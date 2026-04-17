/* eslint-disable no-unused-vars */
import "./App.css";
import React, { useEffect, useState, Suspense } from "react";
import { useDispatch } from "react-redux";
import AOS from "aos";
import "aos/dist/aos.css";
import { loginSuccess, logout } from "./store/slices/AuthSlice";
import AppRoutes from "./routes/AppRoutes";
import { EmployeeService } from "./backend/ApiService"; 

const FullPageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E68736]"></div>
  </div>
);

function App() {
  // We only show the loader if we have NO user data at all in storage
  const [isAppLoading, setIsAppLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("employeeToken");
      const savedUserStr = localStorage.getItem("employeeUser");

      if (token && savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);

          // STEP 1: RESTORE IMMEDIATELY
          // This populates Redux instantly so the Header shows the email/role
          dispatch(loginSuccess({ user: savedUser, token: token }));

          // STEP 2: END APP LOADING NOW
          // The user can now see the Dashboard/Page. No more waiting.
          setIsAppLoading(false);

          // STEP 3: SILENT BACKGROUND SYNC
          // We do this AFTER setIsAppLoading(false) so it doesn't block the UI
          if (savedUser.email) {
            EmployeeService.getEmployeeByEmail(savedUser.email).then((response) => {
              if (response.success) {
                // Update Redux silently. Header will update when this finishes.
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