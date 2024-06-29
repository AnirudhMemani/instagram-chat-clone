import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import { NavigationRoutes } from "./utils/constants";
import Signup from "./pages/Signup";
import ImageCropProvider from "./components/image-editor/ImageCropProvider";
import AppRoutes from "./routes/AppRoutes";

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
                        element={<AppRoutes />}
                    />
                </Routes>
            </ImageCropProvider>
        </main>
    );
};

export default App;
