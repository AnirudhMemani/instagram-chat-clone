import { localStorageUtils } from "@/utils/LocalStorageUtils";
import { env, handleUserLogout } from "@/utils/constants";
import { printlogs } from "@/utils/logs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const navigate = useNavigate();
    const token = useMemo(() => localStorageUtils.getToken(), []);
    const RECONNECT_INTERVAL = 2000;

    const connectToWs = useCallback(() => {
        if (!token) return handleUserLogout(navigate);

        const ws = new WebSocket(`${env.WS_BACKEND_URL}?token=${token}`);

        ws.onopen = () => setSocket(ws);

        ws.onclose = (ev) => {
            printlogs("WebSocket closed | Reason:", ev.reason, "| StatusCode:", ev.code);

            if ([1006, 1007].includes(ev.code)) {
                handleUserLogout(navigate);
                return toast.error(ev.code === 1007 ? "Session timed out!" : "An unknown error occurred");
            }

            setSocket(null);
            setTimeout(() => connectToWs(), RECONNECT_INTERVAL);
        };

        ws.onerror = () => ws.close();

        return () => setSocket(null);
    }, [token]);

    useEffect(() => connectToWs(), [connectToWs]);

    return socket;
};
