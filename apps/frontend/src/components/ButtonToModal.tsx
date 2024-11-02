import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import { useEffect, useState } from "react";
import CredentailsCard from "./CredentialsCard";

const ButtonToModal: React.FC = (): JSX.Element => {
    const [isOpen, setIsOpen] = useState(true);
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

    const fabSize = 64; // 4rem (w-16 h-16)
    const modalSize = Math.min(425, Math.min(dimensions.width, dimensions.height) * 0.8);

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
                className="text-primary-foreground fixed z-50 overflow-x-hidden bg-gradient-to-b from-gray-950 to-black shadow-lg"
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
                                    <h2 className="mx-auto text-2xl font-bold">Welcome to Insta Chat</h2>
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
                                <p className="text-foreground/80 mb-4">
                                    If you are a <span className="text-green-500">recruiter</span> and want to explore
                                    the application without the hastle of creating a new account, please use the
                                    credentials below to login into the application.
                                </p>
                                <div className="border-b pb-4">
                                    <p className="text-foreground/80">
                                        Username: <span className="text-sky-500">cristiano_7</span>
                                    </p>
                                    <p className="text-foreground/80">
                                        Password: <span className="text-sky-500">ronaldo7</span>
                                    </p>
                                </div>
                                <p className="text-foreground/80 pt-4">
                                    <span className="text-red-500">Note:</span> In case you want to view the credentials
                                    again, you can open this modal by clicking on the floating action button on the
                                    bottom-right of your screen.
                                </p>
                            </CredentailsCard>
                        </motion.div>
                    ) : (
                        <motion.button
                            key="fab"
                            className="bg-primary-foreground flex h-full w-full cursor-pointer items-center justify-center text-white"
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
