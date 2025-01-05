import { Route, Routes } from "react-router-dom";
import ImageCropProvider from "./components/image-editor/ImageCropProvider";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AppRoutes from "./routes/AppRoutes";
import { NAVIGATION_ROUTES } from "./utils/constants";

const App: React.FC = (): JSX.Element => {
    return (
        <main className="text-foreground dark:bg-background bg-background dark:text-foreground w-full lg:min-h-dvh">
            <ImageCropProvider>
                <Routes>
                    <Route path={NAVIGATION_ROUTES.LOGIN} element={<Login />} />
                    <Route path={NAVIGATION_ROUTES.RECRUITER_LOGIN} element={<Login />} />
                    <Route path={NAVIGATION_ROUTES.SIGNUP} element={<Signup />} />
                    <Route path="/*" element={<AppRoutes />} />
                </Routes>
            </ImageCropProvider>
        </main>
    );
};

export default App;
