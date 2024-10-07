import expressAsyncHandler from "express-async-handler";
import z from "zod";
import { getAllUserData, saveUserInfo, validateUser } from "../services/user.services.js";
import { BadRequestException, InternalServerError } from "../middlewares/GlobalErrorHandler.js";
import cloudinary from "cloudinary";
import { Readable } from "stream";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileSchema = z
    .any()
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.mimetype), ".jpg .jpeg .png or .webp files are accepted.");

const passwordSchema = z.string().min(8, "Password must be minimum 8 characters");

const loginSchema = z.object({
    credentials: z.union([z.string().email().min(1, "Email is required"), z.string().min(1, "Username is required")]),
    password: passwordSchema,
});

const userSchema = z.object({
    email: z.string().email().min(1, "Email is required"),
    fullName: z.string().min(1, "Full Name is required"),
    password: passwordSchema,
    username: z.string().min(1, "Username is required"),
    profilePic: fileSchema.optional(),
});

interface UserSignupRequest {
    email: string;
    fullName: string;
    password: string;
    username: string;
    profilePic?: Express.Multer.File;
}

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

    new InternalServerError();
});

const uploadToCloudinary = async (profilePic: Buffer): Promise<string> => {
    return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream({ resource_type: "auto" }, (error, result) => {
            if (error) {
                console.error(error);
                reject(error);
            } else if (result) {
                resolve(result.secure_url);
            } else {
                reject(new InternalServerError("Could not upload your profile picture"));
            }
        });

        const bufferStream = Readable.from(profilePic);
        bufferStream.pipe(uploadStream);
    });
};

export const userSignupController = expressAsyncHandler(async (req, res) => {
    const result = userSchema.safeParse({
        ...req.body,
        profilePic: req.file,
    });

    if (!result.success) {
        new BadRequestException(result.error.message);
        return;
    }

    const { username, email, password, profilePic, fullName } = result.data as UserSignupRequest;

    let filePath = "https://res.cloudinary.com/dtbyy0w95/image/upload/v1716151086/anonymous-avatar_dmiw3j.webp";

    if (profilePic) {
        try {
            const secure_url = await uploadToCloudinary(profilePic.buffer);
            filePath = secure_url;
        } catch (error) {
            new InternalServerError("Failed to process profile picture");
        }
    }

    const response = await saveUserInfo(email, fullName, username, password, filePath);

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
