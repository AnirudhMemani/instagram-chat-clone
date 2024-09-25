import { Loader } from "@/components/Loader";
import { chatRoomAtom, groupAtom } from "@/state/chat";
import { isChatModalVisibleAtom } from "@/state/global";
import { selectedUsersAtom, userAtom } from "@/state/user";
import { NavigationRoutes } from "@/utils/constants";
import { printlogs } from "@/utils/logs";
import {
    ADD_TO_CHAT,
    FIND_USERS,
    ROOM_EXISTS,
} from "@instachat/messages/messages";
import { IMessage } from "@instachat/messages/types";
import { X } from "lucide-react";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { toast } from "sonner";
import { IUserBarsProps, UserBars } from "./UserBars";
import { UserLoadingSkeleton } from "./UserLoadingSkeleton";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export type TUsersSchema = {
    id: string;
    fullName: string;
    username: string;
    profilePic: string;
};

type TAllUsersSchema = {
    id: string;
    username: string;
    email: string;
    fullName: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    profilePic: string;
};

export const NewChatModal: React.FC<{ socket: WebSocket | null }> = ({
    socket,
}): JSX.Element => {
    const [searchInput, setSearchInput] = useState<string>("");
    const [usersData, setUsersData] = useState<TUsersSchema[]>();
    const [filteredUsers, setFilteredUsers] =
        useState<Omit<IUserBarsProps, "onClick">[]>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [isChatModalVisible, setIsChatModalVisible] = useRecoilState(
        isChatModalVisibleAtom
    );
    const [selectedUsers, setSelectedUsers] = useRecoilState(selectedUsersAtom);
    const [chatRoomDetails, setChatRoomDetails] = useRecoilState(chatRoomAtom);
    const setGroupDetails = useSetRecoilState(groupAtom);
    const user = useRecoilValue(userAtom);

    const modalContainerRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!socket) {
            setIsLoading(true);
            return;
        }

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as IMessage;
                const payload = message.payload;

                switch (message.type) {
                    case FIND_USERS:
                        printlogs("chatRoomDetails", chatRoomDetails);
                        printlogs("payload", payload);
                        const data =
                            chatRoomDetails?.participants.length &&
                            isChatModalVisible.type === "ADD_USERS"
                                ? (payload as TAllUsersSchema[]).filter(
                                      (user) =>
                                          chatRoomDetails.participants.every(
                                              (participant) =>
                                                  participant.id !== user.id
                                          )
                                  )
                                : payload;
                        printlogs("User data inside modal:", data);
                        setUsersData(data);
                        break;
                    case ROOM_EXISTS:
                        const isGroup = Boolean(payload.groupDetails);

                        if (payload.result === "error") {
                            toast.info(payload.message, {
                                richColors: true,
                            });
                            return;
                        }

                        if (
                            payload.result === "created" ||
                            payload.result === "exists"
                        ) {
                            console.log("\n\nROOM_EXISTS PAYLOAD:", payload);
                            setChatRoomDetails(() => ({
                                id: payload.chatRoomId,
                                name: payload.chatRoomName,
                                createdAt: payload.createdAt,
                                participants: payload.participants,
                                messages: payload.messageDetails,
                                isGroup,
                            }));

                            if (isGroup) {
                                setGroupDetails(payload.groupDetails);
                            }

                            setSelectedUsers([]);
                            navigate(`/inbox/direct/${payload.chatRoomId}`);
                        }

                        if (payload.result === "group") {
                            navigate(NavigationRoutes.CreateNewGroup);
                        }

                        setIsChatModalVisible({ visible: false });
                        break;
                    case ADD_TO_CHAT:
                        if (payload.result === "error") {
                            switch (payload.statusCode) {
                                case 400:
                                    printlogs(
                                        "Error trying to add new member",
                                        payload.message
                                    );
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

                        if (payload.result === "success") {
                            setChatRoomDetails((prev) => {
                                printlogs("before adding new user:", prev);
                                payload?.newUsersDetails?.length &&
                                    payload?.newUsersDetails?.map((user: any) =>
                                        prev?.participants.push({
                                            id: user?.id,
                                            username: user?.username,
                                            fullName: user?.fullName,
                                            profilePic: user?.profilePic,
                                        })
                                    );
                                printlogs("after adding new user:", prev);
                                return prev;
                            });
                        }
                        break;
                    default:
                        break;
                }

                /**
                 * prev?.participants.push({
                                    id: payload.newUsersDetails?.id,
                                    username: payload.newUsersDetails?.username,
                                    fullName: payload.newUsersDetails?.fullName,
                                    profilePic:
                                        payload.newUsersDetails?.profilePic,
                                });
                                return prev;
                 */

                // if (message.type === FIND_USERS) {
                //     printlogs("chatRoomDetails", chatRoomDetails);
                //     printlogs("payload", payload);
                //     const data =
                //         chatRoomDetails?.participants.length &&
                //         isChatModalVisible.type === "ADD_USERS"
                //             ? (payload as TAllUsersSchema[]).filter((user) =>
                //                   chatRoomDetails.participants.every(
                //                       (participant) =>
                //                           participant.id !== user.id
                //                   )
                //               )
                //             : payload;
                //     printlogs("User data inside modal:", data);
                //     setUsersData(data);
                //     return;
                // }

                // if (message.type === ROOM_EXISTS) {
                //     const isGroup = Boolean(payload.groupDetails);

                //     if (payload.result === "error") {
                //         toast.info(payload.message, { richColors: true });
                //         return;
                //     }

                //     if (
                //         payload.result === "created" ||
                //         payload.result === "exists"
                //     ) {
                //         console.log("\n\nROOM_EXISTS PAYLOAD:", payload);
                //         setChatRoomDetails(() => ({
                //             id: payload.chatRoomId,
                //             name: payload.chatRoomName,
                //             createdAt: payload.createdAt,
                //             participants: payload.participants,
                //             messages: payload.messageDetails,
                //             isGroup,
                //         }));

                //         if (isGroup) {
                //             setGroupDetails(payload.groupDetails);
                //         }

                //         setSelectedUsers([]);
                //         navigate(`/inbox/direct/${payload.chatRoomId}`);
                //     }

                //     if (payload.result === "group") {
                //         navigate(NavigationRoutes.CreateNewGroup);
                //     }

                //     setIsChatModalVisible({ visible: false });
                //     return;
                // }
            } catch (error) {
                toast.error("Uh oh! Something went wrong.", {
                    description: "Your request could not be processed",
                    richColors: true,
                });
                setSelectedUsers([]);
            } finally {
                setIsLoading(false);
                setIsSubmitting(false);
            }
        };

        setIsLoading(true);
        socket.send(
            JSON.stringify({
                type: FIND_USERS,
            })
        );
    }, [socket]);

    useEffect(() => {
        const handleModalClose = (event: MouseEvent) => {
            if (
                modalContainerRef.current &&
                !modalContainerRef.current.contains(event.target as Node)
            ) {
                setIsChatModalVisible({ visible: false });
                setSearchInput("");
                setSelectedUsers([]);
            }
        };

        document.addEventListener("mousedown", handleModalClose);

        return () => {
            document.removeEventListener("mousedown", handleModalClose);
        };
    }, []);

    const filterUsers = (users: TUsersSchema[], searchQuery: string) => {
        const filteredUserData = users.filter(
            (user) =>
                user.fullName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                user.username.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setFilteredUsers(
            filteredUserData.map((user) => ({
                ...user,
                isSelected: selectedUsers.some(
                    (selectedUser) => user.id === selectedUser.id
                ),
            }))
        );
    };

    const searchInputChangeHandler = async (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const searchQuery = e.target.value;
        setSearchInput(searchQuery);

        if (usersData) {
            filterUsers(usersData, searchQuery);
        }
    };

    const handleUserSelection = (
        id: string,
        fullName: string,
        profilePic: string
    ) => {
        setSelectedUsers((p) =>
            p.some((user) => user.id === id)
                ? p.filter((user) => user.id !== id)
                : [...p, { id, fullName, profilePic }]
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

        printlogs("participants for the chat room", participants);

        const message: IMessage = {
            type: ROOM_EXISTS,
            payload: {
                userDetails: participants,
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
        <div className="h-dvh fixed top-0 left-0 right-0 w-full bg-[#00000080] flex items-center justify-center z-30">
            <div
                className="py-6 rounded-lg sm:w-[588px] overflow-hidden sm:h-[70%] bg-background w-[90%] border border-input flex flex-col"
                ref={modalContainerRef}
            >
                <div className="flex items-center mb-3 justify-center">
                    <h1 className="text-center flex-grow font-bold">
                        New Message
                    </h1>
                    <X
                        className="size-6 mr-6 cursor-pointer"
                        onClick={() => {
                            if (isSubmitting) {
                                return;
                            }
                            setIsChatModalVisible({ visible: false });
                            setSelectedUsers([]);
                        }}
                    />
                </div>
                <div className="flex items-center py-2 gap-3 border border-input">
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
                        className="placeholder:text-gray-400 px-2 border-0 outline-none bg-transparent w-full mr-5"
                        onChange={searchInputChangeHandler}
                        value={searchInput}
                    />
                </div>
                <div className="flex flex-col w-full gap-1 pt-5 flex-grow overflow-y-scroll scrollbar mb-4">
                    {searchInput ? (
                        !isLoading &&
                        filteredUsers &&
                        filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <React.Fragment key={user.id}>
                                    <UserBars
                                        id={user.id}
                                        fullName={user.fullName}
                                        username={user.username}
                                        profilePic={user.profilePic}
                                        isSelected={selectedUsers.some(
                                            (selectedUser) =>
                                                selectedUser.id === user.id
                                        )}
                                        onClick={() => {
                                            if (isLoading) {
                                                return;
                                            }
                                            handleUserSelection(
                                                user.id,
                                                user.fullName,
                                                user.profilePic
                                            );
                                        }}
                                    />
                                </React.Fragment>
                            ))
                        ) : (
                            <div className="flex flex-col mx-6 gap-6">
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
                <div className="w-full flex items-center justify-center">
                    <Button
                        className="w-full mx-6"
                        disabled={selectedUsers.length === 0 || isSubmitting}
                        onClick={
                            isChatModalVisible.type === "ADD_USERS"
                                ? addNewUserToChatRoom
                                : initiateNewChat
                        }
                        variant="secondary"
                    >
                        {!isSubmitting ? (
                            "Chat"
                        ) : (
                            <Loader visible={isSubmitting} />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
