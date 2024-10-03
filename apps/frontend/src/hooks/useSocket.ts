import { localStorageUtils } from "@/utils/LocalStorageUtils";
import { env, handleUserLogout } from "@/utils/constants";
import { printlogs } from "@/utils/logs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const token = localStorageUtils.getToken();
    const navigate = useNavigate();
    const RECONNECT_INTERVAL = 2 * 1000;

    const connectToWs = () => {
        const ws = new WebSocket(`${env.WS_BACKEND_URL}?token=${token}`);

        ws.onopen = () => {
            console.log("Web socket open");
            setSocket(ws);
        };

        ws.onclose = (ev) => {
            printlogs("Web socket closed because of this reason:", ev.reason, "with status code:", ev.code);
            if (ev.code === 1006) {
                toast.error("An unknown error occurred");
                handleUserLogout(navigate);
                setSocket(null);
                return;
            } else if (ev.code === 1007) {
                toast.error("Session timed out!");
                setSocket(null);
                handleUserLogout(navigate);
                return;
            }
            setSocket(null);
            setTimeout(() => connectToWs(), RECONNECT_INTERVAL);
        };

        ws.onerror = () => {
            ws.close();
        };

        return () => setSocket(null);
    };

    useEffect(() => {
        if (!token) {
            handleUserLogout(navigate);
            return;
        }
        connectToWs();
    }, [token]);

    return socket;
};
