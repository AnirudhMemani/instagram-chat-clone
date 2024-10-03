import cloudinary from "cloudinary";
import url from "url";
import { WebSocketServer } from "ws";
import { InboxManager } from "./managers/InboxManager.js";
import { IUser } from "./managers/UserManager.js";
import { connectToRedis } from "./redis/client.js";
import { validateUser } from "./utils/helper.js";

// const app = express();

// const __filename = fileURLToPath(import.meta.url);
// export const directoryName = path.dirname(__filename);

// app.use("pictures", express.static(path.resolve(directoryName, "pictures")));

const port = Number(process.env.WS_URL) || 8080;
const wss = new WebSocketServer({ port });

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

connectToRedis();

const inboxManager = new InboxManager();

wss.on("connection", function connection(socket, req) {
    console.log("Connection Established");

    socket.on("error", console.error);

    const token = url.parse(req.url as string, true).query.token as string;

    if (!token) {
        socket.close(1007, "Token not found");
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

    socket.on("close", () => socket.close());
});
