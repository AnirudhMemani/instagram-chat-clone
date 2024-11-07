import { prisma } from "@instachat/db/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ConflictException, ResourceNotFoundError, UnauthorizedError } from "../middlewares/GlobalErrorHandler.js";
import { env } from "../utils/constants.js";
import { printlogs } from "../utils/logs.js";

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
        throw new ResourceNotFoundError("Username or Email does not exists");
    }

    const isPasswordValid = await bcrypt.compare(password, userInfo.password);

    if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid Credentials");
    }

    const jwtPayload = {
        id: userInfo.id,
        username: userInfo.username,
        email: userInfo.email,
        fullName: userInfo.fullName,
        profilePic: userInfo.profilePic,
    };

    const token = jwt.sign(jwtPayload, env.JWT_SECRET);

    return { token, ...jwtPayload };
};

export const saveUserInfo = async (
    email: string,
    fullName: string,
    username: string,
    password: string,
    profilePic: string
) => {
    const userExists = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { username }],
        },
        select: { id: true },
    });

    printlogs("userExists", userExists);

    if (userExists) {
        throw new ConflictException("Username or Email already exists");
    }

    const encryptedPassword = await bcrypt.hash(password, salt);

    await prisma.user.create({
        data: {
            username,
            fullName,
            email,
            password: encryptedPassword,
            profilePic,
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
        throw new ResourceNotFoundError("No other user found");
    }

    return userData;
};
