import WebSocket from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "./constants.js";

export const validateUser = (token: string, socket: WebSocket) => {
    try {
        const decodedToken = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        if (decodedToken) {
            return decodedToken;
        }
        socket.terminate();
    } catch (error) {
        console.error(error);
        socket.terminate();
    }
};

export const getSortedSetKey = (id: string) => {
    return `user:${id}:dms`;
};
