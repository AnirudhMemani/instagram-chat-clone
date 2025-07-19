import { existingGroupsAtom } from "@/state/chat";
import { useRecoilValue } from "recoil";

export const useExistingGroups = () => {
  const existingGroups = useRecoilValue(existingGroupsAtom);
  return existingGroups;
};
