import { potentialSuperAdminsAtom } from "@/state/chat";
import { useRecoilValue } from "recoil";

export const usePotentialSuperAdmins = () => {
  const potentialSuperAdmins = useRecoilValue(potentialSuperAdminsAtom);
  return potentialSuperAdmins;
};
