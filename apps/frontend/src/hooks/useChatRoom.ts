import { chatRoomAtom } from "@/state/chat";
import { useRecoilValue } from "recoil";

export const useChatRoom = () => {
  const chatRoom = useRecoilValue(chatRoomAtom);
  return chatRoom;
};
