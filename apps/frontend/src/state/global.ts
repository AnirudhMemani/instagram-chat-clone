import { atom } from "recoil";

export const isLoadingAtom = atom<boolean>({
	key: "isLoadingAtom",
	default: false,
});

export const isChatModalVisibleAtom = atom<boolean>({
	key: "isChatModalVisibleAtom",
	default: false,
});
