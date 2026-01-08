<script setup>
<<<<<<< HEAD
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')
const TOKEN_KEY = 'quantgem_auth_token'
const PRODUCT_LOGIN_URL = String(import.meta.env.VITE_PRODUCT_LOGIN_URL || import.meta.env.VITE_APP_LOGIN_URL || 'https://taiwan-stock-returns-quantgems-vue-vercel.onrender.com/api/auth/google').trim()
=======
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')
>>>>>>> 07cf0bc (Add marketing + api for Vercel)

const tutorials = ref([])
const loading = ref(false)
const error = ref('')

<<<<<<< HEAD
const authToken = ref(null)
const authUser = ref(null)
const authError = ref('')

const creating = ref(false)
const createError = ref('')
const createForm = reactive({ slug: '', title: '', summary: '', content_md: '' })

const isAuthed = computed(() => !!authToken.value)

function getAuthHeaders() {
  if (!authToken.value) return {}
  return { Authorization: `Bearer ${authToken.value}` }
}

function buildAuthCallbackUrl(redirectPath = '/tutorials') {
  const base = `${window.location.origin}/auth/callback`
  const u = new URL(base)
  u.searchParams.set('redirect', redirectPath)
  return u.toString()
}

function loginWithGoogle() {
  authError.value = ''
  const callback = buildAuthCallbackUrl('/tutorials')
  const u = new URL(PRODUCT_LOGIN_URL)
  if (!u.searchParams.has('redirect')) u.searchParams.set('redirect', callback)
  window.location.assign(u.toString())
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

=======
>>>>>>> 07cf0bc (Add marketing + api for Vercel)
async function loadTutorials() {
  loading.value = true
  error.value = ''
  try {
    const resp = await fetch(`${API_BASE}/tutorials`, { credentials: 'include' })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const json = await resp.json()
    tutorials.value = Array.isArray(json?.data) ? json.data : []
  } catch (e) {
<<<<<<< HEAD
    error.value = '論壇載入失敗（請確認後端 /api/tutorials 是否可用）'
=======
    error.value = '教學文章載入失敗（請確認後端 /api/tutorials 是否可用）'
>>>>>>> 07cf0bc (Add marketing + api for Vercel)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
<<<<<<< HEAD
  loadAuthFromStorage()
=======
>>>>>>> 07cf0bc (Add marketing + api for Vercel)
  loadTutorials()
})
</script>

<template>
  <main class="tutorials-page">
    <div class="container">
      <div class="tutorials-page__head">
        <div>
<<<<<<< HEAD
          <h1 class="section-title" style="margin-bottom:6px;">論壇</h1>
          <p class="section-sub" style="margin-top:0;">交流使用心得、策略想法與問題討論。登入後可發表主題與回覆。</p>
=======
          <h1 class="section-title" style="margin-bottom:6px;">教學文章</h1>
          <p class="section-sub" style="margin-top:0;">用實戰導向的文章，帶你快速上手：看盤面、找強弱、用條件選股建立流程。</p>
>>>>>>> 07cf0bc (Add marketing + api for Vercel)
        </div>
        <div class="tutorials-page__actions">
          <button class="btn" type="button" :disabled="loading" @click="loadTutorials">重新整理</button>
          <RouterLink class="btn" :to="{ path: '/', hash: '#features' }">回首頁</RouterLink>
        </div>
      </div>

<<<<<<< HEAD
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
          <div class="small">此論壇使用產品的 Google 登入系統。</div>
          <div class="form-row" style="margin-top:10px;">
            <button class="btn primary" type="button" @click="loginWithGoogle">使用 Google 登入</button>
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
=======
      <div class="card tutorials-card">
        <div class="small" v-if="loading">載入中...</div>
        <div class="small" v-else-if="error">{{ error }}</div>
        <div class="small" v-else>最新 {{ tutorials.length }} 篇</div>

        <div v-if="!loading && !error && tutorials.length === 0" class="empty">
          目前尚無教學文章。
>>>>>>> 07cf0bc (Add marketing + api for Vercel)
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
<<<<<<< HEAD
            <div class="tutorial-meta small">{{ t.published ? '公開' : '草稿' }}</div>
=======
            <div class="tutorial-meta small">{{ t.published ? '已發布' : '草稿' }}</div>
>>>>>>> 07cf0bc (Add marketing + api for Vercel)
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
