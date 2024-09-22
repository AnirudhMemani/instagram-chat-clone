import { StartChatPrompt } from "./StartChatPrompt";

const Inbox = () => {
	return (
		<>
			<div className="hidden lg:flex h-dvh w-full">
				<StartChatPrompt />
			</div>
		</>
	);
};

export default Inbox;
