<template>
  <div>
    <header class="top">
      <div class="container top-inner">
        <RouterLink class="brand" :to="{ path: '/', hash: '#top' }" aria-label="QuantGems">
          <div class="logo">Q</div>
          <div>
            <div class="brand-name">QuantGems</div>
            <div class="brand-sub">報酬引擎</div>
          </div>
        </RouterLink>

        <nav class="nav">
          <RouterLink class="nav-link" :to="{ path: '/', hash: '#features' }">功能亮點</RouterLink>
<<<<<<< HEAD
          <RouterLink class="nav-link" :to="{ path: '/', hash: '#workflow' }">使用流程</RouterLink>
          <RouterLink class="nav-link" to="/tutorials">論壇</RouterLink>
          <RouterLink class="nav-link" :to="{ path: '/', hash: '#pricing' }">方案價格</RouterLink>
          <RouterLink class="nav-link" :to="{ path: '/', hash: '#faq' }">常見問題</RouterLink>
          <RouterLink class="nav-link" :to="{ path: '/', hash: '#disclaimer' }">風險聲明</RouterLink>
=======
          <RouterLink class="nav-link" to="/tutorials">教學文章</RouterLink>
          <RouterLink class="nav-link" :to="{ path: '/', hash: '#pricing' }">方案價格</RouterLink>
          <RouterLink class="nav-link" :to="{ path: '/', hash: '#faq' }">常見問題</RouterLink>
>>>>>>> 07cf0bc (Add marketing + api for Vercel)
          <RouterLink class="nav-link" :to="{ path: '/', hash: '#contact' }">聯絡</RouterLink>
        </nav>

        <div class="actions">
          <a class="btn link" :href="loginUrl" target="_blank" rel="noopener noreferrer">產品登入</a>
          <a class="btn primary" :href="signupUrl">立即開始</a>
        </div>
      </div>
    </header>

    <RouterView />

    <footer class="footer">
      <div class="container footer-inner">
        <div class="small">© {{ new Date().getFullYear() }} QuantGems 報酬引擎. All rights reserved.</div>
        <div class="footer-links">
          <RouterLink v-if="showAdminLink" class="small" to="/admin/tutorials">管理</RouterLink>
          <a class="small" :href="loginUrl">登入</a>
          <a class="small" :href="signupUrl">註冊</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'

<<<<<<< HEAD
const loginUrl = import.meta.env.VITE_APP_LOGIN_URL || 'https://quantgems.com/'
const signupUrl = import.meta.env.VITE_APP_SIGNUP_URL || 'https://quantgems.com/'
=======
const loginUrl = import.meta.env.VITE_APP_LOGIN_URL || 'http://localhost:5173'
const signupUrl = import.meta.env.VITE_APP_SIGNUP_URL || 'http://localhost:5173'
>>>>>>> 07cf0bc (Add marketing + api for Vercel)

const showAdminLink =
  import.meta.env.DEV || String(import.meta.env.VITE_SHOW_ADMIN_LINK || '').toLowerCase() === 'true'
</script>

<style>
.top {
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  background: rgba(7, 10, 18, 0.65);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.top-inner {
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: inline-flex;
  gap: 12px;
  align-items: center;
}

.logo {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-weight: 900;
  background: linear-gradient(135deg, rgba(124, 58, 237, 1), rgba(34, 197, 94, 1));
  box-shadow: 0 14px 30px rgba(124, 58, 237, 0.2);
}

.brand-name {
  font-weight: 850;
  letter-spacing: 0.2px;
}

.brand-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.68);
}

.nav {
  display: none;
  gap: 14px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.78);
  font-weight: 650;
  font-size: 14px;
}

.nav-link:hover {
  color: rgba(255, 255, 255, 0.94);
}

.actions {
  display: inline-flex;
  gap: 10px;
}

@media (min-width: 860px) {
  .nav {
    display: inline-flex;
  }
}

.hero {
  padding: 92px 0 56px;
}

.hero-inner {
  display: grid;
  gap: 24px;
}

