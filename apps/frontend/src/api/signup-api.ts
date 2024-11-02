import { EndPoints, StatusCodes } from "@/utils/constants";
import { NavigateFunction } from "react-router-dom";
import { APIServices } from "./APIServices";

export const processUserSignup = async (formData: FormData, navigate: NavigateFunction) => {
    try {
        const response = await new APIServices(false, navigate).post(EndPoints.Signup, formData);
        if (response.status === StatusCodes.Ok) {
            return response.data;
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
};
