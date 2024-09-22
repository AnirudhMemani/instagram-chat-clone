import { LoaderCircle } from "lucide-react";

export const Loader: React.FC = (): JSX.Element => {
	return (
		<>
			<div className="fixed w-full bg-[#000000e6] top-0 left-0 h-full flex items-center justify-center z-50">
				<LoaderCircle className="h-16 w-16 text-blue-700 animate-spin" />
			</div>
		</>
	);
};
