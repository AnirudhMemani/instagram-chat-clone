import { atom } from "recoil";

type TChatModalVisible = {
    visible: boolean;
    type?: "FIND_USERS" | "ADD_USERS";
};

export const isLoadingAtom = atom<boolean>({
    key: "isLoadingAtom",
    default: false,
});

export const isChatModalVisibleAtom = atom<TChatModalVisible>({
    key: "isChatModalVisibleAtom",
    default: { visible: false, type: "FIND_USERS" },
    effects_UNSTABLE: [
        ({ onSet, setSelf }) => {
            onSet((newValue) => {
                if (!newValue.type) {
                    setSelf({ ...newValue, type: "FIND_USERS" });
                }
            });
        },
    ],
});
