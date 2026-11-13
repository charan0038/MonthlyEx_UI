import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import './sweetUpdateAlert.css';

export const CURRENT_UPDATE_VERSION = 'vessel_update_2026_11_v2';

export const showWhatsNewAlert = (theme: 'dark' | 'light' = 'dark', force: boolean = false) => {
  // If not forced (auto-trigger), check if already shown to user
  if (!force) {
    const hasSeen = localStorage.getItem(CURRENT_UPDATE_VERSION);
    if (hasSeen === 'true') {
      return;
    }
  }

  // Mark as seen immediately so it only pops up once
  localStorage.setItem(CURRENT_UPDATE_VERSION, 'true');

  const isDark = theme === 'dark';

  Swal.fire({
    title: '',
    html: `
      <div class="swal-update-wrapper ${isDark ? 'dark-theme' : 'light-theme'}">
        <!-- Top Pill Badge -->
        <div class="swal-update-pill-badge">
          <span class="swal-update-sparkle-icon">✨</span>
          <span>NEW SYSTEM UPDATE</span>
        </div>

        <h2 class="swal-update-heading">What's New in Vessel</h2>
        <p class="swal-update-tagline">
          We've introduced major new financial tracking & productivity tools to make managing your money effortless!
        </p>

        <!-- Features List -->
        <div class="swal-update-features-grid">
          <!-- Feature 1: Dues & Commitments -->
          <div class="swal-feature-card">
            <div class="swal-feature-icon-box emi-box">
              🏛️
            </div>
            <div class="swal-feature-text">
              <div class="swal-feature-title">
                <span>Dues & Commitments Tracker</span>
                <span class="swal-feature-tag new-tag">New</span>
              </div>
              <p class="swal-feature-desc">
                Track <strong>Chit Funds (சீட்டு)</strong>, <strong>Personal Hand Loans (கைமாத்து கடன்)</strong>, and <strong>EMIs</strong> with automatic real-time deduction every time you add an expense!
              </p>
            </div>
          </div>

          <!-- Feature 2: Built-in Calculator -->
          <div class="swal-feature-card">
            <div class="swal-feature-icon-box calc-box">
              🧮
            </div>
            <div class="swal-feature-text">
              <div class="swal-feature-title">
                <span>Built-in Financial Calculator</span>
                <span class="swal-feature-tag">Smart</span>
              </div>
              <p class="swal-feature-desc">
                Do math and calculate splits on the fly. Tap <em>Apply</em> to prefill amounts straight into your transaction form!
              </p>
            </div>
          </div>

          <!-- Feature 3: Category Icon Picker -->
          <div class="swal-feature-card">
            <div class="swal-feature-icon-box icon-box">
              🎨
            </div>
            <div class="swal-feature-text">
              <div class="swal-feature-title">
                <span>Expandable Icon Picker</span>
                <span class="swal-feature-tag">Visual</span>
              </div>
              <p class="swal-feature-desc">
                30+ categorized outline icons across Food, Living, Travel, Leisure, Work & Finance with quick filter pills.
              </p>
            </div>
          </div>

          <!-- Feature 4: Mobile Responsiveness -->
          <div class="swal-feature-card">
            <div class="swal-feature-icon-box mobile-box">
              📱
            </div>
            <div class="swal-feature-text">
              <div class="swal-feature-title">
                <span>Mobile-First Responsiveness</span>
                <span class="swal-feature-tag">Polished</span>
              </div>
              <p class="swal-feature-desc">
                Balanced header navigation and smooth tab switchers custom-tailored for iPhone XR, Android & mobile viewports.
              </p>
            </div>
          </div>
        </div>

        <div class="swal-update-footer-tip">
          💡 You can re-open this message anytime by tapping the <strong>✨ Sparkles</strong> icon in the top navigation bar!
        </div>
      </div>
    `,
    showCloseButton: true,
    showConfirmButton: true,
    confirmButtonText: 'Explore New Features 🚀',
    buttonsStyling: false,
    background: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f8fafc' : '#0f172a',
    customClass: {
      popup: `vessel-sweet-popup ${isDark ? 'vessel-sweet-dark' : 'vessel-sweet-light'}`,
      confirmButton: 'vessel-sweet-confirm-btn',
      closeButton: 'vessel-sweet-close-btn',
    },
    showClass: {
      popup: 'swal2-show animate-scale-up',
    },
    hideClass: {
      popup: 'swal2-hide animate-scale-down',
    },
  });
};
