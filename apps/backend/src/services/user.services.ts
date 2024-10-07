import { prisma } from "@instachat/db/client";
import { ConflictException, ResourceNotFoundError, UnauthorizedError } from "../middlewares/GlobalErrorHandler.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../utils/constants.js";
import bcrypt from "bcrypt";

const salt = 10;

export const validateUser = async (credentials: string, password: string) => {
    const userInfo = await prisma.user.findFirst({
        where: {
            OR: [{ email: credentials }, { username: credentials }],
        },
        select: {
            id: true,
            password: true,
            profilePic: true,
            fullName: true,
            username: true,
            email: true,
        },
    });

    if (!userInfo) {
        new ResourceNotFoundError("Username or Email does not exists");
        return;
    }

    const isPasswordValid = await bcrypt.compare(password, userInfo.password);

    if (!isPasswordValid) {
        new UnauthorizedError("Invalid Credentials");
        return;
    }

    const jwtPayload = {
        id: userInfo.id,
        username: userInfo.username,
        fullName: userInfo.fullName,
        profilePic: userInfo.profilePic,
    };

    const token = jwt.sign(jwtPayload, env.JWT_SECRET, {
        expiresIn: "365d",
    });

    const decodedToken = jwt.decode(token) as JwtPayload;

    return { token, ...decodedToken, email: userInfo.email };
};

export const saveUserInfo = async (
    email: string,
    fullName: string,
    username: string,
    password: string,
    profilePic: string
) => {
    const userId = await prisma.user.findFirst({
        where: {
            OR: [{ email, username }],
        },
        select: { id: true },
    });

    if (userId) {
        new ConflictException("Username or Email already exists");
    }

    const encryptedPassword = await bcrypt.hash(password, salt);

    await prisma.user.create({
        data: {
            username,
            fullName,
            email,
            password: encryptedPassword,
            profilePic,
            createdAt: new Date(Date.now()),
        },
        select: {
            id: true,
        },
    });
    return true;
};

export const getAllUserData = async (id: string) => {
    const userData = await prisma.user.findMany({
        where: {
            NOT: { id },
        },
        select: {
            id: true,
            fullName: true,
            username: true,
            profilePic: true,
        },
    });

    if (!userData) {
        new ResourceNotFoundError("No other user found");
    }

    return userData;
};
