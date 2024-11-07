import { EndPoints, StatusCodes } from "@/utils/constants";
import { printlogs } from "@/utils/logs";
import { NavigateFunction } from "react-router-dom";
import { APIServices } from "./APIServices";

export const processUserLogin = async (credentials: string, password: string, navigate: NavigateFunction) => {
    try {
        const requestBody = {
            credentials,
            password,
        };

        const response = await new APIServices(false, navigate).post(EndPoints.Login, requestBody);

        if (response.status === StatusCodes.Ok) {
            return response;
        }
    } catch (error) {
        printlogs(error);
        throw error;
    }
};
