import React, { useState, useEffect, useContext } from "react";
import Axios, { AxiosError } from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useImmerReducer } from "use-immer";
import { Typography, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

// Custom modules
import Page from "../Page";
import EditPlan from "./EditPlan";
import LoadingDotsIcon from "../LoadingDotsIcon";

// Context
import DispatchContext from "../../DispatchContext";
import PlanManagementStateContext from "./PlanManagementStateContext";
import PlanManagementDispatchContext from "./PlanManagementDispatchContext";
import CreatePlan from "./CreatePlan";

function PlanManagement() {
  const { appAcronym } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const appDispatch = useContext(DispatchContext);
  const navigate = useNavigate();

  function planMgmtReducer(draft, action) {
    switch (action.type) {
      case "populate plans":
        draft.plans = action.value;
        break;
      case "create plan":
        const newPlan = action.value;
        draft.plans.push(newPlan);
        break;
      case "edit plan":
        const plan = draft.plans.find(
          plan => plan.mvpName === action.value.mvpName
        );
        console.log("======", plan);

        plan.startDate = action.value.startDate
          ? action.value.startDate
          : plan.startDate;
        plan.endDate = action.value.endDate
          ? action.value.endDate
          : plan.endDate;
        break;
      case "set isProjectManager":
        draft.isProjectManager = action.value;
    }
  }
  const [state, dispatch] = useImmerReducer(planMgmtReducer, {
    appAcronym,
    isProjectManager: false,
    plans: []
  });

  useEffect(() => {
    async function initialiseState() {
      console.log("=== Initialising State for Plan Management");
      try {
        console.log(`Getting plans for <${appAcronym}>`);
        const urlSafeAppAcronym = encodeURIComponent(appAcronym);
        var allPlansResponse = await Axios.get(`/plan/${urlSafeAppAcronym}`);
        console.log("Response\n", allPlansResponse);
      } catch (error) {
        console.log(error);
        navigate("/");
        appDispatch({ type: "flash message", value: "There was an error" });
        return;
      }

      try {
        console.log("Checking user is project manager");
        const URLSafeGroup = encodeURI("project manager");
        await Axios.get(`/auth/verify/${URLSafeGroup}`);
        dispatch({ type: "set isProjectManager", value: true });
      } catch (error) {
        if (error instanceof AxiosError && error.response.status === 401) {
          dispatch({ type: "set isProjectManager", value: false });
        } else {
          console.log(error);
          navigate("/");
          appDispatch({ type: "flash message", value: "There was an error" });
          return;
        }
      }

      dispatch({
        type: "populate plans",
        value: allPlansResponse.data.plans.sort((plan1, plan2) => {
          const startDate1 = new Date(plan1.startDate);
          const startDate2 = new Date(plan2.startDate);
          if (startDate1 - startDate2 === 0) {
            const endDate1 = new Date(plan1.endDate);
            const endDate2 = new Date(plan2.endDate);

            return endDate1 - endDate2;
          } else {
            return startDate1 - startDate2;
          }
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
        <Page title="User Management">
          <PlanManagementStateContext.Provider value={state}>
            <PlanManagementDispatchContext.Provider value={dispatch}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {/* ============ Back button ============ */}
                <Link to={`/kanban/${appAcronym}`}>
                  <Button>
                    <ArrowBack fontSize="large" />
                  </Button>
                </Link>
                {/* ============ Title ============ */}
                <Typography variant="h3" style={{ textAlign: "left" }}>
                  {appAcronym} plans
                </Typography>
              </div>
              <table className="table">
                <thead className="thead-light">
                  <tr>
                    <th>MVP Name</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    {state.isProjectManager && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {state.isProjectManager && <CreatePlan />}
                  {state.plans.length > 0 &&
                    state.plans.map((plan, index) => {
                      return (
                        <EditPlan
                          plan={plan}
                          index={index + 1}
                          key={index + 1}
                        />
                      );
                    })}
                </tbody>
              </table>
              {state.plans.length === 0 && !state.isProjectManager && (
                <Typography variant="h5">No plans yet</Typography>
              )}
            </PlanManagementDispatchContext.Provider>
          </PlanManagementStateContext.Provider>
        </Page>
      )}
    </>
  );
}

export default PlanManagement;
