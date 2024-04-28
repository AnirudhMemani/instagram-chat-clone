import { X } from "lucide-react";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useRecoilState } from "recoil";
import { isChatModalVisibleAtom, loadingAtom } from "@/state/global";
import { IUserBarsProps, UserBars } from "./UserBars";
import { UserLoadingSkeleton } from "./UserLoadingSkeleton";
import { IMessage, IStartConvoMessage } from "@instachat/messages/types";
import { FIND_USERS, START_CONVO } from "@instachat/messages/messages";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";

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
    const [isSelectedUsers, setIsSelectedUsers] = useState<
        { id: string; fullName: string }[]
    >([]);
    const [groupName, _setGroupName] = useState<string>("Random Group Name");
    const [groupProfilePic, setGroupProfilePic] = useState<File | null>(null);

    const [isChatModalVisible, setIsChatModalVisible] = useRecoilState(
        isChatModalVisibleAtom
    );

    const [isLoading, setIsLoading] = useRecoilState(loadingAtom);

    const modalContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!socket) {
            setIsLoading(true);
            return;
        }

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as IMessage;

                if (message.type === FIND_USERS) {
                    setUsersData(message.payload);
                    setIsLoading(false);
                }

                if (message.type === START_CONVO) {
                    console.log("START_CONVO Response:", message);
                }
            } catch (error) {
                console.error("\n\nERROR parsing WebSocket message:", error);
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
                setIsSelectedUsers([]);
            }
        };

        document.addEventListener("mousedown", handleModalClose);

        return () =>
            document.removeEventListener("mousedown", handleModalClose);
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
                isSelected: isSelectedUsers.includes({
                    id: user.id,
                    fullName: user.fullName,
                }),
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

    const handleUserSelection = (id: string, fullName: string) => {
        setIsSelectedUsers((p) =>
            p.includes({ id, fullName })
                ? p.filter((user) => user.id !== id)
                : [...p, { id, fullName }]
        );
        setSearchInput("");
    };

    const removeSelectedUser = (id: string) => {
        setIsSelectedUsers((p) => p.filter((user) => user.id !== id));
    };

    const initiateNewChat = () => {
        if (!socket) {
            console.log("New chat initiation, socket not found");
            return;
        }

        if (!groupProfilePic) {
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            const imageData = e.target?.result;

            if (!imageData) {
                return;
            }

            const message: IStartConvoMessage = {
                type: START_CONVO,
                payload: {
                    userDetails: isSelectedUsers,
                    groupDetails: {
                        name: groupName,
                        profilePic: imageData,
                        pictureName: groupProfilePic.name,
                    },
                },
            };
            socket.send(JSON.stringify(message));
        };
        reader.readAsDataURL(groupProfilePic);
    };

    return (
        <div
            className={cn(
                "h-dvh fixed top-0 left-0 right-0 w-full bg-[#00000080] flex items-center justify-center z-30",
                { hidden: !isChatModalVisible }
            )}
        >
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
                            setIsChatModalVisible(false);
                            setIsSelectedUsers([]);
                        }}
                    />
                </div>
                <div className="flex items-center py-2 gap-3 border border-input">
                    <span className="ml-6 font-semibold">To:</span>
                    {isSelectedUsers.length > 0 &&
                        isSelectedUsers.map((user) => (
                            <Badge
                                className="cursor-pointer"
                                key={user.id}
                            >
                                {user.fullName}
                                <X
                                    onClick={() => removeSelectedUser(user.id)}
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
                                        isSelected={isSelectedUsers.includes({
                                            id: user.id,
                                            fullName: user.fullName,
                                        })}
                                        onClick={() =>
                                            handleUserSelection(
                                                user.id,
                                                user.fullName
                                            )
                                        }
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
                    <Input
                        type="file"
                        onChange={(e) => {
                            if (e.target.files?.length) {
                                setGroupProfilePic(e.target.files[0]);
                            }
                        }}
                    />
                    <Button
                        className="w-full mx-6"
                        disabled={isSelectedUsers.length === 0}
                        onClick={initiateNewChat}
                    >
                        Chat
                    </Button>
                </div>
            </div>
        </div>
    );
};
