import React from "react";

export const StartChatPromptSkeleton: React.FC = (): JSX.Element => {
	return (
		<div className="h-dvh w-full lg:block hidden">
			<div className="flex flex-col items-center justify-center gap-4 h-full w-full animate-pulse">
				<div className="bg-gray-300 rounded-full h-40 w-40"></div>
				<div className="flex flex-col items-center justify-center gap-1">
					<div className="bg-gray-300 h-3 w-36 rounded-lg"></div>
					<div className="bg-gray-200 h-3 w-48 rounded-lg mt-2"></div>
				</div>
				<div className="bg-gray-300 h-10 w-36 rounded-lg mt-3"></div>
			</div>
		</div>
	);
};
