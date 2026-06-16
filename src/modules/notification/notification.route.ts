import { Router } from "express";
import { Routes } from "../../common/interfaces/routes.interfaces.js";
import { NotificationController } from "./notification.controller.js";

export class NotificationRouter implements Routes {

    path: string = "/notifications";

    router = Router();

    private notificationController =
        new NotificationController();

    constructor() {
        this.init();
    }

    private init(): void {

        this.router.get(
            "/",
            this.notificationController.getNotifications
        );

        this.router.get(
            "/unread",
            this.notificationController.getUnreadNotifications
        );

        this.router.get(
            "/unread/count",
            this.notificationController.getUnreadCount
        );

        this.router.patch(
            "/:notificationId/read",
            this.notificationController.markAsRead
        );

        this.router.patch(
            "/read-all",
            this.notificationController.markAllAsRead
        );
    }
}