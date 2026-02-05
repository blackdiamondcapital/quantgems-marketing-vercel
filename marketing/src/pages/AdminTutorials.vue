<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')
const TOKEN_KEY = 'quantgem_auth_token'

const email = ref('')
const password = ref('')

const authToken = ref(null)
const authUser = ref(null)
const authLoading = ref(false)
const authError = ref('')

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const items = ref([])

const editingId = ref(null)
const form = ref({
  slug: '',
  title: '',
  summary: '',
  content_md: '',
  cover_image_url: '',
  published: false,
})

const isAuthed = computed(() => !!authToken.value)
const isPrimeOrEnterprise = computed(() => {
  const plan = String(authUser.value?.plan || '').toLowerCase()
  return plan === 'prime' || plan === 'enterprise'
})

function getAuthHeaders() {
  if (!authToken.value) return {}
  return { Authorization: `Bearer ${authToken.value}` }
}

function normalizeSlug(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function resetForm() {
  editingId.value = null
  form.value = {
    slug: '',
    title: '',
    summary: '',
    content_md: '',
    cover_image_url: '',
    published: false,
  }
}

function fillFromItem(it) {
  editingId.value = it?.id ?? null
  form.value = {
    slug: String(it?.slug || ''),
    title: String(it?.title || ''),
    summary: it?.summary == null ? '' : String(it.summary),
    content_md: it?.content_md == null ? '' : String(it.content_md),
    cover_image_url: it?.cover_image_url == null ? '' : String(it.cover_image_url),
    published: Boolean(it?.published),
  }
}

function formatDateTime(ts) {
  if (!ts) return '--'
  try {
    return new Date(ts).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return String(ts)
  }
}

async function apiGet(path) {
  const resp = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      ...getAuthHeaders(),
    },
  })
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
  return resp.json()
}

async function apiPost(path, body) {
  const resp = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body ?? {}),
  })
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
  return resp.json()
}

async function apiPut(path, body) {
  const resp = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body ?? {}),
  })
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
  return resp.json()
}

async function apiDelete(path) {
  const resp = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      ...getAuthHeaders(),
    },
  })
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
  return resp.json()
}

async function loadAuthFromStorage() {
  authError.value = ''
  try {
    const t = localStorage.getItem(TOKEN_KEY)
    if (t) authToken.value = t
  } catch {}

  if (!authToken.value) return

  try {
    const json = await apiGet('/auth/me')
    authUser.value = json?.data?.user ?? json?.data ?? null
  } catch (e) {
    // token invalid; clear
    try { localStorage.removeItem(TOKEN_KEY) } catch {}
    authToken.value = null
    authUser.value = null
  }
}

async function login() {
  authLoading.value = true
  authError.value = ''
  error.value = ''

  try {
    const json = await apiPost('/auth/login', {
      email: String(email.value || '').trim(),
      password: String(password.value || ''),
    })
    const token = json?.data?.token
    const user = json?.data?.user
    if (!token) throw new Error('missing_token')

    authToken.value = token
    authUser.value = user ?? null
    try { localStorage.setItem(TOKEN_KEY, token) } catch {}

    await load()
  } catch (e) {
    const msg = String(e?.message || '')
    if (msg.includes('401')) authError.value = 'Email 或密碼錯誤'
    else if (msg.includes('403')) authError.value = '登入失敗（可能尚未完成 Email 驗證 / 帳號停用）'
    else authError.value = '登入失敗，請稍後再試'
  } finally {
    authLoading.value = false
  }
}

async function logout() {
  try { localStorage.removeItem(TOKEN_KEY) } catch {}
  authToken.value = null
  authUser.value = null
  resetForm()
  items.value = []
}

async function load() {
  error.value = ''
  loading.value = true
  try {
    const json = await apiGet('/tutorials?limit=200')
    items.value = Array.isArray(json?.data) ? json.data : []
  } catch (e) {
    error.value = '載入失敗（請確認後端 /api/tutorials 可用，且你已用 Prime 登入）'
  } finally {
    loading.value = false
  }
}

async function fetchFullBySlug(slug) {
  const json = await apiGet(`/tutorials/${encodeURIComponent(String(slug))}`)
  return json?.data ?? null
}

async function onClickEdit(it) {
  error.value = ''
  saving.value = true
  try {
    const full = await fetchFullBySlug(it?.slug)
    if (!full) throw new Error('not_found')
    fillFromItem(full)
    try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch {}
  } catch {
    error.value = '載入文章內容失敗'
  } finally {
    saving.value = false
  }
}

