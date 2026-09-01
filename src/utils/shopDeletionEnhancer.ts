const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const BUTTON_ID = 'claymarket-delete-shop-button';
const MODAL_ID = 'claymarket-delete-shop-modal';

const getAuthToken = () => localStorage.getItem('claymarket_auth_token') || '';

const getFirebaseUserIdFromToken = (token: string) => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return '';
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return String(decoded.user_id || decoded.sub || '');
  } catch {
    return '';
  }
};

const request = async (path: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }
  return payload?.data ?? payload;
};

const getOwnedShop = async () => {
  const userId = getFirebaseUserIdFromToken(getAuthToken());
  if (!userId) return null;
  const shops = await request('/shops?limit=100');
  const list = Array.isArray(shops) ? shops : [];
  return list.find((shop: any) => String(shop?.ownerId?._id || shop?.ownerId || '') === userId) || null;
};

const removeExistingModal = () => document.getElementById(MODAL_ID)?.remove();

const showDeleteModal = (shop: any) => {
  removeExistingModal();
  let step = 1;
  const overlay = document.createElement('div');
  overlay.id = MODAL_ID;
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(15,18,30,.58);backdrop-filter:blur(4px);font-family:inherit;';

  const render = () => {
    overlay.innerHTML = `
      <div style="width:min(460px,100%);background:#fff;border-radius:24px;padding:28px;box-shadow:0 24px 70px rgba(0,0,0,.25);">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <div style="width:44px;height:44px;border-radius:14px;background:#fff1f2;color:#dc2626;display:flex;align-items:center;justify-content:center;font-size:22px;">!</div>
          <div><h2 style="margin:0;color:#20243A;font-size:20px;font-weight:800;">Delete your shop?</h2><p style="margin:3px 0 0;color:#737B89;font-size:13px;">${String(shop?.name || 'Your shop')}</p></div>
        </div>
        ${step === 1 ? `
          <p style="color:#4b5563;font-size:14px;line-height:1.55;margin:0 0 20px;">This permanently deletes your shop and its products. Your seller account will remain active.</p>
          <div style="display:flex;gap:10px;justify-content:flex-end;">
            <button data-cancel style="border:1px solid #e5e7eb;background:#fff;color:#374151;border-radius:12px;padding:10px 16px;font-weight:700;cursor:pointer;">Cancel</button>
            <button data-next style="border:0;background:#dc2626;color:#fff;border-radius:12px;padding:10px 16px;font-weight:800;cursor:pointer;">Continue</button>
          </div>` : `
          <p style="color:#991b1b;font-size:14px;line-height:1.55;margin:0 0 14px;font-weight:700;">Final confirmation: this action cannot be undone.</p>
          <p style="color:#4b5563;font-size:13px;line-height:1.55;margin:0 0 20px;">Shop: <strong>${String(shop?.name || 'Your shop')}</strong></p>
          <div style="display:flex;gap:10px;justify-content:flex-end;">
            <button data-back style="border:1px solid #e5e7eb;background:#fff;color:#374151;border-radius:12px;padding:10px 16px;font-weight:700;cursor:pointer;">Back</button>
            <button data-confirm style="border:0;background:#b91c1c;color:#fff;border-radius:12px;padding:10px 16px;font-weight:800;cursor:pointer;">Yes, Delete Shop</button>
          </div>`}
        <p data-error style="display:none;color:#dc2626;font-size:12px;margin:14px 0 0;"></p>
      </div>`;

    overlay.querySelector('[data-cancel]')?.addEventListener('click', removeExistingModal);
    overlay.querySelector('[data-next]')?.addEventListener('click', () => { step = 2; render(); });
    overlay.querySelector('[data-back]')?.addEventListener('click', () => { step = 1; render(); });
    overlay.querySelector('[data-confirm]')?.addEventListener('click', async (event) => {
      const button = event.currentTarget as HTMLButtonElement;
      button.disabled = true;
      button.textContent = 'Deleting...';
      try {
        await request(`/shops/${encodeURIComponent(String(shop._id || shop.id))}`, { method: 'DELETE' });
        localStorage.removeItem('claymarket_shops_v2');
        localStorage.removeItem('claymarket_products_v2');
        removeExistingModal();
        window.location.reload();
      } catch (error: any) {
        const errorEl = overlay.querySelector('[data-error]') as HTMLElement | null;
        if (errorEl) { errorEl.textContent = error?.message || 'Could not delete the shop.'; errorEl.style.display = 'block'; }
        button.disabled = false;
        button.textContent = 'Yes, Delete Shop';
      }
    });
  };

  document.body.appendChild(overlay);
  render();
};

const install = async () => {
  if (document.getElementById(BUTTON_ID)) return;
  const dashboard = Array.from(document.querySelectorAll('h1')).some(el => el.textContent?.includes('Seller Dashboard'));
  if (!dashboard) return;

  try {
    const shop = await getOwnedShop();
    if (!shop || document.getElementById(BUTTON_ID)) return;

    const button = document.createElement('button');
    button.id = BUTTON_ID;
    button.type = 'button';
    button.textContent = 'Delete Shop';
    button.style.cssText = 'padding:10px 16px;border-radius:999px;border:1px solid #fecaca;background:#fff7f7;color:#b91c1c;font-weight:800;font-size:12px;cursor:pointer;transition:.15s;';
    button.addEventListener('mouseenter', () => { button.style.background = '#fee2e2'; });
    button.addEventListener('mouseleave', () => { button.style.background = '#fff7f7'; });
    button.addEventListener('click', () => showDeleteModal(shop));

    const header = Array.from(document.querySelectorAll('h1')).find(el => el.textContent?.includes('Seller Dashboard'))?.closest('div[class*="rounded-3xl"]');
    const actions = header?.querySelector('div.flex.items-center.gap-3') || header?.lastElementChild;
    if (actions) actions.appendChild(button);
  } catch (error) {
    console.error('[Claymarket] Failed to initialize shop deletion', error);
  }
};

let timer: number | undefined;
const observe = () => {
  window.clearTimeout(timer);
  timer = window.setTimeout(install, 250);
};

if (typeof window !== 'undefined') {
  const observer = new MutationObserver(observe);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('popstate', observe);
  observe();
}
