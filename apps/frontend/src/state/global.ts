import { atom } from "recoil";

export const loadingAtom = atom({
    key: "loadingAtom",
    default: false,
});

export const isChatModalVisibleAtom = atom({
    key: "isChatModalVisibleAtom",
    default: false,
});
