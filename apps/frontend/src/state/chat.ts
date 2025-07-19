import { atom } from "recoil";

// type TAttachments = {
//     id: string;
//     url: string;
//     contentType: string;
//     size: number;
//     sentAt: Date;
// };

// type TGroupAtom = {
//     id: string;
//     name: string;
//     picture: string;
//     createdAt: Date;
//     adminOf: Pick<TParticipant, "id">[];
//     superAdminId: string;
//     chatRoomId: string;
// };

// const defaultChatRoomAtomValue: TChatRoomAtom = {
//     id: "",
//     name: "",
//     createdAt: new Date(),
//     participants: [],
//     messages: [],
//     isGroup: false,
// };

// const defaultGroupAtomValue: TGroupAtom = {
//     id: "",
//     name: "",
//     picture: "",
//     createdAt: new Date(),
//     adminOf: [],
//     superAdminId: "",
//     chatRoomId: "",
// };

export type TParticipant = {
  id: string;
  username: string;
  fullName: string;
  profilePic: string;
};

export type TMessage = {
  id: string;
  content: string;
  sentAt: Date;
  editedAt: Date;
  readBy: TParticipant[];
  isEdited: boolean;
  sentBy: TParticipant;
  chatRoomId: string;
  receivedBy: TParticipant[];
  recipients: TParticipant[];
};

export type TChatRoomAtom =
  | {
      isGroup: true;
      id: string;
      createdAt: Date;
      name: string;
      picture: string;
      createdBy: TParticipant;
      admins: TParticipant[];
      participants: TParticipant[];
      messages: TMessage[];
      superAdmin: TParticipant;
      pictureUpdatedAt: Date;
      nameUpdatedAt: Date;
    }
  | { isGroup: false; id: string; createdAt: Date; participants: TParticipant[]; messages: TMessage[] };

export type TExistingGroupsAtom = {
  id: string;
  name: string;
  picture: string;
  createdBy: {
    id: string;
    username: string;
  };
  participants: {
    id: string;
    fullName: string;
    username: string;
    profilePic: string;
  }[];
};

export const chatRoomAtom = atom<TChatRoomAtom | null>({
  key: "chatRoomAtom",
  default: null,
});

export const existingGroupsAtom = atom<TExistingGroupsAtom[]>({
  key: "existingGroupsAtom",
  default: [],
});

export const potentialSuperAdminsAtom = atom<TParticipant[]>({
  key: "potentialSuperAdminsAtom",
  default: [],
});
