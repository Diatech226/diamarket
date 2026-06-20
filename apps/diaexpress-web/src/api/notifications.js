import { buildApiUrl } from './api';

export const myNotifications = async (token, unread = false) => {
  const r = await fetch(buildApiUrl('/api/notifications', unread ? { unread: true } : undefined), {
    headers: { Authorization: `Bearer ${token}` }
  });
  return r.json();
};

export const markRead = async (token, id) => {
  const r = await fetch(buildApiUrl(`/api/notifications/${id}/read`), {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  return r.json();
};
