export const UserLoadingSkeleton: React.FC = (): JSX.Element => {
	return (
		<div className="w-full flex items-center gap-3 animate-pulse">
			<div className="p-6 rounded-full bg-gray-400"></div>
			<div className="w-full flex-grow">
				<div className="w-[60%] h-3 mb-3 bg-gray-400 rounded-2xl"></div>
				<div className="w-[40%] h-3 bg-gray-400 rounded-2xl"></div>
			</div>
			<div className="p-3 rounded-full bg-gray-400"></div>
		</div>
	);
};
