import { localStorageUtils } from "@/utils/LocalStorageUtils";
import { env, handleUserLogout } from "@/utils/constants";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const useSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const token = localStorageUtils.getToken();
    const navigate = useNavigate();
    const RECONNECT_INTERVAL = 2 * 1000;

    if (!token) {
        handleUserLogout(navigate);
    }

    const connectToWs = () => {
        const ws = new WebSocket(`${env.WS_BACKEND_URL}?token=${token}`);

        ws.onopen = () => {
            console.log("Web socket open");
            setSocket(ws);
        };

        ws.onclose = () => {
            console.log("web socket closed");
            setTimeout(() => connectToWs(), RECONNECT_INTERVAL);
            setSocket(null);
        };

        ws.onerror = () => {
            ws.close();
        };

        return () => ws.close();
    };

    useEffect(() => {
        connectToWs();
    }, [token]);

    return socket;
};
