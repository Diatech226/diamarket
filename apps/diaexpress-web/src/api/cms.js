const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
async function get(path) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`);
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.data ?? payload;
  } catch (_error) {
    return null;
  }
}
export const getPublicSiteSettings = () => get('/api/public/site-settings');
export const getPublicHomepage = () => get('/api/public/homepage');
export const getPublicServices = () => get('/api/public/services');
export const getPublicPopularRoutes = () => get('/api/public/popular-routes');
export const getPublicFaq = () => get('/api/public/faq');
