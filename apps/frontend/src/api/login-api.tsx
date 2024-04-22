import { EndPoints, StatusCodes } from "@/utils/constants";
import { APIServices } from "./APIServices";
import { NavigateFunction } from "react-router-dom";

export const processUserLogin = async (
    credentials: string,
    password: string,
    navigate: NavigateFunction
) => {
    try {
        const requestBody = {
            credentials,
            password,
        };

        const response = await new APIServices(false, navigate).post(
            EndPoints.Login,
            requestBody
        );

        if (response.status === StatusCodes.Ok) {
            return response;
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
};
