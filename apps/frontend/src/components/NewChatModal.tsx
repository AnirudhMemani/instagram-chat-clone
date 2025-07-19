import { Loader } from "@/components/Loader";
import useAutosizeTextArea from "@/hooks/useAutosizeTextArea";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { cn } from "@/lib/utils";
import { chatRoomAtom, existingGroupsAtom, TParticipant } from "@/state/chat";
import { isChatModalVisibleAtom, showGroupSelectionModalAtom } from "@/state/global";
import { selectedUsersAtom, userAtom } from "@/state/user";
import { TGroupExistsResponse } from "@/types/chatRoom";
import { NAVIGATION_ROUTES, StatusCodes } from "@/utils/constants";
import { printlogs } from "@/utils/logs";
import { ADD_TO_CHAT, FIND_CHATS, ROOM_EXISTS } from "@instachat/messages/messages";
import { IMessage } from "@instachat/messages/types";
import { ArrowLeft, X } from "lucide-react";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { toast } from "sonner";
import GroupBars from "./GroupBars";
import { useTheme } from "./theme-provider";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { UserBars } from "./UserBars";
import { UserLoadingSkeleton } from "./UserLoadingSkeleton";

export type TUsersSchema = {
  id: string;
  fullName: string;
  username: string;
  profilePic: string;
};

type TFilteredChats =
  | {
      showGroup: false;
      id: string;
      fullName: string;
      username: string;
      profilePic: string;
      isSelected?: boolean;
    }
  | {
      showGroup: true;
      data:
        | {
            isGroup: true;
            id: string;
            name: string;
            picture: string;
            participants: { id: string; username: string; profilePic: string }[];
          }
        | {
            isGroup: false;
            id: string;
            fullName: string;
            username: string;
            profilePic: string;
          };
    };

type TAllUsersSchema = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
  profilePic: string;
};

type TGroupSchema = {
  id: string;
  name: string;
  picture: string;
  participants: { id: string; username: string; profilePic: string }[];
};

type TNewChatModalProps = { socket: WebSocket | null; containerClassName?: string; className?: string };

