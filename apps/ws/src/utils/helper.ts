import jwt, { JwtPayload } from "jsonwebtoken";
import WebSocket from "ws";
import { env } from "./constants.js";

export const validateUser = (token: string, socket: WebSocket) => {
    try {
        const decodedToken = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        if (decodedToken) {
            return decodedToken;
        }
        socket.close(1007, "Couldn't verify the token");
    } catch (error) {
        console.error(error);
        socket.close(1007, "Couldn't verify the token");
    }
};

export const getSortedSetKey = (id: string) => {
    return `user:${id}:dms`;
};
