export const UserLoadingSkeleton: React.FC = (): JSX.Element => {
    return (
        <div className="flex w-full animate-pulse items-center gap-3">
            <div className="rounded-full bg-gray-400 p-6"></div>
            <div className="w-full flex-grow">
                <div className="mb-3 h-3 w-[60%] rounded-2xl bg-gray-400"></div>
                <div className="h-3 w-[40%] rounded-2xl bg-gray-400"></div>
            </div>
            <div className="rounded-full bg-gray-400 p-3"></div>
        </div>
    );
};
