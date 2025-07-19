import React from "react";

export const StartChatPromptSkeleton: React.FC = (): JSX.Element => {
  return (
    <div className="hidden h-dvh w-full lg:block">
      <div className="flex h-full w-full animate-pulse flex-col items-center justify-center gap-4">
        <div className="h-40 w-40 rounded-full bg-gray-300"></div>
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="h-3 w-36 rounded-lg bg-gray-300"></div>
          <div className="mt-2 h-3 w-48 rounded-lg bg-gray-200"></div>
        </div>
        <div className="mt-3 h-10 w-36 rounded-lg bg-gray-300"></div>
      </div>
    </div>
  );
};
