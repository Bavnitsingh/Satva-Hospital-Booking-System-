import {
  CreateINotification,
  INotification
} from "./notification.interface.js";

import { INotificationRepository } from "./notification.repository.js";

export class INotificationService {

  private notificationRepository =
    new INotificationRepository();


  async createINotification(
    data: INotification
  ): Promise<{
    notification_id: number;
  }> {

    return await this.notificationRepository
      .createNotification(data) as;

  }


  async getINotifications(
    userId: number
  ): Promise<INotification[]> {

    return await this.notificationRepository
      .getINotifications(userId);

  }


  async getUnreadINotifications(
    userId: number
  ): Promise<INotification[]> {

    return await this.notificationRepository
      .getUnreadINotifications(userId);

  }


  async getUnreadCount(
    userId: number
  ): Promise<number> {

    return await this.notificationRepository
      .getUnreadCount(userId);

  }


  async markAsRead(
    notificationId: number
  ): Promise<void> {

    await this.notificationRepository
      .markAsRead(notificationId);

  }


  async markAllAsRead(
    userId: number
  ): Promise<void> {

    await this.notificationRepository
      .markAllAsRead(userId);

  }

}