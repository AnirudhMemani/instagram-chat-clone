import { UserLoadingSkeleton } from "@/components/UserLoadingSkeleton";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { cn } from "@/lib/utils";
import { chatRoomAtom, TParticipant } from "@/state/chat";
import { isChatModalVisibleAtom } from "@/state/global";
import { userAtom } from "@/state/user";
import { TGetInboxResponse, TLatestMessage, TReadMessageResponse } from "@/types/chatRoom";
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

type TCommonInboxProps = {
  chatRoomId: string;
  picture: string;
  name: string;
  hasRead: boolean;
  participants: TParticipant[];
  createdBy: TParticipant;
  createdAt: Date;
};

type TInbox =
  | ({
      isGroup: true;
      latestMessage?: TLatestMessage;
    } & TCommonInboxProps)
  | ({
      isGroup: false;
      latestMessage: TLatestMessage;
    } & TCommonInboxProps);

type TDirectMessageProps = {
  socket: WebSocket | null;
  className?: string;
};

const DirectMessage: React.FC<TDirectMessageProps> = ({ socket, className }): JSX.Element => {
  const [dmList, setDmList] = useState<TInbox[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const user = useRecoilValue(userAtom);
  const setIsChatModalVisible = useSetRecoilState(isChatModalVisibleAtom);
  const chatRoomDetails = useRecoilValue(chatRoomAtom);

  const navigate = useNavigate();

  const { width: windowWidth } = useWindowDimensions();

  const fetchInbox = (socket: WebSocket) => {
    try {
      setIsLoading(true);
      socket.send(
        JSON.stringify({
          type: GET_INBOX,
          payload: {},
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
                const otherParticipant = inbox?.participants?.filter((member) => member?.id !== user.id)?.[0];
                return {
                  ...inbox,
                  picture: inbox?.isGroup ? inbox?.picture : otherParticipant?.profilePic,
                  name: inbox?.isGroup ? inbox?.name : otherParticipant?.fullName,
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

              const otherParticipant = newMessageData?.participants?.filter((member) => member?.id !== user.id)?.[0];

              const picture = newMessageData?.isGroup ? newMessageData?.picture : otherParticipant?.profilePic;

              const name = newMessageData?.isGroup ? newMessageData?.name : otherParticipant?.fullName;

              printlogs("chatRoomDetails inside inbox:", chatRoomDetails);

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

                const chatRoomIndex = prevDmList.findIndex((chat) => chat.chatRoomId === newMessageData?.chatRoomId);

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
          case READ_MESSAGE:
            const data = message?.payload as TReadMessageResponse;
            if (message?.status === StatusCodes.Ok && data?.readerId === user.id) {
              setDmList((prevList) =>
                prevList?.map((prev) => (prev?.chatRoomId === data?.chatRoomId ? { ...prev, hasRead: true } : prev))
              );
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

  const handleOpenNewChatSelection = () => {
    if (windowWidth < 1024) {
      navigate(NAVIGATION_ROUTES.NEW);
    } else {
      setIsChatModalVisible({ visible: true });
    }
  };

  const formatLatestMessage = (chatRoom: TInbox) => {
    let message: string;
    if (chatRoom.latestMessage) {
      message =
        chatRoom.latestMessage.sentBy.id === user.id
          ? `You: ${chatRoom.latestMessage.content.trim()}`
          : chatRoom.latestMessage.content.trim();
    } else {
      message =
        chatRoom.createdBy.id === user.id ? "You created the group" : `Group created by ${chatRoom.createdBy.fullName}`;
    }
    return message;
  };

  return (
    <div
      className={cn(
        "scrollbar w-full overflow-y-auto border-r border-gray-700 px-3 pb-4 sm:px-6 lg:h-dvh lg:w-[380px] xl:w-[550px]",
        className
      )}
    >
      <div className="font-bold">
        <div className="flex items-center justify-between pb-3 pt-9">
          <h2 className="line-clamp-1 text-ellipsis text-xl">{user.username}</h2>
          <Edit
            className="size-6 flex-shrink-0 cursor-pointer active:scale-95"
            onClick={handleOpenNewChatSelection}
            aria-disabled={isLoading}
          />
        </div>
        <h2 className="pb-5 pt-3">Messages</h2>
      </div>
      <div className="scrollbar flex w-full flex-col gap-4 overflow-y-auto">
        {dmList && dmList?.length > 0 ? (
          dmList?.map((dm) => (
            <ChatPreviewBox
              key={dm.chatRoomId}
              messageAge={getMessageAge(dm.latestMessage ? dm.latestMessage.sentAt : dm.createdAt)}
              avatar={dm.picture}
              message={formatLatestMessage(dm)}
              name={dm.name}
              hasRead={dm.hasRead}
              onClick={() => navigate(`${NAVIGATION_ROUTES.DM}/${dm.chatRoomId}`)}
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
