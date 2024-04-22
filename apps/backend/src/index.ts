import express from "express";
import UserRouter from "./routers/user.routers.js";
import GlobalErrorHandler from "./middlewares/GlobalErrorHandler.js";
import { directoryName, env } from "./utils/constants.js";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    "/pictures",
    express.static(path.resolve(directoryName, "..", "pictures"))
);

app.use("/user", UserRouter);

app.use(GlobalErrorHandler);

app.listen(env.PORT, () => {
    console.log(new Date(), "Server is listening on port", port);
});
