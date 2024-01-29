import React, { useState, useEffect, useContext, useRef } from "react";
import { useImmer } from "use-immer";
import Axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { TextField, Select } from "@mui/material";

// Custom modules
// Context
import DispatchContext from "../../DispatchContext";
import PlanManagementStateContext from "./PlanManagementStateContext";
import PlanManagementDispatchContext from "./PlanManagementDispatchContext";
import DispatchCheckContext from "../ProtectedRoute/DispatchCheckContext";

function CreatePlan() {
  const navigate = useNavigate();
  // ======================= Context =======================
  const appDispatch = useContext(DispatchContext);
  const planMgmtState = useContext(PlanManagementStateContext);
  const planMgmtDispatch = useContext(PlanManagementDispatchContext);
  const checkDispatch = useContext(DispatchCheckContext);

  // ======================= Row state =======================
  const [createFields, setCreateFields] = useImmer({
    mvpName: "",
    startDate: "",
    endDate: ""
  });

  const [mvpNameError, setMvpNameError] = useState(false);

  function clear() {
    setCreateFields(draft => {
      return {
        mvpName: "",
        startDate: "",
        endDate: ""
      };
    });

    setMvpNameError(false);
  }

  const createUserButtonRef = useRef();

  const [canSubmit, setCanSubmit] = useState(false);

  // ======================= Event Listeners =======================
  async function handleCreatePlan() {
    const newPlan = { ...createFields };

    try {
      await Axios.post(`/plan/${planMgmtState.appAcronym}`, newPlan);

      appDispatch({
        type: "flash message",
        value: "Successfully created plan"
      });
      planMgmtDispatch({ type: "create plan", value: newPlan });

      clear();
    } catch (error) {
      if (error instanceof AxiosError && error.response.status === 409) {
        setMvpNameError(true);
        createUserButtonRef.current.blur();
      } else {
        appDispatch({
          type: "flash message",
          value: "Unauthorised"
        });
        if (error instanceof AxiosError && error.response.status === 401) {
          checkDispatch({ type: "toggle" });
        }
      }
    }
  }

  // ======================= Use effects =======================
  // Checks if they user can submit changes
  let enableSubmitDebounce;
  useEffect(() => {
    setCanSubmit(false);
    enableSubmitDebounce = setTimeout(() => {
      setCanSubmit(createFields.mvpName !== "");
    }, 600);

    return () => clearTimeout(enableSubmitDebounce);
  }, [createFields]);

  return (
    <tr
      key={0}
      style={{
        textAlign: "center",
        height: "100%"
      }}
    >
      <td style={{ maxWidth: "250px" }}>
        <TextField
          error={mvpNameError}
          id="MVP Name"
          label="MVP Name"
          value={createFields.mvpName}
          helperText={mvpNameError ? "Plan already exists" : "Required"}
          onChange={e => {
            setMvpNameError(false);
            setCreateFields(draft => {
              draft.mvpName = e.target.value;
            });
          }}
        />
      </td>

      {/* ========== Start / End date =========== */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {/* ========== Start date =========== */}
        <td>
          <DatePicker
            label="Start date"
            format="DD/MM/YYYY"
            value={dayjs(createFields.startDate)}
            onChange={e => {
              console.log(e.format("YYYY-MM-DD"));
              setCreateFields(draft => {
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
        </td>
        {/* ========== End date =========== */}
        <td>
          <DatePicker
            label="End date"
            format="DD/MM/YYYY"
            value={dayjs(createFields.endDate)}
            onChange={e => {
              console.log(e.format("YYYY-MM-DD"));
              setCreateFields(draft => {
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
        </td>
      </LocalizationProvider>

      {/* ========== Buttons =========== */}
      <td>
        <button
          ref={createUserButtonRef}
          type="button"
          className="btn btn-success btn-sm"
          onClick={handleCreatePlan}
          disabled={!canSubmit}
          style={{ marginTop: "12px" }}
        >
          Create plan
        </button>
      </td>
    </tr>
  );
}

export default CreatePlan;
