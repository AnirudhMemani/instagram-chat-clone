import { Router } from "express";
import {
    AllUserDataController,
    UserLoginController,
    userSignupController,
} from "../controllers/user.controllers.js";
import multer from "multer";
import path from "path";
import { directoryName } from "../utils/constants.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

const uploadDirectory = path.resolve(directoryName, "..", "pictures");
const uploadMiddleware = multer({ dest: uploadDirectory });

router.post(
    "/signup",
    uploadMiddleware.single("profilePic"),
    userSignupController
);

router.post("/login", UserLoginController);

router.get("/get-all", AllUserDataController);

router.post("/auth", authMiddleware, (req, res) =>
    res.status(200).json("success")
);

export default router;
