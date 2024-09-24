import { NewChatModal } from "@/components/NewChatModal";
import { useSocket } from "@/hooks/useSocket";
import GroupDetailsPage from "@/pages/group/GroupDetailsPage";
import { ChatRoom } from "@/pages/inbox/ChatRoom";
import DirectMessage from "@/pages/inbox/DirectMessages";
import Inbox from "@/pages/inbox/Inbox";
import Sidebar from "@/pages/inbox/Sidebar";
import { isChatModalVisibleAtom } from "@/state/global";
import { NavigationRoutes } from "@/utils/constants";
import { Navigate, Route, Routes } from "react-router-dom";
import { useRecoilValue } from "recoil";

const ProtectedRoutes = () => {
    const socket = useSocket();
    const isChatModalVisible = useRecoilValue(isChatModalVisibleAtom);

    return (
        <div className="flex">
            <Sidebar className="lg:block hidden" />
            <DirectMessage socket={socket} />
            <Routes>
                <Route path={NavigationRoutes.Inbox} element={<Inbox />} />
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
                    element={<Navigate to={NavigationRoutes.Inbox} replace />}
                />
            </Routes>
            {isChatModalVisible.visible && <NewChatModal socket={socket} />}
        </div>
    );
};

export default ProtectedRoutes;
