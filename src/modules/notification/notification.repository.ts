import { query } from "../../database/connection.js";
import { INotification } from "./notification.interface.js";

export class NotificationRepository {

  async getINotifications(
    userId: number
  ): Promise<INotification[]> {

    const sql = `
      select *
      from notifications
      where patient_id = ?
         or doctor_id = ?
      order by created_at desc
    `;

    return await query(
      sql,
      [userId, userId]
    ) as INotification[];
  }

  async getUnreadINotifications(
    userId: number
  ): Promise<INotification[]> {

    const sql = `
      select *
      from notifications
      where
      (
        patient_id = ?
        or doctor_id = ?
      )
      and is_read = false
      order by created_at desc
    `;

    return await query(
      sql,
      [userId, userId]
    ) as INotification[];
  }

  async getUnreadCount(
    userId: number
  ): Promise<number> {

    const sql = `
      select count(*) as count
      from notifications
      where
      (
        patient_id = ?
        or doctor_id = ?
      )
      and is_read = false
    `;

    const rows = await query(sql,[userId, userId]) as { count: number }[];

    return rows[0]?.count as number;
  }

  async markAsRead(
    notificationId: number
  ): Promise<void> {

    const sql = `
      update notifications
      set is_read = true
      where notification_id = ?
    `;

    await query(
      sql,
      [notificationId]
    );
  }

  async markAllAsRead(
    userId: number
  ): Promise<void> {

    const sql = `
      update notifications
      set is_read = true
      where
      (
        patient_id = ?
        or doctor_id = ?
      )
      and is_read = false
    `;

    await query(
      sql,
      [userId, userId]
    );
  }
}