import React, { useState, useContext, useEffect } from "react";
import { useImmer } from "use-immer";
import Axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

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

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ApplicationsStateContext from "./ApplicationsStateContext";
import ApplicationsDispatchContext from "./ApplicationsDispatchContext";
import DispatchContext from "../../DispatchContext";

function CreateApplicationDialog({ open, setOpen }) {
  const pageState = useContext(ApplicationsStateContext);
  const pageDispatch = useContext(ApplicationsDispatchContext);
  const appDispatch = useContext(DispatchContext);
  const navigate = useNavigate();

  const [acronymHelpText, setAcronymHelpText] = useState("Required");

  const mandatoryFieldKeys = [
    "acronym",
    "rNum",
    "createPerm",
    "openPerm",
    "todoPerm",
    "doingPerm",
    "donePerm"
  ];

  const [mandatoryFields, setMandatoryFields] = useImmer({
    acronym: "",
    rNum: NaN,
    createPerm: "",
    openPerm: "",
    todoPerm: "",
    doingPerm: "",
    donePerm: ""
  });

  const [optionalFields, setOptionalFields] = useImmer({
    description: "",
    startDate: "",
    endDate: ""
  });

  const [errors, setErrors] = useImmer({
    acronym: false,
    rNum: false,
    createPerm: false,
    openPerm: false,
    todoPerm: false,
    doingPerm: false,
    donePerm: false
  });

  function clear() {
    for (const index in mandatoryFieldKeys) {
      const fieldKey = mandatoryFieldKeys[index];

      // Clear all fields
      setMandatoryFields(draft => {
        draft[fieldKey] = "";
      });
      setOptionalFields(draft => {
        draft.description = "";
        draft.startDate = "";
        draft.endDate = "";
      });

      // Clear all errors
      setErrors(draft => {
        draft[fieldKey] = false;
      });

      // Reset acronym help text to base
      setAcronymHelpText("Required");
    }
  }

  async function handleCreateClick(closeDialog) {
    document.activeElement.blur();
    let hasErrors = false;

    // Check mandatory fields are filled
    for (const index in mandatoryFieldKeys) {
      const fieldKey = mandatoryFieldKeys[index];
      if (!mandatoryFields[fieldKey]) {
        console.log(`${fieldKey} is empty`);
        setErrors(draft => {
          console.log("setting error");
          draft[fieldKey] = true;
        });
        hasErrors = true;
      } else {
        setErrors(draft => {
          draft[fieldKey] = false;
        });
      }
    }

    if (hasErrors) {
      return;
    }

    // No errors ready to submit
    const newApplication = { ...mandatoryFields };
    newApplication.description =
      optionalFields.description !== undefined
        ? optionalFields.description
        : null;
    newApplication.startDate =
      optionalFields.startDate !== undefined && optionalFields.startDate !== ""
        ? optionalFields.startDate
        : null;
    newApplication.endDate =
      optionalFields.endDate !== undefined && optionalFields.endDate !== ""
        ? optionalFields.endDate
        : null;

    console.log(newApplication);

    try {
      await Axios.post("/app", newApplication);
      pageDispatch({ type: "create application", value: newApplication });
      appDispatch({
        type: "flash message",
        value: "Successfully created application"
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
      } else if (error instanceof AxiosError && error.response.status === 409) {
        appDispatch({
          type: "flash message",
          value: "Failed to create application"
        });
        setAcronymHelpText("Acronym already exists");
        setErrors(draft => {
          draft.acronym = true;
        });
        return;
      } else {
        appDispatch({ type: "flash message", value: "There was an error" });
      }
      console.error("Create application error:\n", error);
      navigate("/");
    }
  }

  // useEffect(() => {
  //   console.log(mandatoryFields);
  // }, [mandatoryFields]);

  return (
    <Dialog open={open} maxWidth="lg">
      <DialogTitle>Create Application</DialogTitle>
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
          width: "fit-content"
        }}
        noValidate
        autoComplete="off"
      >
        {/* ============ Title ============ */}
        <Typography variant="h5" component="div">
          Details
        </Typography>

        {/* ============ Details ============ */}
        {/* ============ Acrnoym ============ */}
        <div className="inputRow">
          <TextField
            error={errors.acronym}
            id="Acronym"
            label="Acronym"
            value={mandatoryFields.acronym}
            helperText={errors.acronym ? acronymHelpText : ""}
            onChange={e => {
              setMandatoryFields(draft => {
                draft.acronym = e.target.value;
              });
            }}
          />
          {/* ============ Rnumber ============ */}
          <TextField
            error={errors.rNum}
            id="rNumber"
            label="R Number"
            type="number"
            value={mandatoryFields.rNum === NaN ? "" : mandatoryFields.rNum}
            helperText={errors.rNum ? "Required" : "Positive integer"}
            inputProps={{ min: 0 }}
            onChange={e => {
              setMandatoryFields(draft => {
                draft.rNum = parseInt(e.target.value, 10);
              });
            }}
          />
        </div>

        {/* ============ Start / End date ============ */}
        <div className="inputRow">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start date"
              format="DD/MM/YYYY"
              value={dayjs(optionalFields.startDate)}
              onChange={e => {
                console.log(e.format("YYYY-MM-DD"));
                setOptionalFields(draft => {
                  draft.startDate = e.format("YYYY-MM-DD");
                });
              }}
              slotProps={{
                textField: {
                  readOnly: true,
                  error: false
                }
              }}
            />
            <DatePicker
              label="End date"
              format="DD/MM/YYYY"
              value={dayjs(optionalFields.endDate)}
              onChange={e => {
                console.log(e.format("YYYY-MM-DD"));
                setOptionalFields(draft => {
                  draft.endDate = e.format("YYYY-MM-DD");
                });
              }}
              slotProps={{
                textField: {
                  readOnly: true,
                  error: false
                }
              }}
            />
          </LocalizationProvider>
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
            value={optionalFields.description}
            onChange={e =>
              setOptionalFields(draft => {
                draft.description = e.target.value;
              })
            }
            inputProps={{
              style: { resize: "vertical" }, // Allow vertical resizing
              component: TextareaAutosize, // Use TextareaAutosize component
              maxRows: 20
            }}
          />
        </div>

        {/* ============ Task Permissions ============ */}
        <Typography variant="h5" component="div">
          Task Permissions
        </Typography>

        <div className="inputRow">
          {/* ============ Create ============ */}
          <FormControl>
            <InputLabel error={errors.createPerm} id="create">
              Create
            </InputLabel>
            <Select
              labelId="create"
              id="create"
              label="Create"
              error={errors.createPerm}
              value={mandatoryFields.createPerm}
              onChange={e =>
                setMandatoryFields(draft => {
                  draft.createPerm = e.target.value;
                })
              }
            >
              {pageState.groups.map((group, index) => {
                return (
                  <MenuItem key={index} value={group}>
                    {group}
                  </MenuItem>
                );
              })}
            </Select>
            {errors.createPerm && (
              <FormHelperText style={{ color: "red" }}>Required</FormHelperText>
            )}
          </FormControl>

          {/* ============ Open ============ */}
          <FormControl>
            <InputLabel error={errors.openPerm} id="open">
              Open
            </InputLabel>
            <Select
              labelId="open"
              id="open"
              label="Open"
              error={errors.openPerm}
              value={mandatoryFields.openPerm}
              onChange={e =>
                setMandatoryFields(draft => {
                  draft.openPerm = e.target.value;
                })
              }
            >
              {pageState.groups.map((group, index) => {
                return (
                  <MenuItem key={index} value={group}>
                    {group}
                  </MenuItem>
                );
              })}
            </Select>
            {errors.openPerm && (
              <FormHelperText style={{ color: "red" }}>Required</FormHelperText>
            )}
          </FormControl>

          {/* ============ Todo ============ */}
          <FormControl>
            <InputLabel error={errors.todoPerm} id="todo">
              To-do
            </InputLabel>
            <Select
              labelId="todo"
              id="todo"
              label="To-do"
              error={errors.todoPerm}
              value={mandatoryFields.todoPerm}
              onChange={e =>
                setMandatoryFields(draft => {
                  draft.todoPerm = e.target.value;
                })
              }
            >
              {pageState.groups.map((group, index) => {
                return (
                  <MenuItem key={index} value={group}>
                    {group}
                  </MenuItem>
                );
              })}
            </Select>
            {errors.todoPerm && (
              <FormHelperText style={{ color: "red" }}>Required</FormHelperText>
            )}
          </FormControl>
        </div>

        <div className="inputRow">
          {/* ============ Doing ============ */}
          <FormControl>
            <InputLabel error={errors.doingPerm} id="doing">
              Doing
            </InputLabel>
            <Select
              labelId="doing"
              id="doing"
              label="Doing"
              error={errors.doingPerm}
              value={mandatoryFields.doingPerm}
              onChange={e =>
                setMandatoryFields(draft => {
                  draft.doingPerm = e.target.value;
                })
              }
            >
              {pageState.groups.map((group, index) => {
                return (
                  <MenuItem key={index} value={group}>
                    {group}
                  </MenuItem>
                );
              })}
            </Select>
            {errors.doingPerm && (
              <FormHelperText style={{ color: "red" }}>Required</FormHelperText>
            )}
          </FormControl>

          {/* ============ Done ============ */}
          <FormControl>
            <InputLabel error={errors.donePerm} id="done">
              Done
            </InputLabel>
            <Select
              labelId="done"
              id="done"
              label="Done"
              error={errors.donePerm}
              value={mandatoryFields.donePerm}
              onChange={e =>
                setMandatoryFields(draft => {
                  draft.donePerm = e.target.value;
                })
              }
            >
              {pageState.groups.map((group, index) => {
                return (
                  <MenuItem key={index} value={group}>
                    {group}
                  </MenuItem>
                );
              })}
            </Select>
            {errors.donePerm && (
              <FormHelperText style={{ color: "red" }}>Required</FormHelperText>
            )}
          </FormControl>
        </div>
        <div
          className="inputRow"
          style={{ justifyContent: "right", marginRight: "50px" }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={() => handleCreateClick(true)}
            style={{ backgroundColor: "#28A745" }}
          >
            Submit
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => handleCreateClick(false)}
            style={{ backgroundColor: "#28A745" }}
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

export default CreateApplicationDialog;
