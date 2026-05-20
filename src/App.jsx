import "./App.css";
import React, { useEffect, useState, Suspense } from "react";
import { useDispatch } from "react-redux";
import AOS from "aos";
import "aos/dist/aos.css";
import { loginSuccess, logout } from "./store/slices/AuthSlice";
import AppRoutes from "./routes/AppRoutes";
import { EmployeeService } from "./backend/ApiService"; 
import { socket } from "./utils/socket";
import { useSocketNotifications } from "./hooks/useSocketNotifications";
const FullPageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E68736]"></div>
  </div>
);

function App() {
  useSocketNotifications();
  const [isAppLoading, setIsAppLoading] = useState(true);
  const dispatch = useDispatch();

  // ── CLEAN SINGLE SOCKET CONNECTION LIFE-CYCLE ──
  useEffect(() => {
    socket.connect();

    const handleDisconnect = () => console.log("Socket Disconnected");
    
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("disconnect", handleDisconnect);
      socket.disconnect(); // Clean teardown on unmount
    };
  }, []); // Empty array ensures connection lifecycle executes exactly once

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("employeeToken");
      const savedUserStr = localStorage.getItem("employeeUser");

      if (token && savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          dispatch(loginSuccess({ user: savedUser, token: token }));
          setIsAppLoading(false);

          if (savedUser.email) {
            EmployeeService.getEmployeeByEmail(savedUser.email).then((response) => {
              if (response.success) {
                dispatch(loginSuccess({ user: response.data, token: token }));
              }
            }).catch(err => console.error("Silent sync failed", err));
          }

        } catch (error) {
          console.error("Session restoration error:", error);
          setIsAppLoading(false); 
        }
      } else {
        dispatch(logout());
        setIsAppLoading(false);
      }
    };

    checkSession();
    AOS.init({ duration: 1000, once: false, offset: 100 });
  }, [dispatch]);

  if (isAppLoading) {
    return <FullPageLoader />;
  }

  return (
    <Suspense fallback={<FullPageLoader />}>
      <AppRoutes isAppLoading={isAppLoading} />
    </Suspense>
  );
}
 
export default App;