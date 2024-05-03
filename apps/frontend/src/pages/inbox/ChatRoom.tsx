import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { env } from "@/utils/constants";
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
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [showRoomInfo, setShowRoomInfo] = useState<boolean>(false);
    const [newGroupName, setNewGroupName] = useState<string>("");
    const [showEditNameModal, setShowEditNameModal] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [chatRoomDetails, setChatRoomDetails] = useRecoilState(chatRoomAtom);
    const [groupDetails, setGroupDetails] = useRecoilState(groupAtom);
    const userId = useRecoilValue(userIdAtom);

    const [isAdmin, _setIsAdmin] = useState<boolean>(
        chatRoomDetails.isGroup
            ? groupDetails.adminOf.some((admin) => admin.id === userId)
            : false
    );

    const url = env.SERVER_URL;

    const roomName = chatRoomDetails.isGroup
        ? groupDetails.name
        : chatRoomDetails.name;

    const roomPicture =
        url + "/" + chatRoomDetails.isGroup
            ? groupDetails.picture
            : chatRoomDetails.participants[0].profilePic;

    const inputRef = useRef<HTMLInputElement | null>(null);
    const emojiPickerRef = useRef<HTMLDivElement | null>(null);

    const { theme } = useTheme();
    const { toast } = useToast();

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as IMessage;

                switch (message.type) {
                    case CHANGE_GROUP_NAME:
                        if (message.payload.result === SUCCESS) {
                            setGroupDetails({
                                ...groupDetails,
                                name: message.payload.groupName,
                            });
                            setChatRoomDetails({
                                ...chatRoomDetails,
                                name: message.payload.groupName,
                            });
                        } else if (message.payload.result === ERROR) {
                            toast({
                                title: "Uh oh! You do not have enough permission.",
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
                        if (message.payload.result === ERROR) {
                            toast({
                                description:
                                    "You are not a part of this group chat",
                            });
                        } else if (message.payload.result === SUCCESS) {
                            const id = message.payload.userId;
                            setChatRoomDetails({
                                ...chatRoomDetails,
                                participants:
                                    chatRoomDetails.participants.filter(
                                        (participant) => participant.id !== id
                                    ),
                            });
                            setGroupDetails({
                                ...groupDetails,
                                adminOf: groupDetails.adminOf.filter(
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
                        if (message.payload.result === ERROR) {
                            toast({
                                title: "Uh oh! Something went wrong.",
                            });
                        } else {
                            const userDetails = message.payload.userDetails;
                            setGroupDetails({
                                ...groupDetails,
                                adminOf: [...groupDetails.adminOf, userDetails],
                            });
                        }
                        break;
                    case REMOVE_AS_ADMIN:
                        if (message.payload.result === ERROR) {
                            toast({
                                title: "Uh oh! Something went wrong.",
                            });
                        } else {
                            const adminId = message.payload.adminId;
                            setGroupDetails({
                                ...groupDetails,
                                adminOf: groupDetails.adminOf.filter(
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
                setShowEditNameModal(false);
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
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener("mousedown", closeEmojiPicker);

        return () => {
            document.removeEventListener("mousedown", closeEmojiPicker);
        };
    }, []);

    const addEmoji = (e: EmojiClickData) => {
        setMessage((p) => p + e.emoji);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const sendMessage = () => {
        if (message.length < 1) {
            return;
        }

        if (!socket) {
            return;
        }

        const socketMessage: IMessage = {
            type: NEW_MESSAGE,
            payload: {},
        };

        socket.send(JSON.stringify(socketMessage));
    };

    const changeGroupName = (e: FormEvent) => {
        e.preventDefault();
        try {
            if (!socket) {
                return;
            }

            setIsLoading(true);

            const changeGroupNameMessage: IMessage = {
                type: CHANGE_GROUP_NAME,
                payload: {
                    chatRoomId: chatRoomDetails.id,
                    groupName: newGroupName,
                },
            };

            socket.send(JSON.stringify(changeGroupNameMessage));
        } catch (error) {
            console.log(error);
            toast({
                description:
                    "Could not process your request. Please try again!",
            });
            setShowEditNameModal(false);
            setIsLoading(false);
        }
    };

    const handleLeaveChat = () => {
        try {
            if (!socket) {
                return;
            }

            const leaveChatMessage: IMessage = {
                type: LEAVE_GROUP_CHAT,
                payload: {
                    chatRoomId: chatRoomDetails.id,
                },
            };

            setIsLoading(true);
            socket.send(JSON.stringify(leaveChatMessage));
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

    const handleDeleteChat = () => {};

    const handleRemoveUser = () => {};

    const handleMakeAdmin = (
        userId: string,
        operationType: "Make admin" | "Remove as admin"
    ) => {
        try {
            if (!socket) {
                return;
            }

            setIsLoading(true);

            if (operationType === "Make admin") {
                socket.send(
                    JSON.stringify({
                        type: MAKE_ADMIN,
                        payload: {
                            userId,
                            groupId: groupDetails.id,
                        },
                    })
                );
                return;
            }

            if (operationType === "Remove as admin") {
                socket.send(
                    JSON.stringify({
                        type: REMOVE_AS_ADMIN,
                        payload: {
                            userId,
                            groupId: groupDetails.id,
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
                            onClick={() => setShowRoomInfo((p) => !p)}
                        >
                            <AvatarImage src={roomPicture} />
                            <AvatarFallback>
                                {roomName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <h1
                            className="font-semibold cursor-pointer select-none"
                            onClick={() => setShowRoomInfo((p) => !p)}
                        >
                            {roomName}
                        </h1>
                    </div>
                    <CircleAlert
                        className={cn(
                            "rotate-180 cursor-pointer active:brightness-50",
                            showRoomInfo && "fill-white text-black"
                        )}
                        onClick={() => setShowRoomInfo((p) => !p)}
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
                            open={showEmojiPicker}
                            theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                            onEmojiClick={addEmoji}
                            autoFocusSearch={false}
                            suggestedEmojisMode={SuggestionMode.FREQUENT}
                            className="!absolute bottom-[150%]"
                            height={400}
                        />
                        <Smile
                            className="size-7 active:brightness-50 cursor-pointer"
                            onClick={() => setShowEmojiPicker((p) => !p)}
                        />
                    </div>
                    <input
                        className="bg-transparent border-none outline-none w-full text-lg"
                        type="text"
                        id={"message"}
                        placeholder="Message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        ref={inputRef}
                    />
                    <p
                        className={cn(
                            "text-gray-400 cursor-not-allowed select-none",
                            message.length > 0 &&
                                "text-blue-400 cursor-pointer active:scale-95 active:text-blue-700"
                        )}
                        onClick={sendMessage}
                    >
                        Send
                    </p>
                </div>
            </div>
            {showRoomInfo && (
                <div className="w-[550px] h-full flex flex-col border-l border-input ml-[1px]">
                    <h1 className="p-6 border-b border-input text-2xl font-semibold">
                        Details
                    </h1>
                    <div className="flex items-center justify-between p-6 border-b border-input">
                        <p>Change group name</p>
                        <EditModal
                            title="Change group name"
                            defaultValue={groupDetails.name}
                            label="New group name"
                            placeholder="Change name to..."
                            description="Changing the name of a group chat changes it for everyone."
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            open={showEditNameModal}
                            setOpen={setShowEditNameModal}
                            onSubmit={changeGroupName}
                            submitLabel={isLoading ? "Saving..." : "Save"}
                            disabled={isLoading}
                        >
                            <Button
                                variant="outline"
                                onClick={() => setShowEditNameModal((p) => !p)}
                            >
                                Change
                            </Button>
                        </EditModal>
                    </div>
                    <div className="p-6 flex items-center justify-between">
                        <p className="font-medium">Members</p>
                        {chatRoomDetails.isGroup &&
                            groupDetails.adminOf.some(
                                (admin) => admin.id === userId
                            ) && (
                                <p className="select-none text-blue-400 cursor-pointer active:scale-95 active:text-blue-700">
                                    Add people
                                </p>
                            )}
                    </div>
                    <div className="flex flex-grow w-full flex-col gap-4 overflow-y-auto px-6">
                        {chatRoomDetails.participants
                            .map((members) => {
                                const isUserAdmin = groupDetails.adminOf.some(
                                    (admin) => admin.id === members.id
                                );
                                const isUserSuperAdmin =
                                    groupDetails.superAdminId === members.id;
                                return (
                                    <div className="flex justify-between items-center w-full">
                                        <div className="flex gap-3 items-center">
                                            <Avatar className="size-16">
                                                <AvatarImage
                                                    src={`${url}/${members.profilePic}`}
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
                                                                handleRemoveUser
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
                                                            handleMakeAdmin(
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
                            positiveOnClick={handleLeaveChat}
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
                                positiveOnClick={handleDeleteChat}
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
