"use client";

import React from "react";
import {
  LineChart,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  YAxis,
} from "recharts";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";

import { DD1KType } from "@/types/dd1k";
import DD1K from "@/lib/dd1k";

interface ArrivalTimelineProps {
  arrivalRate: number;
  serviceRate: number;
  capacity: number;
  t_i: number;
  systemType: DD1KType;
}

const colors = [
  "#4287f5", // Blue
  "#42f5b3", // Turquoise
  "#8442f5", // Purple
  "#42d4f5", // Sky Blue
  "#42f578", // Green
  "#b942f5", // Violet
  "#42f5e9", // Cyan
];

const ArrivalTimeline: React.FC<ArrivalTimelineProps> = ({
  arrivalRate,
  serviceRate,
  capacity,
  t_i,
  systemType,
}) => {
  const generateData: () => Array<{
    time: string;
    arrival: number;
    blocked: boolean;
  }> = () => {
    const data = [];
    const maxTime = DD1K.graphMaxTime(t_i);
    const timeStep = 1 / arrivalRate;

    // Start with t=0 for initial state
    data.push({
      time: "0",
      arrival: 0,
      blocked: false,
    });

    // Generate rest of the timeline
    for (let t = timeStep; t <= maxTime; t += timeStep) {
      const arrivals = Math.floor(t * arrivalRate);
      const blocked = DD1K.isCustomerBlocked(
        t,
        arrivalRate,
        serviceRate,
        capacity,
        t_i,
        systemType
      );
      data.push({
        time: Math.round(t).toString(), // Round time to whole numbers
        arrival: arrivals,
        blocked: blocked,
      });
    }
    return data;
  };

  const data = generateData();

  // Add customer indices to data
  const dataWithCustomers = data.map((point, index) => ({
    ...point,
    customerIndex: index > 0 ? `C${index}` : "", // First index is empty
  }));

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        mt: 2,
      }}
    >
      <Typography variant="h6" component="h3">
        Arrival Timeline
      </Typography>
      <Box
        sx={{
          width: "100%",
          height: isMobile ? 400 : 500,
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
          p: { xs: 0, sm: 4 },
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={dataWithCustomers}
            margin={{
              top: 20,
              right: 0,
              left: isMobile ? 0 : 90,
              bottom: isMobile ? 30 : 50,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            {/* Top time axis */}
            <XAxis
              dataKey="time"
              orientation="top"
              label={{
                value: "Time (t)",
                position: "insideTop",
                offset: -25, // Increased from -20
              }}
              tick={{ dy: -10 }} // Add this line to move ticks up
            />
            {/* Bottom customer index axis */}
            <XAxis
              xAxisId="customer"
              dataKey="customerIndex"
              orientation="bottom"
              label={{
                value: "Customer Index",
                position: "insideBottom",
                offset: -10,
                dy: 10,
              }}
              height={40} // Add height for better visibility
              tick={{ dy: 10 }} // Move ticks down
            />
            <YAxis 
              label={{
                value: "Arrival Times",
                angle: -90,
                position: "insideLeft",
                dx: isMobile ? 10 : -20,
                dy: isMobile ? 90 : 90,
              }}
            />
            <Tooltip />
            {dataWithCustomers.map((entry, index) => (
              <ReferenceLine
                key={index}
                x={entry.time}
                xAxisId={0} // Explicitly use top axis
                stroke={
                  entry.time === "0"
                    ? "transparent"
                    : entry.blocked
                      ? "red"
                      : colors[index % colors.length]
                }
                label={
                  entry.blocked
                    ? {
                        value: '⊗',
                        position: "top",
                        fill: "red",
                        fontSize: 12,
                      }
                    : undefined
                }
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
      <Typography
        variant="caption"
        sx={{ color: "red", mt: 1, textAlign: "center" }}
      >
        ⊗ Red lines indicate blocked customers
      </Typography>
    </Box>
  );
};

export default ArrivalTimeline;
