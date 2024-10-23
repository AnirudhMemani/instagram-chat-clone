import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { alertModalAtom } from "@/state/global";
import { useRecoilState } from "recoil";

export const AlertModal = () => {
    const [alertModalMetadata, setAlertModalMetadata] = useRecoilState(alertModalAtom);
    return (
        <AlertDialog open={alertModalMetadata.visible}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{alertModalMetadata.title}</AlertDialogTitle>
                </AlertDialogHeader>
                {alertModalMetadata.description && (
                    <AlertDialogDescription>{alertModalMetadata.description}</AlertDialogDescription>
                )}
                <AlertDialogFooter>
                    <AlertDialogCancel
                        onClick={() => {
                            if (alertModalMetadata.negativeOnClick) {
                                alertModalMetadata.negativeOnClick();
                            } else {
                                setAlertModalMetadata({ visible: false });
                            }
                        }}
                    >
                        {alertModalMetadata.negativeTitle}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={alertModalMetadata.positiveOnClick}
                        className={alertModalMetadata.PositiveButtonStyles}
                    >
                        {alertModalMetadata.positiveTitle}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
