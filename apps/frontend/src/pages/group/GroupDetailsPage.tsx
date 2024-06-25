import { Input } from "@/components/ui/input";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Camera } from "lucide-react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { selectedUsersAtom } from "@/state/user";
import { useImageCropContext } from "@/components/image-editor/ImageCropProvider";
import { readFile } from "@/components/image-editor/helpers/cropImage";
import { CropModal } from "@/components/image-editor/CropModal";
import { cn } from "@/lib/utils";
import { pageTypeAtom } from "@/state/global";
import { Button } from "@/components/ui/button";
import { IMessage, IStartConvoMessage } from "@instachat/messages/types";
import { CREATE_GROUP } from "@instachat/messages/messages";
import { chatRoomAtom, groupAtom } from "@/state/chat";
import { toast } from "sonner";

const GroupDetailsPage: React.FC<{ socket: WebSocket | null }> = ({
    socket,
}): JSX.Element => {
    const defaultGroupImageFile = new File(
        [
            "https://res.cloudinary.com/dtbyy0w95/image/upload/v1716144011/default-group-image_eopbih.png",
        ],
        "default-group-image.png"
    );

    const [groupName, setGroupName] = useState<string>("");
    const [groupImage, setGroupImage] = useState<File>(defaultGroupImageFile);
    const [previewImage, setPreviewImage] = useState<string>(
        "https://res.cloudinary.com/dtbyy0w95/image/upload/v1716144011/default-group-image_eopbih.png"
    );
    const [isCropModalVisible, setIsCropModalVisible] =
        useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [selectedUsers, setSelectedUsers] = useRecoilState(selectedUsersAtom);
    const setChatRoomDetails = useSetRecoilState(chatRoomAtom);
    const setGroupDetails = useSetRecoilState(groupAtom);
    const setPagetype = useSetRecoilState(pageTypeAtom);

    const { getProcessedImage, setImage, resetStates } = useImageCropContext();

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.onmessage = (event) => {
            const message: IMessage = JSON.parse(event.data);

            if (message.type === CREATE_GROUP) {
                const payload = message.payload;

                if (payload.error) {
                    toast.error("Uh oh! Something went wrong.", {
                        richColors: true,
                        description: "Max 5 MB of file size allowed",
                    });
                    return;
                }

                setChatRoomDetails(() => ({
                    id: payload.chatRoomId,
                    name: payload.chatRoomName,
                    createdAt: payload.createdAt,
                    participants: payload.participants,
                    messages: payload.messageDetails,
                    isGroup: true,
                }));

                setGroupDetails(payload.groupDetails);

                setIsSubmitting(false);
                setPagetype("ChatRoom");
                setSelectedUsers([]);
            }
        };

        return () => {
            socket.onmessage = null;
        };
    }, [socket]);

    const handleGroupImageChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!e.target.files?.length) {
            return;
        }

        const file = e.target.files[0];

        const imageDataUrl = await readFile(file);
        setImage(imageDataUrl);
        setIsCropModalVisible(true);
    };

    const handleCropDone = async () => {
        const avatar = await getProcessedImage();
        setGroupImage(avatar);
        setPreviewImage(window.URL.createObjectURL(avatar));
        resetStates();
        setIsCropModalVisible(false);
    };

    const handleGroupCreation = (e: FormEvent) => {
        e.preventDefault();

        if (!socket) {
            console.log("Group Creation, socket not found");
            return;
        }

        setIsSubmitting(true);

        const reader = new FileReader();

        reader.onload = (e) => {
            const imageData = e.target?.result;

            if (!imageData) {
                return;
            }

            console.log(imageData);

            const message: IStartConvoMessage = {
                type: CREATE_GROUP,
                payload: {
                    userDetails: selectedUsers,
                    groupDetails: {
                        name: groupName,
                        profilePic: imageData,
                        pictureName: groupImage.name,
                    },
                },
            };

            socket.send(JSON.stringify(message));
        };

        reader.readAsDataURL(groupImage);
    };

    return (
        <div className="flex items-center justify-center h-dvh w-full">
            <form
                className="flex items-center justify-center flex-col gap-6 border border-input p-10 rounded-lg w-[400px] overflow-hidden"
                onSubmit={handleGroupCreation}
            >
                <div className="flex items-center relative gap-1 justify-center w-full">
                    <ArrowLeft
                        className="size-5 absolute left-0 cursor-pointer"
                        onClick={() => {
                            if (isSubmitting) return;
                            setPagetype("StartChatPrompt");
                            setSelectedUsers([]);
                        }}
                    />
                    <h1 className="text-lg font-medium">New Group</h1>
                </div>
                <div className="relative h-40 w-40 overflow-hidden bg-gray-200 rounded-full flex items-center justify-center">
                    <Input
                        type="file"
                        onChange={handleGroupImageChange}
                        accept=".jpg, .png, .jpeg, .webp"
                        className="absolute opacity-0 w-full h-full peer z-20 cursor-pointer"
                        disabled={isSubmitting}
                    />
                    <img
                        src={previewImage}
                        className="object-cover object-center opacity-40"
                    />
                    <div
                        className={cn(
                            "absolute text-black hover:opacity-100 font-medium flex flex-col items-center justify-center",
                            previewImage !==
                                "https://res.cloudinary.com/dtbyy0w95/image/upload/v1716144011/default-group-image_eopbih.png" &&
                                "peer-hover:opacity-100 opacity-0 transition-opacity duration-300 ease-in-out"
                        )}
                    >
                        <Camera className="size-10" />
                        <span>
                            {previewImage ===
                            "https://res.cloudinary.com/dtbyy0w95/image/upload/v1716144011/default-group-image_eopbih.png"
                                ? "Add a group icon"
                                : "Change group icon"}
                        </span>
                    </div>
                </div>
                <Input
                    type="text"
                    placeholder="Group Name..."
                    required
                    onChange={(e) => setGroupName(e.target.value)}
                    value={groupName}
                    disabled={isSubmitting}
                />
                <h1 className="mr-auto">Members</h1>
                <div className="overflow-y-auto flex-grow flex-wrap flex gap-3 w-full max-h-24">
                    {selectedUsers.length > 0 &&
                        selectedUsers.map((user) => (
                            <div
                                className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex justify-center items-center"
                                key={user.id}
                            >
                                <img
                                    className="object-center object-cover"
                                    src={user.profilePic}
                                />
                            </div>
                        ))}
                </div>
                <Button
                    className="w-full"
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Creating..." : "Create"}
                </Button>
            </form>
            <CropModal
                handleDone={handleCropDone}
                isModalVisible={isCropModalVisible}
                setIsModalVisible={setIsCropModalVisible}
            />
        </div>
    );
};

export default GroupDetailsPage;
