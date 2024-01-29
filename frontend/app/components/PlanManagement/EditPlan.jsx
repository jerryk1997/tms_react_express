import React, { useState, useEffect, useContext } from "react";
import Axios, { AxiosError } from "axios";
import dayjs from "dayjs";
import { TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

// Custom modules
// Context
import DispatchContext from "../../DispatchContext";
import PlanManagementStateContext from "./PlanManagementStateContext";
import PlanManagementDispatchContext from "./PlanManagementDispatchContext";
import DispatchCheckContext from "../ProtectedRoute/DispatchCheckContext";

function EditPlan({ plan, index }) {
  // ======================= Context =======================
  const appDispatch = useContext(DispatchContext);
  const planMgmtState = useContext(PlanManagementStateContext);
  const planMgmtDispatch = useContext(PlanManagementDispatchContext);
  const checkDispatch = useContext(DispatchCheckContext);

  // ======================= Row state =======================
  const [isEditing, setIsEditing] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ======================= Event Listeners =======================
  function handleEdit() {
    setIsEditing(true);
  }

  async function handleConfirm() {
    console.log(plan);
    const editedFields = {};
    if (startDate !== plan.startDate) {
      editedFields.startDate = startDate;
    }

    if (endDate !== plan.endDate) {
      editedFields.endDate = endDate;
    }
    console.log(editedFields);

    // ============= Send request =============
    try {
      const URLSafeAppAcronym = encodeURIComponent(planMgmtState.appAcronym);
      const URLSafeMvpName = encodeURIComponent(plan.mvpName);
      await Axios.put(
        `/plan//${URLSafeAppAcronym}/${URLSafeMvpName}`,
        editedFields,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      // Update page state
      planMgmtDispatch({
        type: "edit plan",
        value: {
          ...editedFields,
          mvpName: plan.mvpName
        }
      });

      // Flash message
      appDispatch({
        type: "flash message",
        value: "Successfully edited plan"
      });
    } catch (error) {
      if (error instanceof AxiosError && error.response.status === 401) {
        appDispatch({
          type: "flash message",
          value: "Failed to edit plan"
        });
        checkDispatch({ type: "toggle" });
      } else {
        appDispatch({
          type: "flash message",
          value: "There was an error"
        });
      }
    }
    setIsEditing(false);
  }

  const handleCancel = userId => {
    setIsEditing(false);
  };

  // ======================= UseEffects =======================
  useEffect(() => {
    setStartDate(plan.startDate);
    setEndDate(plan.endDate);
  }, []);

  // Checks if they user can submit changes
  let enableSubmitDebounce;
  useEffect(() => {
    setCanSubmit(false);
    enableSubmitDebounce = setTimeout(() => {
      console.log(startDate, plan.startDate, endDate, plan.endDate);
      if (startDate !== plan.startDate || endDate !== plan.endDate) {
        setCanSubmit(true);
      } else {
        setCanSubmit(false);
      }
    }, 600); // Longer delay to allow passwordError to disable button

    return () => clearTimeout(enableSubmitDebounce);
  }, [startDate, endDate]);

  useEffect(() => {
    console.log(planMgmtState.isProjectManager);
  }, [planMgmtState]);

  // ======================= JSX =======================
  return (
    <tr
      key={index}
      style={{
        textAlign: "center",
        height: "100%"
      }}
    >
      {/* <td
        style={{
          maxWidth: "250px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
      >
        {plan.mvpName}
      </td> */}

      <td>
        <TextField
          id="Plan"
          label="Plan"
          value={plan.mvpName}
          inputProps={{ readOnly: true }}
          disabled={isEditing}
        />
      </td>

      {/* ========== Start / End date edit =========== */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {/* ========== Start date edit =========== */}
        <td>
          <DatePicker
            label="Start date"
            format="DD/MM/YYYY"
            value={dayjs(startDate)}
            onChange={e => {
              console.log(e.format("YYYY-MM-DD"));
              setStartDate(e.format("YYYY-MM-DD"));
            }}
            readOnly={!isEditing}
            slotProps={{
              textField: {
                readOnly: true,
                error: false
              }
            }}
          />
        </td>

        {/* ========== End date edit =========== */}
        <td>
          <DatePicker
            label="End date"
            format="DD/MM/YYYY"
            value={dayjs(endDate)}
            onChange={e => {
              console.log(e.format("YYYY-MM-DD"));
              setEndDate(e.format("YYYY-MM-DD"));
            }}
            readOnly={!isEditing}
            slotProps={{
              textField: {
                readOnly: true,
                error: false
              }
            }}
          />
        </td>
      </LocalizationProvider>

      {/* ========== Buttons =========== */}
      {planMgmtState.isProjectManager && (
        <td
          style={{
            height: "100%",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div style={{ width: "flex", gap: "30px" }}>
            {isEditing ? (
              <>
                <div>
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={handleConfirm}
                    style={{ marginBottom: "5px" }}
                    ref={button => button && button.blur()}
                    disabled={!canSubmit}
                  >
                    Confirm
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={handleCancel}
                    ref={button => button && button.blur()}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleEdit}
                ref={button => button && button.blur()}
                style={{ marginTop: "12px" }}
              >
                Edit
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}

export default EditPlan;
