import { Route, Routes } from "react-router-dom";
import ImageCropProvider from "./components/image-editor/ImageCropProvider";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AppRoutes from "./routes/AppRoutes";
import { NavigationRoutes } from "./utils/constants";

const App: React.FC = (): JSX.Element => {
	return (
		<main className="min-h-dvh w-full text-foreground dark:bg-background bg-background dark:text-foreground">
			<ImageCropProvider>
				<Routes>
					<Route path={NavigationRoutes.Login} element={<Login />} />
					<Route path={NavigationRoutes.Signup} element={<Signup />} />
					<Route path="/*" element={<AppRoutes />} />
				</Routes>
			</ImageCropProvider>
		</main>
	);
};

export default App;
