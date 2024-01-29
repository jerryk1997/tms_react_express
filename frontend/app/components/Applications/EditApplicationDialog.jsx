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
  TextareaAutosize
} from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ApplicationsStateContext from "./ApplicationsStateContext";
import ApplicationsDispatchContext from "./ApplicationsDispatchContext";
import DispatchContext from "../../DispatchContext";

function EditApplicationDialog({ open, setOpen }) {
  // ========= Context =========
  const pageState = useContext(ApplicationsStateContext);
  const pageDispatch = useContext(ApplicationsDispatchContext);
  const appDispatch = useContext(DispatchContext);
  const [app, setApp] = useImmer();

  const navigate = useNavigate();

  // ========= State =========
  const [canSubmit, setCanSubmit] = useState(false);

  // ========= Edit field states =========
  const editableFieldKeys = [
    "description",
    "startDate",
    "endDate",
    "createPerm",
    "openPerm",
    "todoPerm",
    "doingPerm",
    "donePerm"
  ];
  const [editableFields, setEditableFields] = useImmer({
    description: "",
    startDate: "",
    endDate: "",
    createPerm: "",
    openPerm: "",
    todoPerm: "",
    doingPerm: "",
    donePerm: ""
  });

  // ========= Functions =========
  function clear() {
    setEditableFields(draft => {
      return {
        description: "",
        startDate: "",
        endDate: "",
        createPerm: "",
        openPerm: "",
        todoPerm: "",
        doingPerm: "",
        donePerm: ""
      };
    });
    setApp(draft => {
      return {};
    });
  }

  async function handleEditClick() {
    document.activeElement.blur();
    let hasErrors = false;

    // No errors ready to submit
    let editedFields = {};
    for (const index in editableFieldKeys) {
      const fieldKey = editableFieldKeys[index];
      if (editableFields[fieldKey] !== app[fieldKey]) {
        editedFields[fieldKey] = editableFields[fieldKey];
        setApp(draft => {
          draft[fieldKey] = editableFields[fieldKey];
        });
      }
    }

    try {
      const urlSafeAcronym = encodeURI(app.acronym);
      await Axios.put(`/app/${urlSafeAcronym}`, editedFields);
      pageDispatch({
        type: "edit application",
        value: { acronym: pageState.selectedApplication.acronym, editedFields }
      });

      appDispatch({
        type: "flash message",
        value: "Successfully edited application"
      });
      setCanSubmit(false);
    } catch (error) {
      if (error instanceof AxiosError && error.response.status === 401) {
        appDispatch({ type: "flash message", value: "Unauthorised" });
      } else {
        appDispatch({ type: "flash message", value: "There was an error" });
      }
      console.error("Edit application error:\n", error);
      navigate("/");
    }
  }

  // ========= UseEffects =========
  // Enable submit if any editable fields changed
  let enableSubmitDebounce;
  useEffect(() => {
    setCanSubmit(false);
    if (app) {
      enableSubmitDebounce = setTimeout(() => {
        let canSubmit = false;
        for (const index in editableFieldKeys) {
          const fieldKey = editableFieldKeys[index];
          if (editableFields[fieldKey] !== app[fieldKey]) {
            canSubmit = true;
          }
        }

        setCanSubmit(canSubmit);
      }, 300); // Longer delay to allow passwordError to disable button
    }

    return () => clearTimeout(enableSubmitDebounce);
  }, [editableFields]);

  // ========= Initialise state =========
  useEffect(() => {
    if (pageState.selectedApplication) {
      setEditableFields(draft => {
        draft = {
          description: pageState.selectedApplication.description,
          startDate: pageState.selectedApplication.startDate,
          endDate: pageState.selectedApplication.endDate,
          createPerm: pageState.selectedApplication.createPerm,
          openPerm: pageState.selectedApplication.openPerm,
          todoPerm: pageState.selectedApplication.todoPerm,
          doingPerm: pageState.selectedApplication.doingPerm,
          donePerm: pageState.selectedApplication.donePerm
        };
        return draft;
      });
      setApp(draft => pageState.selectedApplication);
    }
  }, [pageState.selectedApplication]);

  // useEffect(() => {
  //   console.log(pageState.selectedApplication);
  // }, [pageState.selectedApplication]);

  return (
    <>
      {pageState.selectedApplication && (
        <Dialog open={open} maxWidth="lg">
          <DialogTitle>Edit Application</DialogTitle>
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
                id="Acronym"
                label="Acronym"
                value={pageState.selectedApplication.acronym}
                disabled
              />
              {/* ============ Rnumber ============ */}
              <TextField
                id="rNumber"
                label="R Number"
                type="number"
                value={pageState.selectedApplication.rNum}
                disabled
              />
            </div>

            {/* ============ Start / End date ============ */}
            <div className="inputRow">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                {/* ============ Start date ============ */}
                <DatePicker
                  label="Start date"
                  format="DD/MM/YYYY"
                  value={dayjs(editableFields.startDate)}
                  onChange={dateObj => {
                    console.log(dateObj.format("YYYY-MM-DD"));
                    setEditableFields(draft => {
                      draft.startDate = dateObj.format("YYYY-MM-DD");
                    });
                  }}
                  slotProps={{
                    textField: {
                      readOnly: true,
                      error: false
                    }
                  }}
                />

                {/* ============ End date ============ */}
                <DatePicker
                  label="End date"
                  format="DD/MM/YYYY"
                  value={dayjs(editableFields.endDate)}
                  onChange={dateObj => {
                    console.log(dateObj.format("YYYY-MM-DD"));
                    setEditableFields(draft => {
                      draft.endDate = dateObj.format("YYYY-MM-DD");
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
                multiline
                maxRows="20"
                value={editableFields.description}
                onChange={e =>
                  setEditableFields(draft => {
                    draft.description = e.target.value;
                  })
                }
                inputProps={{
                  // Allow resizing
                  style: { resize: "vertical" },
                  component: TextareaAutosize,
                  maxRows: 20
                }}
              />
            </div>

            {/* ============ Task Permissions ============ */}
            <Typography variant="h5" component="div">
              Task Permissions
            </Typography>

            {/* ============ Create / Open / Todo ============ */}
            <div className="inputRow">
              {/* ============ Create ============ */}
              <FormControl>
                <InputLabel id="create">Create</InputLabel>
                <Select
                  labelId="create"
                  id="create"
                  label="Create"
                  value={editableFields.createPerm}
                  onChange={e =>
                    setEditableFields(draft => {
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
              </FormControl>

              {/* ============ Open ============ */}
              <FormControl>
                <InputLabel id="open">Open</InputLabel>
                <Select
                  labelId="open"
                  id="open"
                  label="Open"
                  value={editableFields.openPerm}
                  onChange={e =>
                    setEditableFields(draft => {
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
              </FormControl>

              {/* ============ Todo ============ */}
              <FormControl>
                <InputLabel id="todo">To-do</InputLabel>
                <Select
                  labelId="todo"
                  id="todo"
                  label="To-do"
                  value={editableFields.todoPerm}
                  onChange={e =>
                    setEditableFields(draft => {
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
              </FormControl>
            </div>

            {/* ============ Doing / Done ============ */}
            <div className="inputRow">
              {/* ============ Doing ============ */}
              <FormControl>
                <InputLabel id="doing">Doing</InputLabel>
                <Select
                  labelId="doing"
                  id="doing"
                  label="Doing"
                  value={editableFields.doingPerm}
                  onChange={e =>
                    setEditableFields(draft => {
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
              </FormControl>

              {/* ============ Done ============ */}
              <FormControl>
                <InputLabel id="done">Done</InputLabel>
                <Select
                  labelId="done"
                  id="done"
                  label="Done"
                  value={editableFields.donePerm}
                  onChange={e =>
                    setEditableFields(draft => {
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
              </FormControl>
            </div>

            {/* ============ Buttons ============ */}
            <div
              className="inputRow"
              style={{ justifyContent: "right", marginRight: "50px" }}
            >
              {/* ============ Submit ============ */}
              <Button
                variant="contained"
                size="small"
                onClick={() => handleEditClick()}
                style={{ backgroundColor: "#28A745" }}
                disabled={!canSubmit}
              >
                Submit
              </Button>

              {/* ============ Close ============ */}
              <Button
                onClick={() => {
                  pageDispatch({ type: "select application", value: null });
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

export default EditApplicationDialog;
