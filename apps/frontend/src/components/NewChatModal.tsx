import { Loader } from "@/components/Loader";
import { chatRoomAtom, existingGroupsAtom } from "@/state/chat";
import { isChatModalVisibleAtom, showGroupSelectionModalAtom } from "@/state/global";
import { selectedUsersAtom, userAtom } from "@/state/user";
import { TGroupExistsResponse } from "@/types/chatRoom";
import { NAVIGATION_ROUTES } from "@/utils/constants";
import { printlogs } from "@/utils/logs";
import { ADD_TO_CHAT, FIND_CHATS, ROOM_EXISTS } from "@instachat/messages/messages";
import { IMessage } from "@instachat/messages/types";
import { X } from "lucide-react";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { toast } from "sonner";
import GroupBars from "./GroupBars";
import { UserBars } from "./UserBars";
import { UserLoadingSkeleton } from "./UserLoadingSkeleton";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

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

export const NewChatModal: React.FC<{ socket: WebSocket | null }> = ({ socket }): JSX.Element => {
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

    useEffect(() => {
        if (isChatModalVisible.visible === true) {
            setSelectedUsers([]);
        }
    }, [isChatModalVisible.visible]);

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
                                    navigate(`/inbox/direct/${payload?.existingChatRoom?.id}`);
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
                                navigate(`/inbox/direct/${payload?.chatRoomDetails?.id}`);
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
                        if (payload.result === "error") {
                            switch (payload.statusCode) {
                                case 400:
                                    toast.error(
                                        "Invalid request. Please contact the owner or the developer of this website"
                                    );
                                    break;
                                case 409:
                                    toast.error(payload.message);
                                    break;
                                case 403:
                                    toast.error(payload.message);
                                    break;
                                case 404:
                                    toast.error(payload.message);
                                    break;
                                default:
                                    toast.error("An unknown error occurred");
                                    break;
                            }
                            return;
                        }

                        if (payload.result === "success" && payload?.newUsersDetails?.length) {
                            setChatRoomDetails((prev) => {
                                if (prev) {
                                    const newUsersDetails = payload.newUsersDetails.map((user: any) => ({
                                        id: user.id,
                                        username: user.username,
                                        fullName: user.fullName,
                                        profilePic: user.profilePic,
                                    }));
                                    return { ...prev, participants: [...prev?.participants, ...newUsersDetails] };
                                }
                                return prev;
                            });

                            setIsChatModalVisible({ visible: false });
                        }
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

        printlogs("selectedUsers", selectedUsers);
        printlogs("selectedUsers length", selectedUsers.length);

        if (selectedUsers.length > 0) {
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

    const searchInputChangeHandler = async (e: ChangeEvent<HTMLInputElement>) => {
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

        setIsSubmitting(true);

        const message: IMessage = {
            type: ADD_TO_CHAT,
            payload: {
                chatRoomDetails,
                newUsersDetails: selectedUsers,
            },
        };

        socket.send(JSON.stringify(message));
    };

    return (
        <div className="fixed left-0 right-0 top-0 z-30 flex h-dvh w-full items-center justify-center bg-[#00000080]">
            <div
                className="bg-background border-input flex w-[90%] flex-col overflow-hidden rounded-lg border py-6 sm:h-[70%] sm:w-[588px]"
                ref={modalContainerRef}
            >
                <div className="mb-3 flex items-center justify-center">
                    <h1 className="flex-grow text-center font-bold">New Message</h1>
                    <X
                        className="mr-6 size-6 cursor-pointer"
                        onClick={() => {
                            if (isSubmitting) {
                                return;
                            }
                            setIsChatModalVisible({ visible: false });
                        }}
                    />
                </div>
                <div className="border-input flex items-center gap-3 border py-2">
                    <span className="ml-6 font-semibold">To:</span>
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
                    <input
                        type="search"
                        placeholder="Search..."
                        className="mr-5 w-full border-0 bg-transparent px-2 outline-none placeholder:text-gray-400"
                        onChange={searchInputChangeHandler}
                        value={searchInput}
                    />
                </div>
                <div className="scrollbar mb-4 flex w-full flex-grow flex-col gap-1 overflow-y-scroll pt-5">
                    {searchInput ? (
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
                                            navigate(`/inbox/direct/${chat.data.id}`);
                                        }}
                                    />
                                ) : (
                                    <UserBars
                                        key={`${chat.data.id}${index}`}
                                        id={chat.data.id}
                                        fullName={chat.data.fullName}
                                        username={chat.data.username}
                                        profilePic={chat.data.profilePic}
                                        isSelected={selectedUsers.some(
                                            (selectedUser) => selectedUser.id === chat.data.id
                                        )}
                                        onClick={() => {
                                            if (isLoading) {
                                                return;
                                            }
                                            if (chat.data.isGroup === false) {
                                                handleUserSelection(
                                                    chat.data.id,
                                                    chat.data.fullName,
                                                    chat.data.profilePic
                                                );
                                            }
                                        }}
                                    />
                                )
                            )
                        ) : (
                            <div className="mx-6 flex flex-col gap-6">
                                {Array.from({ length: 20 }, (_, index) => (
                                    <UserLoadingSkeleton key={index} />
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="ml-6 text-sm text-gray-400">
                            <p>No account found</p>
                        </div>
                    )}
                </div>
                <div className="flex w-full items-center justify-center">
                    <Button
                        className="mx-6 w-full"
                        disabled={selectedUsers.length === 0 || isSubmitting}
                        onClick={isChatModalVisible.type === "ADD_USERS" ? addNewUserToChatRoom : initiateNewChat}
                        variant="secondary"
                    >
                        {!isSubmitting ? "Chat" : <Loader visible={isSubmitting} />}
                    </Button>
                </div>
            </div>
        </div>
    );
};
