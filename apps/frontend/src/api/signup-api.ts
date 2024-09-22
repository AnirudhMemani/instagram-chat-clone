import { NavigateFunction } from "react-router-dom";
import { APIServices } from "./APIServices";
import { EndPoints } from "@/utils/constants";
import { HttpStatusCode } from "axios";

export const processUserSignup = async (
	formData: FormData,
	navigate: NavigateFunction
) => {
	try {
		const response = await new APIServices(false, navigate).post(
			EndPoints.Signup,
			formData
		);
		if (response.status === HttpStatusCode.Ok) {
			return response.data;
		}
	} catch (error) {
		console.log(error);
		throw error;
	}
};
