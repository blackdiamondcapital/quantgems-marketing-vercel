<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const route = useRoute()
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

const loading = ref(false)
const error = ref('')
const post = ref(null)

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
    error.value = '文章載入失敗'
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => route.params.slug, load)
</script>

<template>
  <main class="tutorial-detail">
    <div class="container">
      <div class="tutorial-detail__head">
        <RouterLink class="btn" to="/tutorials">返回列表</RouterLink>
        <RouterLink class="btn" :to="{ path: '/', hash: '#pricing' }">查看方案</RouterLink>
      </div>

      <div class="card tutorial-detail__card">
        <div v-if="loading" class="small">載入中...</div>
        <div v-else-if="error" class="small">{{ error }}</div>

        <template v-else>
          <h1 class="tutorial-detail__title">{{ post?.title || '教學文章' }}</h1>
          <div v-if="post?.summary" class="tutorial-detail__summary">{{ post.summary }}</div>
          <pre class="tutorial-content">{{ post?.content_md || '' }}</pre>
        </template>
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
