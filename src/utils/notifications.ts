import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export async function requestNotificationPermission() {
  if (!Capacitor.isNativePlatform()) {
    console.log('Notifications only work on native platforms');
    return false;
  }

  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export async function scheduleExpiryNotification(
  productName: string,
  expiryDate: Date,
  daysBeforeExpiry: number = 7
) {
  if (!Capacitor.isNativePlatform()) {
    console.log('Notifications only work on native platforms');
    return;
  }

  try {
    const notificationDate = new Date(expiryDate);
    notificationDate.setDate(notificationDate.getDate() - daysBeforeExpiry);

    // Only schedule if the notification date is in the future
    if (notificationDate > new Date()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Product Expiring Soon!',
            body: `${productName} will expire in ${daysBeforeExpiry} days`,
            id: Math.floor(Math.random() * 1000000),
            schedule: { at: notificationDate },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          },
        ],
      });

      console.log(`Scheduled notification for ${productName}`);
    }
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

export async function cancelAllNotifications() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications && pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
}
