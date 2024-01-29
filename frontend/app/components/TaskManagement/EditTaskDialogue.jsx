import React, { useState, useContext, useEffect } from "react";
import Axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

import {
  Typography,
  Button,
  TextField,
  Box,
  DialogTitle,
  Dialog,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  TextareaAutosize,
  FormHelperText
} from "@mui/material";

import DispatchContext from "../../DispatchContext";
import KanbanStateContext from "./KanbanStateContext";
import KanbanDispatchContext from "./KanbanDispatchContext";

function EditTaskDialog({ open, setOpen }) {
  // ========= Context =========
  const pageState = useContext(KanbanStateContext);
  const pageDispatch = useContext(KanbanDispatchContext);
  const appDispatch = useContext(DispatchContext);

  const URLSafeAppAcronym = encodeURIComponent(pageState.appAcronym);

  const navigate = useNavigate();

  // ========= State =========
  const [canSubmit, setCanSubmit] = useState(false);
  const [submitButtonText, setSubmitButtonText] = useState("Submit");
  const [isEditing, setIsEditing] = useState(false);
  const [canChangePlan, setCanChangePlan] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canPromote, setCanPromote] = useState(true);
  const [canDemote, setCanDemote] = useState(true);

  // ========= Edit field states =========
  const [newNotes, setNewNotes] = useState("");
  const [newPlan, setNewPlan] = useState("");
  const [appPlans, setAppPlans] = useState();

  // ========= Functions =========
  function clear() {
    setNewNotes("");
    setNewPlan(
      pageState.selectedTask.plan === null ? "" : pageState.selectedTask.plan
    );
  }

  async function handleSubmit() {
    const URLSafeTaskID = encodeURIComponent(pageState.selectedTask.id);

    const editedFields = {};
    if (newNotes) {
      editedFields.notes = newNotes;
    }

    if (
      newPlan !== pageState.selectedTask.plan ||
      (newPlan === "" && pageState.selectedTask.plan !== null)
    ) {
      editedFields.plan = newPlan;
      if (pageState.selectedTask.state === "done") {
        editedFields.demote = true;
      }
    }

    console.log("Edited task", editedFields);
    try {
      await Axios.put(
        `/task/${URLSafeAppAcronym}/${URLSafeTaskID}`,
        editedFields
      );

      appDispatch({ type: "flash message", value: "Successfully edited task" });

      const allTaskResponse = await Axios.get(`/task/${URLSafeAppAcronym}`);
      pageDispatch({
        type: "populate tasks",
        value: allTaskResponse.data.tasks
      });
      pageDispatch({
        type: "edit task",
        value: allTaskResponse.data.tasks.filter(
          task => task.id === pageState.selectedTask.id
        )[0]
      });
      clear();
      setIsEditing(false);
      setCanEdit(false);
    } catch (error) {
      if (error instanceof AxiosError && error.response.status === 401) {
        appDispatch({ type: "flash message", value: "Unauthorised" });
        clear();
        pageDispatch({ type: "select task", value: null });
        setOpen(false);
      } else {
        appDispatch({ type: "flash message", value: "There was an error" });
        navigate("/");
      }
    }
  }

  async function handleEditClick() {
    try {
      await Axios.get(
        `/app/${URLSafeAppAcronym}/check/${pageState.selectedTask.state}`
      );
      setIsEditing(true);
    } catch (error) {
      if (error instanceof AxiosError && error.response.status === 401) {
        appDispatch({ type: "flash message", value: "Unauthorised" });
        setCanEdit(false);
      } else {
        appDispatch({ type: "flash message", value: "There was an error" });
        navigate("/");
      }
    }
  }

  async function handleTaskStateChangeClick(type) {
    try {
      await Axios.get(
        `/app/${URLSafeAppAcronym}/check/${pageState.selectedTask.state}`
      );

      const URLSafeTaskID = encodeURIComponent(pageState.selectedTask.id);

      const editedFields = {};
      if (newNotes) {
        editedFields.notes = newNotes;
      }

      if (
        newPlan !== pageState.selectedTask.plan ||
        (newPlan === "" && pageState.selectedTask.plan !== null)
      ) {
        editedFields.plan = newPlan;
        if (pageState.selectedTask.state === "done") {
          editedFields.demote = true;
        }
      }

      if (type === "promote") {
        editedFields.promote = true;
      } else if (type === "demote") {
        editedFields.demote = true;
      } else {
        throw new Error("Wrong state change type");
      }

      await Axios.put(
        `/task/${URLSafeAppAcronym}/${URLSafeTaskID}`,
        editedFields
      );

      const allTaskResponse = await Axios.get(`/task/${URLSafeAppAcronym}`);
      pageDispatch({
        type: "populate tasks",
        value: allTaskResponse.data.tasks
      });
      pageDispatch({
        type: "edit task",
        value: allTaskResponse.data.tasks.filter(
          task => task.id === pageState.selectedTask.id
        )[0]
      });

      var action;
      if (type === "promote") {
        action = "promoted";
      } else {
        action = "demoted";
      }
      appDispatch({
        type: "flash message",
        value: `Task successfully saved and ${action}`
      });

      clear();
      setIsEditing(false);
    } catch (error) {
      if (error instanceof AxiosError && error.response.status === 401) {
        appDispatch({ type: "flash message", value: "Unauthorised" });
        setCanEdit(false);
      } else {
        console.error(error);
        appDispatch({ type: "flash message", value: "There was an error" });
        navigate("/");
      }
    }
  }

  // ========= Use Effects =========
  useEffect(() => {
    async function fetchPlans() {
      if (isEditing) {
        const allAppPlansResponse = await Axios.get(
          `/plan/${URLSafeAppAcronym}`
        );
        setAppPlans(allAppPlansResponse.data.plans.map(plan => plan.mvpName));
      }
    }

    fetchPlans();
  }, [isEditing]);

  useEffect(() => {
    async function initialiseState() {
      if (pageState.selectedTask) {
        setNewPlan(
          pageState.selectedTask.plan === null
            ? ""
            : pageState.selectedTask.plan
        );
        setCanChangePlan(
          pageState.selectedTask.state === "open" ||
            pageState.selectedTask.state === "done"
        );

        try {
          // Check user permissions
          await Axios.get(
            `/app/${URLSafeAppAcronym}/check/${pageState.selectedTask.state}`
          );
          const allAppPlansResponse = await Axios.get(
            `/plan/${URLSafeAppAcronym}`
          );
          setAppPlans(allAppPlansResponse.data.plans.map(plan => plan.mvpName));
          setCanEdit(true);
        } catch (error) {
          if (error instanceof AxiosError && error.response.status === 401) {
            setCanEdit(false);
          } else {
            appDispatch({ type: "flash message", value: "There was an error" });
            navigate("/");
          }
        }

        switch (pageState.selectedTask.state) {
          case "open":
          case "todo":
            setCanPromote(true);
            setCanDemote(false);
            break;
          case "doing":
          case "done":
            setCanPromote(true);
            setCanDemote(true);
        }
      }
    }

    initialiseState();
  }, [pageState]);

  let enableSubmitDebounce;
  useEffect(() => {
    setCanSubmit(false);
    if (pageState.selectedTask) {
      enableSubmitDebounce = setTimeout(() => {
        const notesChanged = newNotes !== "";
        const planChanged =
          canChangePlan &&
          newPlan !== pageState.selectedTask.plan &&
          !(newPlan === "" && pageState.selectedTask.plan === null);
        setCanSubmit(notesChanged || planChanged);
        if (planChanged && pageState.selectedTask.state === "done") {
          setCanSubmit(false);
          setCanPromote(false);
        } else {
          setSubmitButtonText("Submit");
          setCanPromote(true);
        }
      }, 500); // Longer delay to allow passwordError to disable button
    }

    return () => clearTimeout(enableSubmitDebounce);
  }, [newPlan, newNotes]);

  return (
    <>
      {pageState.selectedTask && (
        <Dialog open={open} maxWidth="lg">
          <DialogTitle>Task ID: {pageState.selectedTask.id}</DialogTitle>
          <Box
            component="form"
            sx={{
              "& .inputRow": {
                m: 2,
                display: "flex"
              },
              "& .MuiTextField-root, & .MuiSelect-select, & .MuiFormControl-root":
                {
                  marginLeft: 1,
                  marginRight: 1,
                  width: "25ch"
                },
              "& .wide": {
                width: "100%"
              },
              "& .MuiTypography-root": {
                marginLeft: 3
              },
              "& .MuiButton-root": {
                m: 0.5
              },
              display: "flex",
              flexDirection: "column",
              m: "auto",
              width: "fit-content",
              minWidth: "1000px"
            }}
            noValidate
            autoComplete="off"
          >
            {/* ============ Title ============ */}
            <Typography variant="h5" component="div">
              Details
            </Typography>

            {/* ============ Row 1 ============ */}
            <div className="inputRow">
              {/* ============ Name ============ */}
              <TextField
                id="Name"
                label="Name"
                value={pageState.selectedTask.name}
                inputProps={{ readOnly: true }}
                disabled={canEdit}
              />

              {/* ============ Creator ============ */}
              <TextField
                id="Creator"
                label="Creator"
                value={pageState.selectedTask.creator}
                inputProps={{ readOnly: true }}
                disabled={canEdit}
              />

              {/* ============ Owner ============ */}
              <TextField
                id="Owner"
                label="Owner"
                value={pageState.selectedTask.owner}
                inputProps={{ readOnly: true }}
                disabled={canEdit}
              />
            </div>

            {/* ============ Row 2 ============ */}
            <div className="inputRow">
              {/* ============ State ============ */}
              <TextField
                id="state"
                label="State"
                value={pageState.selectedTask.state}
                inputProps={{ readOnly: true }}
                disabled={canEdit}
              />
              {/* ============ Plan ============ */}
              {canEdit && canChangePlan ? (
                appPlans && (
                  <FormControl>
                    <InputLabel id="plans">Plan</InputLabel>
                    <Select
                      labelId="plans"
                      id="plans"
                      label="Plan"
                      value={newPlan}
                      onChange={e => setNewPlan(e.target.value)}
                      variant="outlined"
                      sx={{
                        "&:hover .MuiOutlinedInput-notchedOutline, & .MuiOutlinedInput-notchedOutline":
                          {
                            borderColor: "#1976D2", // Border color on hover and no hover (blue)
                            borderWidth: "2px"
                          }
                      }}
                    >
                      <MenuItem value="">
                        <em>No Plan</em>
                      </MenuItem>
                      {appPlans.map((plan, index) => {
                        return (
                          <MenuItem key={index} value={plan}>
                            {plan}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    <FormHelperText>
                      {pageState.selectedTask.state === "done" && canEdit
                        ? "Changing plan will demote the task"
                        : ""}
                    </FormHelperText>
                  </FormControl>
                )
              ) : (
                <TextField
                  id="plan"
                  label="Plan"
                  value={pageState.selectedTask.plan || " "}
                  inputProps={{ readOnly: !canEdit }}
                  disabled={canEdit}
                />
              )}
            </div>

            {/* ============ Description ============ */}
            <div className="inputRow" fullwidth="true">
              <TextField
                id="description"
                label="Description"
                className="wide"
                multiline
                maxRows="20"
                value={
                  pageState.selectedTask.description === null
                    ? "No Description added"
                    : pageState.selectedTask.description
                }
                inputProps={{
                  // Allow resizing
                  style: { resize: "vertical" },
                  component: TextareaAutosize,
                  maxRows: 10,
                  readOnly: true
                }}
                disabled={canEdit}
              />
            </div>

            {/* ============ Display Notes ============ */}
            <div className="inputRow" fullwidth="true">
              <TextField
                id="notes"
                label="Notes"
                className="wide"
                multiline
                maxRows="20"
                value={pageState.selectedTask.notes}
                inputProps={{
                  // Allow resizing
                  style: { resize: "vertical" },
                  component: TextareaAutosize,
                  maxRows: 10,
                  readOnly: true
                }}
                disabled={canEdit}
              />
            </div>

            {/* ============ Add Notes ============ */}
            {canEdit && (
              <div className="inputRow" fullwidth="true">
                <TextField
                  id="notes"
                  label="Add Notes"
                  className="wide"
                  multiline
                  maxRows="20"
                  value={newNotes}
                  inputProps={{
                    // Allow resizing
                    style: { resize: "vertical" },
                    component: TextareaAutosize,
                    maxRows: 10
                  }}
                  sx={{
                    "&:hover .MuiOutlinedInput-notchedOutline, & .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: "#1976D2", // Border color on hover and no hover (blue)
                        borderWidth: "2px"
                      }
                  }}
                  onChange={e => setNewNotes(e.target.value)}
                />
              </div>
            )}

            {/* ============ Buttons ============ */}
            <div
              className="inputRow"
              style={{ justifyContent: "right", marginRight: "50px" }}
            >
              {canEdit && (
                <>
                  {/* ============ Submit ============ */}
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      document.activeElement.blur();
                      handleSubmit();
                    }}
                    style={
                      submitButtonText === "Submit"
                        ? { backgroundColor: "#28A745" }
                        : { backgroundColor: "#ED6C02" }
                    }
                    disabled={!canSubmit}
                  >
                    {submitButtonText}
                  </Button>
                </>
              )}
              {canEdit && (
                <>
                  {/* ============ Demote ============ */}
                  {canDemote && (
                    <Button
                      onClick={() => {
                        document.activeElement.blur();
                        handleTaskStateChangeClick("demote");
                      }}
                      size="small"
                      variant="contained"
                      color="warning"
                    >
                      Demote
                    </Button>
                  )}

                  {/* ============ Promote ============ */}
                  {canPromote && (
                    <Button
                      onClick={() => {
                        document.activeElement.blur();
                        handleTaskStateChangeClick("promote");
                      }}
                      size="small"
                      variant="contained"
                    >
                      Promote
                    </Button>
                  )}
                </>
              )}
              {/* ============ Close ============ */}
              <Button
                onClick={() => {
                  document.activeElement.blur();
                  pageDispatch({ type: "select task", value: null });
                  clear();
                  setOpen(false);
                }}
                size="small"
                variant="contained"
                color="error"
              >
                Close
              </Button>
            </div>
          </Box>
        </Dialog>
      )}
    </>
  );
}

export default EditTaskDialog;