@media (min-width: 960px) {
  .hero-inner {
    grid-template-columns: 1.05fr 0.95fr;
    align-items: start;
  }
}

.hero-title {
  margin: 14px 0 12px;
  font-size: clamp(34px, 4vw, 54px);
  line-height: 1.05;
  letter-spacing: -0.5px;
}

.hero-sub {
  margin: 0;
  color: rgba(255, 255, 255, 0.74);
  font-size: 16px;
  max-width: 640px;
  line-height: 1.7;
}

.hero-cta {
  display: flex;
  gap: 12px;
  margin-top: 22px;
  flex-wrap: wrap;
}

.hero-note {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.note-item {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
}

.hero-panel {
  padding: 18px;
}

.panel-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.panel-title {
  font-weight: 800;
}

.panel-pill {
  font-size: 12px;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.14);
  border: 1px solid rgba(34, 197, 94, 0.32);
  color: rgba(255, 255, 255, 0.88);
  font-weight: 750;
}

.panel-grid {
  gap: 12px;
}

.mini {
  padding: 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: none;
}

.mini-k {
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  font-weight: 650;
}

.mini-v {
  font-size: 22px;
  font-weight: 900;
  margin-top: 8px;
}

.mini-s {
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.panel-bottom {
  margin-top: 12px;
}

.feature-grid {
  margin-top: 22px;
}

.feature {
  padding: 18px;
}

.feature-icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.feature-title {
  font-weight: 850;
  margin-bottom: 8px;
}

.feature-desc {
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.7;
}

.tutorials-card {
  padding: 18px;
  margin-top: 22px;
}

.tutorials-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.tutorials-grid {
  margin-top: 14px;
}

.tutorial-item {
  padding: 16px;
  text-align: left;
  cursor: pointer;
}

.tutorial-item {
  appearance: none;
  background: rgba(255, 255, 255, 0.06);
}

.tutorial-item:hover {
  border-color: rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.1);
}

.tutorial-title {
  font-weight: 900;
  margin-bottom: 8px;
}

.tutorial-summary {
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.7;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tutorial-meta {
  margin-top: 12px;
}

.empty {
  margin-top: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: grid;
  place-items: center;
  padding: 22px;
  z-index: 50;
}

.modal {
  width: min(920px, 100%);
  max-height: min(80vh, 720px);
  overflow: auto;
  padding: 18px;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.modal-title {
  font-weight: 950;
  font-size: 18px;
}

.tutorial-content {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.86);
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px;
}

.pricing-grid {
  margin-top: 22px;
  align-items: stretch;
}

.pricing {
  padding: 18px;
  display: grid;
  gap: 14px;
}

.pricing.featured {
  border-color: rgba(124, 58, 237, 0.45);
  background: linear-gradient(180deg, rgba(124, 58, 237, 0.14), rgba(255, 255, 255, 0.06));
}

.pricing-top {
  display: grid;
  gap: 6px;
}

.pricing-name {
  font-weight: 900;
  font-size: 18px;
}

.pricing-price {
  font-weight: 950;
  font-size: 30px;
}

.list {
  margin: 0;
  padding-left: 18px;
  color: rgba(255, 255, 255, 0.74);
  line-height: 1.8;
}

.faq-grid {
  margin-top: 22px;
}

.faq {
  padding: 14px 16px;
}

.faq summary {
  cursor: pointer;
  font-weight: 850;
}

.faq-body {
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.7;
}

.contact-grid {
  margin-top: 22px;
}

.contact-card {
  padding: 18px;
}

.form {
  display: grid;
  gap: 10px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.contact-side {
  padding: 18px;
  display: grid;
  gap: 10px;
}

.side-title {
  font-weight: 900;
  font-size: 18px;
}

.side-desc {
  color: rgba(255, 255, 255, 0.74);
  line-height: 1.7;
}

.side-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 10px 0;
}

.footer {
  padding: 24px 0 44px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(7, 10, 18, 0.45);
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.footer-links {
  display: flex;
  gap: 12px;
}
</style>
