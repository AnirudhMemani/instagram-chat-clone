import { EditModal } from "@/components/EditModal";
import { Loader } from "@/components/Loader";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { chatRoomAtom, potentialSuperAdminsAtom, TChatRoomAtom, TMessage, TParticipant } from "@/state/chat";
import { alertModalAtom, isChatModalVisibleAtom, showAdminSelectionModalAtom } from "@/state/global";
import { userAtom } from "@/state/user";
import { TNewMesageResponse } from "@/types/chatRoom";
import { NAVIGATION_ROUTES, StatusCodes } from "@/utils/constants";
import { printlogs } from "@/utils/logs";
import { TWebSocket } from "@/utils/types";
import {
    CHANGE_GROUP_NAME,
    CHATROOM_DETAILS_BY_ID,
    DELETE_GROUP_CHAT,
    LEAVE_GROUP_CHAT,
    MAKE_ADMIN,
    NEW_MESSAGE,
    READ_MESSAGE,
    REMOVE_AS_ADMIN,
    REMOVE_FROM_CHAT,
    SEND_MESSAGE,
    TRANSFER_SUPER_ADMIN,
} from "@instachat/messages/messages";
import { IMessage } from "@instachat/messages/types";
import { format } from "date-fns";
import EmojiPicker, { EmojiClickData, SuggestionMode, Theme } from "emoji-picker-react";
import { CircleAlert, Clock, EllipsisVertical, Smile } from "lucide-react";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { toast } from "sonner";

