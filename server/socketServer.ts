import http from "http";
import { Server as SocketIOServer } from "socket.io";

export const initSocketServer = (server: http.Server) => {
    const io = new SocketIOServer(server);

    io.on("connection", (socket) => {
        console.log("A user connected");

        // Listen for notification events
        socket.on("notification", (data) => {
            // Broadcast the notification to all connected clients
            io.emit("newNotification", data);
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
    });
};