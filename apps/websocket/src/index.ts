import cloudinary from "cloudinary";
import url from "url";
import WebSocket, { WebSocketServer } from "ws";
import { InboxManager } from "./managers/InboxManager.js";
import { IUser, IUserWithSocket, UserManager } from "./managers/UserManager.js";
import { connectToRedis } from "./redis/client.js";
import { validateUser } from "./utils/helper.js";
import { printlogs } from "./utils/logs.js";

const port = Number(process.env.WS_URL) || 8080;
const wss = new WebSocketServer({ port });
const userManager = new UserManager();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

connectToRedis();

wss.on("connection", function connection(socket, req) {
    console.log("Connection Established");

    socket.on("error", printlogs);

    const token = url.parse(req.url as string, true).query.token as string;

    if (!token) {
        return closeSocket(socket, "Token not found");
    }

    const user = validateUser(token, socket) as IUser;

    if (!user) {
        return socket.close(1007, "Invalid token");
    }

    const userWithSocket: IUserWithSocket = {
        ...user,
        socket,
        chatRooms: [],
    };

    userManager.addUser(userWithSocket);

    const inboxManager = new InboxManager(socket, userManager);

    inboxManager.connectUser(userWithSocket);

    socket.on("close", () => userManager.removeUser(user.id));
});

function closeSocket(socket: WebSocket, reason: string) {
    socket.close(1007, reason);
}
