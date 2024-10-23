import AdminSelectionModal from "@/components/AdminSelectionModal";
import { AlertModal } from "@/components/AlertModal";
import GroupSelectionModal from "@/components/GroupSelectionModal";
import { NewChatModal } from "@/components/NewChatModal";
import { useSocket } from "@/hooks/useSocket";
import GroupDetailsPage from "@/pages/group/GroupDetailsPage";
import { ChatRoom } from "@/pages/inbox/ChatRoom";
import DirectMessage from "@/pages/inbox/DirectMessages";
import Inbox from "@/pages/inbox/Inbox";
import Sidebar from "@/pages/inbox/Sidebar";
import { isChatModalVisibleAtom, showAdminSelectionModalAtom, showGroupSelectionModalAtom } from "@/state/global";
import { NAVIGATION_ROUTES } from "@/utils/constants";
import { Navigate, Route, Routes } from "react-router-dom";
import { useRecoilValue } from "recoil";

const ProtectedRoutes = () => {
    const socket = useSocket();
    const isChatModalVisible = useRecoilValue(isChatModalVisibleAtom);
    const showGroupSelectionModal = useRecoilValue(showGroupSelectionModalAtom);
    const showAdminSelectionModal = useRecoilValue(showAdminSelectionModalAtom);

    return (
        <div className="flex">
            <Sidebar className="hidden lg:block" />
            <DirectMessage socket={socket} />
            <Routes>
                <Route path={NAVIGATION_ROUTES.INBOX} element={<Inbox />} />
                <Route path={NAVIGATION_ROUTES.DM} element={<ChatRoom socket={socket} />} />
                <Route path={NAVIGATION_ROUTES.CREATE_NEW_GROUP} element={<GroupDetailsPage socket={socket} />} />
                <Route path="*" element={<Navigate to={NAVIGATION_ROUTES.INBOX} replace />} />
            </Routes>
            {isChatModalVisible.visible && <NewChatModal socket={socket} />}
            {showGroupSelectionModal && <GroupSelectionModal />}
            {showAdminSelectionModal && <AdminSelectionModal socket={socket} />}
            <AlertModal />
        </div>
    );
};

export default ProtectedRoutes;
