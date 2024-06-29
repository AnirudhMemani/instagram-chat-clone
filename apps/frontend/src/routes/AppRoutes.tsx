import { useSocket } from "@/hooks/useSocket";
import DirectMessage from "@/pages/inbox/DirectMessages";
import Sidebar from "@/pages/inbox/Sidebar";
import ProtectedRoutes from "./ProtectedRoutes";
import { Navigate, Route } from "react-router-dom";
import Inbox from "@/pages/inbox/Inbox";
import { NavigationRoutes } from "@/utils/constants";
import { ChatRoom } from "@/pages/inbox/ChatRoom";
import GroupDetailsPage from "@/pages/group/GroupDetailsPage";
import { NewChatModal } from "@/components/NewChatModal";
import { useRecoilValue } from "recoil";
import { isChatModalVisibleAtom } from "@/state/global";

const AppRoutes = () => {
    const socket = useSocket();
    const isChatModalVisible = useRecoilValue(isChatModalVisibleAtom);

    return (
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
                    element={<GroupDetailsPage socket={socket} />}
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
            {isChatModalVisible && <NewChatModal socket={socket} />}
        </div>
    );
};

export default AppRoutes;
