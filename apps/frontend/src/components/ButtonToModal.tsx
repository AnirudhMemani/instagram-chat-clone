import { Button } from "@/components/ui/button";
import { LocalStorageKeys } from "@/utils/LocalStorageUtils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import { useEffect, useState } from "react";
import CredentailsCard from "./CredentialsCard";

const ButtonToModal: React.FC = (): JSX.Element => {
    const showPopup = localStorage.getItem(LocalStorageKeys.PopupDisabled);
    const parsedShowPopup = showPopup ? JSON.parse(showPopup) : null;
    const [isOpen, setIsOpen] = useState(parsedShowPopup === true ? false : true);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen) {
                setIsOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    const fabSize = 64;
    const modalSize = Math.min(425, Math.min(dimensions.width, dimensions.height) * 0.8);

    const disabledPopup = () => {
        localStorage.setItem(LocalStorageKeys.PopupDisabled, JSON.stringify(true));
        setIsOpen(false);
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black bg-opacity-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            <motion.div
                className="text-primary-foreground border-input scrollbarModal fixed z-50 overflow-y-auto overflow-x-hidden border bg-[#020617] py-3"
                initial={false}
                animate={{
                    width: isOpen ? modalSize : fabSize,
                    height: isOpen ? modalSize : fabSize,
                    borderRadius: isOpen ? 12 : fabSize / 2,
                    right: isOpen ? (dimensions.width - modalSize) / 2 : 24,
                    bottom: isOpen ? (dimensions.height - modalSize) / 2 : 24,
                }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="modal"
                            className="flex h-full w-full flex-grow flex-col"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <CredentailsCard>
                                <div className="text-foreground/90 mb-8 flex items-center">
                                    <h2 className="text-muted-foreground mx-auto text-2xl font-bold">
                                        Welcome to Insta Chat
                                    </h2>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsOpen(false)}
                                        className="text-foreground hover:bg-foreground/10"
                                        aria-label="Close modal"
                                    >
                                        <X className="h-6 w-6" />
                                    </Button>
                                </div>
                                <p className="text-foreground/80 border-b pb-4">
                                    If you're a <span className="text-green-500">recruiter</span> and would like to
                                    explore the application without the hassle of creating a new account, please use the
                                    credentials below to log in. Two sets of credentials are provided to help you test
                                    sending and receiving messages.
                                </p>
                                <div className="border-b py-4">
                                    <h1 className="text-green-500">Credentials one:</h1>
                                    <p className="text-foreground/80">
                                        Username: <span className="text-sky-500">beta_tester</span>
                                    </p>
                                    <p className="text-foreground/80">
                                        Password: <span className="text-sky-500">Welcome123</span>
                                    </p>
                                </div>
                                <div className="border-b py-4">
                                    <h1 className="text-green-500">Credentials two:</h1>
                                    <p className="text-foreground/80">
                                        Username: <span className="text-sky-500">beta_tester2</span>
                                    </p>
                                    <p className="text-foreground/80">
                                        Password: <span className="text-sky-500">Welcome123</span>
                                    </p>
                                </div>
                                <p className="text-foreground/80 py-4">
                                    <span className="text-red-500">Note:</span> The backend of this application is
                                    hosted on Vercel, so if you notice delays in response time, that&apos;s the reason
                                    why.
                                </p>
                                {parsedShowPopup !== true && (
                                    <p className="text-muted-foreground">
                                        Don't want to see this pop-up again?{" "}
                                        <span
                                            className="cursor-pointer text-sky-500 underline underline-offset-2"
                                            onClick={disabledPopup}
                                        >
                                            Click here
                                        </span>
                                    </p>
                                )}
                            </CredentailsCard>
                        </motion.div>
                    ) : (
                        <motion.button
                            key="fab"
                            className="flex h-full w-full cursor-pointer items-center justify-center text-white"
                            onClick={() => setIsOpen(true)}
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            aria-label="Open modal"
                        >
                            <ArrowLeft className="h-6 w-6 rotate-45" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
};

export default ButtonToModal;
