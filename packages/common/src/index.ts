import WebSocket from "ws";

export class SocketResponse {
  socket: WebSocket;
  private statusCode: number = 200;

  constructor(socket: WebSocket) {
    this.socket = socket;
  }

  private sendPayload(type: string, data?: any, options?: { success?: boolean }) {
    const payload = {
      type,
      status: this?.statusCode,
      payload: data,
      success: options?.success !== undefined ? options.success : true,
    };

    try {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(payload));
      } else {
        console.error("WebSocket is not open");
      }
    } catch (error) {
      console.error("Failed to send payload:", error);
    } finally {
      this.statusCode = 200;
    }
  }

  json(type: string, data?: { [key: string]: any }, options?: { success?: boolean }) {
    this.sendPayload(type, data, options);
  }

  send(type: string, data?: any, options?: { success?: boolean }) {
    this.sendPayload(type, data, options);
  }

  error(type: string, errorMessage: string, statusCode: number = 500) {
    this.status(statusCode).json(type, { message: errorMessage }, { success: false });
  }

  status(code: number) {
    this.statusCode = code;
    return this;
  }
}
