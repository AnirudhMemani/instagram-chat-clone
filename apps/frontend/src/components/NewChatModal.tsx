import { X } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useRecoilState, useRecoilValue } from "recoil";
import { isChatModalVisibleAtom, loadingAtom } from "@/state/global";
import { getAllUsers } from "@/api/users-api";
import { useNavigate } from "react-router-dom";
import { userIdAtom } from "@/state/user";
import { IUserBarsProps, UserBars } from "./UserBars";
import { UserLoadingSkeleton } from "./UserLoadingSkeleton";

export type TUsersSchema = {
    id: string;
    fullName: string;
    username: string;
    profilePic: string;
};

export const NewChatModal: React.FC = (): JSX.Element => {
    const [searchInput, setSearchInput] = useState<string>("");
    const [usersData, setUsersData] = useState<TUsersSchema[]>();
    const [filteredUsers, setFilteredUsers] =
        useState<Omit<IUserBarsProps, "onClick">[]>();
    const [isSelectedUsers, setIsSelectedUsers] = useState<string[]>([]);

    const [isChatModalVisible, setIsChatModalVisible] = useRecoilState(
        isChatModalVisibleAtom
    );

    const [isLoading, setIsLoading] = useRecoilState(loadingAtom);
    const id = useRecoilValue(userIdAtom);

    const modalContainerRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();

    const populateUsersData = async () => {
        try {
            setIsLoading(true);
            const response = await getAllUsers(id, navigate);

            if (response) {
                setUsersData(response.data);
            }
        } catch (error) {
            return;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        populateUsersData();
        const handleModalClose = (event: MouseEvent) => {
            if (
                modalContainerRef.current &&
                !modalContainerRef.current.contains(event.target as Node)
            ) {
                setIsChatModalVisible(false);
                setSearchInput("");
                setIsSelectedUsers([]);
            }
        };

        document.addEventListener("mousedown", handleModalClose);

        return () =>
            document.removeEventListener("mousedown", handleModalClose);
    }, []);

    const filterUsers = (users: TUsersSchema[], searchQuery: string) => {
        const filteredUserData = users.filter(
            (user) =>
                user.fullName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                user.username.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setFilteredUsers(
            filteredUserData.map((user) => ({
                ...user,
                isSelected: isSelectedUsers.includes(user.id),
            }))
        );
    };

    const searchInputChangeHandler = async (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const searchQuery = e.target.value;
        setSearchInput(searchQuery);

        if (usersData) {
            filterUsers(usersData, searchQuery);
        }
    };

    const handleUserSelection = (userId: string) => {
        setIsSelectedUsers((p) =>
            p.includes(userId)
                ? p.filter((id) => id !== userId)
                : [...p, userId]
        );
    };

    return (
        <div
            className={cn(
                "h-dvh fixed top-0 left-0 right-0 w-full bg-[#00000080] flex items-center justify-center z-30",
                { hidden: !isChatModalVisible }
            )}
        >
            <div
                className="py-6 sm:w-[588px] overflow-y-hidden sm:h-[70%] bg-background w-[90%] border border-input"
                ref={modalContainerRef}
            >
                <div className="flex items-center mb-3 justify-center">
                    <h1 className="text-center flex-grow font-bold">
                        New Message
                    </h1>
                    <X
                        className="size-6 mr-6 cursor-pointer"
                        onClick={() => {
                            setIsChatModalVisible(false);
                            setIsSelectedUsers([]);
                        }}
                    />
                </div>
                <div className="flex items-center py-2 gap-3 border border-input">
                    <span className="ml-6 font-semibold">To:</span>
                    <input
                        type="search"
                        placeholder="Search..."
                        className="placeholder:text-gray-400 px-2 border-0 outline-none bg-transparent w-full mr-5"
                        onChange={searchInputChangeHandler}
                        value={searchInput}
                    />
                </div>
                <div className="flex flex-col gap-1 pt-5 overflow-y-scroll h-full scrollbar">
                    {searchInput ? (
                        !isLoading &&
                        filteredUsers &&
                        filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <>
                                    <UserBars
                                        key={user.id}
                                        id={user.id}
                                        fullName={user.fullName}
                                        username={user.username}
                                        profilePic={user.profilePic}
                                        isSelected={isSelectedUsers.includes(
                                            user.id
                                        )}
                                        onClick={() =>
                                            handleUserSelection(user.id)
                                        }
                                    />
                                </>
                            ))
                        ) : (
                            <div className="flex flex-col mx-6 gap-6">
                                {Array.from({ length: 5 }, (_, index) => (
                                    <UserLoadingSkeleton key={index} />
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="ml-6 text-sm text-gray-400">
                            <p>No account found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
