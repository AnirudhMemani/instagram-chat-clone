import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TWebSocket } from "@/utils/types";
import { CircleAlert, EllipsisVertical, Smile } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import EmojiPicker, {
    EmojiClickData,
    SuggestionMode,
} from "emoji-picker-react";
import { Theme } from "emoji-picker-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import {
    CHANGE_GROUP_NAME,
    ERROR,
    LEAVE_GROUP_CHAT,
    MAKE_ADMIN,
    NEW_MESSAGE,
    REMOVE_AS_ADMIN,
    SUCCESS,
} from "@instachat/messages/messages";
import { IMessage } from "@instachat/messages/types";
import { useRecoilState, useRecoilValue } from "recoil";
import { chatRoomAtom, groupAtom } from "@/state/chat";
import { Button } from "@/components/ui/button";
import { userIdAtom } from "@/state/user";
import { EditModal } from "@/components/EditModal";
import { useToast } from "@/components/ui/use-toast";
import { DialogBox } from "@/components/DialogBox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ChatRoom: React.FC<TWebSocket> = ({ socket }): JSX.Element => {
    const [isEmojiPickerVisible, setIsEmojiPickerVisible] =
        useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");
    const [isRoomInfoVisible, setIsRoomInfoVisible] = useState<boolean>(false);
    const [newGroupName, setNewGroupName] = useState<string>("");
    const [isEditNameModalVisible, setIsEditNameModalVisible] =
        useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [chatRoomState, setChatRoomState] = useRecoilState(chatRoomAtom);
    const [groupState, setGroupState] = useRecoilState(groupAtom);
    const userId = useRecoilValue(userIdAtom);

    const [isAdmin, _setIsAdmin] = useState<boolean>(
        chatRoomState.isGroup
            ? groupState.adminOf.some((admin) => admin.id === userId)
            : false
    );

    const chatRoomName = chatRoomState.isGroup
        ? groupState.name
        : chatRoomState.name;

    const chatRoomImage = chatRoomState.isGroup
        ? groupState.picture
        : chatRoomState.participants[0].profilePic;

    const messageInputRef = useRef<HTMLInputElement | null>(null);
    const emojiPickerRef = useRef<HTMLDivElement | null>(null);

    const { theme } = useTheme();
    const { toast } = useToast();

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.onmessage = (event) => {
            try {
                const messageText = JSON.parse(event.data) as IMessage;

                switch (messageText.type) {
                    case CHANGE_GROUP_NAME:
                        if (messageText.payload.result === SUCCESS) {
                            setGroupState({
                                ...groupState,
                                name: messageText.payload.groupName,
                            });
                            setChatRoomState({
                                ...chatRoomState,
                                name: messageText.payload.groupName,
                            });
                        } else if (messageText.payload.result === ERROR) {
                            toast({
                                title: "Permission Denied",
                                description:
                                    "Only a member of the group can change the group name",
                            });
                        } else {
                            toast({
                                title: "Uh oh! Something went wrong",
                                description:
                                    "There was an issue with your request. Please try again",
                            });
                        }
                        break;
                    case LEAVE_GROUP_CHAT:
                        if (messageText.payload.result === ERROR) {
                            toast({
                                description:
                                    "You are not a part of this group chat",
                            });
                        } else if (messageText.payload.result === SUCCESS) {
                            const id = messageText.payload.userId;
                            setChatRoomState({
                                ...chatRoomState,
                                participants: chatRoomState.participants.filter(
                                    (participant) => participant.id !== id
                                ),
                            });
                            setGroupState({
                                ...groupState,
                                adminOf: groupState.adminOf.filter(
                                    (admin) => admin.id !== id
                                ),
                            });
                        } else {
                            toast({
                                title: "Uh oh! Something went wrong",
                                description:
                                    "There was an issue with your request. Please try again",
                            });
                        }
                        break;
                    case MAKE_ADMIN:
                        if (messageText.payload.result === ERROR) {
                            toast({
                                title: "Uh oh! Something went wrong.",
                            });
                        } else {
                            const userDetails = messageText.payload.userDetails;
                            setGroupState({
                                ...groupState,
                                adminOf: [...groupState.adminOf, userDetails],
                            });
                        }
                        break;
                    case REMOVE_AS_ADMIN:
                        if (messageText.payload.result === ERROR) {
                            toast({
                                title: "Uh oh! Something went wrong.",
                            });
                        } else {
                            const adminId = messageText.payload.adminId;
                            setGroupState({
                                ...groupState,
                                adminOf: groupState.adminOf.filter(
                                    (admin) => admin.id !== adminId
                                ),
                            });
                        }
                        break;
                }
            } catch (error) {
                console.log(error);
                toast({
                    title: "Uh oh! Something went wrong",
                    description:
                        "There was an issue with your request. Please try again",
                });
            } finally {
                setIsEditNameModalVisible(false);
                setIsLoading(false);
            }
        };
    }, [socket]);

    useEffect(() => {
        const closeEmojiPicker = (e: MouseEvent) => {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(e.target as Node)
            ) {
                setIsEmojiPickerVisible(false);
            }
        };

        document.addEventListener("mousedown", closeEmojiPicker);

        return () => {
            document.removeEventListener("mousedown", closeEmojiPicker);
        };
    }, []);

    const handleEmojiClick = (e: EmojiClickData) => {
        setMessageText((p) => p + e.emoji);
        if (messageInputRef.current) {
            messageInputRef.current.focus();
        }
    };

    const handleSendMessage = () => {
        if (messageText.length < 1) {
            return;
        }

        if (!socket) {
            return;
        }

        const newMessage: IMessage = {
            type: NEW_MESSAGE,
            payload: {},
        };

        socket.send(JSON.stringify(newMessage));
    };

    const handleChangeGroupName = (e: FormEvent) => {
        e.preventDefault();
        try {
            if (!socket) {
                return;
            }

            setIsLoading(true);

            const changeGroupNameMessage: IMessage = {
                type: CHANGE_GROUP_NAME,
                payload: {
                    chatRoomId: chatRoomState.id,
                    groupName: newGroupName,
                },
            };

            socket.send(JSON.stringify(changeGroupNameMessage));
        } catch (error) {
            console.error(error);
            toast({
                description:
                    "Could not process your request. Please try again!",
            });
            setIsEditNameModalVisible(false);
            setIsLoading(false);
        }
    };

    const handleLeaveGroupChat = () => {
        try {
            if (!socket) {
                return;
            }

            const leaveGroupChatMessage: IMessage = {
                type: LEAVE_GROUP_CHAT,
                payload: {
                    chatRoomId: chatRoomState.id,
                },
            };

            setIsLoading(true);
            socket.send(JSON.stringify(leaveGroupChatMessage));
        } catch (error) {
            console.log(error);
            setIsLoading(false);
            toast({
                title: "Uh oh! Something went wrong",
                description:
                    "There was an issue with your request. Please try again",
            });
        }
    };

    const handleDeleteGroupChat = () => {};

    const handleRemoveUserFromGroup = () => {};

    const handleAdminStatusChange = (
        userId: string,
        action: "Make admin" | "Remove as admin"
    ) => {
        try {
            if (!socket) {
                return;
            }

            setIsLoading(true);

            if (action === "Make admin") {
                socket.send(
                    JSON.stringify({
                        type: MAKE_ADMIN,
                        payload: {
                            userId,
                            groupId: groupState.id,
                        },
                    })
                );
                return;
            }

            if (action === "Remove as admin") {
                socket.send(
                    JSON.stringify({
                        type: REMOVE_AS_ADMIN,
                        payload: {
                            userId,
                            groupId: groupState.id,
                        },
                    })
                );
            }
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    };

    return (
        <div className="h-dvh w-full flex overflow-hidden">
            <div className="h-full w-full flex flex-col items-center overflow-hidden">
                {/* header */}
                <div className="flex items-center w-full justify-between p-4 border-b border-input">
                    <div className="flex gap-3 items-center">
                        <Avatar
                            className="size-12 cursor-pointer select-none"
                            onClick={() => setIsRoomInfoVisible((p) => !p)}
                        >
                            <AvatarImage
                                src={chatRoomImage}
                                alt="Group Image"
                            />
                            <AvatarFallback>
                                {chatRoomName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <h1
                            className="font-semibold cursor-pointer select-none"
                            onClick={() => setIsRoomInfoVisible((p) => !p)}
                        >
                            {chatRoomName}
                        </h1>
                    </div>
                    <CircleAlert
                        className={cn(
                            "rotate-180 cursor-pointer active:brightness-50",
                            isRoomInfoVisible && "fill-white text-black"
                        )}
                        onClick={() => setIsRoomInfoVisible((p) => !p)}
                    />
                </div>
                {/* messages */}
                <div className="flex-grow w-full overflow-y-scroll scrollbar"></div>
                <div className="w-[98%] flex items-center rounded-full border border-input py-2 pl-4 pr-6 my-4 gap-4">
                    <div
                        ref={emojiPickerRef}
                        className="relative"
                    >
                        <EmojiPicker
                            open={isEmojiPickerVisible}
                            theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                            onEmojiClick={handleEmojiClick}
                            autoFocusSearch={false}
                            suggestedEmojisMode={SuggestionMode.FREQUENT}
                            className="!absolute bottom-[150%]"
                            height={400}
                        />
                        <Smile
                            className="size-7 active:brightness-50 cursor-pointer"
                            onClick={() => setIsEmojiPickerVisible((p) => !p)}
                        />
                    </div>
                    <input
                        className="bg-transparent border-none outline-none w-full text-lg"
                        type="text"
                        id={"messageText"}
                        placeholder="Message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        ref={messageInputRef}
                    />
                    <p
                        className={cn(
                            "text-gray-400 cursor-not-allowed select-none",
                            messageText.length > 0 &&
                                "text-blue-400 cursor-pointer active:scale-95 active:text-blue-700"
                        )}
                        onClick={handleSendMessage}
                    >
                        Send
                    </p>
                </div>
            </div>
            {isRoomInfoVisible && (
                <div className="w-[550px] h-full flex flex-col border-l border-input ml-[1px]">
                    <h1 className="p-6 border-b border-input text-2xl font-semibold">
                        Details
                    </h1>
                    <div className="flex items-center justify-between p-6 border-b border-input">
                        <p>Change group name</p>
                        <EditModal
                            title="Change group name"
                            defaultValue={groupState.name}
                            label="New group name"
                            placeholder="Change name to..."
                            description="Changing the name of a group chat changes it for everyone."
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            open={isEditNameModalVisible}
                            setOpen={setIsEditNameModalVisible}
                            onSubmit={handleChangeGroupName}
                            submitLabel={isLoading ? "Saving..." : "Save"}
                            disabled={isLoading}
                        >
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setIsEditNameModalVisible((p) => !p)
                                }
                            >
                                Change
                            </Button>
                        </EditModal>
                    </div>
                    <div className="p-6 flex items-center justify-between">
                        <p className="font-medium">Members</p>
                        {chatRoomState.isGroup &&
                            groupState.adminOf.some(
                                (admin) => admin.id === userId
                            ) && (
                                <p className="select-none text-blue-400 cursor-pointer active:scale-95 active:text-blue-700">
                                    Add people
                                </p>
                            )}
                    </div>
                    <div className="flex flex-grow w-full flex-col gap-4 overflow-y-auto px-6">
                        {chatRoomState.participants
                            .map((members) => {
                                const isUserAdmin = groupState.adminOf.some(
                                    (admin) => admin.id === members.id
                                );
                                const isUserSuperAdmin =
                                    groupState.superAdminId === members.id;
                                return (
                                    <div className="flex justify-between items-center w-full">
                                        <div className="flex gap-3 items-center">
                                            <Avatar className="size-16">
                                                <AvatarImage
                                                    src={members.profilePic}
                                                />
                                                <AvatarFallback>
                                                    {members.fullName
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-sm line-clamp-1 font-bold text-ellipsis">
                                                    {members.username}
                                                </p>
                                                <div className="flex text-xs items-center text-gray-400 font-bold">
                                                    {isUserAdmin && (
                                                        <span className="after:px-1 after:text-gray-400 after:content-['·']">
                                                            Admin
                                                        </span>
                                                    )}
                                                    <p className="line-clamp-1 text-ellipsis">
                                                        {members.fullName}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {isAdmin && !isUserSuperAdmin && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger>
                                                    <EllipsisVertical className="size-5 cursor-pointer active:brightness-50 select-none" />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem asChild>
                                                        <DialogBox
                                                            title="Remove from the group?"
                                                            description={`You are about to remove ${members.fullName} from the group`}
                                                            positiveTitle="Remove"
                                                            negativeTitle="Cancel"
                                                            PositiveButtonStyles="!bg-destructive dark:text-slate-200 text-black"
                                                            positiveOnClick={
                                                                handleRemoveUserFromGroup
                                                            }
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                className="w-full text-destructive justify-start border-0 text-sm px-2 rounde-sm"
                                                                disabled={
                                                                    isLoading
                                                                }
                                                            >
                                                                Remove from the
                                                                group
                                                            </Button>
                                                        </DialogBox>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className={
                                                            isUserAdmin
                                                                ? "text-destructive"
                                                                : ""
                                                        }
                                                        onClick={() =>
                                                            handleAdminStatusChange(
                                                                members.id,
                                                                isUserAdmin
                                                                    ? "Remove as admin"
                                                                    : "Make admin"
                                                            )
                                                        }
                                                    >
                                                        {isUserAdmin
                                                            ? "Remove as admin"
                                                            : "Make admin"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                );
                            })
                            .reverse()}
                    </div>
                    <div className="flex justify-center flex-col border-t items-start border-input p-6 gap-4 w-full">
                        <DialogBox
                            positiveTitle="Leave"
                            negativeTitle="Cancel"
                            title="Leave chat"
                            description="You won't be able to send or receive messages unless someone adds you back to the chat. No one will be notified that you left the chat."
                            positiveOnClick={handleLeaveGroupChat}
                            PositiveButtonStyles="!bg-destructive dark:text-slate-200 text-black"
                        >
                            <Button
                                variant="ghost"
                                className="text-destructive select-none p-0 cursor-pointer hover:!bg-transparent text-base"
                            >
                                Leave chat
                            </Button>
                        </DialogBox>
                        <p>
                            You won't be able to send or receive messages unless
                            someone adds you back to the chat. No one will be
                            notified that you left the chat.
                        </p>
                        {isAdmin && (
                            <DialogBox
                                positiveTitle="Delete"
                                negativeTitle="Cancel"
                                title="Permanently delete this chat?"
                                description="This chat and all it's messages will be deleted forever."
                                positiveOnClick={handleDeleteGroupChat}
                                PositiveButtonStyles="!bg-destructive dark:text-slate-200 text-black"
                            >
                                <Button
                                    variant="ghost"
                                    className="text-destructive select-none cursor-pointer p-0 hover:!bg-transparent text-base"
                                >
                                    Delete chat
                                </Button>
                            </DialogBox>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
