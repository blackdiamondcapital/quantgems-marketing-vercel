<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const route = useRoute()
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')
const TOKEN_KEY = 'quantgem_auth_token'
const PRODUCT_LOGIN_URL = String(import.meta.env.VITE_PRODUCT_LOGIN_URL || import.meta.env.VITE_APP_LOGIN_URL || 'https://quantgems.com/').trim()

const loading = ref(false)
const error = ref('')
const post = ref(null)

const authToken = ref(null)
const authUser = ref(null)
const authError = ref('')

const repliesLoading = ref(false)
const repliesError = ref('')
const replies = ref([])

const replyForm = reactive({ content_md: '' })
const replying = ref(false)

const isAuthed = computed(() => !!authToken.value)

function getAuthHeaders() {
  if (!authToken.value) return {}
  return { Authorization: `Bearer ${authToken.value}` }
}

function buildAuthCallbackUrl() {
  const base = `${window.location.origin}/auth/callback`
  const u = new URL(base)
  u.searchParams.set('redirect', String(window.location.pathname || '/tutorials'))
  return u.toString()
}

function loginWithGoogle() {
  const callback = buildAuthCallbackUrl()
  const u = new URL(PRODUCT_LOGIN_URL)
  if (!u.searchParams.has('redirect')) u.searchParams.set('redirect', callback)
  window.location.assign(u.toString())
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

function formatDateTime(ts) {
  if (!ts) return ''
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

async function loadReplies() {
  const slug = String(route.params.slug || '').trim()
  if (!slug) return

  repliesLoading.value = true
  repliesError.value = ''
  replies.value = []

  try {
    const resp = await fetch(`${API_BASE}/tutorials/${encodeURIComponent(slug)}/replies`, {
      headers: { ...getAuthHeaders() },
      credentials: 'include',
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const json = await resp.json()
    replies.value = Array.isArray(json?.data) ? json.data : []
  } catch {
    repliesError.value = '回覆載入失敗'
  } finally {
    repliesLoading.value = false
  }
}

async function submitReply() {
  const slug = String(route.params.slug || '').trim()
  if (!slug) return
  if (!isAuthed.value) {
    repliesError.value = '請先登入後再回覆'
    return
  }

  const contentMd = String(replyForm.content_md || '').trim()
  if (!contentMd) {
    repliesError.value = '請輸入回覆內容'
    return
  }

  replying.value = true
  repliesError.value = ''
  try {
    const resp = await fetch(`${API_BASE}/tutorials/${encodeURIComponent(slug)}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify({ content_md: contentMd }),
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    replyForm.content_md = ''
    await loadReplies()
  } catch (e) {
    const msg = String(e?.message || '')
    if (msg.includes('401')) repliesError.value = '請先登入'
    else repliesError.value = '送出回覆失敗'
  } finally {
    replying.value = false
  }
}

async function load() {
  const slug = String(route.params.slug || '').trim()
  if (!slug) return

  loading.value = true
  error.value = ''
  post.value = null

  try {
    const resp = await fetch(`${API_BASE}/tutorials/${encodeURIComponent(slug)}`, { credentials: 'include' })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const json = await resp.json()
    post.value = json?.data || null
  } catch (e) {
    error.value = '主題載入失敗'
  } finally {
    loading.value = false
  }
}

async function loadAll() {
  await loadAuthFromStorage()
  await load()
  await loadReplies()
}

onMounted(loadAll)
watch(() => route.params.slug, loadAll)
</script>

<template>
  <main class="tutorial-detail">
    <div class="container">
      <div class="tutorial-detail__head">
        <RouterLink class="btn" to="/tutorials">返回論壇</RouterLink>
        <RouterLink class="btn" :to="{ path: '/', hash: '#pricing' }">查看方案</RouterLink>
      </div>

      <div class="card tutorial-detail__card">
        <div v-if="loading" class="small">載入中...</div>
        <div v-else-if="error" class="small">{{ error }}</div>

        <template v-else>
          <h1 class="tutorial-detail__title">{{ post?.title || '論壇主題' }}</h1>
          <div v-if="post?.summary" class="tutorial-detail__summary">{{ post.summary }}</div>
          <pre class="tutorial-content">{{ post?.content_md || '' }}</pre>
        </template>
      </div>

      <div class="card tutorial-detail__card" style="margin-top:14px;">
        <div class="panel-top" style="margin-bottom:10px;">
          <div class="panel-title">回覆</div>
          <div class="small">{{ replies.length }} 則</div>
        </div>

        <div v-if="repliesLoading" class="small">載入回覆中...</div>
        <div v-else-if="repliesError" class="small">{{ repliesError }}</div>
        <div v-else-if="replies.length === 0" class="small">目前尚無回覆。</div>

        <div v-if="replies.length" class="replies">
          <div v-for="r in replies" :key="r.id" class="reply">
            <div class="reply-meta small">
              <span class="mono">#{{ r.id }}</span>
              <span>{{ r.full_name || r.username || (r.author_user_id ? `user:${r.author_user_id}` : '匿名') }}</span>
              <span v-if="r.created_at">· {{ formatDateTime(r.created_at) }}</span>
            </div>
            <pre class="tutorial-content" style="margin-top:8px;">{{ r.content_md }}</pre>
          </div>
        </div>

        <div class="divider" style="margin:12px 0;"></div>

        <div v-if="!isAuthed" class="small">
          登入後即可回覆此主題。
          <div class="form-row" style="margin-top:10px;">
            <button class="btn primary" type="button" @click="loginWithGoogle">使用 Google 登入</button>
          </div>
        </div>
        <div v-else>
          <div class="small">以 {{ authUser?.email || authUser?.username || 'user' }} 身份回覆</div>
          <textarea class="textarea" v-model.trim="replyForm.content_md" rows="6" placeholder="輸入回覆（Markdown）" :disabled="replying" style="margin-top:8px;"></textarea>
          <div class="form-row" style="margin-top:10px;">
            <button class="btn primary" type="button" :disabled="replying" @click="submitReply">
              {{ replying ? '送出中…' : '送出回覆' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.tutorial-detail {
  padding: 44px 0 70px;
}

.tutorial-detail__head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.tutorial-detail__card {
  padding: 18px;
}

.tutorial-detail__title {
  margin: 0 0 10px;
  font-size: 24px;
  font-weight: 900;
}

.tutorial-detail__summary {
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.7;
  margin-bottom: 12px;
}
</style>
