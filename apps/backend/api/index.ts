import express from "express";
import UserRouter from "./routers/user.routers.js";
import GlobalErrorHandler from "./middlewares/GlobalErrorHandler.js";
import cors from "cors";
import cloudinary from "cloudinary";
import { env } from "./utils/constants.js";

const app = express();
const port = env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

cloudinary.v2.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_SECRET,
});

app.use("/user", UserRouter);

app.use(GlobalErrorHandler);

app.listen(env.PORT, () => {
    console.log(new Date(), "Server is listening on port", port);
});
