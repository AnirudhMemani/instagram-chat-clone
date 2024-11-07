import { UserLoadingSkeleton } from "@/components/UserLoadingSkeleton";
import { TParticipant } from "@/state/chat";
import { isChatModalVisibleAtom } from "@/state/global";
import { userAtom } from "@/state/user";
import { TGetInboxResponse, TLatestMessage } from "@/types/chatRoom";
import { getMessageAge, handleUserLogout, NAVIGATION_ROUTES, StatusCodes } from "@/utils/constants";
import { printlogs } from "@/utils/logs";
import { GET_INBOX, READ_MESSAGE, UPDATE_INBOX } from "@instachat/messages/messages";
import { IMessage } from "@instachat/messages/types";
import { Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { toast } from "sonner";
import { ChatPreviewBox } from "./ChatPreviewBox";

type TInbox = {
    chatRoomId: string;
    picture: string;
    name: string;
    isGroup: boolean;
    latestMessage: TLatestMessage;
    hasRead: boolean;
    participants: TParticipant[];
};

type TDirectMessageProps = {
    socket: WebSocket | null;
};

const DirectMessage: React.FC<TDirectMessageProps> = ({ socket }): JSX.Element => {
    const [dmList, setDmList] = useState<TInbox[]>([]);
    const user = useRecoilValue(userAtom);
    const setIsChatModalVisible = useSetRecoilState(isChatModalVisibleAtom);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    const fetchInbox = (socket: WebSocket) => {
        try {
            setIsLoading(true);
            socket.send(
                JSON.stringify({
                    type: GET_INBOX,
                    payload: { take: 20, skip: 0 },
                })
            );
        } catch (error) {
            printlogs("ERROR in fetchInbox:", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!socket) return;

        const handleMessageEvent = (event: MessageEvent) => {
            try {
                const message = JSON.parse(event.data) as IMessage;

                switch (message?.type) {
                    case GET_INBOX:
                        if (message?.status === StatusCodes.Ok) {
                            const inboxData = message?.payload as TGetInboxResponse[];
                            const modifiedInboxData = inboxData?.map((inbox) => {
                                const otherParticipant = inbox?.participants?.filter(
                                    (member) => member?.id !== user.id
                                )?.[0];
                                return {
                                    ...inbox,
                                    picture: inbox?.isGroup ? inbox?.picture : otherParticipant?.profilePic,
                                    name: inbox?.isGroup ? inbox?.name : otherParticipant?.username,
                                };
                            }) satisfies TInbox[];
                            setDmList(modifiedInboxData);
                        } else if (message?.status === StatusCodes.NotFound) {
                            setDmList([]);
                        } else {
                            toast.error("Could not get your inbox. Please try again later!");
                            handleUserLogout(navigate);
                        }
                        break;
                    case UPDATE_INBOX:
                        printlogs("New message inside Direct Message component | message.payload:", message.payload);
                        if (message?.status === StatusCodes.Ok) {
                            const newMessageData = message?.payload as TGetInboxResponse;

                            const otherParticipant = newMessageData?.participants?.filter(
                                (member) => member?.id !== user.id
                            )?.[0];

                            const picture = newMessageData?.isGroup
                                ? newMessageData?.picture
                                : otherParticipant?.profilePic;

                            const name = newMessageData?.isGroup ? newMessageData?.name : otherParticipant?.username;

                            printlogs("dmList in the beginning:", dmList);

                            setDmList((prevDmList) => {
                                if (prevDmList.length < 1) {
                                    return [
                                        {
                                            ...newMessageData,
                                            picture,
                                            name,
                                        },
                                    ];
                                }

                                const chatRoomIndex = prevDmList.findIndex(
                                    (chat) => chat.chatRoomId === newMessageData?.chatRoomId
                                );

                                printlogs("Index found | chatRoomIndex:", chatRoomIndex);

                                if (chatRoomIndex > -1) {
                                    const updatedDmList = [...prevDmList];
                                    updatedDmList.splice(chatRoomIndex, 1);
                                    updatedDmList.unshift({
                                        ...newMessageData,
                                        picture,
                                        name,
                                    });
                                    printlogs("updatedDmList:", updatedDmList);
                                    return updatedDmList;
                                } else {
                                    return [
                                        {
                                            ...newMessageData,
                                            picture,
                                            name,
                                        },
                                        ...prevDmList,
                                    ];
                                }
                            });
                        }
                        break;
                }
            } catch (error) {
                printlogs("Error handling WebSocket message:", error);
            } finally {
                setIsLoading(false);
            }
        };

        socket.addEventListener("message", handleMessageEvent);
        fetchInbox(socket);

        return () => {
            socket.removeEventListener("message", handleMessageEvent);
        };
    }, [socket, user]);

    const handleOpenDm = (chatRoomId: string) => {
        if (!socket) return;
        socket.send(JSON.stringify({ type: READ_MESSAGE, payload: { chatRoomId } }));
        setDmList((prev) => prev?.map((p) => (p?.chatRoomId === chatRoomId ? { ...p, hasRead: true } : p)));
        navigate(`${NAVIGATION_ROUTES.DM}/${chatRoomId}`);
    };

    const formatLatestMessage = (chatRoom: TInbox) =>
        chatRoom.latestMessage.sentBy.id === user.id
            ? `You: ${chatRoom.latestMessage.content.trim()}`
            : chatRoom.latestMessage.content.trim();

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
                {dmList && dmList?.length > 0 ? (
                    dmList?.map((dm) => (
                        <ChatPreviewBox
                            key={dm.chatRoomId}
                            messageAge={getMessageAge(dm.latestMessage.sentAt)}
                            avatar={dm.picture}
                            message={formatLatestMessage(dm)}
                            name={dm.name}
                            hasRead={dm.hasRead}
                            onClick={() => handleOpenDm(dm.chatRoomId)}
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
