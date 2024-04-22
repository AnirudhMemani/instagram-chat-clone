import expressAsyncHandler from "express-async-handler";
import z from "zod";
import {
    getAllUserData,
    saveUserInfo,
    validateUser,
} from "../services/user.services.js";
import {
    BadRequestException,
    InternalServerError,
    ResourceNotFoundError,
} from "../middlewares/GlobalErrorHandler.js";
import { attachedExtension } from "../utils/constants.js";

const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];
const MAX_FILE_SIZE = 1000000; // 10 MB

const fileSchema = z
    .any()
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.mimetype),
        ".jpg, .jpeg, .png and .webp files are accepted."
    );

const passwordSchema = z
    .string()
    .min(8, "Password must be minimum 8 characters");

const loginSchema = z.object({
    credentials: z.union([
        z.string().email().min(1, "Email is required"),
        z.string().min(1, "Username is required"),
    ]),
    password: passwordSchema,
});

const userSchema = z.object({
    email: z.string().email().min(1, "Email is required"),
    fullName: z.string().min(1, "Full Name is required"),
    password: passwordSchema,
    username: z.string().min(1, "Username is required"),
    profilePic: fileSchema.optional(),
});

export const UserLoginController = expressAsyncHandler(async (req, res) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        new BadRequestException(result.error.message);
        return;
    }

    const { credentials, password } = result.data;

    const response = await validateUser(credentials, password);

    if (response) {
        res.status(200).json(response);
        return;
    }
});

export const userSignupController = expressAsyncHandler(async (req, res) => {
    const result = userSchema.safeParse({ ...req.body, profilePic: req.file });

    if (!result.success) {
        new BadRequestException(result.error.message);
        return;
    }

    const { username, email, password, profilePic, fullName } = result.data;
    let filePath = "../static/anonymous-avatar.webp";

    if (profilePic) {
        const originalName = profilePic.originalname;
        const fileName = profilePic.filename;
        filePath = attachedExtension(originalName, fileName);
    }

    const response = await saveUserInfo(
        email,
        fullName,
        username,
        password,
        filePath
    );

    if (response) {
        res.status(200).json({
            message: "User created",
        });
        return;
    }

    new InternalServerError();
});

export const AllUserDataController = expressAsyncHandler(async (req, res) => {
    const id = req.query.id;

    const userData = await getAllUserData(String(id));

    if (userData) {
        res.status(200).json(userData);
        return;
    }

    new InternalServerError();
});
