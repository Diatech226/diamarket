const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { renderTemplate } = require('./notificationTemplates');

async function createNotification({ userId, recipientEmail, recipientPhone, channel = 'in_app', eventType = 'System', type = 'system', title, message, relatedType, relatedId, metadata = {}, status = 'sent' }) {
  const objectUserId = userId && mongoose.Types.ObjectId.isValid(String(userId)) ? userId : undefined;
  return Notification.create({ user: objectUserId, userId: userId ? String(userId) : undefined, recipientEmail, recipientPhone, channel, eventType, type, title, message, status, sentAt: new Date(), relatedType, relatedId, relatedEntity: { entityType: relatedType, entityId: relatedId }, deliveryChannels: { inApp: channel === 'in_app', email: channel === 'email', sms: channel === 'sms', whatsapp: channel === 'whatsapp' }, metadata });
}

exports.notify = async ({ userId, recipientEmail, recipientPhone, eventType, template, type = 'system', title, message, relatedType, relatedId, metadata = {}, channels = ['in_app', 'email'] }) => {
  const rendered = title && message ? { title, message } : renderTemplate(template, metadata);
  const safeChannels = channels.length ? channels : ['in_app'];
  const notifications = [];
  for (const channel of safeChannels) {
    notifications.push(await createNotification({ userId, recipientEmail, recipientPhone, channel, eventType, type, title: rendered.title, message: rendered.message, relatedType, relatedId, metadata, status: channel === 'email' ? 'pending' : 'sent' }));
    if (channel === 'email') console.info('[email:mock]', { to: recipientEmail, eventType, title: rendered.title });
  }
  return notifications;
};

exports.push = async ({ userId, type, title, message, entity = {}, channels = {}, metadata = {} }) => createNotification({ userId, type, title, message, relatedType: entity.entityType, relatedId: entity.entityId, eventType: metadata.eventType || type, channel: channels.email ? 'email' : 'in_app', metadata });
function userRecipientFilter(userId) {
  const conditions = [{ userId: String(userId) }];
  if (userId && mongoose.Types.ObjectId.isValid(String(userId))) conditions.push({ user: userId });
  return { $or: conditions };
}
exports.markAsRead = async (id, userId) => Notification.findOneAndUpdate({ _id: id, ...userRecipientFilter(userId) }, { read: true, readAt: new Date(), status: 'read' }, { new: true });
exports.markAllAsRead = async (userId) => Notification.updateMany({ ...userRecipientFilter(userId), read: false }, { read: true, readAt: new Date(), status: 'read' });
exports.listForUser = async (userId, { limit = 50, unread } = {}) => Notification.find({ ...userRecipientFilter(userId), ...(unread ? { read: false } : {}) }).sort({ createdAt: -1 }).limit(Math.min(Number(limit) || 50, 100));
exports.listAdmin = async ({ limit = 100, unread } = {}) => Notification.find({ ...(unread ? { read: false } : {}), $or: [{ type: 'incident' }, { eventType: /Incident|Delayed|DeliveryFailed|PaymentReceived|QuoteSubmitted/ }] }).sort({ createdAt: -1 }).limit(Math.min(Number(limit) || 100, 250));
