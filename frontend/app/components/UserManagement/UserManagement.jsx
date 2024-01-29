import React, { useState, useEffect, useContext } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

// Custom modules
import Page from "../Page";
import EditUser from "./EditUser";
import { useImmerReducer } from "use-immer";
import LoadingDotsIcon from "../LoadingDotsIcon";

// Context
import DispatchContext from "../../DispatchContext";
import UserManagementStateContext from "./UserManagementStateContext";
import UserManagementDispatchContext from "./UserManagementDispatchContext";
import CreateUser from "./CreateUser";

function UserManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const appDispatch = useContext(DispatchContext);
  const navigate = useNavigate();

  function userMgmtReducer(draft, action) {
    switch (action.type) {
      case "populate users":
        draft.users = action.value;
        break;
      case "create user":
        const newUser = action.value;
        newUser.is_active = newUser.isActive === "active" ? 1 : 0;
        delete newUser.isActive;
        delete newUser.password;
        draft.users.push(newUser);
        break;
      case "edit user":
        const user = draft.users.find(
          user => user.username === action.value.username
        );
        const editedFields = action.value.editedFields;

        user.email = editedFields.email || user.email;

        if (editedFields.groups) {
          if (editedFields.groups.length === 0) {
            delete user.groups;
          } else {
            user.groups = editedFields.groups;
          }
        }

        if (editedFields.isActive) {
          user.is_active = editedFields.isActive === "active" ? 1 : 0;
        }
        break;
      case "populate groups":
        draft.groups = action.value;
        break;
      case "create group":
        draft.groups = draft.groups.concat(action.value);
        break;
    }
  }

  const [state, dispatch] = useImmerReducer(userMgmtReducer, {
    users: [],
    groups: []
  });

  useEffect(() => {
    async function initialiseState() {
      console.log("=== Initialising State for User Management");
      try {
        console.log("Getting users and groups");
        var allUsersResponse = await Axios.get("/admin/user/all");
        var userGroupsResponse = await Axios.get("/admin/group/all");
        console.log("Responses", allUsersResponse, userGroupsResponse);
      } catch (error) {
        console.log(error);
        navigate("/");
        appDispatch({ type: "flash message", value: "There was an error" });
        return;
      }
      // Get groups
      dispatch({
        type: "populate groups",
        value: userGroupsResponse.data.groups
      });

      // Get users
      dispatch({
        type: "populate users",
        value: allUsersResponse.data.users.map(userData => {
          const user = { ...userData };
          if (userData.groups) {
            user.groups = userData.groups.split("/");
          }
          return user;
        })
      });

      setIsLoading(false);
    }

    initialiseState();
  }, []);

  return (
    <>
      {isLoading ? (
        <LoadingDotsIcon />
      ) : (
        <Page title="User Management" width={"wide"}>
          <UserManagementStateContext.Provider value={state}>
            <UserManagementDispatchContext.Provider value={dispatch}>
              <h1>User Management</h1>

              <table className="table">
                <thead className="thead-light">
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Password</th>
                    <th>Groups</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <CreateUser />
                  {state.users.map((user, index) => {
                    return (
                      <EditUser user={user} index={index + 1} key={index + 1} />
                    );
                  })}
                </tbody>
              </table>
            </UserManagementDispatchContext.Provider>
          </UserManagementStateContext.Provider>
        </Page>
      )}
    </>
  );
}

export default UserManagement;
