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
  FormHelperText,
  TextareaAutosize
} from "@mui/material";

import DispatchContext from "../../DispatchContext";
import KanbanStateContext from "./KanbanStateContext";
import KanbanDispatchContext from "./KanbanDispatchContext";

function CreateTaskDialog({ open, setOpen }) {
  const pageState = useContext(KanbanStateContext);
  const pageDispatch = useContext(KanbanDispatchContext);
  const appDispatch = useContext(DispatchContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [plan, setPlan] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);

  function clear() {
    setName("");
    setDescription("");
    setPlan("");
  }

  async function handleCreateClick(closeDialog) {
    document.activeElement.blur();

    const newTask = { name };
    if (description) {
      newTask.description = description;
    }
    if (plan) {
      newTask.plan = plan;
    }

    console.log("==== New Task", newTask);

    try {
      const URLSafeAppAcronym = encodeURIComponent(pageState.appAcronym);
      await Axios.post(`/task/${URLSafeAppAcronym}`, newTask);

      const tasks = (await Axios.get(`/task/${URLSafeAppAcronym}`)).data.tasks;

      pageDispatch({ type: "populate tasks", value: tasks });
      appDispatch({
        type: "flash message",
        value: "Successfully created task"
      });

      clear();
      if (closeDialog) {
        console.log("Closing");
        setOpen(false);
      } else {
        console.log("Stay Open");
        setOpen(true);
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response.status === 401) {
        appDispatch({ type: "flash message", value: "Unauthorised" });
        pageDispatch({ type: "set create", value: false });
        setOpen(false);
        return;
      } else {
        appDispatch({ type: "flash message", value: "There was an error" });
      }
      console.error("Create application error:\n", error);
      navigate("/");
    }
  }

  let enableSubmitDebounce;
  useEffect(() => {
    setCanSubmit(false);
    enableSubmitDebounce = setTimeout(() => {
      setCanSubmit(name !== "");
    }, 600); // Longer delay to allow passwordError to disable button

    return () => clearTimeout(enableSubmitDebounce);
  }, [name]);

  // useEffect(() => {
  //   console.log(mandatoryFields);
  // }, [mandatoryFields]);

  return (
    <Dialog open={open} maxWidth="lg">
      <DialogTitle>Create Task</DialogTitle>
      <Box
        component="form"
        sx={{
          "& .inputRow": {
            m: 2,
            display: "flex"
          },
          "& .MuiTextField-root, & .MuiSelect-select, & .MuiFormControl-root": {
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
          minWidth: "800px"
        }}
        noValidate
        autoComplete="off"
      >
        {/* ============ Title ============ */}
        <Typography variant="h5" component="div">
          Details
        </Typography>

        {/* ============ Details ============ */}
        {/* ============ Acronym ============ */}
        <div className="inputRow">
          <TextField
            id="Name"
            label="Name"
            value={name}
            helperText={"Required"}
            onChange={e => {
              setName(e.target.value);
            }}
          />

          {/* ============ Plan ============ */}
          <FormControl>
            <InputLabel id="plan">Plan</InputLabel>
            <Select
              labelId="plan"
              id="plan"
              label="Plan"
              value={plan}
              onChange={e => setPlan(e.target.value)}
            >
              <MenuItem value="">
                <em>No Plan</em>
              </MenuItem>
              {pageState.plans.map((plan, index) => {
                return (
                  <MenuItem key={index} value={plan.mvpName}>
                    {plan.mvpName}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </div>

        {/* ============ Description ============ */}
        <div className="inputRow" fullwidth="true">
          <TextField
            id="description"
            label="Description"
            className="wide"
            size="medium"
            multiline
            maxRows="20"
            value={description}
            onChange={e => setDescription(e.target.value)}
            inputProps={{
              style: { resize: "vertical" }, // Allow vertical resizing
              component: TextareaAutosize, // Use TextareaAutosize component
              maxRows: 20
            }}
          />
        </div>

        {/* ============ Buttons ============ */}
        <div
          className="inputRow"
          style={{ justifyContent: "right", marginRight: "50px" }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={() => handleCreateClick(true)}
            style={{ backgroundColor: "#28A745" }}
            disabled={!canSubmit}
          >
            Submit
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => handleCreateClick(false)}
            style={{ backgroundColor: "#28A745" }}
            disabled={!canSubmit}
          >
            Submit another
          </Button>
          <Button
            onClick={() => {
              clear();
              setOpen(false);
            }}
            size="small"
            variant="contained"
            color="error"
          >
            Cancel
          </Button>
        </div>
      </Box>
    </Dialog>
  );
}

export default CreateTaskDialog;
