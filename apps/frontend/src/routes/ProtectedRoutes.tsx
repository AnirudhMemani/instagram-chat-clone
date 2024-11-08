import AdminSelectionModal from "@/components/AdminSelectionModal";
import { AlertModal } from "@/components/AlertModal";
import GroupSelectionModal from "@/components/GroupSelectionModal";
import { NewChatModal } from "@/components/NewChatModal";
import { useSocket } from "@/hooks/useSocket";
import { EditProfile } from "@/pages/EditProfile";
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
        <div className="relative">
            <div className="flex">
                <Sidebar className="max-lg:hidden" />
                <DirectMessage socket={socket} className="max-lg:hidden" />
                <Routes>
                    <Route path={NAVIGATION_ROUTES.INBOX} element={<Inbox socket={socket} />} />
                    <Route path={`${NAVIGATION_ROUTES.DM}/:id`} element={<ChatRoom socket={socket} />} />
                    <Route path={NAVIGATION_ROUTES.CREATE_NEW_GROUP} element={<GroupDetailsPage socket={socket} />} />
                    <Route path={NAVIGATION_ROUTES.EDIT_PROFILE} element={<EditProfile socket={socket} />} />
                    <Route
                        path={NAVIGATION_ROUTES.NEW}
                        element={
                            <NewChatModal
                                socket={socket}
                                containerClassName="!relative lg:hidden"
                                className="!h-full !w-full"
                            />
                        }
                    />
                    <Route path="*" element={<Navigate to={NAVIGATION_ROUTES.INBOX} replace />} />
                </Routes>
            </div>
            <Sidebar className="max-lg:sticky max-lg:bottom-0 max-lg:w-full lg:hidden" />
            {isChatModalVisible.visible && <NewChatModal socket={socket} />}
            {showGroupSelectionModal && <GroupSelectionModal />}
            {showAdminSelectionModal && <AdminSelectionModal socket={socket} />}
            <AlertModal />
        </div>
    );
};

export default ProtectedRoutes;