async function onSubmit() {
  error.value = ''

  if (!isAuthed.value) {
    error.value = '請先登入'
    return
  }
  if (!isPrimeOrEnterprise.value) {
    error.value = '此功能僅 Prime 尊榮版可用'
    return
  }

  const payload = {
    slug: normalizeSlug(form.value.slug),
    title: String(form.value.title || '').trim(),
    summary: String(form.value.summary || '').trim(),
    content_md: String(form.value.content_md || '').trim(),
    cover_image_url: String(form.value.cover_image_url || '').trim(),
    published: Boolean(form.value.published),
  }

  if (!payload.slug) {
    error.value = '請輸入 slug（英文/數字/連字號）'
    return
  }
  if (!payload.title) {
    error.value = '請輸入標題'
    return
  }
  if (!payload.content_md) {
    error.value = '請輸入內容（Markdown）'
    return
  }

  saving.value = true
  try {
    if (editingId.value) {
      await apiPut(`/tutorials/${encodeURIComponent(String(editingId.value))}`, payload)
    } else {
      await apiPost('/tutorials', payload)
    }

    await load()
    resetForm()
  } catch (e) {
    const msg = String(e?.message || '')
    if (msg.includes('409')) error.value = 'slug 已存在，請換一個'
    else if (msg.includes('401') || msg.includes('403')) error.value = '權限不足（需要 Prime 且已 admitted）'
    else error.value = '儲存失敗'
  } finally {
    saving.value = false
  }
}

async function onTogglePublished(it) {
  if (!it?.id) return
  error.value = ''
  saving.value = true
  try {
    await apiPut(`/tutorials/${encodeURIComponent(String(it.id))}`, { published: !Boolean(it.published) })
    await load()
  } catch (e) {
    const msg = String(e?.message || '')
    if (msg.includes('401') || msg.includes('403')) error.value = '權限不足（需要 Prime 且已 admitted）'
    else error.value = '更新失敗'
  } finally {
    saving.value = false
  }
}

async function onDelete(it) {
  if (!it?.id) return
  if (!confirm(`確定要刪除「${it.title || it.slug}」？此操作不可復原。`)) return

  error.value = ''
  saving.value = true
  try {
    await apiDelete(`/tutorials/${encodeURIComponent(String(it.id))}`)
    await load()
    if (Number(editingId.value) === Number(it.id)) resetForm()
  } catch (e) {
    const msg = String(e?.message || '')
    if (msg.includes('401') || msg.includes('403')) error.value = '權限不足（需要 Prime 且已 admitted）'
    else error.value = '刪除失敗'
  } finally {
    saving.value = false
  }
}

async function onCreateNew() {
  resetForm()
  try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch {}
}

onMounted(async () => {
  await loadAuthFromStorage()
  if (authToken.value) {
    await load()
  }
})
</script>

