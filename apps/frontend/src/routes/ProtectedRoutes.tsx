import { EndPoints, NavigationRoutes, StatusCodes } from "@/utils/constants";
import { useEffect } from "react";
import { Navigate, Routes } from "react-router-dom";
import axios from "axios";
import { localStorageUtils } from "@/utils/LocalStorageUtils";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isAuthenticatedAtom } from "@/state/user";
import { isLoadingAtom } from "@/state/global";

const ProtectedRoutes = ({ children }: { children?: React.ReactNode }) => {
	const token = localStorageUtils.getToken();

	const navigateToLoginScreen = () => {
		return <Navigate to={NavigationRoutes.Login} replace />;
	};

	if (!token) {
		navigateToLoginScreen();
	}

	const [isAuthenticated, setIsAuthenticated] =
		useRecoilState(isAuthenticatedAtom);
	const isLoading = useSetRecoilState(isLoadingAtom);

	const authenticateUser = async () => {
		try {
			isLoading(true);
			const response = await axios.post(EndPoints.Auth, null, {
				headers: {
					Authorization: "Bearer " + token,
				},
			});
			if (response.status === StatusCodes.Ok) {
				setIsAuthenticated(true);
			} else {
				localStorageUtils.clearStore();
				setIsAuthenticated(false);
			}
		} catch (error) {
			localStorageUtils.clearStore();
			setIsAuthenticated(false);
		} finally {
			isLoading(false);
		}
	};

	useEffect(() => {
		authenticateUser();
	}, []);

	return isAuthenticated ? (
		<Routes>{children}</Routes>
	) : (
		navigateToLoginScreen()
	);
};

export default ProtectedRoutes;
