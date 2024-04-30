import { atom } from "recoil";

type TPageTypeAtom = "StartChatPrompt" | "GroupDetailsPage" | "ChatRoom";

export const loadingAtom = atom<boolean>({
    key: "loadingAtom",
    default: false,
});

export const isChatModalVisibleAtom = atom<boolean>({
    key: "isChatModalVisibleAtom",
    default: false,
});

export const pageTypeAtom = atom<TPageTypeAtom>({
    key: "pageTypeAtom",
    default: "StartChatPrompt",
});
