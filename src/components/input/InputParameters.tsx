import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid2";
import InfinityLinkIndicator from "../base/InfinityLinkIndicator";
import { Box } from "@mui/material";
import { evaluate, isNaN, fraction, format } from "mathjs"; // Import mathjs

type InputParametersProps = {
  setArrivalRate: (value: string) => void;
  setServiceRate: (value: string) => void;
  arrivalRate: string;
  serviceRate: string;
  setArrivalTime: (value: string) => void;
  setServiceTime: (value: string) => void;
  arrivalTime: string;
  serviceTime: string;
  initialCutsomers?: number;
  setInitialCustomers?: (value: number) => void;
};

const InputParameters: React.FC<InputParametersProps> = ({
  setArrivalRate,
  setServiceRate,
  arrivalRate,
  serviceRate,
  setArrivalTime,
  setServiceTime,
  arrivalTime,
  serviceTime,
}) => {
  const handleServiceRateChange = (value: string) => {
    setServiceRate(value);
    if (value === "") {
      setServiceTime("");
      return;
    }
    try {
      const serviceTime = 1 / evaluate(value);
      if (!isNaN(serviceTime)) {
        setServiceTime(format(fraction(serviceTime), { fraction: 'ratio' }));
      } else {
        setServiceTime("");
      }
    } catch {
      setServiceTime("");
    }
  };

  const handleServiceTimeChange = (value: string) => {
    setServiceTime(value);
    if (value === "") {
      setServiceRate("");
      return;
    }
    try {
      const serviceRate = 1 / evaluate(value);
      if (!isNaN(serviceRate)) {
        setServiceRate(format(fraction(serviceRate), { fraction: 'ratio' }));
      } else {
        setServiceRate("");
      }
    } catch {
      setServiceRate("");
    }
  };

  const handleArrivalRateChange = (value: string) => {
    setArrivalRate(value);
    if (value === "") {
      setArrivalTime("");
      return;
    }
    try {
      const arrivalTime = 1 / evaluate(value);
      if (!isNaN(arrivalTime)) {
        setArrivalTime(format(fraction(arrivalTime), { fraction: 'ratio' }));
      } else {
        setArrivalTime("");
      }
    } catch {
      setArrivalTime("");
    }
  };

  const handleArrivalTimeChange = (value: string) => {
    setArrivalTime(value);
    if (value === "") {
      setArrivalRate("");
      return;
    }
    try {
      const arrivalRate = 1 / evaluate(value);
      if (!isNaN(arrivalRate)) {
        setArrivalRate(format(fraction(arrivalRate), { fraction: 'ratio' }));
      } else {
        setArrivalRate("");
      }
    } catch {
      setArrivalRate("");
    }
  };

  return (
    <Grid container spacing={2}>
      {/* Service Rate-Time */}
      <Grid size={{ xs: 12, sm: 6 }} container spacing={0} alignItems="center">
        {/* Service Rate-Time Infinity Link Indicator */}
        <Grid
          size={{ xs: 1 }}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: "100%",
              justifyContent: "center",
            }}
          >
            <InfinityLinkIndicator />
          </Box>
        </Grid>
        {/* Service Rate-Time Input Fields */}
        <Grid size={{ xs: 11 }}>
          <Grid container spacing={2}>
            {/* Service Rate */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Service Rate (μ)"
                value={serviceRate ?? ""}
                onChange={(e) => handleServiceRateChange(e.target.value)}
                placeholder="Enter service rate"
                fullWidth
              />
            </Grid>

            {/* Service Time */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Service Time (1/μ)"
                value={serviceTime ?? ""}
                onChange={(e) => handleServiceTimeChange(e.target.value)}
                placeholder="Enter service time"
                fullWidth
              />
            </Grid>
          </Grid>
        </Grid>{" "}
        {/* Service Rate-Time Input Fields */}
      </Grid>
      {/* Service Rate-Time And Infinity Link Indicator  */}

      {/* Arrival Rate-Time And Infinity Link Indicator */}
      <Grid size={{ xs: 12, sm: 6 }} container spacing={0} alignItems="center">
        {/* Arrival Rate-Time Infinity Link Indicator */}
        <Grid
          size={{ xs: 1 }}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: "100%",
              justifyContent: "center",
            }}
          >
            <InfinityLinkIndicator />
          </Box>
        </Grid>

        {/* Arrival Rate-Time Input Fields */}
        <Grid size={{ xs: 11 }}>
          <Grid container spacing={2}>
            {/* Arrival Rate */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Arrival Rate (λ)"
                value={arrivalRate || ""}
                onChange={(e) => handleArrivalRateChange(e.target.value)}
                placeholder="Enter arrival rate"
                fullWidth
              />
            </Grid>

            {/* Arrival Time */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Arrival Time (1/λ)"
                value={arrivalTime || ""}
                onChange={(e) => handleArrivalTimeChange(e.target.value)}
                placeholder="Enter arrival time"
                fullWidth
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default InputParameters;
