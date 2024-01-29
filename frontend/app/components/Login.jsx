import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";

//Custom Modules
import DispatchContext from "../DispatchContext";
import Page from "./Page";

function Login() {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const navigate = useNavigate();
  const appDispatch = useContext(DispatchContext);

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const response = await Axios.post("/auth/login", { username, password });
      console.log("Successful login");

      appDispatch({ type: "login", value: username });
      appDispatch({ type: "flash message", value: "Log in successful" });

      navigate("/applications");
    } catch (error) {
      console.log("Error logging in");

      appDispatch({
        type: "flash message",
        value: "Username or password is incorrect"
      });
    }
  }

  return (
    <Page title="Login">
      <div className="container py-md-5">
        {/* ====================== Page Header ====================== */}
        <header className="col-5 mx-auto mb-4">
          {" "}
          {/* Add a header element */}
          <h1>TMS Login</h1>
          <p>Please log in to your account</p>
        </header>
        {/* ========================= Form ========================== */}
        <form onSubmit={handleLogin} className="col-5 mx-auto">
          {/* ==================== Username input ===================== */}
          <div className="form-group">
            <label
              htmlFor="username-register"
              className="text-muted mb-1"
            ></label>
            <input
              onChange={e => setUsername(e.target.value)}
              id="username-register"
              name="username"
              className="form-control"
              type="text"
              placeholder="Username"
              autoComplete="off"
            />
          </div>
          {/* ==================== Password Input ===================== */}
          <div className="form-group">
            <label
              htmlFor="password-register"
              className="text-muted mb-1"
            ></label>
            <input
              onChange={e => setPassword(e.target.value)}
              id="password-register"
              name="password"
              className="form-control"
              type="password"
              placeholder="Password"
            />
          </div>
          {/* ===================== Submit button ===================== */}
          <div className="text-center">
            <button type="submit" className="btn btn-lg btn-success ">
              Login
            </button>
          </div>
        </form>
      </div>
    </Page>
  );
}

export default Login;
