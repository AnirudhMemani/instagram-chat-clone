import { Loader } from "@/components/Loader";
import { CropModal } from "@/components/image-editor/CropModal";
import { useImageCropContext } from "@/components/image-editor/ImageCropProvider";
import { readFile } from "@/components/image-editor/helpers/cropImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { chatRoomAtom, TParticipant } from "@/state/chat";
import { selectedUsersAtom } from "@/state/user";
import { NAVIGATION_ROUTES, StatusCodes } from "@/utils/constants";
import { CREATE_GROUP } from "@instachat/messages/messages";
import { IMessage } from "@instachat/messages/types";
import { ArrowLeft, Camera } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { toast } from "sonner";

type TCreateGroupResponse = {
    id: string;
    name: string;
    picture: string;
    nameUpdatedAt: Date;
    pictureUpdatedAt: Date;
    createdAt: Date;
    createdBy: TParticipant;
    admins: TParticipant[];
    participants: TParticipant[];
    superAdmin: TParticipant;
};

const GroupDetailsPage: React.FC<{ socket: WebSocket | null }> = ({ socket }): JSX.Element => {
    const [groupName, setGroupName] = useState<string>("");
    const [groupImage, setGroupImage] = useState<File>();
    const [previewImage, setPreviewImage] = useState<string>(
        "https://res.cloudinary.com/dtbyy0w95/image/upload/v1716144011/default-group-image_eopbih.png"
    );
    const [isCropModalVisible, setIsCropModalVisible] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [selectedUsers, setSelectedUsers] = useRecoilState(selectedUsersAtom);
    const setChatRoomDetails = useSetRecoilState(chatRoomAtom);

    const { getProcessedImage, setImage, resetStates } = useImageCropContext();

    const navigate = useNavigate();

    const getSkeletonGroupPicture = async () => {
        const response = await fetch(
            "https://res.cloudinary.com/dtbyy0w95/image/upload/v1716144011/default-group-image_eopbih.png"
        );
        const blob = await response.blob();
        const newFile = new File([blob], "default-group-image.png", { type: "image/png" });
        setGroupImage(newFile);
    };

    useEffect(() => {
        getSkeletonGroupPicture();
    }, []);

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.onmessage = (event) => {
            const message: IMessage = JSON.parse(event.data);

            if (message.type === CREATE_GROUP) {
                const success = message.success;
                const status = message.status;
                const payload = message.payload as TCreateGroupResponse;

                if (!success) {
                    if (status === StatusCodes.BadRequest) {
                        toast.error("Uh oh! Something went wrong.", {
                            description: "Max 5 MB of file size allowed",
                        });
                    } else {
                        toast.error("Uh oh! Something went wrong.", {
                            description: "There was an issue with your request. Please try again later!",
                        });
                    }
                    setIsSubmitting(false);
                } else {
                    if (status === StatusCodes.Ok) {
                        setChatRoomDetails(() => ({
                            isGroup: true,
                            id: payload.id,
                            name: payload.name,
                            admins: payload.admins,
                            superAdmin: payload.superAdmin,
                            createdAt: payload.createdAt,
                            createdBy: payload.createdBy,
                            participants: payload.participants,
                            picture: payload.picture,
                            messages: [],
                            nameUpdatedAt: payload.nameUpdatedAt,
                            pictureUpdatedAt: payload.pictureUpdatedAt,
                        }));
                        setSelectedUsers([]);
                        toast.success("Group created successfully");
                        navigate(`/inbox/direct/${payload.id}`);
                    } else {
                        toast.error("Uh oh! Something went wrong.", {
                            description: "Our servers are busy. Please try again later!",
                        });
                    }
                }
            }
        };
    }, [socket]);

    const handleGroupImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            return;
        }

        setIsSubmitting(true);

        const reader = new FileReader();

        reader.onload = (e) => {
            const imageData = e.target?.result;

            if (!imageData) {
                return;
            }

            const message = {
                type: CREATE_GROUP,
                payload: {
                    selectedUsers,
                    groupDetails: {
                        name: groupName,
                        profilePic: imageData,
                        ...(groupImage?.name && { pictureName: groupImage.name }),
                    },
                },
            };

            socket.send(JSON.stringify(message));
        };

        if (groupImage) {
            reader.readAsDataURL(groupImage);
        }
    };

    return (
        <div className="flex h-dvh w-full items-center justify-center">
            <form
                className="border-input flex w-[400px] flex-col items-center justify-center gap-6 overflow-hidden rounded-lg border p-10"
                onSubmit={handleGroupCreation}
            >
                <div className="relative flex w-full items-center justify-center gap-1">
                    <ArrowLeft
                        className="absolute left-0 size-5 cursor-pointer"
                        onClick={() => {
                            if (isSubmitting) return;
                            navigate(NAVIGATION_ROUTES.INBOX);
                            setSelectedUsers([]);
                        }}
                    />
                    <h1 className="text-lg font-medium">New Group</h1>
                </div>
                <div className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                    <Input
                        type="file"
                        onChange={handleGroupImageChange}
                        accept=".jpg, .png, .jpeg, .webp"
                        className="peer absolute z-20 h-full w-full cursor-pointer opacity-0"
                        disabled={isSubmitting}
                    />
                    <img src={previewImage} className="object-cover object-center opacity-40" />
                    <div
                        className={cn(
                            "absolute flex flex-col items-center justify-center font-medium text-black hover:opacity-100",
                            previewImage !==
                                "https://res.cloudinary.com/dtbyy0w95/image/upload/v1716144011/default-group-image_eopbih.png" &&
                                "opacity-0 transition-opacity duration-300 ease-in-out peer-hover:opacity-100"
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
                <div className="flex max-h-24 w-full flex-grow flex-wrap gap-3 overflow-y-auto">
                    {selectedUsers.length > 0 &&
                        selectedUsers.map((user) => (
                            <div
                                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200"
                                key={user.id}
                            >
                                <img className="object-cover object-center" src={user.profilePic} />
                            </div>
                        ))}
                </div>
                <Button className="w-full" type="submit" disabled={isSubmitting} variant="secondary">
                    {isSubmitting ? <Loader visible={isSubmitting} /> : "Create"}
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
