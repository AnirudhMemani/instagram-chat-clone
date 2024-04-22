import { NavigateFunction } from "react-router-dom";
import { APIServices } from "./APIServices";
import { EndPoints, StatusCodes } from "@/utils/constants";

export const getAllUsers = async (id: string, navigate: NavigateFunction) => {
    try {
        const response = await new APIServices(false, navigate).get(
            EndPoints.GetAllUsers,
            { params: { id } }
        );

        if (response.status === StatusCodes.Ok) {
            return response;
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getUserDirectMessages = async (id: string) => {
    try {
        //
    } catch (error) {
        console.log(error);
        throw error;
    }
};
