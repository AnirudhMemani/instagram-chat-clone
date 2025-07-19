import { alertModalAtom } from "@/state/global";
import { useRecoilValue } from "recoil";

export const useAlertModal = () => {
  const alertModal = useRecoilValue(alertModalAtom);
  return alertModal;
};
