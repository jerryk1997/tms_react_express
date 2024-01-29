import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faUsersGear,
  faRightFromBracket
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Axios from "axios";

// Custom modules
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

function Header() {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const navigate = useNavigate();

  const [displayUserManagement, setDisplayUserManagement] = useState(false);

  async function handleLogout() {
    await Axios.get("/auth/logout");
    appDispatch({ type: "logout" });
    appDispatch({ type: "flash message", value: "Logout successful" });
    navigate("/");
  }

  useEffect(() => {
    async function checkAdmin() {
      if (appState.loggedIn) {
        try {
          await Axios.get("/auth/verify/admin");
          setDisplayUserManagement(true);
        } catch (error) {
          setDisplayUserManagement(false);
        }
      }
    }

    checkAdmin();
  });

  return (
    <header className="header-bar bg-primary mb-3">
      <div className="container container--wide d-flex flex-column flex-md-row align-items-center p-3">
        <h4 className="my-0 mr-md-auto font-weight-normal">
          <Link to="/" className="text-white">
            {" "}
            TMS{" "}
          </Link>
        </h4>

        {/* User function icons */}
        {appState.loggedIn && (
          <div>
            {displayUserManagement && (
              <Link to="user-management">
                <FontAwesomeIcon icon={faUsersGear} className="header-icon" />
              </Link>
            )}
            <Link to="/profile">
              <FontAwesomeIcon icon={faUser} className="header-icon" />
            </Link>
            <FontAwesomeIcon
              onClick={handleLogout}
              icon={faRightFromBracket}
              className="header-icon"
            />
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
