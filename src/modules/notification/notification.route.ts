import { Router } from "express";
import { Routes } from "../../common/interfaces/routes.interfaces.js";
import { NotificationController } from "./notification.controller.js";
import { patientAuth } from "../../common/middlewares/auth.middleware.js";

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
            "/",patientAuth,
            this.notificationController.getNotifications
        );

        this.router.get(
            "/unread",patientAuth,
            this.notificationController.getUnreadNotifications
        );

        this.router.get(
            "/unread/count",patientAuth,
            this.notificationController.getUnreadCount
        );

        this.router.patch(
            "/:notificationId/read",patientAuth,
            this.notificationController.markAsRead
        );

        this.router.patch(
            "/read-all",patientAuth,
            this.notificationController.markAllAsRead
        );
    }
}