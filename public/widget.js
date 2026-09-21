/**
 * LocalSurge AI FrontDesk (SurgeBot) — Standalone Shadow DOM Embed Widget
 * Version: 1.0.0
 * Size: ~13KB Vanilla JS | Zero CSS Conflicts | 100/100 Lighthouse Performance
 */
(function () {
  if (window.__LOCALSURGE_FRONTDESK_LOADED__) return;
  window.__LOCALSURGE_FRONTDESK_LOADED__ = true;

  // 1. Resolve host configuration from current script tag
  const scriptTag =
    document.currentScript ||
    document.querySelector('script[src*="widget.js"]') ||
    document.querySelector("script[data-site-id]");

  const siteId = scriptTag?.getAttribute("data-site-id") || "site_apex_plumbing";
  const customApiUrl = scriptTag?.getAttribute("data-api-url");
  const position = scriptTag?.getAttribute("data-position") || "bottom-right";

  // Determine base API URL
  let baseUrl = "";
  if (customApiUrl) {
    baseUrl = customApiUrl.replace(/\/+$/, "");
  } else if (scriptTag?.src && scriptTag.src.startsWith("http")) {
    try {
      const parsed = new URL(scriptTag.src);
      baseUrl = `${parsed.protocol}//${parsed.host}`;
    } catch {
      baseUrl = window.location.origin;
    }
  } else {
    baseUrl = window.location.origin;
  }

  // 2. Create host container & attach Shadow Root
  const container = document.createElement("div");
  container.id = "localsurge-frontdesk-root";
  container.style.display = "none"; // Kept invisible until site config and URL path rules pass
  document.body.appendChild(container);

  const shadow = container.attachShadow({ mode: "open" });

  // 3. Encapsulated Stylesheet (Zero CSS Leaks into host)
  const styles = `
    :host {
      --primary: #10b981;
      --primary-dark: #059669;
      --bg-surface: #ffffff;
      --bg-subtle: #f8fafc;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border-color: #e2e8f0;
      --shadow-elevation: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      box-sizing: border-box;
      z-index: 2147483647;
      position: fixed;
      ${position === "bottom-left" ? "left: 20px;" : "right: 20px;"}
      bottom: 20px;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* Trigger Launcher Button */
    .ls-launcher {
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #ffffff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .ls-launcher:hover {
      transform: scale(1.06);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25);
    }

    .ls-launcher svg {
      width: 28px;
      height: 28px;
      fill: currentColor;
      transition: transform 0.2s ease;
    }

    .ls-badge-dot {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 14px;
      height: 14px;
      background: #22c55e;
      border: 2px solid #ffffff;
      border-radius: 7px;
    }

    /* Proactive Teaser Tooltip */
    .ls-teaser {
      position: absolute;
      bottom: 72px;
      ${position === "bottom-left" ? "left: 0;" : "right: 0;"}
      background: #ffffff;
      color: var(--text-main);
      padding: 10px 16px;
      border-radius: 12px;
      box-shadow: var(--shadow-elevation);
      border: 1px solid var(--border-color);
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      animation: lsSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transition: opacity 0.2s, transform 0.2s;
    }

    .ls-teaser::after {
      content: "";
      position: absolute;
      bottom: -6px;
      ${position === "bottom-left" ? "left: 24px;" : "right: 24px;"}
      width: 12px;
      height: 12px;
      background: #ffffff;
      transform: rotate(45deg);
      border-right: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
    }

    /* Chat Drawer Card */
    .ls-drawer {
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 600px;
      max-height: calc(100vh - 100px);
      background: var(--bg-surface);
      border-radius: 16px;
      box-shadow: var(--shadow-elevation);
      border: 1px solid var(--border-color);
      display: none;
      flex-direction: column;
      overflow: hidden;
      position: absolute;
      bottom: 74px;
      ${position === "bottom-left" ? "left: 0;" : "right: 0;"}
      animation: lsDrawerIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .ls-drawer.active {
      display: flex;
    }

    /* Header */
    .ls-header {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #ffffff;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .ls-header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .ls-header-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ls-avatar {
      width: 32px;
      height: 32px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .ls-business-name {
      font-size: 15px;
      font-weight: 700;
      line-height: 1.2;
    }

    .ls-status-sub {
      font-size: 11px;
      opacity: 0.9;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .ls-status-dot {
      width: 6px;
      height: 6px;
      border-radius: 3px;
      background: #22c55e;
    }

    .ls-close-btn {
      background: transparent;
      border: none;
      color: #ffffff;
      cursor: pointer;
      padding: 4px;
      display: flex;
      opacity: 0.8;
      transition: opacity 0.15s;
    }

    .ls-close-btn:hover {
      opacity: 1;
    }

    /* Live Speed-to-Lead Banner */
    .ls-speed-banner {
      background: rgba(0, 0, 0, 0.18);
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Message Stream */
    .ls-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: var(--bg-subtle);
    }

    .ls-msg {
      max-width: 84%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 13.5px;
      line-height: 1.45;
      word-break: break-word;
    }

    .ls-msg-user {
      align-self: flex-end;
      background: var(--primary);
      color: #ffffff;
      border-bottom-right-radius: 4px;
    }

    .ls-msg-assistant {
      align-self: flex-start;
      background: #ffffff;
      color: var(--text-main);
      border: 1px solid var(--border-color);
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .ls-msg-img {
      max-width: 100%;
      max-height: 160px;
      border-radius: 8px;
      margin-top: 6px;
      display: block;
      border: 1px solid rgba(0,0,0,0.1);
    }

    /* 1-Tap Quick Action Chips */
    .ls-chips-wrap {
      padding: 8px 12px;
      background: #ffffff;
      border-top: 1px solid var(--border-color);
      display: flex;
      gap: 6px;
      overflow-x: auto;
      white-space: nowrap;
      scrollbar-width: none;
    }

    .ls-chips-wrap::-webkit-scrollbar {
      display: none;
    }

    .ls-chip {
      background: var(--bg-subtle);
      color: var(--text-main);
      border: 1px solid var(--border-color);
      padding: 6px 10px;
      border-radius: 16px;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }

    .ls-chip:hover {
      background: var(--primary);
      color: #ffffff;
      border-color: var(--primary);
      transform: translateY(-1px);
    }

    /* Photo Staging Preview Bar */
    .ls-photo-preview-bar {
      padding: 6px 12px;
      background: #ffffff;
      border-top: 1px solid var(--border-color);
      display: none;
      align-items: center;
      gap: 8px;
    }

    .ls-photo-preview-bar.active {
      display: flex;
    }

    .ls-thumb-wrap {
      position: relative;
      width: 44px;
      height: 44px;
    }

    .ls-thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid var(--border-color);
    }

    .ls-thumb-remove {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 16px;
      height: 16px;
      border-radius: 8px;
      background: #ef4444;
      color: #ffffff;
      border: none;
      font-size: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Input Footer */
    .ls-footer {
      padding: 10px 12px;
      background: #ffffff;
      border-top: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ls-camera-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 6px;
      display: flex;
      border-radius: 6px;
      transition: color 0.15s, background 0.15s;
    }

    .ls-camera-btn:hover {
      color: var(--primary);
      background: var(--bg-subtle);
    }

    .ls-input {
      flex: 1;
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 8px 14px;
      font-size: 13.5px;
      outline: none;
      color: var(--text-main);
      background: var(--bg-subtle);
      transition: border-color 0.15s;
    }

    .ls-input:focus {
      border-color: var(--primary);
      background: #ffffff;
    }

    .ls-send-btn {
      width: 36px;
      height: 36px;
      border-radius: 18px;
      background: var(--primary);
      color: #ffffff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, transform 0.1s;
    }

    .ls-send-btn:hover {
      background: var(--primary-dark);
      transform: scale(1.05);
    }

    /* Lead Confirmation Card */
    .ls-lead-card {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      padding: 12px;
      margin-top: 8px;
      font-size: 12.5px;
      color: #166534;
    }

    .ls-lead-card h5 {
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Powered by LocalSurge Viral Loop */
    .ls-branding {
      text-align: center;
      font-size: 10.5px;
      color: var(--text-muted);
      padding: 4px 0 6px 0;
      background: #ffffff;
      text-decoration: none;
      display: block;
    }

    .ls-branding span {
      font-weight: 700;
      color: var(--primary);
    }

    /* Animations */
    @keyframes lsSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes lsDrawerIn {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* Grace Period Banner */
    .ls-grace-banner {
      background: #fef3c7;
      border-bottom: 1px solid #fde68a;
      color: #92400e;
      padding: 8px 14px;
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      line-height: 1.3;
    }
    .ls-grace-banner a {
      color: #b45309;
      text-decoration: underline;
      font-weight: 800;
      white-space: nowrap;
    }

    /* Fallback Direct Contact Card */
    .ls-fallback-card {
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 14px;
      overflow-y: auto;
      flex: 1;
    }
    .ls-fallback-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #ecfdf5;
      border: 2px solid #a7f3d0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
    }
    .ls-fallback-title {
      font-size: 18px;
      font-weight: 900;
      color: var(--text-dark);
      margin: 0;
    }
    .ls-fallback-desc {
      font-size: 13px;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.5;
      max-width: 320px;
    }
    .ls-fallback-phone-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: var(--primary);
      color: #ffffff;
      padding: 14px 20px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 15px;
      text-decoration: none;
      box-shadow: 0 4px 12px rgba(18, 62, 53, 0.25);
      transition: transform 0.15s ease;
      box-sizing: border-box;
    }
    .ls-fallback-phone-btn:hover {
      transform: scale(1.02);
    }
    .ls-fallback-hours {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }
    .ls-fallback-owner-notice {
      margin-top: auto;
      width: 100%;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px;
      text-align: center;
      box-sizing: border-box;
    }
    .ls-fallback-owner-tag {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .ls-fallback-owner-notice p {
      font-size: 11px;
      color: #475569;
      margin: 0 0 8px 0;
    }
    .ls-fallback-renew-btn {
      display: inline-block;
      background: #bc5f40;
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 800;
      text-decoration: none;
      transition: background 0.15s ease;
    }
    .ls-fallback-renew-btn:hover {
      background: #a34f34;
    }

    /* Mobile Responsive Bottom Sheet */
    @media (max-width: 640px) {
      :host {
        right: 12px;
        bottom: 12px;
        left: auto;
      }

      .ls-drawer {
        width: 100vw;
        max-width: 100vw;
        height: 100vh;
        max-height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 0;
      }
    }
  `;

  // 4. HTML Structure inside Shadow DOM
  shadow.innerHTML = `
    <style>${styles}</style>

    <!-- Proactive Teaser Tooltip -->
    <div class="ls-teaser" id="lsTeaser" style="display: none;">
      <span>👋 Need fast service or a quote?</span>
    </div>

    <!-- Trigger Launcher Button -->
    <button class="ls-launcher" id="lsLauncher" aria-label="Open AI FrontDesk Chat">
      <div class="ls-badge-dot"></div>
      <svg viewBox="0 0 24 24" id="lsIconOpen">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      </svg>
      <svg viewBox="0 0 24 24" id="lsIconClose" style="display: none;">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>

    <!-- Chat Drawer -->
    <div class="ls-drawer" id="lsDrawer">
      <div class="ls-header">
        <div class="ls-header-top">
          <div class="ls-header-title">
            <div class="ls-avatar">⚡</div>
            <div>
              <div class="ls-business-name" id="lsBusinessName">Local Service FrontDesk</div>
              <div class="ls-status-sub">
                <span class="ls-status-dot"></span>
                <span>AI Dispatcher Online</span>
              </div>
            </div>
          </div>
          <button class="ls-close-btn" id="lsCloseDrawer" aria-label="Close Chat">
            <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="ls-speed-banner" id="lsSpeedBanner">
          <span>🟢</span>
          <span id="lsSpeedText">Technicians On-Duty — Live Response in &lt;5 min</span>
        </div>
      </div>

      <!-- Messages Stream -->
      <div class="ls-messages" id="lsMessages"></div>

      <!-- 1-Tap Quick Action Chips -->
      <div class="ls-chips-wrap" id="lsChips"></div>

      <!-- Photo Staging Preview Bar -->
      <div class="ls-photo-preview-bar" id="lsPhotoPreviewBar">
        <div class="ls-thumb-wrap">
          <img class="ls-thumb-img" id="lsThumbImg" src="" alt="Staged Upload" />
          <button class="ls-thumb-remove" id="lsThumbRemove">×</button>
        </div>
        <span style="font-size: 11px; color: var(--text-muted);">Photo attached for visual triage</span>
      </div>

      <!-- Footer Input Bar -->
      <div class="ls-footer">
        <input type="file" id="lsFileInput" accept="image/*" style="display: none;" />
        <button class="ls-camera-btn" id="lsCameraBtn" title="Attach Damage Photo">
          <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
          </svg>
        </button>
        <input type="text" class="ls-input" id="lsInput" placeholder="Type your message or address..." />
        <button class="ls-send-btn" id="lsSendBtn" aria-label="Send Message">
          <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>

      <!-- Viral Agency Branding -->
      <a class="ls-branding" id="lsBranding" href="https://localsurgeseo.com" target="_blank" rel="noopener">
        ⚡ Powered by <span>LocalSurge AI FrontDesk</span>
      </a>
    </div>
  `;

  // 5. DOM References inside Shadow Root
  const launcher = shadow.getElementById("lsLauncher");
  const drawer = shadow.getElementById("lsDrawer");
  const closeBtn = shadow.getElementById("lsCloseDrawer");
  const iconOpen = shadow.getElementById("lsIconOpen");
  const iconClose = shadow.getElementById("lsIconClose");
  const teaser = shadow.getElementById("lsTeaser");
  const messagesEl = shadow.getElementById("lsMessages");
  const chipsEl = shadow.getElementById("lsChips");
  const inputEl = shadow.getElementById("lsInput");
  const sendBtn = shadow.getElementById("lsSendBtn");
  const cameraBtn = shadow.getElementById("lsCameraBtn");
  const fileInput = shadow.getElementById("lsFileInput");
  const photoPreviewBar = shadow.getElementById("lsPhotoPreviewBar");
  const thumbImg = shadow.getElementById("lsThumbImg");
  const thumbRemove = shadow.getElementById("lsThumbRemove");
  const businessNameEl = shadow.getElementById("lsBusinessName");
  const speedTextEl = shadow.getElementById("lsSpeedText");
  const speedBannerEl = shadow.getElementById("lsSpeedBanner");
  const brandingEl = shadow.getElementById("lsBranding");

  // State
  let siteConfig = null;
  let stagedImageBase64 = null;
  let chatHistory = [];
  let isStreaming = false;

  // 6. Grace Period & Fallback Contact Card Handlers
  function renderGracePeriodBanner(checkoutUrl) {
    let graceBanner = shadow.getElementById("lsGraceBanner");
    if (!graceBanner) {
      graceBanner = document.createElement("div");
      graceBanner.id = "lsGraceBanner";
      graceBanner.className = "ls-grace-banner";
      const header = shadow.querySelector(".ls-header");
      if (header && header.parentNode) {
        header.parentNode.insertBefore(graceBanner, header.nextSibling);
      }
    }
    graceBanner.innerHTML = `
      <span>⚠️ 3-day courtesy grace period active.</span>
      <a href="${checkoutUrl || '#'}" target="_blank" rel="noopener">Renew for $10/mo &rarr;</a>
    `;
  }

  function renderFallbackContactCard(site, checkoutUrl, contactPhone) {
    const phone = contactPhone || site.emergency_phone || site.phone || "(512) 555-0199";
    const phoneClean = phone.replace(/[^0-9+]/g, '');

    // Hide normal interactive chat elements
    if (messagesEl) messagesEl.style.display = "none";
    if (chipsEl) chipsEl.style.display = "none";
    const footerEl = shadow.querySelector(".ls-footer");
    if (footerEl) footerEl.style.display = "none";
    const photoBar = shadow.getElementById("lsPhotoPreviewBar");
    if (photoBar) photoBar.style.display = "none";
    if (speedBannerEl) speedBannerEl.style.display = "none";

    // Update status dot and subtitle in header
    const statusSub = shadow.querySelector(".ls-status-sub");
    if (statusSub) {
      statusSub.innerHTML = `
        <span class="ls-status-dot" style="background: #f59e0b;"></span>
        <span>Direct Dispatch Line</span>
      `;
    }

    let fallbackCard = shadow.getElementById("lsFallbackCard");
    if (!fallbackCard) {
      fallbackCard = document.createElement("div");
      fallbackCard.id = "lsFallbackCard";
      fallbackCard.className = "ls-fallback-card";
      if (brandingEl && brandingEl.parentNode) {
        brandingEl.parentNode.insertBefore(fallbackCard, brandingEl);
      } else {
        drawer.appendChild(fallbackCard);
      }
    }

    fallbackCard.innerHTML = `
      <div class="ls-fallback-icon">📞</div>
      <h3 class="ls-fallback-title">Direct Contractor Dispatch</h3>
      <p class="ls-fallback-desc">Need immediate emergency service, scheduling, or a fast diagnostic estimate? Call our on-duty technicians directly:</p>
      <a href="tel:${phoneClean}" class="ls-fallback-phone-btn">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        <span>Call ${phone} Now</span>
      </a>
      <div class="ls-fallback-hours">
        <span>⏱️ Available 24/7 for active emergencies & service</span>
      </div>
      <div class="ls-fallback-owner-notice">
        <div class="ls-fallback-owner-tag">Site Owner Notice</div>
        <p>SurgeBot 24/7 AI Receptionist is paused.</p>
        <a href="${checkoutUrl || '#'}" target="_blank" rel="noopener" class="ls-fallback-renew-btn">
          ⚡ Reactivate SurgeBot for $10/mo &rarr;
        </a>
      </div>
    `;

    // Update teaser tooltip
    if (teaser) {
      teaser.innerHTML = `<span>📞 Call Dispatch: ${phone}</span>`;
      setTimeout(() => {
        if (!drawer.classList.contains("active")) {
          teaser.style.display = "flex";
        }
      }, 2500);
    }
  }

  // 7. Fetch Site Configuration & Evaluate Lifecycle
  async function loadSiteConfig() {
    try {
      const resp = await fetch(`${baseUrl}/api/frontdesk/sites/${encodeURIComponent(siteId)}`);
      const data = await resp.json();
      if (data && data.site) {
        siteConfig = data.site;

        // Franchise Sub-Path & Session Persistence Filter
        // Ensures franchise location bots only appear on their pages (e.g. /tri-cities)
        // while persisting across general national pages (/services) during that visitor session.
        const pathPrefix = siteConfig.path_prefix || siteConfig.widget_config?.path_prefix || scriptTag?.getAttribute("data-path");
        const allowedPaths = siteConfig.allowed_paths || siteConfig.widget_config?.allowed_paths || (pathPrefix ? [pathPrefix, `${pathPrefix}/*`] : null);

        if (allowedPaths && allowedPaths.length > 0) {
          const currentPath = (window.location.pathname || "/").toLowerCase().replace(/\/+$/, "") || "/";
          const sessionKey = `ls_franchise_session_${siteId}`;

          const isDirectMatch = allowedPaths.some(p => {
            const cleanPattern = String(p).replace(/\/\*$/, "").toLowerCase().replace(/\/+$/, "");
            return currentPath === cleanPattern || currentPath.startsWith(cleanPattern + "/");
          });

          if (isDirectMatch) {
            // Direct landing on franchise page -> set or refresh active visitor session (45-min window)
            try {
              sessionStorage.setItem(sessionKey, JSON.stringify({
                active: true,
                path: currentPath,
                timestamp: Date.now()
              }));
            } catch (e) {}
          } else {
            // Visitor on another page -> check if they came from the franchise location (session persistence)
            let isSessionValid = false;
            try {
              const saved = JSON.parse(sessionStorage.getItem(sessionKey) || "null");
              if (saved && saved.active && saved.timestamp) {
                const elapsedMin = (Date.now() - saved.timestamp) / (1000 * 60);
                if (elapsedMin < 45) {
                  isSessionValid = true;
                } else {
                  sessionStorage.removeItem(sessionKey);
                }
              }
            } catch (e) {}

            if (!isSessionValid) {
              console.info(`[LocalSurge FrontDesk] Current page "${currentPath}" is outside the authorized franchise location paths for site "${siteId}". Widget inactive.`);
              container.style.display = "none";
              return;
            }
          }
        }

        // 1. Soft-Locked Mode (Day 33+): Render Fallback Direct Contact Card
        if (data.isSoftLocked || data.status === "soft_locked" || siteConfig.status === "soft_locked") {
          console.info(`[LocalSurge FrontDesk] Trial grace period concluded for site "${siteId}". Switched to Fallback Direct Contact Mode.`);
          applyConfig(siteConfig, true);
          renderFallbackContactCard(siteConfig, data.checkoutUrl, data.contactPhone);
          return;
        }

        // 2. Grace Period Mode (Day 30 to Day 33): Keep chat active + show top renewal banner
        if (data.isGracePeriod || data.status === "grace_period" || siteConfig.status === "grace_period") {
          console.info(`[LocalSurge FrontDesk] Site "${siteId}" is currently in 3-day courtesy grace period.`);
          renderGracePeriodBanner(data.checkoutUrl);
        }

        applyConfig(siteConfig, false);
      }
    } catch (err) {
      console.warn("⚠️ FrontDesk config load error, applying fallback defaults:", err);
      applyConfig({
        business_name: "Local Service FrontDesk",
        widget_config: {
          themeColor: "#10b981",
          greeting: "👋 Hi! Need urgent service or a fast estimate? Let me know how we can help!",
          speedToLeadCity: "Local Area",
          quickChips: ["🚨 24/7 Emergency Service", "📍 Check My Zip Code", "💰 Get Free Estimate", "📞 Request 5-Min Callback"]
        },
        feature_flags: {
          enablePhotoUpload: true,
          enableEmergencyBanner: true,
          enableCustomBranding: false
        }
      }, false);
    }
  }

  function applyConfig(site, isSoftLocked = false) {
    // Show container now that configuration is validated
    container.style.display = "block";
    const w = site.widget_config || {};
    const flags = site.feature_flags || {};

    // Apply Theme Color
    if (w.themeColor) {
      container.style.setProperty("--primary", w.themeColor);
      container.style.setProperty("--primary-dark", w.themeColor);
    }

    if (site.business_name) {
      businessNameEl.textContent = site.business_name;
    }

    // Custom Branding (White-label)
    if (flags.enableCustomBranding === true) {
      brandingEl.style.display = "none";
    }

    if (isSoftLocked) {
      return;
    }

    // Speed-to-lead status banner
    if (flags.enableEmergencyBanner === false) {
      speedBannerEl.style.display = "none";
    } else {
      speedTextEl.textContent = `Technicians On-Duty in ${w.speedToLeadCity || site.service_radius?.city || 'your area'} — Live Response in <5 min`;
    }

    // Camera Button visibility
    if (flags.enablePhotoUpload === false) {
      cameraBtn.style.display = "none";
    }

    // Render Quick Action Chips
    renderChips(w.quickChips || ["🚨 24/7 Emergency Service", "📍 Check My Zip Code", "💰 Get Free Estimate", "📞 Request 5-Min Callback"]);

    // Initial greeting if history is empty
    if (chatHistory.length === 0) {
      const greetingText = w.greeting || `👋 Hi! Need fast assistance or a free estimate for ${site.business_name}?`;
      appendMessage("assistant", greetingText);
      chatHistory.push({ role: "assistant", content: greetingText, timestamp: new Date().toISOString() });
    }

    // Show Teaser Pill after 3 seconds
    setTimeout(() => {
      if (!drawer.classList.contains("active")) {
        teaser.style.display = "flex";
      }
    }, 3000);
  }

  function renderChips(chips) {
    chipsEl.innerHTML = "";
    chips.forEach((chipText) => {
      const chipBtn = document.createElement("button");
      chipBtn.className = "ls-chip";
      chipBtn.textContent = chipText;
      chipBtn.addEventListener("click", () => {
        teaser.style.display = "none";
        openDrawer();
        handleSendMessage(chipText);
      });
      chipsEl.appendChild(chipBtn);
    });
  }

  // 7. Drawer Toggle
  function openDrawer() {
    drawer.classList.add("active");
    iconOpen.style.display = "none";
    iconClose.style.display = "block";
    teaser.style.display = "none";
    setTimeout(() => inputEl.focus(), 100);
  }

  function closeDrawer() {
    drawer.classList.remove("active");
    iconOpen.style.display = "block";
    iconClose.style.display = "none";
  }

  launcher.addEventListener("click", () => {
    if (drawer.classList.contains("active")) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  closeBtn.addEventListener("click", closeDrawer);
  teaser.addEventListener("click", openDrawer);

  // 8. Photo Upload Handling with Automatic Canvas Compression
  function compressImage(file, maxDimension = 1024, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target.result);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  cameraBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      stagedImageBase64 = await compressImage(file, 1024, 0.82);
      thumbImg.src = stagedImageBase64;
      photoPreviewBar.classList.add("active");
    } catch (err) {
      console.warn("⚠️ Photo compression fallback:", err);
      const reader = new FileReader();
      reader.onload = () => {
        stagedImageBase64 = reader.result;
        thumbImg.src = stagedImageBase64;
        photoPreviewBar.classList.add("active");
      };
      reader.readAsDataURL(file);
    }
  });

  thumbRemove.addEventListener("click", () => {
    stagedImageBase64 = null;
    fileInput.value = "";
    photoPreviewBar.classList.remove("active");
  });

  // 9. Message Rendering & Text Formatting
  function formatMarkdown(text) {
    if (!text) return "";
    let safe = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Bold formatting
    safe = safe.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Phone number clickable links (e.g. (512) 555-0199 or 512-555-0199)
    safe = safe.replace(
      /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g,
      `<a href="tel:$1" style="color: inherit; font-weight: bold; text-decoration: underline;">$1</a>`
    );

    // Line breaks
    safe = safe.replace(/\n/g, "<br/>");
    return safe;
  }

  function appendMessage(role, text, imageUrl) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `ls-msg ls-msg-${role}`;
    msgDiv.innerHTML = formatMarkdown(text);

    if (imageUrl) {
      const img = document.createElement("img");
      img.className = "ls-msg-img";
      img.src = imageUrl;
      msgDiv.appendChild(img);
    }

    messagesEl.appendChild(msgDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return msgDiv;
  }

  // 10. Send Message & Handle SSE Stream
  async function handleSendMessage(customText) {
    const text = (customText || inputEl.value).trim();
    if ((!text && !stagedImageBase64) || isStreaming) return;

    const attachedImage = stagedImageBase64;

    // Reset input and stage
    if (!customText) inputEl.value = "";
    stagedImageBase64 = null;
    fileInput.value = "";
    photoPreviewBar.classList.remove("active");

    // Append user message
    appendMessage("user", text || "Attached damage photo:", attachedImage);
    chatHistory.push({
      role: "user",
      content: text || "Attached damage photo:",
      imageUrl: attachedImage || undefined,
      timestamp: new Date().toISOString()
    });

    isStreaming = true;

    // Create assistant streaming placeholder
    const assistantMsgEl = appendMessage("assistant", "...");
    let fullText = "";

    try {
      const activeSiteId = siteConfig?.id || siteId;
      const resp = await fetch(`${baseUrl}/api/frontdesk/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: activeSiteId,
          messages: chatHistory
        })
      });

      if (!resp.ok) {
        throw new Error(`Chat error status ${resp.status}`);
      }

      const reader = resp.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      if (reader) {
        assistantMsgEl.innerHTML = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const jsonStr = trimmed.slice(6);
            try {
              const event = JSON.parse(jsonStr);
              if (event.type === "token") {
                fullText += event.token;
                assistantMsgEl.innerHTML = formatMarkdown(fullText);
                messagesEl.scrollTop = messagesEl.scrollHeight;
              } else if (event.type === "lead_update" && event.leadId) {
                renderLeadConfirmation(event.lead);
              }
            } catch {
              // Non-JSON frame ignored
            }
          }
        }
      }

      chatHistory.push({
        role: "assistant",
        content: fullText || "Thank you! Our on-duty dispatch team has been alerted.",
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.warn("⚠️ Chat streaming connection error, engaging client fallback:", err);
      const fallbackText = "Got it! Our on-duty dispatch team has received your inquiry. Please enter your phone number so we can call you within 5 minutes!";
      assistantMsgEl.innerHTML = formatMarkdown(fallbackText);
      chatHistory.push({ role: "assistant", content: fallbackText, timestamp: new Date().toISOString() });
    } finally {
      isStreaming = false;
    }
  }

  function renderLeadConfirmation(lead) {
    if (!lead || !lead.customerPhone) return;
    const existingCard = shadow.getElementById("lsLeadConfirmation");
    if (existingCard) return;

    const card = document.createElement("div");
    card.id = "lsLeadConfirmation";
    card.className = "ls-lead-card";
    card.innerHTML = `
      <h5>✅ Dispatch Alert Prepared</h5>
      <p>Contact: <strong>${lead.customerPhone}</strong></p>
      ${lead.serviceAddress ? `<p>Location: ${lead.serviceAddress}</p>` : ""}
      <p style="margin-top: 4px; font-size: 11px;">Our dispatch technician is reviewing your request now.</p>
    `;
    messagesEl.appendChild(card);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  sendBtn.addEventListener("click", () => handleSendMessage());
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSendMessage();
  });

  // 11. Public Programmatic API
  window.LocalSurgeFrontDesk = {
    open: openDrawer,
    close: closeDrawer,
    toggle: () => (drawer.classList.contains("active") ? closeDrawer() : openDrawer()),
    resetChat: () => {
      messagesEl.innerHTML = "";
      chatHistory = [];
      if (siteConfig) applyConfig(siteConfig);
    },
    loadSite: async (newSiteId) => {
      messagesEl.innerHTML = "";
      chatHistory = [];
      try {
        const resp = await fetch(`${baseUrl}/api/frontdesk/sites/${encodeURIComponent(newSiteId)}`);
        const data = await resp.json();
        if (data && data.site) {
          siteConfig = data.site;
          applyConfig(siteConfig);
        }
      } catch (err) {
        console.warn("⚠️ Failed to load site:", err);
      }
    },
    getConfig: () => siteConfig,
  };

  // 12. Kick off initial configuration loader
  loadSiteConfig();
})();
