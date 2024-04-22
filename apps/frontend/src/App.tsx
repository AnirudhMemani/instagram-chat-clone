import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import { NavigationRoutes } from "./utils/constants";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import Inbox from "./pages/inbox/Inbox";
import Signup from "./pages/Signup";
import ImageCropProvider from "./components/image-editor/ImageCropProvider";

const App: React.FC = (): JSX.Element => {
    return (
        <main className="min-h-dvh w-full text-foreground dark:bg-background bg-background dark:text-foreground">
            <ImageCropProvider>
                <Routes>
                    <Route
                        path={NavigationRoutes.Login}
                        element={<Login />}
                    />
                    <Route
                        path={NavigationRoutes.Signup}
                        element={<Signup />}
                    />
                    <Route
                        path="/*"
                        element={
                            <ProtectedRoutes>
                                <Route
                                    path={NavigationRoutes.Inbox}
                                    element={<Inbox />}
                                />
                                <Route
                                    path="*"
                                    element={
                                        <Navigate
                                            to={NavigationRoutes.Inbox}
                                            replace
                                        />
                                    }
                                />
                            </ProtectedRoutes>
                        }
                    />
                </Routes>
            </ImageCropProvider>
        </main>
    );
};

export default App;
