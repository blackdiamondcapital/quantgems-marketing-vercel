<template>
  <main id="top">
    <section class="hero">
      <div class="container hero-inner">
        <div>
          <div class="badge">台股報酬排行 · 熱力圖 · 技術分析 · AI 摘要</div>
          <h1 class="hero-title">用數據驅動你的台股投資決策</h1>
          <p class="hero-sub">
            QuantGems 報酬引擎整合多期間報酬排行、市場熱力圖、技術線圖、條件選股與 AI 技術摘要，讓你快速洞察盤面強弱、追蹤自選股、建立可重複的選股流程。
          </p>

          <div class="hero-cta">
            <a class="btn primary" :href="signupUrl">免費註冊</a>
            <a class="btn" href="#pricing">查看方案</a>
          </div>

          <div class="hero-note">
            <div class="note-item">無需安裝，瀏覽器即用</div>
            <div class="note-item">支援手機與桌機</div>
            <div class="note-item">資料每日更新</div>
          </div>
        </div>

        <div class="card hero-panel">
          <div class="panel-top">
            <div class="panel-title">儀表板概覽</div>
            <div class="panel-pill">即時數據</div>
          </div>
          <div class="grid cols-2 panel-grid">
            <div class="mini card">
              <div class="mini-k">報酬排行</div>
              <div class="mini-v">日/週/月/季/年</div>
              <div class="mini-s">漲幅 · 跌幅 · 全部</div>
            </div>
            <div class="mini card">
              <div class="mini-k">熱力圖</div>
              <div class="mini-v">全市場視覺化</div>
              <div class="mini-s">快速掌握盤面強弱</div>
            </div>
            <div class="mini card">
              <div class="mini-k">技術線圖</div>
              <div class="mini-v">全螢幕互動</div>
              <div class="mini-s">KD · MACD · 均線 · 九階梯</div>
            </div>
            <div class="mini card">
              <div class="mini-k">AI 技術摘要</div>
              <div class="mini-v">一鍵解讀</div>
              <div class="mini-s">技術結構 · 多空研判</div>
            </div>
          </div>
          <div class="panel-bottom small">
            登入後可使用完整功能，包含自選股、條件選股與更多指標。
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="section">
      <div class="container">
        <h2 class="section-title">功能亮點</h2>
        <p class="section-sub">從盤面總覽到個股深度分析，QuantGems 報酬引擎提供完整的台股量化工具鏈。</p>

        <div class="grid cols-3 feature-grid">
          <div class="card feature">
            <div class="feature-icon">📊</div>
            <div class="feature-title">報酬排行榜</div>
            <div class="feature-desc">支援日、週、月、季、年多期間，顯示漲幅/跌幅/全部前 100~300 檔，快速找出強勢與弱勢標的。</div>
          </div>
          <div class="card feature">
            <div class="feature-icon">🔥</div>
            <div class="feature-title">市場熱力圖</div>
            <div class="feature-desc">以色塊視覺化全市場報酬分布，支援搜尋、排序、RWD，一眼掌握盤面強弱與產業輪動。</div>
          </div>
          <div class="card feature">
            <div class="feature-icon">📈</div>
            <div class="feature-title">技術線圖</div>
            <div class="feature-desc">ECharts 全螢幕互動，支援多空線、KD、MACD、九階梯線、均線、成交量等完整指標，輪播切換標的。</div>
          </div>
          <div class="card feature">
            <div class="feature-icon">🔍</div>
            <div class="feature-title">條件選股</div>
            <div class="feature-desc">多條件篩選：價格區間、成交量、均線站上/交叉、突破新高、回撤控制、KD/MACD 等，可儲存策略。</div>
          </div>
          <div class="card feature">
            <div class="feature-icon">⭐</div>
            <div class="feature-title">自選股管理</div>
            <div class="feature-desc">最多 10 組群組，每組 100 檔，支援批次加入、清空、重新命名，登入後跨裝置同步。</div>
          </div>
          <div class="card feature">
            <div class="feature-icon">🤖</div>
            <div class="feature-title">AI 技術分析摘要</div>
            <div class="feature-desc">一鍵呼叫 AI 模型，產生技術結構解讀與多空研判，輔助你快速理解圖形與指標。</div>
          </div>
          <div class="card feature">
            <div class="feature-icon">🔄</div>
            <div class="feature-title">持續更新</div>
            <div class="feature-desc">資料每日更新，功能持續迭代，未來將加入更多指標（布林、VWAP、ATR）、多語系與 API 匯出。</div>
          </div>
        </div>
      </div>
    </section>

    <section id="pricing" class="section">
      <div class="container">
        <h2 class="section-title">方案價格</h2>
        <p class="section-sub">先用免費方案體驗流程，再依需求升級。年繳享 8 折優惠。</p>

        <div class="grid cols-3 pricing-grid">
          <div class="card pricing">
            <div class="pricing-top">
              <div class="pricing-name">Free 免費版</div>
              <div class="pricing-price">NT$0</div>
              <div class="small">適合先熟悉工具與流程</div>
            </div>
            <ul class="list">
              <li>報酬排行：全部 + 日，前 20 檔</li>
              <li>熱力圖：僅當日盤面</li>
              <li>技術線圖：日 K + 均線 + 成交量（近 3 個月）</li>
              <li>自選股：1 組，最多 20 檔</li>
              <li>比較工具：一次最多 3 檔</li>
            </ul>
            <a class="btn" :href="signupUrl">免費註冊</a>
          </div>

          <div class="card pricing featured">
            <div class="pricing-top">
              <div class="pricing-name">Pro 專業版</div>
              <div class="pricing-price">NT$399<span class="small">/月</span></div>
              <div class="small">大多數使用者的最佳選擇</div>
            </div>
            <ul class="list">
              <li>報酬排行：全部/漲幅/跌幅，各前 100 檔</li>
              <li>排行榜支援日/週/月週期</li>
              <li>熱力圖與深度分析：多維度盤面視覺化</li>
              <li>技術線圖：多空線、KD、MACD、九階梯線等完整指標</li>
              <li>條件選股：可儲存 5 組自訂策略</li>
              <li>自選股：5 組，每組最多 100 檔</li>
              <li>比較工具：一次最多 5 檔</li>
              <li>AI 技術分析摘要</li>
            </ul>
            <a class="btn primary" :href="signupUrl">開始使用 Pro</a>
          </div>

          <div class="card pricing">
            <div class="pricing-top">
              <div class="pricing-name">Prime 尊榮版</div>
              <div class="pricing-price">NT$999<span class="small">/月</span></div>
              <div class="small">需要更多檔數/團隊協作</div>
            </div>
            <ul class="list">
              <li>排行榜：日/週/月/季/年，各前 300 檔</li>
              <li>熱力圖與深度分析：完整歷史與客製化維度</li>
              <li>技術線圖：長期歷史、多檔並列檢視</li>
              <li>條件選股：團隊共用策略與多組條件</li>
              <li>自選股：10 組，每組 100 檔</li>
              <li>比較與報告匯出</li>
              <li>多帳號與團隊權限管理</li>
              <li>專屬客服與客製導入服務</li>
            </ul>
            <a class="btn" href="#contact">聯絡洽談</a>
          </div>
        </div>
      </div>
    </section>

    <section id="faq" class="section">
      <div class="container">
        <h2 class="section-title">常見問題</h2>
        <p class="section-sub">關於 QuantGems 報酬引擎的常見疑問。</p>

        <div class="grid cols-2 faq-grid">
          <details class="card faq" open>
            <summary>這是投顧嗎？會提供買賣建議嗎？</summary>
            <div class="faq-body">不會。QuantGems 是工具平台，提供資料整理、篩選與視覺化，協助你做決策，但不提供投資建議。</div>
          </details>
          <details class="card faq">
            <summary>需要安裝嗎？手機可以用嗎？</summary>
            <div class="faq-body">不需要安裝，瀏覽器即可使用。支援手機與桌機，介面響應式設計。</div>
          </details>
          <details class="card faq">
            <summary>資料多久更新一次？</summary>
            <div class="faq-body">資料每日更新，排行榜與熱力圖會在收盤後更新當日數據。</div>
          </details>
          <details class="card faq">
            <summary>可以取消訂閱嗎？</summary>
            <div class="faq-body">可以。你可以在訂閱管理頁隨時取消，取消後仍可用到當期結束。</div>
          </details>
          <details class="card faq">
            <summary>AI 技術分析摘要是什麼？</summary>
            <div class="faq-body">系統會將技術線圖與指標資訊送給 AI 模型，產生技術結構解讀與多空研判，輔助你快速理解圖形。</div>
          </details>
          <details class="card faq">
            <summary>自選股可以跨裝置同步嗎？</summary>
            <div class="faq-body">登入後，自選股會同步到後端資料庫，跨裝置皆可存取。未登入則存在瀏覽器 localStorage。</div>
          </details>
        </div>
      </div>
    </section>

    <section id="contact" class="section">
      <div class="container">
        <h2 class="section-title">聯絡我們</h2>
        <p class="section-sub">有任何問題、功能建議或合作需求，歡迎留言。</p>

        <div class="grid cols-2 contact-grid">
          <div class="card contact-card">
            <form class="form" @submit.prevent="submitContact">
              <label class="small">姓名</label>
              <input class="input" v-model.trim="form.name" placeholder="你的名字" autocomplete="name" />

              <label class="small">Email</label>
              <input class="input" v-model.trim="form.email" placeholder="you@example.com" autocomplete="email" />

              <label class="small">訊息</label>
              <textarea class="textarea" v-model.trim="form.message" placeholder="我想了解..." />

              <div class="form-row">
                <button class="btn primary" type="submit" :disabled="submitting">
                  {{ submitting ? '送出中...' : '送出' }}
                </button>
                <div class="small" v-if="status">{{ status }}</div>
              </div>
            </form>
          </div>

          <div class="card contact-side">
            <div class="side-title">立即體驗報酬引擎</div>
            <div class="side-desc">
              免費註冊即可使用基本功能，升級 Pro 解鎖完整指標與條件選股。
            </div>

            <div class="side-actions">
              <a class="btn" :href="loginUrl">登入</a>
              <a class="btn primary" :href="signupUrl">免費註冊</a>
            </div>

            <div class="divider"></div>

            <div class="small">
              有企業合作或客製需求？歡迎透過表單聯絡我們。
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'

const loginUrl = import.meta.env.VITE_APP_LOGIN_URL || 'http://localhost:5173'
const signupUrl = import.meta.env.VITE_APP_SIGNUP_URL || 'http://localhost:5173'

const submitting = ref(false)
const status = ref('')

const form = reactive({
  name: '',
  email: '',
  message: '',
})

function submitContact() {
  submitting.value = true
  status.value = ''

  const subject = encodeURIComponent(`[QuantGems] 聯絡表單：${form.name || '未填姓名'}`)
  const body = encodeURIComponent(`姓名：${form.name}\nEmail：${form.email}\n\n訊息：\n${form.message}`)

  const to = import.meta.env.VITE_CONTACT_TO || ''
  if (!to) {
    status.value = '尚未設定收件信箱（VITE_CONTACT_TO），請先設定。'
    submitting.value = false
    return
  }

  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`

  submitting.value = false
  status.value = '已開啟郵件程式，請確認並送出。'
}
</script>
