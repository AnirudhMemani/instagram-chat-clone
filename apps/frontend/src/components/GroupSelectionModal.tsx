import { useExistingGroups } from "@/hooks/useExistingGroups";
import { showGroupSelectionModalAtom } from "@/state/global";
import { NAVIGATION_ROUTES } from "@/utils/constants";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import GroupBars from "./GroupBars";
import { Button } from "./ui/button";

type TGroupSelectionModalProps = {};

const GroupSelectionModal: React.FC<TGroupSelectionModalProps> = (): JSX.Element => {
    const setShowGroupSelectionModal = useSetRecoilState(showGroupSelectionModalAtom);
    const existingGroups = useExistingGroups();

    const modalContainerRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const handleModalClose = (event: MouseEvent) => {
            if (modalContainerRef.current && !modalContainerRef.current.contains(event.target as Node)) {
                setShowGroupSelectionModal(false);
            }
        };

        document.addEventListener("mousedown", handleModalClose);

        return () => {
            document.removeEventListener("mousedown", handleModalClose);
        };
    }, []);

    const handleGroupSelection = (groupId: string) => {
        setShowGroupSelectionModal(false);
        navigate(`/inbox/direct/${groupId}`);
    };

    const handleGroupCreation = () => {
        setShowGroupSelectionModal(false);
        navigate(NAVIGATION_ROUTES.CREATE_NEW_GROUP);
    };

    return (
        <div className="fixed left-0 right-0 top-0 z-30 flex h-dvh w-full items-center justify-center bg-[#00000080]">
            <div
                className="bg-background border-input flex w-[90%] flex-col overflow-hidden rounded-lg border py-6 sm:h-[70%] sm:w-[588px]"
                ref={modalContainerRef}
            >
                <div className="mb-3 flex items-center justify-center">
                    <h1 className="flex-grow text-center font-bold">Select From Existing Groups</h1>
                    <X
                        className="mr-6 size-6 cursor-pointer"
                        onClick={() => {
                            setShowGroupSelectionModal(false);
                        }}
                    />
                </div>
                <div className="scrollbar mb-4 flex w-full flex-grow flex-col gap-1 overflow-y-scroll pt-5">
                    {existingGroups.length &&
                        existingGroups.map((existingGroup, index) => (
                            <GroupBars
                                key={`${existingGroup.id}${index}`}
                                name={existingGroup.name}
                                participants={existingGroup.participants}
                                picture={existingGroup.picture}
                                onClick={() => handleGroupSelection(existingGroup.id)}
                            />
                        ))}
                </div>
                <div className="flex w-full items-center justify-center">
                    <Button className="mx-6 w-full" variant="secondary" onClick={handleGroupCreation}>
                        Create new group
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default GroupSelectionModal;
