import { Request, Response } from "express";
import { catchAsync } from "../../common/helpers/catch-async.js";
import { generalResponse } from "../../common/helpers/general-response.js";
import { NotificationService } from "./notification.services.js";

export class NotificationController {

    private notificationService =
        new NotificationService();

    getNotifications = catchAsync(
        async (req: Request, res: Response) => {

            const receiverId = Number(req.params.receiverId);

            const notifications =
                await this.notificationService
                    .getNotifications(receiverId);

            generalResponse({
                res,
                data: notifications,
                message: "Notifications fetched successfully"
            });

        }
    );

    getUnreadNotifications = catchAsync(
        async (req: Request, res: Response) => {

            const receiverId = Number(req.params.receiverId);

            const notifications =
                await this.notificationService
                    .getUnreadNotifications(receiverId);

            generalResponse({
                res,
                data: notifications,
                message: "Unread notifications fetched successfully"
            });

        }
    );

    getUnreadCount = catchAsync(
        async (req: Request, res: Response) => {

            const receiverId = Number(req.params.receiverId);

            const count =
                await this.notificationService
                    .getUnreadCount(receiverId);

            generalResponse({
                res,
                data: { count },
                message: "Unread notification count fetched successfully"
            });

        }
    );

    markAsRead = catchAsync(
        async (req: Request, res: Response) => {

            const notificationId =
                Number(req.params.notificationId);

            await this.notificationService
                .markAsRead(notificationId);

            generalResponse({
                res,
                message: "Notification marked as read successfully"
            });

        }
    );

    markAllAsRead = catchAsync(
        async (req: Request, res: Response) => {

            const receiverId =
                Number(req.params.receiverId);

            await this.notificationService
                .markAllAsRead(receiverId);

            generalResponse({
                res,
                message: "All notifications marked as read successfully"
            });

        }
    );

}