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
import { QueueSystem } from "@/class/QueueSystem";
import CustomerToolTip from "./CustomerToolTip";

interface CustomerTimeGraphProps {
  queueSystem: QueueSystem;
  height?: number;
  subGraph?: boolean;
  showTopAxis?: boolean;
  showBottomAxis?: boolean;
}

import { DotProps } from "recharts";

const CustomDot = (props: DotProps & { payload: { blocked: boolean } }) => {
  const { cx, cy, payload } = props;
  if (payload.blocked) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        stroke="none"
        fill={props.stroke}
      />
    );
  }
  return null;
};

const CustomerTimeGraph: React.FC<CustomerTimeGraphProps> = ({
  queueSystem,
  height,
  subGraph,
  showTopAxis,
  showBottomAxis,
}) => {
  const data = queueSystem.customers;

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
          Waiting Time vs Customer Number
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
              top: 20,
              right: 0,
              left: -20,
              bottom: isMobile ? 30 : 50,
            }}
          >
            <CartesianGrid
              strokeDasharray="2 2"
              strokeOpacity={theme.palette.mode === "dark" ? 0.1 : "0.4"}
            />
            {!showTopAxis && !showBottomAxis && (
              <XAxis dataKey="customer" xAxisId="default" hide={true} />
            )}
            {showTopAxis && (
              <XAxis
                dataKey="customerId"
                xAxisId="top"
                orientation="top"
                label={{
                  value: "nth Customer",
                  position: "insideTop",
                  offset: -25,
                  fill: theme.palette.text.primary,
                }}
                tick={{ dy: -10 }}
              />
            )}
            {showBottomAxis && (
              <XAxis
                dataKey="customerId"
                xAxisId="bottom"
                orientation="bottom"
                label={{
                  value: "Customer (n)",
                  position: "insideBottom",
                  offset: -10,
                  dy: -8,
                  fontSize: 12,
                  fill: theme.palette.text.primary,
                }}
                height={40}
                tick={{
                  dy: 10,
                  fontSize: 8,
                  fill: theme.palette.text.primary,
                }}
                stroke={theme.palette.primary.main}
              />
            )}
            <YAxis
              label={{
                value: "Waiting Time Wq(n)",
                angle: -90,
                position: "insideLeft",
                dx: 20,
                dy: 40,
                fontSize: isMobile ? 8 : 12,
                fill: theme.palette.text.primary,
              }}
              stroke={theme.palette.text.primary}
              allowDecimals={true}
              tick={{ fontSize: 8, fill: theme.palette.text.primary }}
            />
            <Tooltip content={<CustomerToolTip />} />
            <Line
              type="stepAfter"
              dataKey="waitingInQueueTime"
              stroke={theme.palette.mode === "dark" ? "#e6591c" : "#db581f"}
              name="WQ"
              dot={false}
              strokeWidth={2}
              xAxisId={
                showTopAxis ? "top" : showBottomAxis ? "bottom" : "default"
              }
            />
            <Line
              type="stepAfter"
              dataKey="waitingInSystemTime"
              stroke={theme.palette.mode === "dark" ? "#e61c9f" : "#920761"}
              name="W"
              dot={false}
              strokeWidth={2}
              xAxisId={
                showTopAxis ? "top" : showBottomAxis ? "bottom" : "default"
              }
            />
            <Line
              type="stepAfter"
              dataKey="blocked"
              stroke={theme.palette.mode === "dark" ? "#ff0000" : "#ff0000"}
              name="Blocked"
              dot={(props) => {
                const { key, ...restProps } = props;
                return <CustomDot key={key} {...restProps} />;
              }}
              activeDot={(props) => {
                const { key, ...restProps } = props;
                return <CustomDot key={key} {...restProps} />;
              }}
              strokeWidth={0}
              xAxisId={
                showTopAxis ? "top" : showBottomAxis ? "bottom" : "default"
              }
            />
            <ReferenceLine
              x={queueSystem.lambdaTiFloored}
              xAxisId={
                showTopAxis ? "top" : showBottomAxis ? "bottom" : "default"
              }
              stroke="red"
              label={{
                value: `n = ⌊λ*t_i⌋`,
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

export default CustomerTimeGraph;
