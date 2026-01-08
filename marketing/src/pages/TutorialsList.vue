<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

const tutorials = ref([])
const loading = ref(false)
const error = ref('')

async function loadTutorials() {
  loading.value = true
  error.value = ''
  try {
    const resp = await fetch(`${API_BASE}/tutorials`, { credentials: 'include' })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const json = await resp.json()
    tutorials.value = Array.isArray(json?.data) ? json.data : []
  } catch (e) {
    error.value = '教學文章載入失敗（請確認後端 /api/tutorials 是否可用）'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTutorials()
})
</script>

<template>
  <main class="tutorials-page">
    <div class="container">
      <div class="tutorials-page__head">
        <div>
          <h1 class="section-title" style="margin-bottom:6px;">教學文章</h1>
          <p class="section-sub" style="margin-top:0;">用實戰導向的文章，帶你快速上手：看盤面、找強弱、用條件選股建立流程。</p>
        </div>
        <div class="tutorials-page__actions">
          <button class="btn" type="button" :disabled="loading" @click="loadTutorials">重新整理</button>
          <RouterLink class="btn" :to="{ path: '/', hash: '#features' }">回首頁</RouterLink>
        </div>
      </div>

      <div class="card tutorials-card">
        <div class="small" v-if="loading">載入中...</div>
        <div class="small" v-else-if="error">{{ error }}</div>
        <div class="small" v-else>最新 {{ tutorials.length }} 篇</div>

        <div v-if="!loading && !error && tutorials.length === 0" class="empty">
          目前尚無教學文章。
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
            <div class="tutorial-meta small">{{ t.published ? '已發布' : '草稿' }}</div>
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
