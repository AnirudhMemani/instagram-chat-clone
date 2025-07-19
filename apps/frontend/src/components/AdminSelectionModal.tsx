import { useChatRoom } from "@/hooks/useChatRoom";
import { usePotentialSuperAdmins } from "@/hooks/usePotentialSuperAdmins";
import { alertModalAtom, showAdminSelectionModalAtom } from "@/state/global";
import { printlogs } from "@/utils/logs";
import { TRANSFER_SUPER_ADMIN } from "@instachat/messages/messages";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useSetRecoilState } from "recoil";
import { UserBars } from "./UserBars";

type TAdminSelectionModalProps = {
  socket: WebSocket | null;
};

const AdminSelectionModal: React.FC<TAdminSelectionModalProps> = ({ socket }): JSX.Element => {
  const setAlertModalMetadata = useSetRecoilState(alertModalAtom);
  const setShowAdminSelectionModal = useSetRecoilState(showAdminSelectionModalAtom);
  const chatRoomDetails = useChatRoom();

  const potentialSuperAdmins = usePotentialSuperAdmins();

  const modalContainerRef = useRef<HTMLDivElement>(null);

  const confirmSuperAdminSelection = (id: string, username: string) => {
    setAlertModalMetadata({
      visible: true,
      title: `Are you sure you want to make ${username} the super admin of this group`,
      description: `You are about to make ${username} the super admin of this group. This action cannot be reverted`,
      positiveOnClick: () => handleSuperAdminSelection(id),
      negativeOnClick: () => setShowAdminSelectionModal(false),
      positiveTitle: "Confirm and leave",
      PositiveButtonStyles: "!bg-destructive dark:text-slate-200 text-black",
    });
  };

  const handleSuperAdminSelection = (id: string) => {
    try {
      if (!socket) {
        return;
      }

      const transferSuperAdminMessage = {
        type: TRANSFER_SUPER_ADMIN,
        payload: {
          newSuperAdminId: id,
          chatRoomId: chatRoomDetails?.id,
        },
      };

      socket.send(JSON.stringify(transferSuperAdminMessage));
    } catch (error) {
      printlogs("ERROR inside handleSuperAdminSelection()", error);
      setAlertModalMetadata({ visible: false });
    }
  };

  return (
    <div className="fixed left-0 right-0 top-0 z-30 flex h-dvh w-full items-center justify-center bg-[#00000080]">
      <div
        className="bg-background border-input flex w-[90%] flex-col overflow-hidden rounded-lg border py-6 sm:h-[70%] sm:w-[588px]"
        ref={modalContainerRef}
      >
        <div className="mb-3 flex items-center justify-center">
          <h1 className="flex-grow text-center font-bold">Select new Super Admin</h1>
          <X
            className="mr-6 size-6 cursor-pointer"
            onClick={() => {
              setShowAdminSelectionModal(false);
            }}
          />
        </div>

        <div className="scrollbar mb-4 flex w-full flex-grow flex-col gap-1 overflow-y-scroll pt-5">
          {potentialSuperAdmins.length ? (
            potentialSuperAdmins.map((member, index) => (
              <UserBars
                key={`${member.id}${index}`}
                fullName={member.fullName}
                id={member.id}
                username={member.username}
                profilePic={member.username}
                onClick={() => confirmSuperAdminSelection(member.id, member.username)}
              />
            ))
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span>No group members to show</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSelectionModal;
