import { X } from "lucide-react";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isChatModalVisibleAtom, pageTypeAtom } from "@/state/global";
import { IUserBarsProps, UserBars } from "./UserBars";
import { UserLoadingSkeleton } from "./UserLoadingSkeleton";
import { IMessage } from "@instachat/messages/types";
import { FIND_USERS, ROOM_EXISTS } from "@instachat/messages/messages";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { selectedUsersAtom } from "@/state/user";
import { chatRoomAtom, groupAtom } from "@/state/chat";
import { useToast } from "./ui/use-toast";

export type TUsersSchema = {
    id: string;
    fullName: string;
    username: string;
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

    const setIsChatModalVisible = useSetRecoilState(isChatModalVisibleAtom);
    const [selectedUsers, setSelectedUsers] = useRecoilState(selectedUsersAtom);
    const setPagetype = useSetRecoilState(pageTypeAtom);
    const setChatRoomDetails = useSetRecoilState(chatRoomAtom);
    const setGroupDetails = useSetRecoilState(groupAtom);

    const { toast } = useToast();
    const modalContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!socket) {
            setIsLoading(true);
            return;
        }

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as IMessage;
                const payload = message.payload;

                if (message.type === FIND_USERS) {
                    setUsersData(payload);
                }

                if (message.type === ROOM_EXISTS) {
                    const isGroup = Boolean(payload.groupDetails);

                    if (
                        payload.result === "created" ||
                        payload.result === "exists"
                    ) {
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
                        setPagetype("ChatRoom");
                    }

                    if (payload.result === "group") {
                        setPagetype("GroupDetailsPage");
                    }

                    setIsChatModalVisible(false);
                }
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "Your request could not be processed",
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

        return () => {
            socket.onmessage = null;
        };
    }, [socket]);

    useEffect(() => {
        const handleModalClose = (event: MouseEvent) => {
            if (
                modalContainerRef.current &&
                !modalContainerRef.current.contains(event.target as Node)
            ) {
                setIsChatModalVisible(false);
                setSearchInput("");
                setSelectedUsers([]);
            }
        };

        document.addEventListener("mousedown", handleModalClose);

        return () => {
            document.removeEventListener("mousedown", handleModalClose);
            console.log("exited modal");
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
            console.log("New chat initiation, socket not found");
            return;
        }

        setIsSubmitting(true);

        const message: IMessage = {
            type: ROOM_EXISTS,
            payload: {
                userDetails: selectedUsers,
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
                            setIsChatModalVisible(false);
                            setSelectedUsers([]);
                        }}
                    />
                </div>
                <div className="flex items-center py-2 gap-3 border border-input">
                    <span className="ml-6 font-semibold">To:</span>
                    {selectedUsers.length > 0 &&
                        selectedUsers.map((user) => (
                            <Badge
                                className="cursor-pointer"
                                key={user.id}
                            >
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
                        onClick={initiateNewChat}
                    >
                        {isSubmitting ? "Creating..." : "Chat"}
                    </Button>
                </div>
            </div>
        </div>
    );
};
