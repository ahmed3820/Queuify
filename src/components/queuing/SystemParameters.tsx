import { TextField, IconButton } from "@mui/material";
import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid2";
import { styled } from "@mui/system";
import { InfinityIcon } from "lucide-react";

type SystemParametersProps = {
  setServers: (servers: number | undefined) => void;
  setCapacity: (capacity: number | undefined) => void;
  servers: number | undefined;
  capacity: number | undefined;
  queueType: string;
};

const SystemParameters: React.FC<SystemParametersProps> = ({
  setServers,
  setCapacity,
  servers,
  capacity,
  queueType,
}) => {
  const [capacityMinusOne, setCapacityMinusOne] = useState<number | undefined>(
    capacity - 1
  );

  useEffect(() => {
    setCapacityMinusOne(capacity - 1);
  }, [capacity]);

  useEffect(() => {
    setCapacity(capacityMinusOne + 1);
  }, [capacityMinusOne, setCapacity]);

  const handleInfinityClick = (setter) => {
    console.log("infinity clicked");
    setter(undefined);
  };

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    setter(value === "" ? "∞" : parseInt(value));
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <InputWithInfinity
          id="servers"
          label="Number of Servers (c)"
          value={servers}
          onChange={handleInputChange(setServers)}
          onInfinityClick={() => handleInfinityClick(setServers)}
          autoComplete="servers"
        />
      </Grid>
      {queueType === "D/D" && (
        <Grid size={{ xs: 12, sm: 6 }}>
          <InputWithInfinity
            id="capacityMinusOne"
            label="System Capacity - 1 (K-1)"
            value={capacityMinusOne}
            onChange={handleInputChange(setCapacityMinusOne)}
            onInfinityClick={() => handleInfinityClick(setCapacityMinusOne)}
            autoComplete="capacity - 1"
          />
        </Grid>
      )}
      <Grid size={{ xs: 12, sm: 6 }}>
        <InputWithInfinity
          id="capacity"
          label="System Capacity (K)"
          value={capacity}
          onChange={handleInputChange(setCapacity)}
          onInfinityClick={() => handleInfinityClick(setCapacity)}
          autoComplete="capacity"
        />
      </Grid>
    </Grid>
  );
};

type InputWithInfinityProps = {
  id: string;
  label: string;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInfinityClick?: () => void;
  required?: boolean;
  autoComplete?: string;
};

const NoNumberArrowsTextField = styled(TextField)({
  "& input[type=number]": {
    "-moz-appearance": "textfield",
  },
  "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
    {
      "-webkit-appearance": "none",
      margin: 0,
    },
});

const InputWithInfinity: React.FC<InputWithInfinityProps> = ({
  id,
  label,
  value,
  onChange,
  onInfinityClick = () => {},
  required = false,
  autoComplete,
}) => (
  <NoNumberArrowsTextField
    id={id}
    value={value === undefined ? "" : value}
    onChange={onChange}
    placeholder="∞"
    label={label}
    type="number"
    fullWidth
    required={required}
    autoComplete={autoComplete}
    size="small"
    slotProps={{
      input: {
        endAdornment: (
          <IconButton
            color="primary"
            onClick={onInfinityClick}
            sx={{ minWidth: "40px" }}
          >
            <InfinityIcon />
          </IconButton>
        ),
      },
    }}
  />
);

export default SystemParameters;
