import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type TDialogBoxProps = {
	children?: React.ReactNode;
	title: string;
	description?: string;
	positiveTitle?: string;
	negativeTitle?: string;
	positiveOnClick?: () => void;
	negativeOnClick?: () => void;
	PositiveButtonStyles?: string;
};

export const DialogBox: React.FC<TDialogBoxProps> = ({
	children,
	description,
	negativeTitle = "cancel",
	positiveOnClick,
	positiveTitle = "Continue",
	title,
	negativeOnClick,
	PositiveButtonStyles,
}) => {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
				</AlertDialogHeader>
				{description && (
					<AlertDialogDescription>{description}</AlertDialogDescription>
				)}
				<AlertDialogFooter>
					<AlertDialogCancel onClick={negativeOnClick}>
						{negativeTitle}
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={positiveOnClick}
						className={PositiveButtonStyles}
					>
						{positiveTitle}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
