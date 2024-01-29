// Applications.js
import React, { useContext, useEffect, useState } from "react";
import DispatchContext from "../../DispatchContext";
import { Link, useNavigate } from "react-router-dom";
import Axios, { AxiosError } from "axios";
import { useImmerReducer } from "use-immer";

import Page from "../Page";
import {
  Card,
  CardContent,
  CardActions,
  Stack,
  Typography,
  Button,
  Paper,
  ButtonGroup
} from "@mui/material";
import { Add, RemoveRedEye, Edit, ViewKanban } from "@mui/icons-material";
import CreateApplicationDialog from "./CreateApplicationDialog";
import LoadingDotsIcon from "../LoadingDotsIcon";
import ApplicationsStateContext from "./ApplicationsStateContext";
import ApplicationsDispatchContext from "./ApplicationsDispatchContext";
import ViewApplicationDialog from "./ViewApplicationDialog";
import EditApplicationDialog from "./EditApplicationDialog";

function Applications() {
  const appDispatch = useContext(DispatchContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isProjectLead, setIsProjectLead] = useState(false);

  /*
	{
		"App_Acronym": "App1",
		"App_Description": "Description 1",
		"App_Rnumber": 123,
		"App_startDate": "2023-01-15",
		"App_endDate": "2023-02-28",
		"App_permit_Create": "project manager",
		"App_permit_Open": "admin",
		"App_permit_toDoList": "dev",
		"App_permit_Doing": "devops",
		"App_permit_Done": "project lead"
	}
	*/

  // ================= Context =================
  function applicationsReducer(draft, action) {
    switch (action.type) {
      case "populate applications":
        draft.applications = action.value;
        console.log("Application state: \n", action.value);
        break;
      case "create application":
        const newApplication = action.value;
        draft.applications.push(newApplication);
        break;
      case "edit application":
        // Find edited application
        const newApplications = [];
        draft.applications.forEach(application => {
          if (application.acronym === action.value.acronym) {
            for (const key in action.value.editedFields) {
              application[key] = action.value.editedFields[key];
            }
          }
          newApplications.push(application);
        });
        console.log(newApplications);
        draft.applications = newApplications;
        break;
      case "select application":
        console.log(
          `=== Page dispatch selecting application: <${
            action.value ? action.value.acronym : null
          }>`
        );
        draft.selectedApplication = action.value;
        break;
      case "populate groups":
        draft.groups = action.value;
        break;
      case "set isProjectLead":
        draft.isProjectLead = action.value;
        break;
    }
  }
  const [state, dispatch] = useImmerReducer(applicationsReducer, {
    applications: [],
    groups: [],
    isProjectLead: false,
    selectedApplication: null
  });

  // ================= Functions =================
  async function checkProjectLead() {
    const urlSafeGroup = encodeURIComponent("project lead");
    try {
      await Axios.get(`auth/verify/${urlSafeGroup}`);
      dispatch({ type: "set isProjectLead", value: true });
      return true;
    } catch (error) {
      if (error instanceof AxiosError && error.response.status === 401) {
        dispatch({ type: "set isProjectLead", value: false });
        return false;
      } else {
        console.error(error);
        navigate("/");
        appDispatch({ type: "flash message", value: "There was an error" });
        dispatch({ type: "set isProjectLead", value: false });
        return false;
      }
    }
  }

  // ================= Use Effects =================
  // Initialise state
  useEffect(() => {
    async function initialiseState() {
      console.log("=== Initialising State for Applications");

      await checkProjectLead();

      // Populate application data
      try {
        console.log("Getting applications");
        var allApplicationsResponse = await Axios.get("/app");

        dispatch({
          type: "populate applications",
          value: allApplicationsResponse.data.applications.map(
            applicationData => {
              return {
                acronym: applicationData.App_Acronym,
                description: applicationData.App_Description || "",
                rNum: applicationData.App_Rnumber,
                startDate: applicationData.App_startDate,
                endDate: applicationData.App_endDate,
                createPerm: applicationData.App_permit_Create,
                openPerm: applicationData.App_permit_Open,
                todoPerm: applicationData.App_permit_toDoList,
                doingPerm: applicationData.App_permit_Doing,
                donePerm: applicationData.App_permit_Done
              };
            }
          )
        });
      } catch (error) {
        console.error(error);
        navigate("/");
        appDispatch({ type: "flash message", value: "There was an error" });
        return;
      }

      setIsLoading(false);
    }

    initialiseState();
  }, []);

  async function handleOpen(type) {
    console.log("=== Handle create application button click");
    const isProjectLead = await checkProjectLead();

    console.log(`User isProjectLead: ${isProjectLead}`);

    if (!isProjectLead) {
      appDispatch({ type: "flash message", value: "Unauthorised" });
    } else {
      try {
        var userGroupsResponse = await Axios.get("/app/groups");
        dispatch({
          type: "populate groups",
          value: userGroupsResponse.data.groups
        });
        console.log("Setting groups to:\n", userGroupsResponse.data.groups);
      } catch (error) {
        // 401 is expected if user is not project lead
        console.error(error);
        navigate("/");
        appDispatch({ type: "flash message", value: "There was an error" });
        return;
      }

      setIsProjectLead(isProjectLead);
      if (type === "create") {
        setIsCreateOpen(isProjectLead);
      } else if (type === "edit") {
        setIsEditOpen(isProjectLead);
      }
      document.activeElement.blur();
    }
  }

  return (
    <>
      {isLoading ? (
        <LoadingDotsIcon />
      ) : (
        <ApplicationsStateContext.Provider value={state}>
          <ApplicationsDispatchContext.Provider value={dispatch}>
            {/* ================== Create Dialog ================== */}
            <Page title="Applications">
              <CreateApplicationDialog
                open={isCreateOpen}
                setOpen={setIsCreateOpen}
              />

              {/* ================== View Dialog ================== */}
              <ViewApplicationDialog
                open={isViewOpen}
                setOpen={setIsViewOpen}
              />

              {/* ================== Edit Dialog ================== */}
              <EditApplicationDialog
                open={isEditOpen}
                setOpen={setIsEditOpen}
              />
              <div className="container py-md-5">
                {/* ================== Header ================== */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px"
                  }}
                >
                  {/* ================== Title ================== */}
                  <h1 style={{ flex: 1 }}>Applications</h1>

                  {/* ================== Create button ================== */}
                  {state.isProjectLead && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleOpen("create")}
                      endIcon={<Add />}
                      sx={{ height: 32 }}
                      style={{ backgroundColor: "#28A745" }}
                    >
                      Create
                    </Button>
                  )}
                </div>

                {/* ================== Application List ================== */}
                <Stack spacing={2}>
                  {state.applications.length > 0 ? (
                    state.applications.map((application, index) => {
                      return (
                        <Paper elevation={4} key={index}>
                          <Card sx={{ minWidth: 275 }}>
                            <CardContent style={{ display: "flex" }}>
                              {/* ==== Application details ==== */}
                              <div style={{ flex: 1, cursor: "pointer" }}>
                                <Typography variant="h5" component="div">
                                  {application.acronym}
                                </Typography>
                                {/* <Typography
                                  sx={{
                                    color: "text.secondary"
                                  }}
                                >
                                  Start Date:{" "}
                                  {application.startDate === null
                                    ? "Not set"
                                    : application.startDate}
                                  <br />
                                  End Date:{" "}
                                  {application.endDate === null
                                    ? "Not set"
                                    : application.endDate}
                                </Typography> */}
                              </div>
                              {/* ==== Buttons ==== */}
                              <CardActions>
                                {/* ==== View ==== */}
                                <Button
                                  variant="contained"
                                  onClick={() => {
                                    dispatch({
                                      type: "select application",
                                      value: application
                                    });
                                    document.activeElement.blur();
                                    setIsViewOpen(true);
                                  }}
                                  style={{ backgroundColor: "#28A745" }}
                                >
                                  <Typography variant="caption">
                                    View
                                  </Typography>
                                </Button>

                                {/* ==== Edit ==== */}
                                {state.isProjectLead && (
                                  <Button
                                    variant="contained"
                                    onClick={() => {
                                      dispatch({
                                        type: "select application",
                                        value: application
                                      });
                                      handleOpen("edit");
                                    }}
                                  >
                                    <Typography variant="caption">
                                      Edit
                                    </Typography>
                                  </Button>
                                )}
                                {/* ==== Kanban ==== */}

                                <Button
                                  color="warning"
                                  variant="contained"
                                  onClick={() =>
                                    navigate(
                                      `/kanban/${encodeURIComponent(
                                        application.acronym
                                      )}`
                                    )
                                  }
                                >
                                  <Typography variant="caption">
                                    Enter Kanban
                                  </Typography>
                                </Button>
                              </CardActions>
                            </CardContent>
                          </Card>
                        </Paper>
                      );
                    })
                  ) : (
                    <Typography variant="h4">No applications yet.</Typography>
                  )}
                </Stack>
              </div>
            </Page>
          </ApplicationsDispatchContext.Provider>
        </ApplicationsStateContext.Provider>
      )}
    </>
  );
}

export default Applications;
