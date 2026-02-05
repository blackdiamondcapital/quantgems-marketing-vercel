<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')
const TOKEN_KEY = 'quantgem_auth_token'

const tutorials = ref([])
const loading = ref(false)
const error = ref('')

const authToken = ref(null)
const authUser = ref(null)
const authLoading = ref(false)
const authError = ref('')

const loginForm = reactive({ email: '', password: '' })

const creating = ref(false)
const createError = ref('')
const createForm = reactive({ slug: '', title: '', summary: '', content_md: '' })

const isAuthed = computed(() => !!authToken.value)

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

async function loadAuthFromStorage() {
  authError.value = ''
  try {
    const t = localStorage.getItem(TOKEN_KEY)
    if (t) authToken.value = t
  } catch {}
  if (!authToken.value) return

  try {
    const resp = await fetch(`${API_BASE}/auth/me`, { headers: { ...getAuthHeaders() } })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const json = await resp.json()
    authUser.value = json?.data?.user ?? json?.data ?? null
  } catch {
    try { localStorage.removeItem(TOKEN_KEY) } catch {}
    authToken.value = null
    authUser.value = null
  }
}

async function login() {
  authLoading.value = true
  authError.value = ''
  try {
    const resp = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: String(loginForm.email || '').trim(),
        password: String(loginForm.password || ''),
      }),
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const json = await resp.json()
    const token = json?.data?.token
    if (!token) throw new Error('missing_token')
    authToken.value = token
    authUser.value = json?.data?.user ?? null
    try { localStorage.setItem(TOKEN_KEY, token) } catch {}
  } catch (e) {
    const msg = String(e?.message || '')
    if (msg.includes('401')) authError.value = 'Email 或密碼錯誤'
    else if (msg.includes('403')) authError.value = '登入失敗（可能尚未完成 Email 驗證 / 帳號停用）'
    else authError.value = '登入失敗，請稍後再試'
  } finally {
    authLoading.value = false
  }
}

function logout() {
  try { localStorage.removeItem(TOKEN_KEY) } catch {}
  authToken.value = null
  authUser.value = null
}

async function createThread() {
  createError.value = ''
  if (!isAuthed.value) {
    createError.value = '請先登入後再發表主題'
    return
  }

  const payload = {
    slug: normalizeSlug(createForm.slug),
    title: String(createForm.title || '').trim(),
    summary: String(createForm.summary || '').trim(),
    content_md: String(createForm.content_md || '').trim(),
  }
  if (!payload.slug) return (createError.value = '請輸入 slug（英文/數字/連字號）')
  if (!payload.title) return (createError.value = '請輸入標題')
  if (!payload.content_md) return (createError.value = '請輸入內容')

  creating.value = true
  try {
    const resp = await fetch(`${API_BASE}/tutorials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    createForm.slug = ''
    createForm.title = ''
    createForm.summary = ''
    createForm.content_md = ''
    await loadTutorials()
  } catch (e) {
    const msg = String(e?.message || '')
    if (msg.includes('409')) createError.value = 'slug 已存在，請換一個'
    else if (msg.includes('401')) createError.value = '請先登入'
    else createError.value = '發表失敗'
  } finally {
    creating.value = false
  }
}

async function loadTutorials() {
  loading.value = true
  error.value = ''
  try {
    const resp = await fetch(`${API_BASE}/tutorials`, { credentials: 'include' })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const json = await resp.json()
    tutorials.value = Array.isArray(json?.data) ? json.data : []
  } catch (e) {
    error.value = '論壇載入失敗（請確認後端 /api/tutorials 是否可用）'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAuthFromStorage()
  loadTutorials()
})
</script>

<template>
  <main class="tutorials-page">
    <div class="container">
      <div class="tutorials-page__head">
        <div>
          <h1 class="section-title" style="margin-bottom:6px;">論壇</h1>
          <p class="section-sub" style="margin-top:0;">交流使用心得、策略想法與問題討論。登入後可發表主題與回覆。</p>
        </div>
        <div class="tutorials-page__actions">
          <button class="btn" type="button" :disabled="loading" @click="loadTutorials">重新整理</button>
          <RouterLink class="btn" :to="{ path: '/', hash: '#features' }">回首頁</RouterLink>
        </div>
      </div>

      <div class="card tutorials-card" style="margin-top:14px;">
        <div class="tutorials-toolbar">
          <div>
            <div class="panel-title">帳號</div>
            <div class="small" v-if="isAuthed">已登入：{{ authUser?.email || authUser?.username || 'user' }}</div>
            <div class="small" v-else>登入後即可發表主題與回覆</div>
            <div class="small" v-if="authError" style="margin-top:6px;">{{ authError }}</div>
          </div>
          <div>
            <button v-if="isAuthed" class="btn" type="button" @click="logout">登出</button>
          </div>
        </div>

        <div v-if="!isAuthed" class="forum-login" style="margin-top:12px;">
          <label class="small">Email</label>
          <input class="input" v-model.trim="loginForm.email" type="email" placeholder="you@example.com" :disabled="authLoading" />

          <label class="small">Password</label>
          <input class="input" v-model="loginForm.password" type="password" placeholder="••••••••" :disabled="authLoading" />

          <div class="form-row">
            <button class="btn primary" type="button" :disabled="authLoading" @click="login">
              {{ authLoading ? '登入中…' : '登入' }}
            </button>
          </div>
        </div>

        <div v-else class="forum-create" style="margin-top:12px;">
          <div class="panel-title">發表主題</div>
          <div class="small" v-if="createError" style="margin-top:6px;">{{ createError }}</div>

          <div class="forum-create__grid" style="margin-top:10px;">
            <label class="small">Slug（網址用）</label>
            <input class="input" v-model.trim="createForm.slug" type="text" placeholder="my-first-post" :disabled="creating" />

            <label class="small">標題</label>
            <input class="input" v-model.trim="createForm.title" type="text" placeholder="我想分享…" :disabled="creating" />

            <label class="small">摘要（可選）</label>
            <input class="input" v-model.trim="createForm.summary" type="text" placeholder="（可不填）" :disabled="creating" />

            <label class="small">內容（Markdown）</label>
            <textarea class="textarea" v-model.trim="createForm.content_md" rows="8" placeholder="# 內容\n\n..." :disabled="creating"></textarea>

            <div class="form-row">
              <button class="btn primary" type="button" :disabled="creating" @click="createThread">
                {{ creating ? '送出中…' : '發表' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card tutorials-card">
        <div class="small" v-if="loading">載入中...</div>
        <div class="small" v-else-if="error">{{ error }}</div>
        <div class="small" v-else>最新 {{ tutorials.length }} 則主題</div>

        <div v-if="!loading && !error && tutorials.length === 0" class="empty">
          目前尚無主題。
        </div>

        <div class="grid cols-3 tutorials-grid" v-if="tutorials.length">
          <RouterLink
            v-for="t in tutorials"
            :key="t.id || t.slug"
            class="card tutorial-item"
            :to="`/tutorials/${t.slug}`"
          >
            <div class="tutorial-title">{{ t.title }}</div>
            <div class="tutorial-summary">{{ t.summary || '（尚未填寫摘要）' }}</div>
            <div class="tutorial-meta small">{{ t.published ? '公開' : '草稿' }}</div>
          </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.tutorials-page {
  padding: 44px 0 70px;
}

.tutorials-page__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.tutorials-page__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tutorial-item {
  text-decoration: none;
}
</style>
