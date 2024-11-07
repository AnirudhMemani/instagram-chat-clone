// RouteGuard.tsx
import { Loader } from "@/components/Loader";
import { localStorageUtils } from "@/utils/LocalStorageUtils";
import { EndPoints, handleUserLogout, NAVIGATION_ROUTES, StatusCodes } from "@/utils/constants";
import { printlogs } from "@/utils/logs";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const token = useMemo(() => localStorageUtils.getToken(), []);

    useEffect(() => {
        const authenticateUser = async () => {
            if (!token) return handleUserLogout(navigate);

            try {
                const response = await axios.post(EndPoints.Auth, null, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                response.status === StatusCodes.Ok ? setIsAuthenticated(true) : handleUserLogout(navigate);
            } catch (error) {
                printlogs("Authentication error", error);
                handleUserLogout(navigate);
            } finally {
                setIsLoading(false);
            }
        };

        authenticateUser();
    }, [token]);

    if (isLoading) {
        return (
            <div className="flex h-dvh w-full items-center justify-center bg-black/60">
                <Loader visible />
            </div>
        );
    }

    return isAuthenticated ? <>{children}</> : <Navigate to={NAVIGATION_ROUTES.LOGIN} replace />;
};

export default RouteGuard;
