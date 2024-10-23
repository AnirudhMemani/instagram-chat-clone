import { usePotentialSuperAdmins } from "@/hooks/usePotentialSuperAdmins";
import { showAdminSelectionModalAtom } from "@/state/global";
import { printlogs } from "@/utils/logs";
import { TRANSFER_SUPER_ADMIN } from "@instachat/messages/messages";
import { X } from "lucide-react";
import { useRef } from "react";
import { useSetRecoilState } from "recoil";
import { UserBars } from "./UserBars";

type TAdminSelectionModalProps = {
    socket: WebSocket | null;
};

const AdminSelectionModal: React.FC<TAdminSelectionModalProps> = ({ socket }): JSX.Element => {
    const setShowAdminSelectionModal = useSetRecoilState(showAdminSelectionModalAtom);
    const potentialSuperAdmins = usePotentialSuperAdmins();

    const modalContainerRef = useRef<HTMLDivElement>(null);

    const handleSuperAdminSelection = (id: string) => {
        try {
            if (!socket) {
                return;
            }

            const transferSuperAdminMessage = {
                type: TRANSFER_SUPER_ADMIN,
                payload: {
                    newSuperAdminId: id,
                },
            };

            socket.send(JSON.stringify(transferSuperAdminMessage));
        } catch (error) {
            printlogs("ERROR inside handleSuperAdminSelection()", error);
        }
    };

    return (
        <div className="fixed left-0 right-0 top-0 z-30 flex h-dvh w-full items-center justify-center bg-[#00000080]">
            <div
                className="bg-background border-input flex w-[90%] flex-col overflow-hidden rounded-lg border py-6 sm:h-[70%] sm:w-[588px]"
                ref={modalContainerRef}
            >
                <div className="mb-3 flex items-center justify-center">
                    <h1 className="flex-grow text-center font-bold">
                        Super admin cannot leave the group. Please transfer this role to someone else to leave the group
                        chat
                    </h1>
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
                                onClick={() => handleSuperAdminSelection(member.id)}
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
