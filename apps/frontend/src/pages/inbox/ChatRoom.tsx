import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { env } from "@/utils/constants";
import { TWebSocket } from "@/utils/types";
import { CircleAlert, Smile } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import EmojiPicker, {
    EmojiClickData,
    SuggestionMode,
} from "emoji-picker-react";
import { Theme } from "emoji-picker-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { NEW_MESSAGE } from "@instachat/messages/messages";
import { IMessage } from "@instachat/messages/types";
import { useRecoilValue } from "recoil";
import { chatRoomAtom, groupAtom } from "@/state/chat";
import { Button } from "@/components/ui/button";
import { userIdAtom } from "@/state/user";
import { EditModal } from "@/components/EditModal";

export const ChatRoom: React.FC<TWebSocket> = ({ socket }): JSX.Element => {
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [showRoomInfo, setShowRoomInfo] = useState<boolean>(false);
    const [newGroupName, setNewGroupName] = useState<string>("");

    const chatRoomDetails = useRecoilValue(chatRoomAtom);
    const groupDetails = useRecoilValue(groupAtom);
    const userId = useRecoilValue(userIdAtom);

    const url = env.SERVER_URL;

    const roomPicture =
        url + "/" + chatRoomDetails.isGroup
            ? groupDetails.picture
            : chatRoomDetails.participants[0].profilePic;

    const inputRef = useRef<HTMLInputElement | null>(null);
    const emojiPickerRef = useRef<HTMLDivElement | null>(null);

    const { theme } = useTheme();

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
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

    return (
        <div className="h-dvh w-full flex">
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
                                {chatRoomDetails.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <h1
                            className="font-semibold cursor-pointer select-none"
                            onClick={() => setShowRoomInfo((p) => !p)}
                        >
                            {chatRoomDetails.name}
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
                <div className="flex-grow w-full overflow-y-scroll"></div>
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
                <div className="w-[550px]">
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
                            onChange={(e) => {
                                const name = e.target.value;
                                if (name.length < 1) {
                                    e.target.setCustomValidity(
                                        "Cannot be empty"
                                    );
                                } else {
                                    e.target.setCustomValidity("");
                                    setNewGroupName(name);
                                }
                            }}
                            onSubmit={() => {
                                // write the logic to change the group name and also close the modal
                            }}
                        >
                            <Button variant="outline">Change</Button>
                        </EditModal>
                    </div>
                    <div className="p-6 flex items-center justify-between">
                        <p className="font-medium">Members</p>
                        {chatRoomDetails.isGroup &&
                            groupDetails.adminOf.some(
                                (admin) => admin.id === userId
                            ) && (
                                <p
                                    className={cn(
                                        "text-gray-400 cursor-not-allowed select-none",
                                        message.length > 0 &&
                                            "text-blue-400 cursor-pointer active:scale-95 active:text-blue-700"
                                    )}
                                >
                                    Add people
                                </p>
                            )}
                    </div>
                    <div className="flex flex-grow flex-col gap-4 overflow-y-auto px-6">
                        {chatRoomDetails.participants
                            .map((members) => (
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
                                            <div className="flex text-xs items-center">
                                                <p className="after:px-1 text-gray-400 font-bold line-clamp-1 text-ellipsis">
                                                    {members.fullName}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                            .reverse()}
                    </div>
                </div>
            )}
        </div>
    );
};
