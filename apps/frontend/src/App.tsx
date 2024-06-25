import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import { NavigationRoutes } from "./utils/constants";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import Inbox from "./pages/inbox/Inbox";
import Signup from "./pages/Signup";
import ImageCropProvider from "./components/image-editor/ImageCropProvider";
import Sidebar from "./pages/inbox/Sidebar";
import DirectMessage from "./pages/inbox/DirectMessages";
import { useSocket } from "./hooks/useSocket";
import { ChatRoom } from "./pages/inbox/ChatRoom";
import GroupDetailsPage from "./pages/group/GroupDetailsPage";
import { NewChatModal } from "./components/NewChatModal";
import { isChatModalVisibleAtom } from "./state/global";
import { useRecoilValue } from "recoil";

const App: React.FC = (): JSX.Element => {
    // remove the useSocket from here, it mounts it and tries to connect even in login and signup screens
    const socket = useSocket();
    const isChatModalVisible = useRecoilValue(isChatModalVisibleAtom);
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
                            <div className="flex">
                                <Sidebar className="lg:block hidden" />
                                <DirectMessage socket={socket} />
                                <ProtectedRoutes>
                                    <Route
                                        path={NavigationRoutes.Inbox}
                                        element={<Inbox />}
                                    />
                                    <Route
                                        path={NavigationRoutes.DM}
                                        element={<ChatRoom socket={socket} />}
                                    />
                                    <Route
                                        path={NavigationRoutes.CreateNewGroup}
                                        element={
                                            <GroupDetailsPage socket={socket} />
                                        }
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
                                {isChatModalVisible && (
                                    <NewChatModal socket={socket} />
                                )}
                            </div>
                        }
                    />
                </Routes>
            </ImageCropProvider>
        </main>
    );
};

export default App;