<template>
  <main class="admin-tutorials">
    <div class="container">
      <div class="admin-tutorials__head">
        <div>
          <h1 class="section-title" style="margin-bottom:6px;">管理後台：教學文章</h1>
          <p class="section-sub" style="margin-top:0;">此頁面不會出現在導覽列，請僅提供給管理員使用。</p>
        </div>
        <div class="admin-tutorials__head-actions">
          <RouterLink class="btn" to="/tutorials">前往教學列表</RouterLink>
          <RouterLink class="btn" :to="{ path: '/', hash: '#top' }">回首頁</RouterLink>
        </div>
      </div>

      <div class="card admin-tutorials__card">
        <div class="admin-tutorials__row">
          <div class="admin-tutorials__block">
            <div class="admin-tutorials__block-title">登入</div>

            <div v-if="isAuthed" class="small">
              已登入：{{ authUser?.email || authUser?.username || 'user' }}
              <span v-if="authUser?.plan">（{{ authUser.plan }}）</span>
            </div>

            <div v-if="authError" class="admin-tutorials__error">{{ authError }}</div>

            <div v-if="!isAuthed" class="admin-tutorials__login">
              <label class="field">
                <span class="field__label">Email</span>
                <input class="input" v-model.trim="email" type="email" placeholder="admin@example.com" :disabled="authLoading" />
              </label>
              <label class="field">
                <span class="field__label">Password</span>
                <input class="input" v-model="password" type="password" placeholder="••••••••" :disabled="authLoading" />
              </label>
              <button class="btn primary" type="button" :disabled="authLoading" @click="login">
                {{ authLoading ? '登入中…' : '登入' }}
              </button>
              <div class="small" style="margin-top:8px;">需要 Prime（enterprise）且已 admitted 才能新增/更新/刪除文章。</div>
            </div>

            <div v-else class="admin-tutorials__login">
              <button class="btn" type="button" :disabled="authLoading" @click="logout">登出</button>
            </div>
          </div>

          <div class="admin-tutorials__block" style="flex:1;">
            <div class="admin-tutorials__block-title">新增 / 編輯文章</div>
            <div v-if="error" class="admin-tutorials__error">{{ error }}</div>

            <form class="admin-tutorials__form" @submit.prevent="onSubmit">
              <label class="field">
                <span class="field__label">Slug</span>
                <input class="input" v-model="form.slug" type="text" placeholder="getting-started" :disabled="saving" />
              </label>
              <label class="field">
                <span class="field__label">標題</span>
                <input class="input" v-model="form.title" type="text" placeholder="文章標題" :disabled="saving" />
              </label>
              <label class="field">
                <span class="field__label">摘要</span>
                <textarea class="textarea" v-model="form.summary" rows="3" placeholder="（可空白）" :disabled="saving"></textarea>
              </label>
              <label class="field">
                <span class="field__label">封面圖片 URL</span>
                <input class="input" v-model="form.cover_image_url" type="text" placeholder="https://..." :disabled="saving" />
              </label>
              <label class="field field--checkbox">
                <input v-model="form.published" type="checkbox" :disabled="saving" />
                <span>已發布（/tutorials 只顯示已發布）</span>
              </label>
              <label class="field">
                <span class="field__label">內容（Markdown）</span>
                <textarea class="textarea" v-model="form.content_md" rows="12" placeholder="# 文章內容\n\n..." :disabled="saving"></textarea>
              </label>

              <div class="admin-tutorials__actions">
                <button class="btn primary" type="submit" :disabled="saving || !isAuthed">
                  {{ saving ? '儲存中…' : (editingId ? '儲存變更' : '建立文章') }}
                </button>
                <button class="btn" type="button" :disabled="saving" @click="onCreateNew">清空</button>
                <button class="btn" type="button" :disabled="loading || saving || !isAuthed" @click="load">重新整理</button>
              </div>
            </form>
          </div>
        </div>

        <div class="admin-tutorials__list">
          <div class="admin-tutorials__block-title">文章列表</div>

          <div v-if="loading" class="small">載入中...</div>
          <div v-else-if="!items.length" class="small">尚無文章</div>

          <div v-else class="admin-tutorials__items">
            <div v-for="it in items" :key="it.id" class="admin-tutorials__item">
              <div class="admin-tutorials__item-main">
                <div class="admin-tutorials__item-title">
                  <span class="pill" :class="it.published ? 'pill--pub' : 'pill--draft'">{{ it.published ? '已發布' : '草稿' }}</span>
                  <span class="title-text">{{ it.title }}</span>
                </div>
                <div class="admin-tutorials__item-meta small">
                  <span class="mono">/{{ it.slug }}</span>
                  <span>更新：{{ formatDateTime(it.updated_at) }}</span>
                  <span v-if="it.published">發布：{{ formatDateTime(it.published_at) }}</span>
                </div>
                <div v-if="it.summary" class="admin-tutorials__item-summary">{{ it.summary }}</div>
              </div>

              <div class="admin-tutorials__item-actions">
                <button class="btn" type="button" :disabled="saving || !isAuthed" @click="onClickEdit(it)">編輯</button>
                <button class="btn" type="button" :disabled="saving || !isAuthed" @click="onTogglePublished(it)">
                  {{ it.published ? '取消發布' : '發布' }}
                </button>
                <button class="btn" type="button" :disabled="saving || !isAuthed" @click="onDelete(it)">刪除</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isAuthed && !isPrimeOrEnterprise" class="admin-tutorials__warn">
          你已登入，但不是 Prime 尊榮版，無法新增/更新/刪除。
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.admin-tutorials {
  padding: 44px 0 70px;
}

.admin-tutorials__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.admin-tutorials__head-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.admin-tutorials__card {
  padding: 16px;
}

.admin-tutorials__row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.admin-tutorials__block {
  min-width: min(420px, 100%);
}

.admin-tutorials__block-title {
  font-weight: 900;
  margin-bottom: 10px;
}

.admin-tutorials__error {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.12);
  color: rgba(255, 255, 255, 0.9);
}

.admin-tutorials__warn {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.12);
  color: rgba(255, 255, 255, 0.9);
}

.admin-tutorials__login {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}

.admin-tutorials__form {
  display: grid;
  gap: 10px;
}

.admin-tutorials__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.admin-tutorials__list {
  margin-top: 16px;
}

.admin-tutorials__items {
  display: grid;
  gap: 10px;
}

.admin-tutorials__item {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  gap: 12px;
  justify-content: space-between;
  flex-wrap: wrap;
}

.admin-tutorials__item-title {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.admin-tutorials__item-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.admin-tutorials__item-summary {
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.74);
  line-height: 1.7;
}

.field {
  display: grid;
  gap: 6px;
}

.field--checkbox {
  display: flex;
  gap: 10px;
  align-items: center;
}

.field__label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.pill--pub {
  background: rgba(34, 197, 94, 0.18);
  border: 1px solid rgba(34, 197, 94, 0.35);
  color: rgba(187, 247, 208, 0.95);
}

.pill--draft {
  background: rgba(226, 232, 240, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: rgba(226, 232, 240, 0.85);
}

.title-text {
  font-weight: 900;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
</style>
