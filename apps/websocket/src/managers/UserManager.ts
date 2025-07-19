import WebSocket from "ws";
import { redisPublisher, redisSubscriber } from "../redis/client.js";
import { printlogs } from "../utils/logs.js";

export interface IUser {
  id: string;
  username: string;
  fullName: string;
  profilePic: string;
}

export interface IUserWithSocket extends IUser {
  socket: WebSocket;
  chatRooms: string[];
}

export class UserManager {
  private connections: Map<string, IUserWithSocket> = new Map();
  private chatRoomId: string | undefined;
  private currentUserId: string | undefined;

  constructor() {
    redisSubscriber.on("message", (channel, message) => {
      if (this.chatRoomId === channel) {
        const chatMessage = JSON.parse(message);
        this.broadcastToRoom(this.chatRoomId, chatMessage);
      }
    });
  }

  addUser(user: IUserWithSocket) {
    this.connections.set(user.id, user);
  }

  removeUser(userId: string) {
    this.connections.delete(userId);
  }

  getUserSocket(userId: string): WebSocket | undefined {
    return this.connections.get(userId)?.socket;
  }

  addUserToRoom(userId: string, roomId: string) {
    const user = this.connections.get(userId);

    if (user && !user.chatRooms.includes(roomId)) {
      user.chatRooms.push(roomId);

      redisSubscriber.subscribe(roomId, (err, count) => {
        if (err) {
          printlogs(`Failed to subscribe to channel ${roomId}:`, err);
        } else {
          printlogs(`Subscribed to ${roomId}, currently subscribed to ${count} channels`);
        }
      });
    }
  }

  private broadcastToRoom(roomId: string, message: any) {
    this.connections.forEach((user) => {
      if (this.currentUserId && this.currentUserId !== user.id) {
        if (user.chatRooms.includes(roomId)) {
          user.socket.send(JSON.stringify(message));
        }
      }
    });
  }

  publishToRoom(chatRoomId: string, userId: string, message: any) {
    this.chatRoomId = chatRoomId;
    this.currentUserId = userId;
    redisPublisher.publish(chatRoomId, JSON.stringify(message));
  }
}
