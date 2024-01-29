import React, { useState, useEffect, useContext } from "react";
import Axios, { AxiosError } from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";

// Custom modules
import Page from "../Page";
import { useImmerReducer } from "use-immer";
import LoadingDotsIcon from "../LoadingDotsIcon";

// Context
import DispatchContext from "../../DispatchContext";
import KanbanStateContext from "./KanbanStateContext";
import KanbanDispatchContext from "./KanbanDispatchContext";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Paper,
  ButtonGroup,
  Button
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import CreateTaskDialog from "./CreateTaskDialogue";
import EditTaskDialog from "./EditTaskDialogue";

function Kanban() {
  // ============ STYLING ============
  const columnStyle = {
    backgroundColor: "#FFFFFF",
    boxShadow: "3px 4px 6px 4px rgba(0, 0, 0, 0.1)",
    padding: "16px",
    margin: "8px",
    flex: "1 1 auto",
    minHeight: "calc(70vh - 32px)"
  };
  const headerStyle = {
    borderBottom: "2px solid #333",
    paddingBottom: "10px",
    marginBottom: "10px",
    textAlign: "center"
  };
  const cardStyle = {
    marginBottom: "12px",
    paddingBottom: "0px",
    cursor: "pointer",
    boxShadow: "2px 2px 4px 3px rgba(0, 0, 0, 0.1)"
  };

  // ============ STATE ============
  const { appAcronym } = useParams();
  const URLSafeAppAcronym = encodeURIComponent(appAcronym);

  const appDispatch = useContext(DispatchContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);

  function kanbanReducer(draft, action) {
    switch (action.type) {
      case "populate tasks":
        draft.tasks = action.value;
        break;
      case "edit task":
        draft.selectedTask = action.value;
        break;
      case "select task":
        draft.selectedTask = action.value;
        break;

      case "populate plans":
        draft.plans = action.value;
        break;
      case "set create":
        draft.createPerm = action.value;
        break;
      case "set open":
        draft.openPerm = action.value;
        break;
      case "set todo":
        draft.todoPerm = action.value;
        break;
      case "set doing":
        draft.doingPerm = action.value;
        break;
      case "set done":
        draft.donePerm = action.value;
        break;
    }
  }
  const [state, dispatch] = useImmerReducer(kanbanReducer, {
    appAcronym,
    tasks: [],
    plans: [],
    selectedTask: null,
    createPerm: false,
    openPerm: false,
    todoPerm: false,
    doingPerm: false,
    donePerm: false
  });

  // ============ FUNCTIONS ============
  async function handleCreateTaskOpen() {
    try {
      await Axios.get(`/app/${URLSafeAppAcronym}/check/create`);

      const allAppPlansResponse = await Axios.get(`/plan/${URLSafeAppAcronym}`);

      console.log(allAppPlansResponse);

      dispatch({
        type: "populate plans",
        value: allAppPlansResponse.data.plans
      });
      setIsCreateTaskOpen(true);
    } catch (error) {
      if (error instanceof AxiosError && error.response.status === 401) {
        appDispatch({ type: "flash message", value: "Unauthorised" });
        dispatch({ type: "set create", value: false });
      } else {
        appDispatch({ type: "flash message", value: "There was an error" });
        navigate("/");
      }
    }
  }

  async function handleTaskClick(task) {
    dispatch({ type: "select task", value: task });
    setIsEditTaskOpen(true);
  }

  // ============ USE EFFECTS ============
  useEffect(() => {
    async function initialiseState() {
      // FETCH ALL TASKS
      try {
        const appTasksResponse = await Axios.get(`/task/${URLSafeAppAcronym}`);

        const tasks = appTasksResponse.data.tasks;
        console.log(tasks);
        dispatch({ type: "populate tasks", value: tasks });
      } catch (error) {
        console.log(error);
        appDispatch({ type: "flash message", value: "There was an error" });
        navigate("/");
      }

      try {
        await Axios.get(`/app/${URLSafeAppAcronym}/check/create`);
        dispatch({ type: "set create", value: true });
      } catch {
        dispatch({ type: "set create", value: false });
      }
    }

    initialiseState();
  }, []);

  return (
    <KanbanStateContext.Provider value={state}>
      <KanbanDispatchContext.Provider value={dispatch}>
        <Page title="Kanban" width="wide">
          {/* ============ Dialogs ============ */}
          <CreateTaskDialog
            open={isCreateTaskOpen}
            setOpen={setIsCreateTaskOpen}
          />
          <EditTaskDialog open={isEditTaskOpen} setOpen={setIsEditTaskOpen} />

          {/* ============ Header ============ */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* ============ Back button ============ */}
              <Link to="/applications">
                <Button>
                  <ArrowBack fontSize="large" />
                </Button>
              </Link>
              {/* ============ Title ============ */}
              <Typography variant="h3" style={{ textAlign: "left" }}>
                {appAcronym} Tasks
              </Typography>
            </div>
            {/* ============ Buttons ============ */}
            <ButtonGroup variant="contained">
              {/* ============ Plans ============ */}
              <Link to={`/kanban/${appAcronym}/plans`}>
                <Button>View plans</Button>
              </Link>
              {/* ============ Task ============ */}
              {state.createPerm && (
                <Button
                  style={{ backgroundColor: "#28A745" }}
                  onClick={handleCreateTaskOpen}
                >
                  Create task
                </Button>
              )}
            </ButtonGroup>
          </div>
          <Grid container columnSpacing={2}>
            {/* ============ Open ============ */}
            <Grid item sx={columnStyle}>
              <Typography variant="h6" sx={headerStyle}>
                Open
              </Typography>
              {state.tasks
                .filter(task => task.state === "open")
                .map((task, index) => {
                  return (
                    <Card
                      key={index}
                      sx={cardStyle}
                      onClick={() => handleTaskClick(task)}
                    >
                      <CardContent
                        sx={{ padding: "10px", marginBottom: "0px" }}
                      >
                        <Typography variant="subtitle2">
                          Name: {task.name}
                        </Typography>
                        <Typography variant="subtitle2">
                          ID: {task.id}
                        </Typography>
                        <Typography variant="subtitle2">
                          Owner: {task.owner}
                        </Typography>
                        <Typography variant="subtitle2">
                          Plan:{" "}
                          {task.plan === null ? "Not assigned" : task.plan}
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })}
              {/* Other tasks */}
            </Grid>
            {/* <Divider orientation="vertical" flexItem /> */}
            {/* ============ Todo ============ */}
            <Grid item sx={columnStyle}>
              <Typography variant="h6" sx={headerStyle}>
                Todo
              </Typography>
              {state.tasks
                .filter(task => task.state === "todo")
                .map((task, index) => {
                  return (
                    <Card
                      key={index}
                      sx={cardStyle}
                      onClick={() => handleTaskClick(task)}
                    >
                      <CardContent
                        sx={{ padding: "10px", marginBottom: "0px" }}
                      >
                        <Typography variant="subtitle2">
                          Name: {task.name}
                        </Typography>
                        <Typography variant="subtitle2">
                          ID: {task.id}
                        </Typography>
                        <Typography variant="subtitle2">
                          Owner: {task.owner}
                        </Typography>
                        <Typography variant="subtitle2">
                          Plan:{" "}
                          {task.plan === null ? "Not assigned" : task.plan}
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })}
              {/* Todo tasks */}
            </Grid>
            {/* <Divider orientation="vertical" flexItem /> */}
            {/* ============ Doing ============ */}
            <Grid item sx={columnStyle}>
              <Typography variant="h6" sx={headerStyle}>
                Doing
              </Typography>
              {state.tasks
                .filter(task => task.state === "doing")
                .map((task, index) => {
                  return (
                    <Card
                      key={index}
                      sx={cardStyle}
                      onClick={() => handleTaskClick(task)}
                    >
                      <CardContent
                        sx={{ padding: "10px", marginBottom: "0px" }}
                      >
                        <Typography variant="subtitle2">
                          Name: {task.name}
                        </Typography>
                        <Typography variant="subtitle2">
                          ID: {task.id}
                        </Typography>
                        <Typography variant="subtitle2">
                          Owner: {task.owner}
                        </Typography>
                        <Typography variant="subtitle2">
                          Plan:{" "}
                          {task.plan === null ? "Not assigned" : task.plan}
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })}
              {/* Tasks in progress */}
            </Grid>
            {/* <Divider orientation="vertical" flexItem /> */}
            {/* ============ Done ============ */}
            <Grid item sx={columnStyle}>
              <Typography variant="h6" sx={headerStyle}>
                Done
              </Typography>
              {state.tasks
                .filter(task => task.state === "done")
                .map((task, index) => {
                  return (
                    <Card
                      key={index}
                      sx={cardStyle}
                      onClick={() => handleTaskClick(task)}
                    >
                      <CardContent
                        sx={{ padding: "10px", marginBottom: "0px" }}
                      >
                        <Typography variant="subtitle2">
                          Name: {task.name}
                        </Typography>
                        <Typography variant="subtitle2">
                          ID: {task.id}
                        </Typography>
                        <Typography variant="subtitle2">
                          Owner: {task.owner}
                        </Typography>
                        <Typography variant="subtitle2">
                          Plan:{" "}
                          {task.plan === null ? "Not assigned" : task.plan}
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })}
              {/* Completed tasks */}
            </Grid>
            {/* <Divider orientation="vertical" flexItem /> */}
            {/* ============ Closed ============ */}
            <Grid item sx={columnStyle}>
              <Typography variant="h6" sx={headerStyle}>
                Closed
              </Typography>
              {state.tasks
                .filter(task => task.state === "closed")
                .map((task, index) => {
                  return (
                    <Card
                      key={index}
                      sx={cardStyle}
                      onClick={() => handleTaskClick(task)}
                    >
                      <CardContent
                        sx={{ padding: "10px", marginBottom: "0px" }}
                      >
                        <Typography variant="subtitle2">
                          Name: {task.name}
                        </Typography>
                        <Typography variant="subtitle2">
                          ID: {task.id}
                        </Typography>
                        <Typography variant="subtitle2">
                          Owner: {task.owner}
                        </Typography>
                        <Typography variant="subtitle2">
                          Plan:{" "}
                          {task.plan === null ? "Not assigned" : task.plan}
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })}
              {/* Closed tasks */}
            </Grid>
          </Grid>
        </Page>
      </KanbanDispatchContext.Provider>
    </KanbanStateContext.Provider>
  );
}

export default Kanban;
