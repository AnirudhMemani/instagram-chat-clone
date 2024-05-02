import WebSocket, { WebSocketServer } from "ws";
import url, { fileURLToPath } from "url";
import { validateUser } from "./utils/helper.js";
import { connectToRedis } from "./redis/client.js";
import { IUser } from "./managers/UserManager.js";
import { InboxManager } from "./managers/InboxManager.js";
import express from "express";
import path from "path";

const app = express();

const __filename = fileURLToPath(import.meta.url);
export const directoryName = path.dirname(__filename);

app.use(
    "/pictures",
    express.static(path.resolve(directoryName, "..", "pictures"))
);

const port = 8080;
const wss = new WebSocketServer({ port });

connectToRedis();

const inboxManager = new InboxManager();

wss.on("connection", function connection(socket, req) {
    console.log("Connection Established");

    socket.on("error", console.error);

    const token = url.parse(req.url as string, true).query.token as string;

    if (!token) {
        socket.terminate();
        return;
    }

    const { id, fullName, profilePic } = validateUser(token, socket) as Omit<
        IUser,
        "socket"
    >;

    if (!id || !fullName || !profilePic) {
        return;
    }

    const userInfo = {
        id,
        fullName,
        profilePic,
        socket,
    };

    inboxManager.connectUser(userInfo);

    socket.on("close", () => {});
});
