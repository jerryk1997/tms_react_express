import React, { useState, useEffect, useContext, useRef } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import Axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

// Custom modules
// Context
import DispatchContext from "../../DispatchContext";
import UserManagementStateContext from "./UserManagementStateContext";
import UserManagementDispatchContext from "./UserManagementDispatchContext";
import DispatchCheckContext from "../ProtectedRoute/DispatchCheckContext";
import PasswordChangeInput from "../PasswordChangeInput";

function CreateUser() {
  const navigate = useNavigate();
  // ======================= Context =======================
  const appDispatch = useContext(DispatchContext);
  const userMgmtState = useContext(UserManagementStateContext);
  const userMgmtDispatch = useContext(UserManagementDispatchContext);
  const checkDispatch = useContext(DispatchCheckContext);

  // ======================= Row state =======================
  const [groupOptions, setGroupOptions] = useState();
  const createUserButtonRef = useRef();

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [selectedGroupOptions, setSelectedGroups] = useState([]);

  const userStatusOptions = [
    { label: "Active", value: "active" },
    { label: "Disabled", value: "disabled" }
  ];
  const [selectedStatusOption, setSelectedStatus] = useState(
    userStatusOptions[0]
  );

  const [canSubmit, setCanSubmit] = useState(false);

  // ======================= Event Listeners =======================
  async function handleCreateUser() {
    const user = {};

    setUsername(username.trim());
    user.username = username;
    user.password = password;

    if (email) {
      user.email = email;
    }

    if (selectedGroupOptions.length > 0) {
      user.groups = selectedGroupOptions.map(option => option.value);
    }

    user.isActive = selectedStatusOption.value;

    try {
      await Axios.post("/admin/user", user, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      userMgmtDispatch({ type: "create user", value: user });
      appDispatch({
        type: "flash message",
        value: "Successfully created user"
      });

      setUsername("");
      setEmail("");
      setPassword("");
      setSelectedGroups([]);
      setSelectedStatus(userStatusOptions[0]);
    } catch (error) {
      if (error instanceof AxiosError && error.response.status === 409) {
        setUsernameError("Username is taken");
        createUserButtonRef.current.blur();
      } else {
        appDispatch({
          type: "flash message",
          value: "Failed to create user"
        });
        if (error instanceof AxiosError && error.response.status === 401) {
          checkDispatch({ type: "toggle" });
        }
      }
    }
  }

  function handleGroupChange(selectedGroups) {
    setSelectedGroups(selectedGroups);
  }

  function handleStatusChange(selectedStatus) {
    setSelectedStatus(selectedStatus);
  }

  async function handleCreateOption(option) {
    try {
      await Axios.post(
        "/admin/group",
        { groupName: option.trim() },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      setSelectedGroups(prev =>
        prev.concat({
          label: option,
          value: option
        })
      );
      userMgmtDispatch({ type: "create group", value: option });
      appDispatch({
        type: "flash message",
        value: "Successfully created group"
      });
    } catch (error) {
      console.log(error);
      appDispatch({
        type: "flash message",
        value: "Failed to create group"
      });
    }
  }

  // ======================= Use effects =======================
  // Checks if they user can submit changes
  let enableSubmitDebounce;
  useEffect(() => {
    enableSubmitDebounce = setTimeout(() => {
      const validNonEmptyPassword = password !== "" && passwordError === "";
      const validNonEmptyUsername = username !== "" && usernameError === "";

      setCanSubmit(validNonEmptyUsername && validNonEmptyPassword);
    }, 600); // Longer delay to allow passwordError to disable button

    return () => clearTimeout(enableSubmitDebounce);
  }, [username, password, passwordError]);

  // Clear error after username changes again
  useEffect(() => {
    setUsernameError("");
  }, [username]);

  useEffect(() => {
    setGroupOptions(
      userMgmtState.groups.map(group => {
        return {
          label: group,
          value: group
        };
      })
    );
  }, [userMgmtState]);

  return (
    <tr key={0}>
      <td style={{ maxWidth: "250px" }}>
        <input
          className="form-control"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username is required"
        />
        {usernameError && (
          <small className="text-danger">{usernameError}</small>
        )}
      </td>

      {/* ========== Email edit =========== */}
      <td>
        <input
          className="form-control"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </td>

      {/* ========== Password Edit =========== */}
      <td style={{ maxWidth: "250px" }}>
        <PasswordChangeInput
          password={password}
          setPassword={setPassword}
          passwordError={passwordError}
          setPasswordError={setPasswordError}
          setCanSubmit={setCanSubmit}
          className="form-control"
          placeholder="Password is required"
        />
      </td>

      {/* ========== Group select =========== */}
      <td style={{ maxWidth: "300px" }}>
        <CreatableSelect
          isMulti
          options={groupOptions}
          value={selectedGroupOptions}
          onChange={handleGroupChange}
          onCreateOption={handleCreateOption}
        />
      </td>

      {/* ========== Active / Disable =========== */}
      <td>
        <Select
          options={userStatusOptions}
          value={selectedStatusOption}
          onChange={handleStatusChange}
        ></Select>
      </td>

      {/* ========== Buttons =========== */}
      <td
        style={{
          textAlign: "center"
        }}
      >
        <button
          ref={createUserButtonRef}
          type="button"
          className="btn btn-success btn-sm"
          onClick={handleCreateUser}
          disabled={!canSubmit}
        >
          Create user
        </button>
      </td>
    </tr>
  );
}

export default CreateUser;
