import { atom } from "recoil";

type TParticipants = {
    id: string;
    username: string;
    fullName: string;
    profilePic: string;
};

type TAttachments = {
    id: string;
    url: string;
    contentType: string;
    size: number;
    sentAt: Date;
};

type TMessage = {
    id: string;
    content: string;
    contentType: string;
    senderId: string;
    sentAt: Date;
    editedAt: Date;
    Attachments: TAttachments[];
    readBy: TParticipants[];
    chatRoomId: string;
};

type TChatRoomAtom = {
    id: string;
    name: string;
    createdAt: Date;
    participants: TParticipants[];
    messages: TMessage[];
    isGroup: boolean;
};

type TGroupAtom = {
    id: string;
    name: string;
    picture: string;
    createdAt: Date;
    adminOf: Pick<TParticipants, "id">[];
    superAdminId: string;
    chatRoomId: string;
};

const defaultChatRoomAtomValue: TChatRoomAtom = {
    id: "",
    name: "",
    createdAt: new Date(),
    participants: [],
    messages: [],
    isGroup: false,
};

const defaultGroupAtomValue: TGroupAtom = {
    id: "",
    name: "",
    picture: "",
    createdAt: new Date(),
    adminOf: [],
    superAdminId: "",
    chatRoomId: "",
};

export const chatRoomAtom = atom<TChatRoomAtom>({
    key: "chatRoomAtom",
    default: defaultChatRoomAtomValue,
});

export const groupAtom = atom<TGroupAtom>({
    key: "groupAtom",
    default: defaultGroupAtomValue,
});
