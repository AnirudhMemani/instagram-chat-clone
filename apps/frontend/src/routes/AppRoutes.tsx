import ProtectedRoutes from "./ProtectedRoutes";
import RouteGuard from "./RouteGuard";

const AppRoutes = () => {
    return (
        <RouteGuard>
            <ProtectedRoutes />
        </RouteGuard>
    );
};

export default AppRoutes;
