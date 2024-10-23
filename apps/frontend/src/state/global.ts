import { atom } from "recoil";

type TChatModalVisible = {
    visible: boolean;
    type?: "FIND_CHATS" | "ADD_USERS";
};

type TAlertBoxAtom = {
    visible: boolean;
    title?: string;
    description?: string;
    positiveTitle?: string;
    negativeTitle?: string;
    positiveOnClick?: () => void;
    negativeOnClick?: () => void;
    PositiveButtonStyles?: string;
};

export const isLoadingAtom = atom<boolean>({
    key: "isLoadingAtom",
    default: false,
});

export const isChatModalVisibleAtom = atom<TChatModalVisible>({
    key: "isChatModalVisibleAtom",
    default: { visible: false, type: "FIND_CHATS" },
    effects_UNSTABLE: [
        ({ onSet, setSelf }) => {
            onSet((newValue) => {
                if (!newValue.type) {
                    setSelf({ ...newValue, type: "FIND_CHATS" });
                }
            });
        },
    ],
});

export const showGroupSelectionModalAtom = atom<boolean>({
    key: "showGroupSelectionModalAtom",
    default: false,
});

export const showAdminSelectionModalAtom = atom<boolean>({
    key: "showAdminSelectionModalAtom",
    default: false,
});

export const alertModalAtom = atom<TAlertBoxAtom>({
    key: "alertModalAtom",
    default: {
        visible: false,
        title: "Are you sure you want to complete this action?",
        description: "",
        positiveTitle: "Confirm",
        negativeTitle: "Cancel",
    },
    effects_UNSTABLE: [
        ({ onSet, setSelf }) => {
            onSet((newValue) => {
                const defaultValues: TAlertBoxAtom = {
                    visible: false,
                    title: "Are you sure you want to complete this action?",
                    description: "",
                    positiveTitle: "Confirm",
                    negativeTitle: "Cancel",
                };

                setSelf({
                    ...defaultValues,
                    ...newValue,
                });
            });
        },
    ],
});
