import { UserLoadingSkeleton } from "@/components/UserLoadingSkeleton";
import { TMessage, TParticipant } from "@/state/chat";
import { isChatModalVisibleAtom } from "@/state/global";
import { userAtom } from "@/state/user";
import { getMessageAge, StatusCodes } from "@/utils/constants";
import { GET_INBOX, NEW_MESSAGE } from "@instachat/messages/messages";
import { IMessage } from "@instachat/messages/types";
import { Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { ChatPreviewBox } from "./ChatPreviewBox";

type TInbox = {
    id: string;
    picture: string;
    name: string;
    isGroup: boolean;
    latestMessage: TMessage;
    hasRead: boolean;
    participants: TParticipant[];
};

type TDirectMessageProps = {
    socket: WebSocket | null;
};

const DirectMessage: React.FC<TDirectMessageProps> = ({ socket }): JSX.Element => {
    const [dm, setDm] = useState<TInbox[]>([]);
    const user = useRecoilValue(userAtom);

    const setIsChatModalVisible = useSetRecoilState(isChatModalVisibleAtom);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data) as IMessage;
            if (message?.type === GET_INBOX) {
                if (message?.status === StatusCodes.Ok) {
                    const inbox = message?.payload?.userInbox as TInbox[];
                    setDm(inbox);
                }
            } else if (message?.type === NEW_MESSAGE) {
                if (message?.status === StatusCodes.Ok) {
                    const newMessage = message?.payload?.messageDetails as TInbox;
                    const updatedChatRoomDetails = {
                        id: newMessage?.id,
                        hasRead: newMessage?.hasRead,
                        isGroup: newMessage?.isGroup,
                        latestMessage: { ...newMessage?.latestMessage },
                        name: newMessage?.name,
                        participants: newMessage?.participants,
                        picture: newMessage?.picture,
                    } satisfies TInbox;

                    setDm([updatedChatRoomDetails]);
                }
            }
        };

        const getUserDM = {
            type: GET_INBOX,
            payload: {
                take: 20,
                skip: 0,
            },
        };

        socket.send(JSON.stringify(getUserDM));
    }, [socket]);

    const getLatestMessage = (userDms: TInbox) => {
        if (userDms.latestMessage.sentBy.id === user.id) {
            return `You: ${userDms.latestMessage.content.trim()}`;
        }

        return userDms.latestMessage.content.trim();
    };

    return (
        <div className="h-dvh w-full overflow-y-hidden border-r border-gray-700 lg:w-[450px] xl:w-[550px]">
            <div className="px-6 font-bold">
                <div className="flex items-center justify-between pb-3 pt-9">
                    <h2 className="text-xl">{user.username}</h2>
                    <Edit
                        className="size-6 cursor-pointer active:scale-95"
                        onClick={() => setIsChatModalVisible({ visible: true })}
                        aria-disabled={isLoading}
                    />
                </div>
                <h2 className="pb-5 pt-3">Messages</h2>
            </div>
            <div className="scrollbar flex h-dvh w-full flex-col gap-4 overflow-y-scroll pl-6">
                {dm && dm.length > 0 ? (
                    dm.map((_, index) => (
                        <ChatPreviewBox
                            key={index}
                            messageAge={getMessageAge(_?.latestMessage?.sentAt)}
                            avatar={_?.isGroup ? _?.picture : _?.latestMessage?.sentBy?.profilePic}
                            message={getLatestMessage(_)}
                            name={_.isGroup ? _.name : _.latestMessage?.sentBy?.username}
                            hasRead={_?.hasRead}
                            onClick={() => {
                                setDm((prev) => (prev ? prev.map((p) => ({ ...p, hasRead: true })) : prev));
                                navigate(`/inbox/direct/${_.id}`);
                            }}
                        />
                    ))
                ) : isLoading ? (
                    <div className="mr-2 flex flex-col gap-4">
                        {Array.from({ length: 10 }, (_, index) => (
                            <UserLoadingSkeleton key={index} />
                        ))}
                    </div>
                ) : (
                    <div>Your DMs are empty</div>
                )}
            </div>
        </div>
    );
};

export default DirectMessage;
