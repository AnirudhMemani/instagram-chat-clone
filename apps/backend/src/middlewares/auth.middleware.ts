import expressAsyncHandler from "express-async-handler";
import { ForbiddenError } from "./GlobalErrorHandler.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../utils/constants.js";

export const authMiddleware = expressAsyncHandler((req, res, next) => {
    try {
        const authToken = req.headers.authorization;

        if (!authToken) {
            new ForbiddenError("Token not found");
            return;
        }

        const token = validateTokenPattern(authToken);

        if (!token) {
            new ForbiddenError("Authorization header must start with Bearer");
            return;
        }

        jwt.verify(token, env.JWT_SECRET) as JwtPayload;

        next();
    } catch (error) {
        next(error);
    }
});

const validateTokenPattern = (token: string): string | null => {
    const result = token.startsWith("Bearer ");
    return result ? token.split(" ").pop() ?? null : null;
};
