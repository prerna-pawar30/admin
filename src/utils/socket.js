import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  // Allow polling to wake up Render, then automatically upgrade to websocket
  transports: ["polling", "websocket"], 
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000, // Wait 2 seconds before retrying if it drops
  auth: {
    userId: JSON.parse(localStorage.getItem("employeeUser"))?._id,
  },
});