import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

type TSelectedUsersAtom = {
    id: string;
    fullName: string;
    profilePic: string;
};

export const userIdAtom = atom({
    key: "userIdAtom",
    default: "",
    effects_UNSTABLE: [persistAtom],
});

export const usernameAtom = atom({
    key: "usernameAtom",
    default: "",
    effects_UNSTABLE: [persistAtom],
});

export const fullNameAtom = atom({
    key: "fullNameAtom",
    default: "",
});

export const emailAtom = atom({
    key: "emailAtom",
    default: "",
});

export const isAuthenticatedAtom = atom({
    key: "isAuthenticatedAtom",
    default: false,
    effects_UNSTABLE: [persistAtom],
});

export const profilePicAtom = atom({
    key: "profilePicAtom",
    default: "",
    effects_UNSTABLE: [persistAtom],
});

export const selectedUsersAtom = atom<TSelectedUsersAtom[]>({
    key: "selectedUsersAtom",
    default: [],
});
