"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import ThemedToolTip from "./ThemedToolTip";
import { QueueSystem } from "@/class/QueueSystem";

interface CustomerFlowDiagramProps {
  queueSystem: QueueSystem;
  height?: number;
  subGraph?: boolean;
  showTopAxis?: boolean;
  showBottomAxis?: boolean;
}

const CustomerFlowDiagram: React.FC<CustomerFlowDiagramProps> = ({
  queueSystem,
  height,
  subGraph,
  showTopAxis,
  showBottomAxis,
}) => {
  const data = queueSystem.timeLineData;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        mt: subGraph ? 0 : 2,
      }}
    >
      {!subGraph && (
        <Typography variant="h6" component="h3">
          Customer Flow Diagram
        </Typography>
      )}
      <Box
        sx={{
          width: "100%",
          height: height || (isMobile ? 400 : 500),
          borderRadius: subGraph ? 0 : 2,
          border: subGraph ? 0 : 1,
          borderColor: "divider",
          p: subGraph ? 0 : { xs: 0, sm: 4 },
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 30,
              right: 0,
              left: -20,
              bottom: subGraph ? 0 : isMobile ? 30 : 50,
            }}
          >
            <CartesianGrid
              strokeDasharray="2 2"
              strokeOpacity={theme.palette.mode === "dark" ? 0.1 : "0.4"}
            />
            {/* Add time axis at the top */}
            {showTopAxis && (
              <XAxis
                dataKey="time"
                orientation="top"
                xAxisId="top"
                label={{
                  value: "Time (t)",
                  position: "insideTop",
                  offset: -25,
                  fill: theme.palette.text.primary,
                }}
                tick={{
                  dy: -10,
                  fontSize: 8,
                  fill: theme.palette.text.primary,
                }}
                stroke={theme.palette.text.primary}
                interval={queueSystem.arrivalTime - 1}
              />
            )}
            {/* Keep existing bottom axis for customer index */}
            {showBottomAxis && (
              <XAxis
                xAxisId="bottom"
                dataKey="customerIndex"
                orientation="bottom"
                label={{
                  value: "Customer Index",
                  position: "insideBottom",
                  offset: -10,
                  dy: 10,
                  fill: theme.palette.text.primary,
                }}
                height={40}
                tickSize={0}
                tickLine={false}
                tick={{ dy: 10, fontSize: 8 }}
                stroke={theme.palette.text.primary}
              />
            )}
            {!showTopAxis && !showBottomAxis && (
              <XAxis dataKey="time" xAxisId="default" hide={true} />
            )}
            <YAxis
              label={{
                value: "Customer Flow",
                angle: -90,
                position: "insideLeft",
                dx: 20,
                dy: 50,
                fontSize: 12,
                fill: theme.palette.text.primary,
              }}
              tick={{ fontSize: 8 }}
              allowDecimals={false}
              stroke={theme.palette.text.primary}
            />
            <Tooltip content={<ThemedToolTip labelKey="Time" />} />
            <Line
              type="monotone"
              dataKey="arrivalCount"
              stroke="#ffc800"
              name="Arrivals"
              dot={false}
              strokeWidth={2}
              xAxisId={
                showTopAxis ? "top" : showBottomAxis ? "bottom" : "default"
              }
            />
            <Line
              type="monotone"
              dataKey="departureCount"
              stroke="#00a941"
              name="Departures"
              dot={false}
              strokeWidth={2}
              xAxisId={
                showTopAxis ? "top" : showBottomAxis ? "bottom" : "default"
              }
            />
            <Line
              type="monotone"
              dataKey="blockCount"
              stroke="#ff0000"
              name="Blocks"
              dot={false}
              strokeWidth={2}
              xAxisId={
                showTopAxis ? "top" : showBottomAxis ? "bottom" : "default"
              }
            />
            <ReferenceLine
              x={queueSystem.timeSpecialValue}
              xAxisId={
                showTopAxis ? "top" : showBottomAxis ? "bottom" : "default"
              }
              stroke="red"
              label={{
                value: `t = t_i`,
                position: "top",
                fill: "red",
                fontSize: 12,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default CustomerFlowDiagram;
