import { Router } from "express";
import multer from "multer";
import { AllUserDataController, UserLoginController, userSignupController } from "../controllers/user.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

router.post("/signup", upload.single("profilePic"), userSignupController);

router.post("/login", UserLoginController);

router.get("/get-all", AllUserDataController);

router.post("/auth", authMiddleware, (_, res) => res.status(200).json("success"));

export default router;
