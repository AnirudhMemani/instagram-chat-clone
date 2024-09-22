import { cn } from "@/lib/utils";

type ImageModalProps = {
	children: React.ReactNode;
	open: boolean;
	handleClose: () => void;
};

const Modal: React.FC<ImageModalProps> = ({ children, open }): JSX.Element => {
	return (
		<div
			className={cn(
				"fixed z-10 overflow-y-auto top-0 w-full left-0 dark:bg-slate-950",
				{
					hidden: !open,
				}
			)}
			id="modal"
		>
			<div className="flex items-center justify-center min-height-100vh pt-4 px-4 pb-20 text-center sm:block sm:p-0">
				<div className="fixed inset-0 transition-opacity">
					<div className="absolute inset-0 bg-gray-900 opacity-75"></div>
					<span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
					<div
						className="inline-block align-center bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full"
						role="dialog"
						aria-modal="true"
						aria-labelledby="modal-headline"
					>
						<div className="dark:bg-slate-950 bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border border-slate-200 dark:border-slate-80">
							{children}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Modal;
