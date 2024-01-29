import React, { useContext, useEffect } from "react";
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

function ViewApplicationDialog({ open, setOpen }) {
  const pageState = useContext(ApplicationsStateContext);
  const pageDispatch = useContext(ApplicationsDispatchContext);

  useEffect(() => {
    console.log(pageState.selectedApplication);
  }, [pageState.selectedApplication]);

  return (
    <>
      {pageState.selectedApplication && (
        <Dialog open={open} maxWidth="lg" className="non-editable">
          <DialogTitle>View Application</DialogTitle>
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
            {/* ============ Acrnoym ============ */}
            <div className="inputRow">
              <TextField
                id="Acronym"
                label="Acronym"
                value={pageState.selectedApplication.acronym}
                inputProps={{ readOnly: true }}
              />
              {/* ============ Rnumber ============ */}
              <TextField
                id="rNumber"
                label="R Number"
                type="number"
                value={pageState.selectedApplication.rNum}
                inputProps={{ readOnly: true }}
              />
            </div>

            {/* ============ Start / End date ============ */}
            <div className="inputRow">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start date"
                  format="DD/MM/YYYY"
                  value={dayjs(pageState.selectedApplication.startDate)}
                  readOnly
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
                  value={dayjs(pageState.selectedApplication.endDate)}
                  readOnly
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
                value={pageState.selectedApplication.description}
                inputProps={{
                  readOnly: true,
                  style: { resize: "vertical" }, // Allow vertical resizing
                  component: TextareaAutosize, // Use TextareaAutosize component
                  maxRows: 20
                }}
              />
            </div>

            {/* ============ Task Permissions ============ */}
            {false && (
              <>
                <Typography variant="h5" component="div">
                  Task Permissions
                </Typography>

                <div className="inputRow">
                  {/* ============ Create ============ */}
                  <FormControl>
                    <InputLabel id="create">Create</InputLabel>
                    <Select
                      labelId="create"
                      id="create"
                      label="Create"
                      value={pageState.selectedApplication.createPerm}
                      inputProps={{ readOnly: true }}
                    >
                      <MenuItem
                        value={pageState.selectedApplication.createPerm}
                      >
                        {pageState.selectedApplication.createPerm}
                      </MenuItem>
                    </Select>
                  </FormControl>

                  {/* ============ Open ============ */}
                  <FormControl>
                    <InputLabel id="open">Open</InputLabel>
                    <Select
                      labelId="open"
                      id="open"
                      label="Open"
                      value={pageState.selectedApplication.openPerm}
                      inputProps={{ readOnly: true }}
                    >
                      <MenuItem value={pageState.selectedApplication.openPerm}>
                        {pageState.selectedApplication.openPerm}
                      </MenuItem>
                    </Select>
                  </FormControl>

                  {/* ============ Todo ============ */}
                  <FormControl>
                    <InputLabel id="todo">To-do</InputLabel>
                    <Select
                      labelId="todo"
                      id="todo"
                      label="To-do"
                      value={pageState.selectedApplication.todoPerm}
                      inputProps={{ readOnly: true }}
                    >
                      <MenuItem value={pageState.selectedApplication.todoPerm}>
                        {pageState.selectedApplication.todoPerm}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </div>

                <div className="inputRow">
                  {/* ============ Doing ============ */}
                  <FormControl>
                    <InputLabel id="doing">Doing</InputLabel>
                    <Select
                      labelId="doing"
                      id="doing"
                      label="Doing"
                      value={pageState.selectedApplication.doingPerm}
                      inputProps={{ readOnly: true }}
                    >
                      <MenuItem value={pageState.selectedApplication.doingPerm}>
                        {pageState.selectedApplication.doingPerm}
                      </MenuItem>
                    </Select>
                  </FormControl>

                  {/* ============ Done ============ */}
                  <FormControl>
                    <InputLabel id="done">Done</InputLabel>
                    <Select
                      labelId="done"
                      id="done"
                      label="Done"
                      value={pageState.selectedApplication.donePerm}
                      inputProps={{ readOnly: true }}
                    >
                      <MenuItem value={pageState.selectedApplication.donePerm}>
                        {pageState.selectedApplication.donePerm}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </>
            )}
            <div
              className="inputRow"
              style={{ justifyContent: "right", marginRight: "50px" }}
            >
              <Button
                onClick={() => {
                  setOpen(false);
                  pageDispatch({ type: "select application", value: null });
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

export default ViewApplicationDialog;
