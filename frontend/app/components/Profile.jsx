import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";

//Custom Modules
import Page from "./Page";
import DispatchContext from "../DispatchContext";
import PasswordChangeInput from "./PasswordChangeInput";
import LoadingDotsIcon from "./LoadingDotsIcon";

function Profile() {
  const appDispatch = useContext(DispatchContext);

  const [user, setUser] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const body = {};
    if (email !== user.email) {
      body.email = email;
    }

    if (password !== "") {
      body.password = password;
    }

    try {
      const response = await Axios.put("/user/profile", body, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      console.log(response);
      if (response.status === 200) {
        appDispatch({
          type: "flash message",
          value: "Successfully edited profile"
        });
        setPassword("");
        setUser({ ...user, email });
      }
    } catch (error) {
      appDispatch({
        type: "flash message",
        value: "Edit failed, please contact administrator"
      });
    }
  }

  let enableSubmitDebounce;
  useEffect(() => {
    enableSubmitDebounce = setTimeout(() => {
      const validNonEmptyPassword = password !== "" && passwordError === "";
      console.log(user.email, email);
      const emailChanged = email !== user.email;
      setCanSubmit(
        validNonEmptyPassword || (emailChanged && passwordError === "")
      );
    }, 600); // Longer delay to allow passwordError to disable button

    return () => clearTimeout(enableSubmitDebounce);
  }, [user, email, password, passwordError]);

  useEffect(() => {
    async function fetchCurrentUser() {
      const response = await Axios.get("/user/profile");
      const user = response.data.user[0];
      console.log(user);

      setUser({
        username: user.username,
        email: user.email || ""
      });
      setEmail(user.email || "");

      setIsLoading(false);
    }

    fetchCurrentUser();
  }, []);

  return (
    <>
      {isLoading ? (
        <LoadingDotsIcon />
      ) : (
        <Page title="Profile">
          {/* ====================== Page Header ====================== */}
          <header className="col-5 mx-auto mb-4">
            {" "}
            {/* Add a header element */}
            <h1>Your profile</h1>
            <p>View or type to edit</p>
          </header>
          {/* ========================= Form ========================== */}
          <form onSubmit={handleSubmit} className="col-5 mx-auto">
            {/* ==================== Username input ===================== */}
            <div className="form-group">
              <label htmlFor="username-change" className="text-muted mb-1">
                Username
              </label>
              <input
                id="username-change"
                name="username"
                className="form-control"
                type="text"
                autoComplete="off"
                defaultValue={user.username}
                disabled
              />
            </div>

            {/* ==================== Email Input ===================== */}
            <div className="form-group">
              <label htmlFor="email-change" className="text-muted mb-1">
                Email
              </label>
              <input
                onChange={e => setEmail(e.target.value)}
                id="email-change"
                name="email"
                className="form-control"
                placeholder="Email"
                value={email}
              />
            </div>

            {/* ==================== Password Input ===================== */}
            <div className="form-group">
              <label htmlFor="password-change" className="text-muted mb-1">
                Password
              </label>
              <PasswordChangeInput
                password={password}
                setPassword={setPassword}
                passwordError={passwordError}
                setPasswordError={setPasswordError}
                setCanSubmit={setCanSubmit}
                placeholder="New Password"
              />
            </div>

            {/* ===================== Submit button ===================== */}
            <div className="text-center">
              <button
                type="submit"
                className="btn btn-lg btn-success "
                disabled={!canSubmit}
              >
                Submit
              </button>
            </div>
          </form>
        </Page>
      )}
    </>
  );
}

export default Profile;
