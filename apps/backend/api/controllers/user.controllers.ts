import cloudinary from "cloudinary";
import expressAsyncHandler from "express-async-handler";
import { Readable } from "stream";
import z from "zod";
import { InternalServerError } from "../middlewares/GlobalErrorHandler.js";
import { getAllUserData, saveUserInfo, validateUser } from "../services/user.services.js";

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
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    const { fieldErrors } = validation.error.flatten();

    const formattedErrors = Object.entries(fieldErrors).map(([field, errors]) => ({
      field,
      errors,
    }));

    res.status(400).json(formattedErrors);
    return;
  }

  const { credentials, password } = validation.data;

  const response = await validateUser(credentials, password);

  if (response) {
    res.status(200).json(response);
    return;
  }

  throw new InternalServerError();
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
  const validation = userSchema.safeParse({
    ...req.body,
    profilePic: req.file,
  });

  if (!validation.success) {
    const { fieldErrors } = validation.error.flatten();

    const formattedErrors = Object.entries(fieldErrors).map(([field, errors]) => ({
      field,
      errors,
    }));

    res.status(400).json(formattedErrors);
    return;
  }

  const { username, email, password, profilePic, fullName } = validation.data as UserSignupRequest;

  const defaultImageUrl = "https://res.cloudinary.com/dtbyy0w95/image/upload/v1716151086/anonymous-avatar_dmiw3j.webp";

  let filePath = defaultImageUrl;

  if (profilePic) {
    try {
      const secure_url = await uploadToCloudinary(profilePic.buffer);
      filePath = secure_url;
    } catch (error) {
      throw new InternalServerError("Failed to process profile picture");
    }
  }

  const response = await saveUserInfo(email, fullName, username, password, filePath);

  if (response) {
    res.status(200).json({
      message: "User created",
    });
    return;
  }

  throw new InternalServerError();
});

export const AllUserDataController = expressAsyncHandler(async (req, res) => {
  const id = req.query.id;

  const userData = await getAllUserData(String(id));

  if (userData) {
    res.status(200).json(userData);
    return;
  }

  throw new InternalServerError();
});
