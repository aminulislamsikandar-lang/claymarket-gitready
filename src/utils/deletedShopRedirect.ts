const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const redirectDeletedShop = async () => {
  const match = window.location.pathname.match(/^\/shops\/([^/]+)\/?$/);
  if (!match) return;

  const shopId = decodeURIComponent(match[1]);
  if (!shopId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/shops?limit=100`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.success === false) return;

    const shops = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    const exists = shops.some((shop: any) => String(shop?._id || shop?.id || '') === shopId);

    if (!exists) {
      localStorage.removeItem('claymarket_shops_v2');
      localStorage.removeItem('claymarket_products_v2');
      window.location.assign('/shops');
    }
  } catch (error) {
    console.error('[Claymarket] Failed to validate shop URL', error);
  }
};

if (typeof window !== 'undefined') {
  void redirectDeletedShop();
}