export const NewChatModal: React.FC<TNewChatModalProps> = ({ socket, containerClassName, className }): JSX.Element => {
  const [searchInput, setSearchInput] = useState<string>("");
  const [userDetails, setUserDetails] = useState<TUsersSchema[]>();
  const [groupDetails, setGroupDetails] = useState<TGroupSchema[]>();
  const [filteredChats, setFilteredChats] = useState<TFilteredChats[]>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const setShowGroupSelectionModal = useSetRecoilState(showGroupSelectionModalAtom);
  const [isChatModalVisible, setIsChatModalVisible] = useRecoilState(isChatModalVisibleAtom);
  const [selectedUsers, setSelectedUsers] = useRecoilState(selectedUsersAtom);
  const [chatRoomDetails, setChatRoomDetails] = useRecoilState(chatRoomAtom);
  const setExistingGroups = useSetRecoilState(existingGroupsAtom);

  const user = useRecoilValue(userAtom);

  const modalContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const { width: windowWidth } = useWindowDimensions();

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useAutosizeTextArea(textAreaRef.current, searchInput);

  useEffect(() => {
    if (isChatModalVisible.visible === true) {
      setSelectedUsers([]);
    }
  }, [isChatModalVisible.visible]);

  useEffect(() => {
    if (windowWidth < 1024) {
      setSelectedUsers([]);
    }
  }, []);

  useEffect(() => {
    if (!socket) {
      setIsLoading(true);
      return;
    }

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as IMessage;
        const payload = message?.payload;
        const status = message?.status;

        switch (message.type) {
          case FIND_CHATS:
            const data =
              chatRoomDetails?.participants?.length && isChatModalVisible.type === "ADD_USERS"
                ? (payload?.users as TAllUsersSchema[]).filter((user) =>
                    chatRoomDetails?.participants?.every((participant) => participant?.id !== user.id)
                  )
                : payload?.users;
            setUserDetails(data);
            setGroupDetails(payload?.groups);
            break;
          case ROOM_EXISTS:
            switch (status) {
              case 400:
                toast.error(payload?.message);
                break;
              case 409:
                printlogs("Entered 409 handler");
                printlogs("payload", payload);
                if (payload?.isGroup === true) {
                  setExistingGroups((payload as TGroupExistsResponse)?.existingGroups);
                  setShowGroupSelectionModal(true);
                } else if (payload?.isGroup === false) {
                  const roomName = payload?.existingChatRoom?.participants?.filter(
                    (member: any) => member?.id !== user.id
                  )[0].username;
                  const existingRoomDetails = {
                    id: payload?.existingChatRoom?.id,
                    name: roomName,
                    createdAt: payload?.existingChatRoom?.createdAt,
                    participants: payload?.existingChatRoom?.participants,
                    messages: payload?.existingChatRoom?.messages,
                    isGroup: payload?.isGroup,
                  };
                  setChatRoomDetails(existingRoomDetails);
                  navigate(`${NAVIGATION_ROUTES.DM}/${payload?.existingChatRoom?.id}`);
                }
                break;
              case 201:
                const roomName = payload?.chatRoomDetails?.participants?.filter(
                  (member: any) => member?.id !== user.id
                )[0].username;
                const newChatRoomDetails = {
                  id: payload?.chatRoomDetails?.id,
                  name: roomName,
                  createdAt: payload?.chatRoomDetails?.createdAt,
                  participants: payload?.chatRoomDetails?.participants,
                  messages: payload?.chatRoomDetails?.messages,
                  isGroup: payload?.isGroup,
                };
                setChatRoomDetails(newChatRoomDetails);
                navigate(`${NAVIGATION_ROUTES.DM}/${payload?.chatRoomDetails?.id}`);
                break;
              case 200:
                if (payload?.isGroup === true) {
                  navigate(NAVIGATION_ROUTES.CREATE_NEW_GROUP);
                }
                break;
              default:
                toast.error("An unknown error occurred. Please try again later!");
                break;
            }
            setIsChatModalVisible({ visible: false });
            break;
          case ADD_TO_CHAT:
            if (message.success === false) {
              const action = message?.payload?.action;
              switch (message.status) {
                case StatusCodes.BadRequest:
                  if (action === "invalid-params") {
                    toast.error("There was an issue with your request. Please try again later!");
                  } else if (action === "no-users") {
                    toast.error("Please select atleast one user to add to the group");
                  } else if (action === "not-group") {
                    toast.info("Members can only be removed from group chats");
                    setChatRoomDetails(null);
                    navigate(NAVIGATION_ROUTES.INBOX);
                  } else {
                    toast.error("There was an issue with your request. Please try again later!");
                  }
                  break;
                case StatusCodes.NotFound:
                  if (action === "chat-room") {
                    toast.error("There was an issue with your request. Please try again later!");
                    setChatRoomDetails(null);
                    navigate(NAVIGATION_ROUTES.INBOX);
                  } else if (action === "user") {
                    toast.info(`${message?.payload?.user?.username} does not exists`);
                  } else {
                    toast.error("There was an issue with your request. Please try again later!");
                  }
                  break;
                case StatusCodes.Conflict:
                  const user = message?.payload?.user as TParticipant;
                  toast.info(`${user?.username} is already part of this group`);
                  break;
                case StatusCodes.Forbidden:
                  toast.error("You do not have the required permissions to add members to this group");
                  setChatRoomDetails((prev) =>
                    prev && prev.isGroup
                      ? {
                          ...prev,
                          admins: prev.admins.filter((admin) => admin.id !== user.id),
                        }
                      : prev
                  );
                  break;
                default:
                  toast.error("There was an issue with your request. Please try again later!");
                  break;
              }
            } else {
              if (message.status === StatusCodes.Ok) {
                toast.success("Members added successfully");
                const users = message?.payload?.addedUsers as TParticipant[];
                setChatRoomDetails((prev) =>
                  prev && prev.isGroup ? { ...prev, participants: [...prev.participants, ...users] } : prev
                );
              } else {
                toast.error("There was an issue with your request. Please try again later!");
              }
            }
            setIsChatModalVisible({ visible: false });
            break;
          default:
            break;
        }
      } catch (error) {
        toast.error("Uh oh! Something went wrong.", {
          description: "Your request could not be processed",
          richColors: true,
        });
      } finally {
        setIsLoading(false);
        setIsSubmitting(false);
      }
    };

    setIsLoading(true);
    socket.send(
      JSON.stringify({
        type: FIND_CHATS,
      })
    );
  }, [socket]);

  useEffect(() => {
    const handleModalClose = (event: MouseEvent) => {
      if (modalContainerRef.current && !modalContainerRef.current.contains(event.target as Node)) {
        setIsChatModalVisible({ visible: false });
        setSearchInput("");
      }
    };

    document.addEventListener("mousedown", handleModalClose);

    return () => {
      document.removeEventListener("mousedown", handleModalClose);
    };
  }, []);

  const filterUsers = (searchQuery: string, users?: TUsersSchema[], groups?: TGroupSchema[]) => {
    const filteredUserData = users?.length
      ? users.filter(
          (user) =>
            user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : null;

    if (selectedUsers.length > 0 || isChatModalVisible.type === "ADD_USERS") {
      setFilteredChats(
        filteredUserData?.map((user) => ({
          ...user,
          isSelected: selectedUsers.some((selectedUser) => user.id === selectedUser.id),
          showGroup: false,
        })) || []
      );
      return;
    }

    const filteredGroupsData = groups?.length
      ? groups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : null;

    const filteredData = [
      ...(filteredUserData?.map((user) => ({
        data: { ...user, isGroup: false as false },
        showGroup: true as true,
      })) || []),
      ...(filteredGroupsData?.map((group) => ({
        data: { ...group, isGroup: true as true },
        showGroup: true as true,
      })) || []),
    ];

    setFilteredChats(filteredData);
  };

  const searchInputChangeHandler = async (e: ChangeEvent<HTMLTextAreaElement>) => {
    const searchQuery = e.target.value;
    setSearchInput(searchQuery);

    if (userDetails || groupDetails) {
      filterUsers(searchQuery, userDetails, groupDetails);
    }
  };

  const handleUserSelection = (id: string, fullName: string, profilePic: string) => {
    setSelectedUsers((p) =>
      p.some((user) => user.id === id) ? p.filter((user) => user.id !== id) : [...p, { id, fullName, profilePic }]
    );
    setSearchInput("");
  };

  const removeSelectedUser = (id: string) => {
    setSelectedUsers((p) => p.filter((user) => user.id !== id));
  };

  const initiateNewChat = () => {
    if (!socket) {
      return;
    }

    setIsSubmitting(true);

    const participants = [
      ...selectedUsers,
      {
        id: user.id,
        fullName: user.fullName,
        profilePic: user.profilePic,
      },
    ];

    setSelectedUsers(participants);

    const message: IMessage = {
      type: ROOM_EXISTS,
      payload: {
        selectedUsers: participants,
      },
    };

    socket.send(JSON.stringify(message));
  };

  const addNewUserToChatRoom = () => {
    if (!socket) {
      return;
    }

    if (!chatRoomDetails?.isGroup) {
      return;
    }

    setIsSubmitting(true);

    const message: IMessage = {
      type: ADD_TO_CHAT,
      payload: {
        chatRoomId: chatRoomDetails.id,
        addUsersId: selectedUsers.map((user) => user.id),
      },
    };

    socket.send(JSON.stringify(message));
  };

  const handleGoBack = () => {
    if (isSubmitting) {
      return;
    }
    if (windowWidth < 1024) {
      navigate(-1);
    } else {
      setIsChatModalVisible({ visible: false });
    }
  };

  return (
    <div
      className={cn(
        "fixed left-0 right-0 top-0 z-30 flex w-full items-center justify-center bg-black/5 lg:h-dvh dark:bg-black/60",
        containerClassName
      )}
    >
      <div
        className={cn(
          "bg-background border-input flex w-[90%] flex-col overflow-hidden border py-6 sm:h-[70%] sm:w-[588px] lg:rounded-lg",
          className
        )}
        ref={modalContainerRef}
      >
        <div className="mb-3 flex items-center justify-center">
          <ArrowLeft className="ml-3 size-7 active:brightness-50 lg:hidden" onClick={handleGoBack} />
          <h1 className="flex-grow text-center font-bold">New Message</h1>
          <X className="mr-3 size-6 cursor-pointer lg:mr-6" onClick={handleGoBack} />
        </div>
        <div className="border-input flex items-center gap-3 border py-2">
          <span className="ml-3 font-semibold sm:ml-6">To:</span>
          <div className="flex w-full flex-wrap items-center gap-1">
            {selectedUsers.length > 0 &&
              selectedUsers.map((user) => (
                <Badge className="cursor-pointer" key={user.id}>
                  {user.fullName}
                  <X
                    onClick={() => {
                      if (isLoading) {
                        return;
                      }
                      removeSelectedUser(user.id);
                    }}
                  />
                </Badge>
              ))}
            <textarea
              placeholder="Search..."
              className="scrollbar mr-5 flex-grow resize-none border-0 bg-transparent px-2 outline-none placeholder:text-gray-400"
              onChange={searchInputChangeHandler}
              value={searchInput}
              rows={1}
              ref={textAreaRef}
            />
          </div>
        </div>
        <div className="scrollbar mb-4 flex w-full flex-grow flex-col gap-1 overflow-y-auto pt-5">
          {isLoading ? (
            <div className="flex flex-col gap-6">
              {Array.from({ length: 10 }, (_, index) => (
                <UserLoadingSkeleton key={index} />
              ))}
            </div>
          ) : searchInput ? (
            !isLoading && filteredChats && filteredChats.length > 0 ? (
              filteredChats.map((chat, index) =>
                chat.showGroup === false ? (
                  <UserBars
                    key={`${chat.id}${index}`}
                    id={chat.id}
                    fullName={chat.fullName}
                    username={chat.username}
                    profilePic={chat.profilePic}
                    isSelected={selectedUsers.some((selectedUser) => selectedUser.id === chat.id)}
                    onClick={() => {
                      if (isLoading) {
                        return;
                      }
                      handleUserSelection(chat.id, chat.fullName, chat.profilePic);
                    }}
                  />
                ) : chat.data.isGroup === true ? (
                  <GroupBars
                    key={`${chat.data.id}${index}`}
                    name={chat.data.name}
                    participants={chat.data.participants}
                    picture={chat.data.picture}
                    onClick={() => {
                      setIsChatModalVisible({ visible: false, type: "ADD_USERS" });
                      navigate(`${NAVIGATION_ROUTES.DM}/${chat.data.id}`);
                    }}
                  />
                ) : (
                  <UserBars
                    key={`${chat.data.id}${index}`}
                    id={chat.data.id}
                    fullName={chat.data.fullName}
                    username={chat.data.username}
                    profilePic={chat.data.profilePic}
                    isSelected={selectedUsers.some((selectedUser) => selectedUser.id === chat.data.id)}
                    onClick={() => {
                      if (isLoading) {
                        return;
                      }
                      if (chat.data.isGroup === false) {
                        handleUserSelection(chat.data.id, chat.data.fullName, chat.data.profilePic);
                      }
                    }}
                  />
                )
              )
            ) : (
              <div className="px-3 text-sm text-gray-400 sm:px-6">
                <p>No account found</p>
              </div>
            )
          ) : (
            <div className="px-3 text-sm text-gray-400 sm:px-6">
              <p>No account found</p>
            </div>
          )}
        </div>
        <div className="flex w-full items-center justify-center">
          <Button
            className="mx-6 w-full"
            disabled={selectedUsers.length === 0 || isSubmitting}
            onClick={isChatModalVisible.type === "ADD_USERS" ? addNewUserToChatRoom : initiateNewChat}
            variant={theme === "dark" || theme === "system" ? "secondary" : "default"}
          >
            {!isSubmitting ? "Chat" : <Loader visible={isSubmitting} />}
          </Button>
        </div>
      </div>
    </div>
  );
};
