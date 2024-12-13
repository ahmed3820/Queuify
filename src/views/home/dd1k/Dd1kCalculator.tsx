"use client";

import React, { JSX, useEffect, useState } from "react";
import { evaluate, format, fraction } from "mathjs"; // Import evaluate from mathjs
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import InputParameters from "@/components/input/InputParameters";
import DD1KResults from "@/components/output/DD1K/DD1KResults";
import { Box, Container } from "@mui/material";
import Grid from "@mui/material/Grid2";
import dd1kFactoryMethod from "@/class/dd1k/dd1kFactoryMethod";
import Dd1kSystemParameters from "./Dd1kSystemParameters";
import { NoNumberArrowsTextField } from "@/components/base/NoNumberArrowsTextField";
import { isValidPositiveInteger, isValidPositiveNumber } from "@/lib/math";
import { getFromLocalStorage } from "@/utils/localstorage";

export const dd1kCapacityKey = "dd1k-capacity";
const serviceRateKey = "dd1k-serviceRate";
const arrivalRateKey = "dd1k-arrivalRate";
const initialCustomersKey = "dd1k-initialCustomers";

let init = true;

const Dd1kCalculator: React.FC = () => {
  // dd1k
  const [capacity, setCapacity] = useState<string>("");
  const [arrivalRate, setArrivalRate] = useState<string>("");
  const [arrivalTime, setArrivalTime] = useState("");

  const [serviceRate, setServiceRate] = useState<string>("");
  const [serviceTime, setServiceTime] = useState("");

  const [initialCustomers, setInitialCustomers] = useState<string>("");

  useEffect(() => {
    if (init) {
      init = false;
      const savedServiceRate = getFromLocalStorage(serviceRateKey, "");
      const evaluatedServiceRate = evaluate(savedServiceRate + "");
      if (isValidPositiveNumber(evaluatedServiceRate)) {
        setServiceRate(
          Number.isInteger(evaluatedServiceRate)
            ? evaluatedServiceRate
            : format(fraction(evaluatedServiceRate), { fraction: "ratio" })
        );
        const serviceTime = 1 / evaluatedServiceRate;
        setServiceTime(
          Number.isInteger(serviceTime)
            ? serviceTime.toString()
            : format(fraction(serviceTime), { fraction: "ratio" })
        );
      }

      const savedArrivalRate = getFromLocalStorage(arrivalRateKey, "");
      const evaluatedArrivalRate = evaluate(savedArrivalRate + "");
      if (isValidPositiveNumber(evaluatedArrivalRate)) {
        setArrivalRate(
          Number.isInteger(evaluatedArrivalRate)
            ? evaluatedArrivalRate
            : format(fraction(evaluatedArrivalRate), { fraction: "ratio" })
        );
        const arrivalTime = 1 / evaluatedArrivalRate;
        setArrivalTime(
          Number.isInteger(arrivalTime)
            ? arrivalTime.toString()
            : format(fraction(arrivalTime), { fraction: "ratio" })
        );
      }

      if (evaluatedArrivalRate <= evaluatedServiceRate) {
        console.log("isInitialCutsomersRequired", true);
        setIsInitialCutsomersRequired(true);
      } else {
        setIsInitialCutsomersRequired(false);
      }

      const savedInitialCustomers = getFromLocalStorage(
        initialCustomersKey,
        null
      );
      const evaluateInitialCustomers = evaluate(savedInitialCustomers + "");
      if (isValidPositiveInteger(evaluateInitialCustomers)) {
        setInitialCustomers(evaluateInitialCustomers);
      }
    }
  }, []);

  const [isInitialCutsomersRequired, setIsInitialCutsomersRequired] =
    useState(false);

  // mmxy
  const [error, setError] = useState("");
  const [results, setResults] = useState<JSX.Element | null>(null);

  useEffect(() => {
    if (arrivalRate === "" || serviceRate === "") {
      setIsInitialCutsomersRequired(false);
    } else {
      try {
        const evaluatedArrivalRate = evaluate(arrivalRate + "");
        const evaluatedServiceRate = evaluate(serviceRate + "");
        if (evaluatedArrivalRate <= evaluatedServiceRate) {
          setIsInitialCutsomersRequired(true);
          console.log("isInitialCutsomersRequired", true);
        } else {
          setIsInitialCutsomersRequired(false);
          console.log("isInitialCutsomersRequired", false);
        }
      } catch {
        setIsInitialCutsomersRequired(false);
        console.log("isInitialCutsomersRequired", false);
      }
    }
  }, [arrivalRate, serviceRate]);

  useEffect(() => {
    localStorage.setItem(dd1kCapacityKey, capacity);
  }, [capacity]);

  useEffect(() => {
    localStorage.setItem(arrivalRateKey, arrivalRate);
  }, [arrivalRate]);

  useEffect(() => {
    localStorage.setItem(serviceRateKey, serviceRate);
  }, [serviceRate]);

  useEffect(() => {
    localStorage.setItem(initialCustomersKey, initialCustomers);
  }, [initialCustomers]);

  const handleCalculate = () => {
    let evaluatedCapacity;
    try {
      evaluatedCapacity = evaluate(capacity + "");
      if (!isValidPositiveNumber(evaluatedCapacity)) {
        setError("'K' must be +Integer");
        return;
      }
    } catch {
      setError(" 'K' must be +Integer");
      return;
    }

    let evaluatedServiceRate;
    try {
      evaluatedServiceRate = evaluate(serviceRate + "");
      if (!isValidPositiveNumber(evaluatedServiceRate)) {
        setError("'μ': must be +Number");
        return;
      }
    } catch {
      setError("'μ': must be +Number");
      return;
    }

    let evaluatedArrivalRate;
    try {
      evaluatedArrivalRate = evaluate(arrivalRate + "");
      if (!isValidPositiveNumber(evaluatedArrivalRate)) {
        setError("'λ': must be +Number");
        return;
      }
    } catch {
      setError("'λ': must be +Number");
      return;
    }

    let evaluateInitialCustomers;

    if (isInitialCutsomersRequired) {
      try {
        evaluateInitialCustomers = evaluate(initialCustomers + "");
        if (!isValidPositiveInteger(evaluateInitialCustomers)) {
          setError("M: must be +Integer");
          return;
        }
      } catch (e) {
        setError("'M': must be +Integer");
        console.error(e.message);
        return;
      }
    }

    // Clear previous errors and results
    setError("");
    setResults(null);

    const M = isInitialCutsomersRequired ? evaluateInitialCustomers : undefined;
    try {
      const dd1k = dd1kFactoryMethod(
        evaluatedArrivalRate,
        evaluatedServiceRate,
        evaluatedCapacity,
        M
      );
      setResults(<DD1KResults dd1k={dd1k} />);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Container
      // maxWidth="lg"
      sx={(theme) => ({
        py: 4,
        maxWidth: "100%",
        [theme.breakpoints.up("xs")]: {
          maxWidth: "100%",
        },
        [theme.breakpoints.up("sm")]: {
          maxWidth: theme.breakpoints.values.lg,
        },
        [theme.breakpoints.up("md")]: {
          maxWidth: theme.breakpoints.values.md,
        },
        marginLeft: "auto",
        marginRight: "auto",
        t: 0,
        p: 0,
        borderRadius: 0,
      })}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Dd1kSystemParameters setCapacity={setCapacity} capacity={capacity} />
        <InputParameters
          setArrivalRate={setArrivalRate}
          setServiceRate={setServiceRate}
          arrivalRate={arrivalRate}
          serviceRate={serviceRate}
          setArrivalTime={setArrivalTime}
          setServiceTime={setServiceTime}
          arrivalTime={arrivalTime}
          serviceTime={serviceTime}
        />
        {isInitialCutsomersRequired && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }} container>
              {/* Empty Column */}
              <Grid size={1} />
              <Grid size={11}>
                <NoNumberArrowsTextField
                  value={initialCustomers}
                  placeholder={"Initial Customers: M"}
                  label="Initial Customers: M"
                  fullWidth
                  required={isInitialCutsomersRequired}
                  autoComplete={"dd1k-initial-customers"}
                  onChange={(e) => {
                    setInitialCustomers(e.target.value);
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        )}
        <Grid size={12} container spacing={0} alignItems="start">
          {/* Empty Column */}
          <Grid size={1} />
          <Grid size={11} justifyContent={"start"}>
            <Button variant="contained" onClick={handleCalculate} fullWidth>
              Analyze
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box mt={4}>
        {error && (
          <Alert
            variant="standard"
            severity="error"
            sx={{
              mb: 4,
              fontWeight: "600",
              letterSpacing: "2",
              fontFamily: "sans-serif",
            }}
          >
            {error}
          </Alert>
        )}

        {results}
      </Box>
    </Container>
  );
};

export default Dd1kCalculator;
