import { userAtom } from "@/state/user";
import { useRecoilValue } from "recoil";

export const useUser = () => {
    const user = useRecoilValue(userAtom);
    return user;
};
