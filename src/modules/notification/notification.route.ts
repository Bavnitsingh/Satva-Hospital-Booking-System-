import { Router } from "express";
import { Routes } from "../../common/interfaces/routes.interfaces.js";

export class NotificationRouter implements Routes {

    path: string = "notification";

    router = Router();

    constructor() {
        this.init();
    }

    init() {
        // Get all notifications
        this.router.get(
            "/",
        );

        // Get unread notifications
        this.router.get(
            "/unread",
        );

        // Get unread notifications count
        this.router.get(
            "/unread/count",
        );

        // Get single notification (optional)
        this.router.get(
            "/:notificationId",
        );

        // Mark a notification as read
        this.router.patch(
            "/:notificationId/read",
        );

        // Mark all notifications as read
        this.router.patch(
            "/read-all",
            // notificationController.markAllAsRead
        );

        // Delete a notification (optional)
        this.router.delete(
            "/:notificationId",
            // authMiddleware,
            // notificationController.deleteNotification
        );

        // Delete all notifications (optional)
        this.router.delete(
            "/",
            // authMiddleware,
            // notificationController.deleteAllNotifications
        );



    }





}