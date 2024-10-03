import { isLoadingAtom } from "@/state/global";
import { isAuthenticatedAtom } from "@/state/user";
import { localStorageUtils } from "@/utils/LocalStorageUtils";
import { EndPoints, NavigationRoutes, StatusCodes } from "@/utils/constants";
import { printlogs } from "@/utils/logs";
import axios from "axios";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";

const navigateToLoginScreen = () => {
    return <Navigate to={NavigationRoutes.Login} replace />;
};

const RouteGuard = ({ children }: { children?: React.ReactNode }) => {
    const token = localStorageUtils.getToken();

    if (!token) {
        navigateToLoginScreen();
    }

    const [isAuthenticated, setIsAuthenticated] = useRecoilState(isAuthenticatedAtom);
    const setIsLoading = useSetRecoilState(isLoadingAtom);

    const authenticateUser = async () => {
        try {
            setIsLoading(true);
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
            printlogs("Authentication middleware error", error);
            localStorageUtils.clearStore();
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        authenticateUser();
    }, []);

    return isAuthenticated ? <>{children}</> : navigateToLoginScreen();
};

export default RouteGuard;
