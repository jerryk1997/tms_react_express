import React, { useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";
import { useImmerReducer } from "use-immer";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Axios from "axios";

// Custom components
import Header from "./components/Header";
import Login from "./components/Login";
import Home from "./components/Home";
import Profile from "./components/Profile";
import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";
import FlashMessages from "./components/FlashMessages";
import NotFound from "./components/NotFound";
import LoadingDotsIcon from "./components/LoadingDotsIcon";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import UserManagement from "./components/UserManagement/UserManagement";
import Applications from "./components/Applications/Applications";
import PlanManagement from "./components/PlanManagement/PlanManagement";
import Kanban from "./components/TaskManagement/Kanban";

Axios.defaults.baseURL = "http://localhost:8080/api/v1";
Axios.defaults.withCredentials = true;

function Main() {
  const [isLoading, setIsLoading] = useState(true);
  const initialState = {
    loggedIn: false,
    renderToggle: true,
    flashMessages: []
  };
  console.log("Main");

  function appReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true;
        break;
      case "logout":
        draft.loggedIn = false;
        break;
      case "flash message":
        console.log("Flashing", action.value);
        draft.flashMessages.push(action.value);
        break;
      case "toggle":
        draft.renderToggle = !draft.renderToggle;
        break;
    }
  }

  const [state, dispatch] = useImmerReducer(appReducer, initialState);

  // Check user session, so state reset does not affect session
  useEffect(() => {
    async function checkLogin() {
      try {
        const response = await Axios.get("/auth/verify-session");
        console.log(response);
        if (response.status === 200) {
          dispatch({
            type: "login"
          });
        }
      } catch (error) {
        console.log(error);
        if (error.response.status === 401) {
        } else {
          throw new Error(error);
        }
      }
      setIsLoading(false);
    }

    checkLogin();
  }, []);

  return (
    <>
      {isLoading && <LoadingDotsIcon />}
      {!isLoading && (
        <StateContext.Provider value={state}>
          <DispatchContext.Provider value={dispatch}>
            <BrowserRouter>
              <FlashMessages messages={state.flashMessages} />
              <Header />
              <Routes>
                <Route
                  path="/"
                  element={
                    <Navigate
                      to={state.loggedIn ? "/applications" : "/login"}
                    />
                  }
                />
                <Route path="/login" element={<Login />} />

                {/* ================== User routes ==================*/}
                <Route element={<ProtectedRoute authorisedGroup="" />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/applications" element={<Applications />} />
                  <Route path="/kanban/:appAcronym" element={<Kanban />} />
                  <Route
                    path="/kanban/:appAcronym/plans/"
                    element={<PlanManagement />}
                  />
                </Route>

                {/* ================== Admin routes ==================*/}
                <Route element={<ProtectedRoute authorisedGroup="admin" />}>
                  <Route path="/user-management" element={<UserManagement />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </DispatchContext.Provider>
        </StateContext.Provider>
      )}
    </>
  );
}

const root = ReactDOM.createRoot(document.querySelector("#app"));
root.render(<Main />);

if (module.hot) {
  module.hot.accept();
}
