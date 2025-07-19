import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

type TSelectedUsersAtom = {
  id: string;
  fullName: string;
  profilePic: string;
};

export type TUser = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  profilePic: string;
};

export const userAtom = atom<TUser>({
  key: "userAtom",
  default: {
    id: "",
    username: "",
    fullName: "",
    email: "",
    profilePic: "",
  },
  effects_UNSTABLE: [persistAtom],
});

export const isAuthenticatedAtom = atom({
  key: "isAuthenticatedAtom",
  default: false,
  effects_UNSTABLE: [persistAtom],
});

export const selectedUsersAtom = atom<TSelectedUsersAtom[]>({
  key: "selectedUsersAtom",
  default: [],
});
