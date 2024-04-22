import { WebSocketServer } from "ws";

const port = 8080;
const wss = new WebSocketServer({ port });

wss.on("connection", (socket, req) => {
    console.log("Connection Established");

    wss.on("error", console.error);

    wss.on("message", (message, isBinary) => {
        console.log("message", message);
        console.log("isBinary", isBinary);

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message, { binary: isBinary });
            }
        });
    });

    socket.send("Listening on port " + port);
});
