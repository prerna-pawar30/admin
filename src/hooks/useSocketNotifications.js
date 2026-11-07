import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { addNotification } from "../store/slices/NotificationSlice";
import { socket } from "../utils/socket";

export const useSocketNotifications = () => {

  const dispatch = useDispatch();

  useEffect(() => {

    const handleNotification = (notification) => {

      dispatch(addNotification(notification));

    };

    socket.on("newNotification", handleNotification);

    return () => {
      socket.off("newNotification", handleNotification);
    };

  }, [dispatch]);
};