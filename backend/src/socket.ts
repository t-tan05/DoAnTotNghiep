import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import redisClient from "#config/redis";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN } from "#config/jwt";
import { findUserById } from "#models/user.model";
import {
    removeOnlineStaff,
    removeOnlineVisitor,
    setOnlineStaff,
    setOnlineVisitor,
} from "#utils/dashboardMetrics";
import { getDashboardSummaryAnalyticsService } from "#services/dashboardAnalytics.service";
import logger from "#config/logger";

let io: Server;

export function initSocket(server: HttpServer) {
    io = new Server(server, {
        cors: {
            origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : true,
            credentials: true,
        },
    });

    io.use(async(socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if(!token) {
                socket.data.visitorKind = "guest";
                return next();
            }

            const isBlacklist = await redisClient.exists(`blacklist:${token}`);
            if(isBlacklist) {
                return next(new Error("UNAUTHORIZED"));
            }

            const decoded = jwt.verify(token, ACCESS_TOKEN as string, {
                algorithms: ['HS512'],
            }) as jwt.JwtPayload;

            if(!decoded.user_id) {
                return next(new Error("UNAUTHORIZED"));
            }

            const currentUser = await findUserById(decoded.user_id);

            if(!currentUser || currentUser.status === "LOCKED") {
                return next(new Error("UNAUTHORIZED"));
            }

            socket.data.user = {
                user_id: currentUser.user_id,
                email: currentUser.email,
                roles: currentUser.users_roles.map((role) => role.role_name),
            };

            next();
        }catch{
            socket.data.visitorKind = "guest";
            next();
        }
    });

    io.on("connection", (socket) => {
        const currentUserId = socket.data.user?.user_id;
        const roles: string[] = socket.data.user?.roles || [];

        logger.info({
            socketId: socket.id,
            userId: currentUserId ?? null,
            roles,
        }, "Socket connected");

        if(currentUserId) {
            socket.join(`user:${currentUserId}`);
            socket.join(`warranty_user:${currentUserId}`);
        }

        if(currentUserId && (roles.includes("ADMIN") || roles.includes("EMPLOYEE"))) {
            setOnlineStaff(socket.id, {
                userId: currentUserId,
                roles,
            });
            emitDashboardUpdate();
        }

        socket.on("join_admin", () => {
            const canJoinAdmin = roles.includes("ADMIN") || roles.includes("EMPLOYEE");

            if(!canJoinAdmin) {
                socket.emit("socket:error", "Bạn không có quyền theo dõi đơn hàng.");
                return;
            }

            socket.join("admin");
        });

        socket.on("join_dashboard", async() => {
            const canJoinDashboard = roles.includes("ADMIN");

            if(!canJoinDashboard) {
                socket.emit("socket:error", "Bạn không có quyền theo dõi dashboard.");
                return;
            }

            socket.join("dashboard_admin");
            socket.emit("dashboard:updated", await getDashboardSummaryAnalyticsService());
        });

        socket.on("visitor:active", () => {
            setOnlineVisitor(socket.id, {
                kind: currentUserId ? "authenticated" : "guest",
                userId: currentUserId || null,
            });
            emitDashboardUpdate();
        });

        socket.on("join_warranty_staff", () => {
            const roles: string[] = socket.data.user?.roles || [];

            const canJoinWarrantyStaff = roles.includes("ADMIN") || roles.includes("EMPLOYEE");

            if(!canJoinWarrantyStaff) {
                socket.emit("socket:error", "Bạn không có quyền theo dõi bảo hành.");
                return;
            }

            socket.join("warranty_staff");
        });

        socket.on("join_warranty_detail", (warrantyId: unknown) => {
            const roles: string[] = socket.data.user?.roles || [];
            const canJoinWarrantyDetail = roles.includes("ADMIN") || roles.includes("EMPLOYEE");

            if(!canJoinWarrantyDetail || typeof warrantyId !== "string" || !warrantyId.trim()) {
                socket.emit("socket:error", "Bạn không có quyền theo dõi chi tiết bảo hành.");
                return;
            }

            socket.join(`warranty_detail:${warrantyId}`);
        });

        socket.on("disconnect", () => {
            removeOnlineVisitor(socket.id);
            removeOnlineStaff(socket.id);
            emitDashboardUpdate();
            logger.info({
                socketId: socket.id,
                userId: currentUserId ?? null,
            }, "Socket disconnected");
        });
    });

    return io;
}

export function getIO() {
    if(!io) {
        throw new Error("Socket.IO chưa được khởi tạo.");
    }

    return io;
}

export async function emitDashboardUpdate() {
    if(!io) return;

    const room = io.sockets.adapter.rooms.get("dashboard_admin");
    if(!room?.size) return;

    try {
        io.to("dashboard_admin").emit("dashboard:updated", await getDashboardSummaryAnalyticsService());
    }catch(error) {
        logger.error({ err: error }, "Emit dashboard update failed");
    }
}
