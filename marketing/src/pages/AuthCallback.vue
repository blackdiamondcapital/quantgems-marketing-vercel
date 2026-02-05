<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const TOKEN_KEY = 'quantgem_auth_token'

const loading = ref(true)
const message = ref('登入處理中…')

function getTokenFromLocation() {
  const q = route.query || {}
  const tokenFromQuery = q.token || q.access_token || q.jwt || q.id_token
  if (typeof tokenFromQuery === 'string' && tokenFromQuery.trim()) return tokenFromQuery.trim()

  const hash = String(window.location.hash || '')
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash
  const params = new URLSearchParams(fragment)
  const tokenFromHash = params.get('token') || params.get('access_token') || params.get('jwt') || params.get('id_token')
  if (tokenFromHash && tokenFromHash.trim()) return tokenFromHash.trim()

  return ''
}

onMounted(async () => {
  try {
    const token = getTokenFromLocation()
    if (!token) {
      message.value = '未取得登入資訊，請重新登入'
      loading.value = false
      return
    }

    try { localStorage.setItem(TOKEN_KEY, token) } catch {}

    const redirect = typeof route.query?.redirect === 'string' ? route.query.redirect : '/tutorials'
    await router.replace(redirect || '/tutorials')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="tutorials-page">
    <div class="container">
      <div class="card tutorials-card">
        <div class="panel-title">登入回跳</div>
        <div class="small" style="margin-top:8px;">{{ message }}</div>
        <div v-if="!loading" class="form-row" style="margin-top:12px;">
          <a class="btn" href="/tutorials">前往論壇</a>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.tutorials-page {
  padding: 44px 0 70px;
}
</style>