export const ChatRoom: React.FC<TWebSocket> = ({ socket }): JSX.Element => {
    const [message, setMessage] = useState<string>("");
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chatRoomName, setChatRoomName] = useState<string>("");
    const [newGroupName, setNewGroupName] = useState<string>("");
    const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
    const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
    const [isRoomInfoVisible, setIsRoomInfoVisible] = useState<boolean>(false);
    const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState<boolean>(false);
    const [chatRoomImage, setChatRoomImage] = useState<string | undefined>(undefined);
    const [isEditNameModalVisible, setIsEditNameModalVisible] = useState<boolean>(false);

    const user = useRecoilValue(userAtom);

    const setAlertModalMetadata = useSetRecoilState(alertModalAtom);
    const setIsChatModalVisible = useSetRecoilState(isChatModalVisibleAtom);
    const [chatRoomDetails, setChatRoomDetails] = useRecoilState(chatRoomAtom);
    const setPotentialSuperAdmins = useSetRecoilState(potentialSuperAdminsAtom);
    const setShowAdminSelectionModal = useSetRecoilState(showAdminSelectionModalAtom);

    const emojiPickerRef = useRef<HTMLDivElement | null>(null);
    const messageInputRef = useRef<HTMLInputElement | null>(null);

    const { id } = useParams();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const commonToastErrorMessage = ({ title, description }: { title?: string; description?: string }) => {
        toast.error(title ?? "Uh oh! Something went wrong", {
            description,
        });
    };

    const removeMemberById = (id: string) => {
        if (chatRoomDetails && chatRoomDetails.isGroup === true) {
            const modifiedChatRoomDetails = {
                ...chatRoomDetails,
                participants: chatRoomDetails.participants.filter((member) => member.id !== id),
                admins: chatRoomDetails.admins.filter((admin) => admin.id !== id),
            } satisfies TChatRoomAtom;
            setChatRoomDetails(modifiedChatRoomDetails);
        }
    };

    const handleSuperAdminSelection = (id: string) => {
        try {
            if (!socket) {
                return;
            }

            if (!chatRoomDetails || !chatRoomDetails.id) {
                return;
            }

            const transferSuperAdminMessage = {
                type: TRANSFER_SUPER_ADMIN,
                payload: {
                    newSuperAdminId: id,
                    chatRoomId: chatRoomDetails.id,
                },
            };

            setIsLoading(true);
            socket.send(JSON.stringify(transferSuperAdminMessage));
        } catch (error) {
            setIsLoading(false);
            printlogs("ERROR inside handleSuperAdminSelection()", error);
        }
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "auto" });
        }
    }, [chatRoomDetails?.messages]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        if (chatRoomDetails && chatRoomDetails.id === id) {
            socket.send(JSON.stringify({ type: READ_MESSAGE, payload: { chatRoomId: chatRoomDetails.id } }));
            setChatRoomName(
                chatRoomDetails.isGroup
                    ? chatRoomDetails.name
                    : chatRoomDetails.participants.find((member) => member.id !== user.id)?.username || ""
            );
            setChatRoomImage(
                chatRoomDetails.isGroup
                    ? chatRoomDetails.picture
                    : chatRoomDetails.participants[0].id !== user.id
                      ? chatRoomDetails.participants[0].profilePic
                      : chatRoomDetails.participants[1].profilePic
            );
            setIsAdmin(
                (chatRoomDetails.isGroup ? chatRoomDetails.admins?.some((admin) => admin.id === user.id) : false) ||
                    false
            );
            setIsSuperAdmin(chatRoomDetails.isGroup && chatRoomDetails.superAdmin?.id === user?.id);
            return;
        }

        if (!chatRoomDetails?.id || id !== chatRoomDetails.id) {
            try {
                const getChatRoomDetailsByIdMessage = {
                    type: CHATROOM_DETAILS_BY_ID,
                    payload: {
                        chatRoomId: id,
                    },
                };

                setChatRoomDetails(null);
                socket.send(JSON.stringify(getChatRoomDetailsByIdMessage));
            } catch (error) {
                printlogs("ERROR trying to get Chat Room details by ID");
                setIsLoading(false);
            }
        }
    }, [chatRoomDetails, socket, id]);

    useEffect(() => {
        if (isEditNameModalVisible && chatRoomDetails?.isGroup) {
            setNewGroupName(chatRoomDetails?.name.trim());
        }
    }, [isEditNameModalVisible]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.onmessage = (event) => {
            try {
                const responseMessage = JSON.parse(event.data) as IMessage;

                if (responseMessage?.type === CHATROOM_DETAILS_BY_ID) {
                    if (responseMessage.success === false) {
                        if (responseMessage.status === StatusCodes.NotFound) {
                            navigate(NAVIGATION_ROUTES.INBOX, {
                                replace: true,
                            });
                            toast.error(responseMessage?.payload?.message);
                            return;
                        }

                        if (responseMessage.status === StatusCodes.InternalServerError) {
                            navigate(NAVIGATION_ROUTES.INBOX, {
                                replace: true,
                            });
                            toast.error("There was an issue with your request. Try again!");
                            return;
                        }
                    } else {
                        if (responseMessage.status === StatusCodes.Ok) {
                            if (responseMessage?.payload?.isGroup === true) {
                                const chatRoomDetails = {
                                    isGroup: true,
                                    id: responseMessage?.payload?.id,
                                    name: responseMessage?.payload?.name,
                                    admins: responseMessage?.payload?.admins,
                                    picture: responseMessage?.payload?.picture,
                                    messages: responseMessage?.payload?.messages,
                                    createdAt: responseMessage?.payload?.createdAt,
                                    createdBy: responseMessage?.payload?.createdBy,
                                    superAdmin: responseMessage?.payload?.superAdmin,
                                    participants: responseMessage?.payload?.participants,
                                    nameUpdatedAt: responseMessage?.payload?.nameUpdatedAt,
                                    pictureUpdatedAt: responseMessage?.payload?.pictureUpdatedAt,
                                } satisfies TChatRoomAtom;

                                setChatRoomDetails(chatRoomDetails);
                            } else if (responseMessage?.payload?.isGroup === false) {
                                const chatRoomDetails = {
                                    isGroup: false,
                                    id: responseMessage?.payload?.id,
                                    messages: responseMessage?.payload?.messages,
                                    createdAt: responseMessage?.payload?.createdAt,
                                    participants: responseMessage?.payload?.participants,
                                } satisfies TChatRoomAtom;

                                setChatRoomDetails(chatRoomDetails);
                            }
                        } else {
                            navigate(NAVIGATION_ROUTES.INBOX, {
                                replace: true,
                            });
                            toast.error("There was an issue with your request. Try again!");
                        }
                    }
                    return;
                }

                if (chatRoomDetails) {
                    switch (responseMessage?.type) {
                        case CHANGE_GROUP_NAME:
                            if (responseMessage.status === StatusCodes.Forbidden) {
                                commonToastErrorMessage({
                                    title: "Permission Denied",
                                    description: "Only a member of the group can change the group name",
                                });
                            } else if (responseMessage.status === StatusCodes.Ok) {
                                const updatedChatRoomName = responseMessage?.payload?.updatedGroupName;

                                setChatRoomDetails((prev) => (prev ? { ...prev, name: updatedChatRoomName } : prev));
                                setChatRoomName(() => updatedChatRoomName);
                            } else {
                                commonToastErrorMessage({
                                    description: "An unknown error occurred. Please try again!",
                                });
                            }
                            setIsLoading(false);
                            setIsEditNameModalVisible(false);
                            break;
                        case LEAVE_GROUP_CHAT:
                            if (responseMessage?.status === StatusCodes.Forbidden) {
                                switch (responseMessage?.payload?.action) {
                                    case "not-member":
                                        removeMemberById(user.id);
                                        toast.error(responseMessage?.payload?.message);
                                        break;
                                    case "select-superadmin":
                                        toast.info(
                                            "Super admin cannot leave the group. Please transfer this role to someone else to leave the group chat"
                                        );
                                        const potentialSuperAdmins = responseMessage?.payload
                                            ?.participants as TParticipant[];
                                        const filteredSuperAdmins =
                                            (potentialSuperAdmins &&
                                                potentialSuperAdmins?.length &&
                                                potentialSuperAdmins.filter((member) => member.id !== user.id)) ||
                                            [];
                                        setPotentialSuperAdmins(filteredSuperAdmins);
                                        setShowAdminSelectionModal(true);
                                        break;
                                    case "auto-superadmin":
                                        const newSuperAdmin = (
                                            responseMessage?.payload?.participants as TParticipant[]
                                        )?.filter((member) => member.id !== user.id);
                                        setAlertModalMetadata({
                                            visible: true,
                                            title: `Are you sure you want to make ${newSuperAdmin[0].username} the super admin of this group`,
                                            description: `You are about to make ${newSuperAdmin[0].username} the super admin of this group. This action cannot be reverted`,
                                            positiveOnClick: () => handleSuperAdminSelection(newSuperAdmin[0].id),
                                            positiveTitle: "Confirm and leave",
                                            PositiveButtonStyles: "!bg-destructive dark:text-slate-200 text-black",
                                        });
                                        break;
                                    default:
                                        break;
                                }
                            } else if (responseMessage.status === StatusCodes.NotFound) {
                                toast.info("There was an issue with your request. Please try again!");
                                setChatRoomDetails(null);
                                navigate(NAVIGATION_ROUTES.INBOX);
                            } else if (responseMessage.status === StatusCodes.Ok) {
                                removeMemberById(user.id);
                                toast.success("You have left this group chat");
                                navigate(NAVIGATION_ROUTES.INBOX, { replace: true });
                            } else {
                                commonToastErrorMessage({
                                    description: "There was an issue with your request. Please try again!",
                                });
                            }
                            break;
                        case TRANSFER_SUPER_ADMIN:
                            if (responseMessage.success === false) {
                                switch (responseMessage.status) {
                                    case StatusCodes.NotFound:
                                        setChatRoomDetails(null);
                                        navigate(NAVIGATION_ROUTES.INBOX, { replace: true });
                                        break;
                                    case StatusCodes.Forbidden:
                                        toast.error("You do not have enough permissions to perform this action");
                                        break;
                                    case StatusCodes.BadRequest:
                                        if (responseMessage?.payload?.action === "only-members") {
                                            toast.error("Only members of this group chat can be made super admin");
                                        } else {
                                            toast.error("There was an issue with your request. Please try again!");
                                        }
                                        break;
                                    default:
                                        toast.error("There was an issue with your request. Please try again later!");
                                        break;
                                }
                                setShowAdminSelectionModal(false);
                                setAlertModalMetadata({ visible: false });
                            } else if (responseMessage.success === true) {
                                if (responseMessage.status === StatusCodes.Ok && chatRoomDetails.isGroup === true) {
                                    const updatedChatRoomDetails = {
                                        ...chatRoomDetails,
                                        admins: chatRoomDetails.admins.filter((admin) => admin.id !== user.id),
                                        superAdmin: { ...responseMessage?.payload?.newSuperAdmin },
                                        participants: chatRoomDetails.participants.filter(
                                            (member) => member.id !== user.id
                                        ),
                                    } satisfies TChatRoomAtom;

                                    setChatRoomDetails(updatedChatRoomDetails);

                                    toast.success("You have left this group chat");
                                    navigate(NAVIGATION_ROUTES.INBOX, { replace: true });
                                }
                                setShowAdminSelectionModal(false);
                                setAlertModalMetadata({ visible: false });
                            } else {
                                toast.error("Our servers are busy. Please try again later!");
                            }
                            break;
                        case DELETE_GROUP_CHAT:
                            if (responseMessage.success === false) {
                                switch (responseMessage.status) {
                                    case StatusCodes.NotFound:
                                        commonToastErrorMessage({
                                            title: "Group not found",
                                        });
                                        navigate(NAVIGATION_ROUTES.INBOX, { replace: true });
                                        setChatRoomDetails(null);
                                        break;
                                    case StatusCodes.Forbidden:
                                        commonToastErrorMessage({
                                            title: "You do not have enough permissions to perform this action",
                                        });
                                        break;
                                    default:
                                        commonToastErrorMessage({
                                            title: "There was an issue with your request",
                                        });
                                        break;
                                }
                            } else {
                                if (responseMessage.status === StatusCodes.Ok) {
                                    toast.success("Group deleted!");
                                    navigate(NAVIGATION_ROUTES.INBOX, { replace: true });
                                    setChatRoomDetails(null);
                                    return;
                                }
                                commonToastErrorMessage({
                                    title: "There was an issue with your request",
                                });
                                break;
                            }
                            break;
                        case MAKE_ADMIN:
                            if (responseMessage.success === false) {
                                switch (responseMessage.status) {
                                    case StatusCodes.Conflict:
                                        toast.info("This person is already an admin");
                                        setChatRoomDetails(null);
                                        break;
                                    case StatusCodes.NotFound:
                                        commonToastErrorMessage({ title: "This group does not exist!" });
                                        navigate(NAVIGATION_ROUTES.INBOX, { replace: true });
                                        setChatRoomDetails(null);
                                        break;
                                    case StatusCodes.Forbidden:
                                        if (responseMessage.payload?.action === "permission") {
                                            commonToastErrorMessage({
                                                title: "You do not have enough permissions to perform this action",
                                            });
                                        } else if (responseMessage.payload?.action === "not-member") {
                                            commonToastErrorMessage({
                                                title: "This person is not a member of this group",
                                            });
                                        }
                                        setChatRoomDetails(null);
                                        break;
                                    default:
                                        commonToastErrorMessage({
                                            title: "There was an issue with your request!",
                                        });
                                        break;
                                }
                            } else {
                                if (responseMessage.status === StatusCodes.Ok) {
                                    if (!chatRoomDetails.isGroup) {
                                        setChatRoomDetails(null);
                                        return;
                                    }
                                    const newAdmin = responseMessage.payload?.newAdmin as TParticipant;
                                    toast.success(`Successfully made ${newAdmin?.username} an admin`);
                                    const updatedChatRoomDetails = {
                                        ...chatRoomDetails,
                                        admins: [
                                            ...chatRoomDetails.admins,
                                            {
                                                id: newAdmin?.id,
                                                username: newAdmin?.username,
                                                fullName: newAdmin?.fullName,
                                                profilePic: newAdmin?.profilePic,
                                            },
                                        ],
                                    } satisfies TChatRoomAtom;
                                    setChatRoomDetails(updatedChatRoomDetails);
                                    return;
                                }

                                commonToastErrorMessage({});
                            }
                            break;
                        case REMOVE_AS_ADMIN:
                            if (responseMessage.success === false) {
                                switch (responseMessage.status) {
                                    case StatusCodes.NotFound:
                                        navigate(NAVIGATION_ROUTES.INBOX, { replace: true });
                                        setChatRoomDetails(null);
                                        toast.error("This group does not exist");
                                        break;
                                    case StatusCodes.Conflict:
                                        toast.info("This person is not an admin");
                                        setChatRoomDetails(null);
                                        break;
                                    case StatusCodes.Forbidden:
                                        toast.error("You do not have enough permissions");
                                        break;
                                    default:
                                        commonToastErrorMessage({
                                            title: "There was an issue with your request!",
                                        });
                                        break;
                                }
                            } else {
                                if (responseMessage.status === StatusCodes.Ok) {
                                    if (!chatRoomDetails.isGroup) {
                                        return;
                                    }
                                    const removedAdmin = responseMessage.payload?.removedAdmin as TParticipant;
                                    toast.success(`Removed ${removedAdmin?.username} as admin`);
                                    const updatedChatRoomDetails = {
                                        ...chatRoomDetails,
                                        admins: chatRoomDetails.admins.filter((admin) => admin.id !== removedAdmin.id),
                                    } satisfies TChatRoomAtom;
                                    setChatRoomDetails(updatedChatRoomDetails);
                                    return;
                                }
                                commonToastErrorMessage({
                                    title: "There was an issue with your request!",
                                });
                            }
                            break;
                        case REMOVE_FROM_CHAT:
                            if (responseMessage.success === false) {
                                switch (responseMessage.status) {
                                    case StatusCodes.NotFound:
                                        toast.error("There was an issue with your request");
                                        setChatRoomDetails(null);
                                        navigate(NAVIGATION_ROUTES.INBOX);
                                        break;
                                    case StatusCodes.Conflict:
                                        toast.error("The member you are trying to remove is not a part of this group");
                                        const removeUserId = responseMessage?.payload?.removeUserId;
                                        setChatRoomDetails((prev) =>
                                            prev && prev.isGroup
                                                ? {
                                                      ...prev,
                                                      participants: prev.participants.filter(
                                                          (member) => member.id !== removeUserId
                                                      ),
                                                      admins: prev.admins.filter((admin) => admin.id !== removeUserId),
                                                  }
                                                : prev
                                        );
                                        break;
                                    case StatusCodes.BadRequest:
                                        const action = responseMessage?.payload?.action;
                                        if (action === "not-group") {
                                            toast.info("Members can only be removed from group chats");
                                            setChatRoomDetails(null);
                                            navigate(NAVIGATION_ROUTES.INBOX);
                                        } else {
                                            commonToastErrorMessage({
                                                description: "There was an issue with your request. Try again later!",
                                            });
                                        }
                                        break;
                                    case StatusCodes.Forbidden:
                                        if (action === "permission-denied") {
                                            toast.error(
                                                "You do not have the required permissions to remove members from this group"
                                            );
                                            setChatRoomDetails((prev) =>
                                                prev && prev.isGroup
                                                    ? {
                                                          ...prev,
                                                          admins: prev.admins.filter((admin) => admin.id !== user.id),
                                                      }
                                                    : prev
                                            );
                                        } else if (action === "super-admin") {
                                            toast.error("Super Admin cannot be removed by an admin");
                                        } else {
                                            commonToastErrorMessage({
                                                description: "There was an issue with your request. Try again later!",
                                            });
                                        }
                                        break;
                                    default:
                                        commonToastErrorMessage({
                                            description: "There was an issue with your request. Try again later!",
                                        });
                                        break;
                                }
                            } else {
                                if (responseMessage?.status === StatusCodes.Ok) {
                                    const removedMemberId = responseMessage?.payload?.removedMemberId;
                                    setChatRoomDetails((prev) =>
                                        prev && prev.isGroup
                                            ? {
                                                  ...prev,
                                                  participants: prev.participants.filter(
                                                      (member) => member.id !== removedMemberId
                                                  ),
                                                  admins: prev.admins.filter((admin) => admin.id !== removedMemberId),
                                              }
                                            : prev
                                    );
                                    toast.success("Member removed successfully!");
                                } else {
                                    commonToastErrorMessage({
                                        description: "There was an issue with your request. Try again later!",
                                    });
                                }
                            }
                            break;
                        case NEW_MESSAGE:
                            if (responseMessage.status === StatusCodes.Ok) {
                                const chatRoomId = (responseMessage?.payload as TNewMesageResponse).messageDetails
                                    .chatRoomId;
                                if (chatRoomId !== id) {
                                    return;
                                }
                                const newMessage = (responseMessage?.payload as TNewMesageResponse).messageDetails
                                    .latestMessage;
                                const updatedChatRoomDetails: TChatRoomAtom = newMessage
                                    ? {
                                          ...chatRoomDetails,
                                          messages: [
                                              ...chatRoomDetails.messages,
                                              {
                                                  id: newMessage.id,
                                                  chatRoomId: newMessage.chatRoomId,
                                                  content: newMessage.content,
                                                  editedAt: newMessage.editedAt,
                                                  isEdited: newMessage.isEdited,
                                                  readBy: newMessage.readBy,
                                                  receivedBy: newMessage.receivedBy,
                                                  recipients: newMessage.recipients,
                                                  sentAt: newMessage.sentAt,
                                                  sentBy: newMessage.sentBy,
                                              },
                                          ],
                                      }
                                    : chatRoomDetails;

                                setChatRoomDetails(updatedChatRoomDetails);
                                socket.send(
                                    JSON.stringify({ type: READ_MESSAGE, payload: { chatRoomId: chatRoomDetails.id } })
                                );
                            }
                            break;
                        case SEND_MESSAGE:
                            if (responseMessage.success === false) {
                                switch (responseMessage.status) {
                                    case StatusCodes.Forbidden:
                                        navigate(NAVIGATION_ROUTES.INBOX, { replace: true });
                                        setChatRoomDetails(null);
                                        commonToastErrorMessage({ title: "There was an issue with your request" });
                                        break;
                                    case StatusCodes.BadRequest:
                                        if (responseMessage.payload?.action === "empty-message") {
                                            toast.info("Write a message to send");
                                        }
                                        break;
                                    default:
                                        commonToastErrorMessage({ title: "There was an issue with your request" });
                                        break;
                                }
                            } else {
                                if (responseMessage.status === StatusCodes.Ok) {
                                    const newMessage = responseMessage.payload?.messageDetails
                                        ?.latestMessage as TMessage;
                                    const updatedChatRoomDetails = {
                                        ...chatRoomDetails,
                                        messages: [
                                            ...chatRoomDetails.messages.slice(0, -1),
                                            {
                                                id: newMessage.id,
                                                chatRoomId: newMessage.chatRoomId,
                                                content: newMessage.content,
                                                editedAt: newMessage.editedAt,
                                                isEdited: newMessage.isEdited,
                                                readBy: newMessage.readBy,
                                                receivedBy: newMessage.receivedBy,
                                                recipients: newMessage.recipients,
                                                sentAt: newMessage.sentAt,
                                                sentBy: newMessage.sentBy,
                                            },
                                        ],
                                    } satisfies TChatRoomAtom;

                                    setChatRoomDetails(updatedChatRoomDetails);
                                    setIsSendingMessage(false);
                                    return;
                                }
                            }
                            setChatRoomDetails((prev) =>
                                prev ? { ...prev, messages: [...chatRoomDetails.messages.slice(0, -1)] } : prev
                            );
                            setIsSendingMessage(false);
                            break;
                    }
                }
            } catch (error) {
                printlogs("ERROR inside socket event listner useEffect", error);
                commonToastErrorMessage({
                    description: "There was an issue with your request. Please try again",
                });
            } finally {
                setIsEditNameModalVisible(false);
                setIsLoading(false);
            }
        };
    }, [socket, chatRoomDetails]);

    useEffect(() => {
        const closeEmojiPicker = (e: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
                setIsEmojiPickerVisible(false);
            }
        };

        document.addEventListener("mousedown", closeEmojiPicker);

        return () => {
            document.removeEventListener("mousedown", closeEmojiPicker);
        };
    }, []);

    const handleEmojiClick = (e: EmojiClickData) => {
        setMessage((p) => p + e.emoji);
        if (messageInputRef.current) {
            messageInputRef.current.focus();
        }
    };

    const handleAddMembers = () => {
        setIsChatModalVisible({ visible: true, type: "ADD_USERS" });
    };

    const handleSendMessage = async () => {
        try {
            if (message.trim().length < 1) {
                return;
            }

            if (!socket) {
                return;
            }

            if (!chatRoomDetails) {
                return;
            }

            const newMessage: IMessage = {
                type: SEND_MESSAGE,
                payload: {
                    content: message,
                    chatRoomId: chatRoomDetails.id,
                },
            };

            const currentTime = new Date(Date.now());

            setIsSendingMessage(true);

            setChatRoomDetails((prev) =>
                prev
                    ? {
                          ...prev,
                          messages: [
                              ...prev.messages,
                              {
                                  id: "",
                                  content: message,
                                  sentAt: currentTime,
                                  chatRoomId: "",
                                  editedAt: currentTime,
                                  isEdited: false,
                                  readBy: [],
                                  receivedBy: [],
                                  recipients: [],
                                  sentBy: user,
                              },
                          ],
                      }
                    : prev
            );
            setMessage("");
            socket.send(JSON.stringify(newMessage));
        } catch (error) {
            setIsSendingMessage(false);
            commonToastErrorMessage({});
            printlogs("ERROR inside handleSendMessage():", error);
        }
    };

    const handleChangeGroupName = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (!chatRoomDetails || chatRoomDetails?.isGroup === false) {
                return;
            }

            if (newGroupName.trim() === chatRoomDetails.name.trim()) {
                setIsLoading(true);
                const ARTIFICIAL_API_CALL_TIMEOUT = 1 * 1000;
                setTimeout(() => {
                    setNewGroupName((p) => p.trim());
                    setIsEditNameModalVisible(false);
                    setIsLoading(false);
                }, ARTIFICIAL_API_CALL_TIMEOUT);
                return;
            }

            if (!socket) {
                return;
            }

            setIsLoading(true);

            const changeGroupNameMessage: IMessage = {
                type: CHANGE_GROUP_NAME,
                payload: {
                    chatRoomId: chatRoomDetails.id,
                    groupName: newGroupName.trim(),
                },
            };

            socket.send(JSON.stringify(changeGroupNameMessage));
        } catch (error) {
            printlogs("ERROR inside handleChangeGroupName()", error);
            commonToastErrorMessage({
                description: "Could not process your request. Please try again!",
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

            if (!chatRoomDetails || chatRoomDetails?.isGroup === false) {
                return;
            }

            const leaveGroupChatMessage: IMessage = {
                type: LEAVE_GROUP_CHAT,
                payload: {
                    chatRoomId: chatRoomDetails.id,
                },
            };

            setIsLoading(true);
            socket.send(JSON.stringify(leaveGroupChatMessage));
        } catch (error) {
            printlogs("ERROR in handleLeaveGroupChat()", error);
            setIsLoading(false);
            commonToastErrorMessage({
                description: "There was an issue with your request. Please try again",
            });
        }
    };

    const handleDeleteGroupChat = () => {
        try {
            if (!socket) {
                return;
            }

            if (!chatRoomDetails) {
                return;
            }

            const deleteGroupChat: IMessage = {
                type: DELETE_GROUP_CHAT,
                payload: {
                    chatRoomId: chatRoomDetails.id,
                },
            };

            socket.send(JSON.stringify(deleteGroupChat));
        } catch (error) {
            printlogs("Error deleteing group chat", error);
            commonToastErrorMessage({
                description: "There was an issue with your request. Please try again",
            });
        }
    };

    const handleRemoveUserFromGroup = (removeUserId: string) => {
        try {
            if (!socket) {
                return;
            }

            if (!chatRoomDetails) {
                return;
            }

            const removeUserFromGroupMessage: IMessage = {
                type: REMOVE_FROM_CHAT,
                payload: {
                    chatRoomId: chatRoomDetails.id,
                    removeUserId,
                },
            };

            socket.send(JSON.stringify(removeUserFromGroupMessage));
        } catch (error) {
            printlogs("Error removing participant from group", error);
            setIsLoading(false);
            commonToastErrorMessage({
                description: "There was an issue with your request. Please try again",
            });
        }
    };

    const handleAdminStatusChangeConfirmation = (id: string, username: string, isUserAdmin: boolean) => {
        if (isUserAdmin) {
            setAlertModalMetadata({
                visible: true,
                title: `Remove ${username} as the admin of this group`,
                description: `You are about to remove ${username} as the admin of this group. Are you sure you want to continue?`,
                positiveOnClick: () => handleAdminStatusChange(id, "Remove as admin"),
                PositiveButtonStyles: "!bg-destructive dark:text-slate-200 text-black",
            });
        } else {
            setAlertModalMetadata({
                visible: true,
                title: `Make ${username} an admin of this group`,
                description: `You are about to make ${username} an admin of this group. They will be able to add, remove users and performs other actions. Are you sure you want to continue?`,
                positiveOnClick: () => handleAdminStatusChange(id, "Make admin"),
                PositiveButtonStyles: "!bg-destructive dark:text-slate-200 text-black",
            });
        }
    };

    const handleAdminStatusChange = (adminId: string, action: "Make admin" | "Remove as admin") => {
        try {
            if (!socket) {
                return;
            }

            if (!chatRoomDetails) {
                return;
            }

            if (action === "Make admin") {
                socket.send(
                    JSON.stringify({
                        type: MAKE_ADMIN,
                        payload: {
                            adminId,
                            chatRoomId: chatRoomDetails.id,
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
                            adminId,
                            chatRoomId: chatRoomDetails.id,
                        },
                    })
                );
            }
        } catch (error) {
            printlogs("ERROR inside handleAdminStatusChange():", error);
        }
    };

    if (!chatRoomDetails) {
        return (
            <div className="flex h-dvh w-full items-center justify-center bg-black/60">
                <Loader visible={!chatRoomDetails} />
            </div>
        );
    }

    return (
        <div className="flex h-dvh w-full overflow-hidden">
            <div className="flex h-full w-full flex-col items-center overflow-hidden">
                {/* header */}
                <div className="border-input flex w-full items-center justify-between border-b p-4">
                    <div className="flex items-center gap-3">
                        <Avatar
                            className="size-12 cursor-pointer select-none"
                            onClick={() => setIsRoomInfoVisible((p) => !p)}
                        >
                            <AvatarImage src={chatRoomImage} alt="Group Image" />
                            <AvatarFallback>{chatRoomName.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <h1
                            className="cursor-pointer select-none font-semibold"
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
                <div className="scrollbar flex w-full flex-grow flex-col overflow-y-auto pb-2 pt-4 text-white">
                    <div className="mx-2 flex flex-col justify-end gap-4">
                        {chatRoomDetails &&
                            chatRoomDetails?.messages?.length > 0 &&
                            chatRoomDetails?.messages?.map((message, index) =>
                                message?.sentBy?.id === user?.id ? (
                                    <div className="flex flex-col items-end gap-1" key={message.id}>
                                        <div className="flex">
                                            <div className="mx-1 flex max-w-md items-center rounded-3xl rounded-br-md bg-sky-500 px-3 py-2 lg:max-w-lg">
                                                <span>{message?.content}</span>
                                            </div>
                                            <Avatar className="size-6 self-end">
                                                <AvatarImage src={message?.sentBy?.profilePic} />
                                                <AvatarFallback>
                                                    {message?.sentBy?.username?.slice(0, 2)?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        {index === chatRoomDetails.messages.length - 1 && isSendingMessage ? (
                                            <Clock className="text-muted-foreground size-3" />
                                        ) : (
                                            <span className="text-muted-foreground text-xs">
                                                {format(message?.sentAt, "HH:mm")}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-start" key={message.id}>
                                        <div className="flex">
                                            <Avatar className="size-6 self-end">
                                                <AvatarImage src={message?.sentBy?.profilePic} />
                                                <AvatarFallback>
                                                    {message?.sentBy?.username?.slice(0, 2)?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="mx-1 flex max-w-md items-center rounded-3xl rounded-bl-md bg-gray-800 px-3 py-2 lg:max-w-lg">
                                                <span>{message?.content}</span>
                                            </div>
                                        </div>
                                        {index === chatRoomDetails.messages.length - 1 && isSendingMessage ? (
                                            <Clock className="text-muted-foreground size-3" />
                                        ) : (
                                            <span className="text-muted-foreground text-xs">
                                                {format(message?.sentAt, "HH:mm")}
                                            </span>
                                        )}
                                    </div>
                                )
                            )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <div className="w-full">
                    <div className="border-input m-4 flex items-center gap-4 rounded-full border py-2 pl-4 pr-6">
                        <div ref={emojiPickerRef} className="relative">
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
                                className="size-7 cursor-pointer active:brightness-50"
                                onClick={() => setIsEmojiPickerVisible((p) => !p)}
                            />
                        </div>
                        <input
                            className="w-full border-none bg-transparent outline-none"
                            type="text"
                            id={"message"}
                            placeholder="Message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            ref={messageInputRef}
                            autoComplete="off"
                        />
                        <p
                            className={cn(
                                "cursor-not-allowed select-none text-gray-400",
                                message.length > 0 &&
                                    "cursor-pointer text-blue-400 active:scale-95 active:text-blue-700"
                            )}
                            onClick={handleSendMessage}
                        >
                            Send
                        </p>
                    </div>
                </div>
            </div>
            {isRoomInfoVisible && (
                <div className="border-input ml-[1px] flex h-full w-[550px] flex-col border-l">
                    <h1 className="border-input border-b p-6 text-2xl font-semibold">Details</h1>
                    {chatRoomDetails.isGroup && (
                        <div className="border-input flex items-center justify-between border-b p-6">
                            <p>Change group name</p>
                            <EditModal
                                title="Change group name"
                                label="New group name"
                                placeholder="Change name to..."
                                description="Changing the name of a group chat changes it for everyone."
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                open={isEditNameModalVisible}
                                setOpen={setIsEditNameModalVisible}
                                onSubmit={handleChangeGroupName}
                                submitLabel={
                                    !isLoading ? (
                                        "Save"
                                    ) : (
                                        <div className={cn("flex items-center gap-2")}>
                                            <p>Saving</p>
                                            <Loader visible={isLoading} />
                                        </div>
                                    )
                                }
                                disabled={isLoading}
                                required
                            >
                                <Button variant="outline" onClick={() => setIsEditNameModalVisible((p) => !p)}>
                                    Change
                                </Button>
                            </EditModal>
                        </div>
                    )}
                    <div className="flex items-center justify-between p-6">
                        <p className="font-medium">{chatRoomDetails.participants.length > 2 ? "Members" : "Member"}</p>
                        {chatRoomDetails.isGroup && chatRoomDetails.admins.some((admin) => admin.id === user.id) && (
                            <Button
                                variant="ghost"
                                className="cursor-pointer !p-0 text-blue-400 hover:!bg-transparent active:scale-95 active:text-blue-700"
                                onClick={handleAddMembers}
                            >
                                Add people
                            </Button>
                        )}
                    </div>
                    <div className="scrollbar flex w-full flex-grow flex-col gap-4 overflow-y-auto px-6">
                        {chatRoomDetails &&
                            chatRoomDetails.participants.length &&
                            chatRoomDetails.participants
                                .map((member) => {
                                    const isUserAdmin = chatRoomDetails.isGroup
                                        ? chatRoomDetails.admins.some((admin) => admin.id === member.id) || false
                                        : false;
                                    const isUserSuperAdmin = chatRoomDetails.isGroup
                                        ? chatRoomDetails?.superAdmin?.id === member?.id || false
                                        : false;
                                    if (!chatRoomDetails.isGroup && member.id === user.id) {
                                        return;
                                    }
                                    return (
                                        <div className="flex w-full items-center justify-between" key={member.id}>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-16">
                                                    <AvatarImage src={member.profilePic} />
                                                    <AvatarFallback>
                                                        {member.fullName.slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col gap-1">
                                                    <p className="line-clamp-1 text-ellipsis text-sm font-bold">
                                                        {member.username}
                                                    </p>
                                                    <div className="flex items-center text-xs font-bold text-gray-400">
                                                        {isUserAdmin && (
                                                            <span className="after:px-1 after:text-gray-400 after:content-['·']">
                                                                Admin
                                                            </span>
                                                        )}
                                                        <p className="line-clamp-1 text-ellipsis">{member.fullName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {isAdmin && !isUserSuperAdmin && member.id !== user.id && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger>
                                                        <EllipsisVertical className="size-5 cursor-pointer select-none active:brightness-50" />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setAlertModalMetadata({
                                                                    visible: true,
                                                                    title: "Remove from the group?",
                                                                    description: `You are about to remove ${member.fullName} from the group`,
                                                                    positiveTitle: "Remove",
                                                                    PositiveButtonStyles:
                                                                        "!bg-destructive dark:text-slate-200 text-black",
                                                                    positiveOnClick() {
                                                                        handleRemoveUserFromGroup(member.id);
                                                                    },
                                                                })
                                                            }
                                                            className="text-destructive rounde-sm w-full justify-start gap-2 border-0 px-2 text-sm"
                                                            disabled={isLoading}
                                                        >
                                                            Remove from the group
                                                            <Loader visible={isLoading} />
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleAdminStatusChangeConfirmation(
                                                                    member.id,
                                                                    member.username,
                                                                    isUserAdmin
                                                                )
                                                            }
                                                        >
                                                            {isUserAdmin ? "Remove as admin" : "Make admin"}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    );
                                })
                                .reverse()}
                    </div>

                    <div className="border-input flex w-full flex-col items-start justify-center gap-4 border-t p-6">
                        {chatRoomDetails.isGroup && (
                            <>
                                <Button
                                    variant="ghost"
                                    className="text-destructive cursor-pointer select-none p-0 text-base hover:!bg-transparent"
                                    onClick={() =>
                                        setAlertModalMetadata({
                                            visible: true,
                                            positiveTitle: "Leave",
                                            negativeTitle: "Cancel",
                                            title: "Leave chat",
                                            description:
                                                "You won't be able to send or receive messages unless someone adds you back to the chat. No one will be notified that you left the chat.",
                                            positiveOnClick: () => handleLeaveGroupChat(),
                                            PositiveButtonStyles: "!bg-destructive dark:text-slate-200 text-black",
                                        })
                                    }
                                >
                                    Leave chat
                                </Button>

                                <p>
                                    You won't be able to send or receive messages unless someone adds you back to the
                                    chat. No one will be notified that you left the chat.
                                </p>
                            </>
                        )}
                        {(isSuperAdmin || !chatRoomDetails.isGroup) && (
                            <Button
                                variant="ghost"
                                className="text-destructive cursor-pointer select-none p-0 text-base hover:!bg-transparent"
                                onClick={() =>
                                    setAlertModalMetadata({
                                        visible: true,
                                        positiveTitle: "Delete",
                                        negativeTitle: "Cancel",
                                        title: "Permanently delete this chat?",
                                        description: "This chat and all it's messages will be deleted forever.",
                                        positiveOnClick: () => handleDeleteGroupChat(),
                                        PositiveButtonStyles: "!bg-destructive dark:text-slate-200 text-black",
                                    })
                                }
                            >
                                Delete chat
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
