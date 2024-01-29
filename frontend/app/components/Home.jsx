import React, { useState, useEffect, useContext } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

// Custom modules
import Page from "./Page";
import DispatchContext from "../DispatchContext";

function Home() {
  const appDispatch = useContext(DispatchContext);
  const [username, setUsername] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await Axios.get("/user/profile");

        if (response.status === 200) {
          const user = response.data.user[0];
          setUsername(user.username);
        } else {
          throw new Error("Internal server error");
        }
      } catch (error) {
        appDispatch({ type: "logout" });
        navigate("/");
      }
    }
    fetchUser();
  }, []);

  return (
    <Page title="Welcome!">
      <div className="row align-items-center">
        <div className="col-lg-15 py-3 py-md-5">
          <h1 className="display-3">Hi {username}, welcome to TMS!</h1>
          <p className="lead text-muted">
            Hope you enjoy managing your tasks effectively
          </p>
        </div>
      </div>
    </Page>
  );
}

export default Home;
