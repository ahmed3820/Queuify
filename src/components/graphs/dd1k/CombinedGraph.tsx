/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { DD1KType } from "@/types/dd1k";
import DD1K from "@/lib/dd1k";
import { colors } from "@/constants";

const ColorMap = {
  arrivals: "#8884d8",
  departures: "#82ca9d",
  blocked: "red",
  customers: "#2db300",
  waitingTime: "#ff00a2",
};

// Custom tooltip to show correct values
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  data: any[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  data,
}) => {
  if (active && payload?.length) {
    const originalData = data.find((d) => d.time === label);
    return (
      <div className="custom-tooltip">
        <p className="label" color="text.primary">
          {" "}
          {`Time: ${label}`}{" "}
        </p>
        <p
          className="intro"
          color={ColorMap.arrivals}
        >{`Arrivals: ${originalData.arrivals}`}</p>
        <p
          className="intro"
          color={ColorMap.departures}
        >{`Departures: ${originalData.departures}`}</p>
        <p
          className="intro"
          color={ColorMap.blocked}
        >{`Blocked: ${originalData.blocked}`}</p>
        <p
          className="intro"
          color={ColorMap.customers}
        >{`Customers in the System: ${originalData.customers}`}</p>
        <p
          className="intro"
          color={ColorMap.waitingTime}
        >{`Waiting Time: ${originalData.waitingTime}`}</p>
      </div>
    );
  }

  return null;
};

interface CombinedGraphProps {
  arrivalRate: number;
  serviceRate: number;
  capacity: number;
  t_i: number;
  systemType: DD1KType;
  height?: number;
}

const CombinedGraph: React.FC<CombinedGraphProps> = ({
  arrivalRate,
  serviceRate,
  capacity,
  t_i,
  systemType,
  height,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const maxTime = DD1K.graphMaxTime(t_i);

  // First generate basic data without timeline
  const generateBasicData = () => {
    const data = [];
    const timeStep = 1 / arrivalRate;
    const serviceTime = 1 / serviceRate;
    const firstServiceTime = 1 / arrivalRate;
    const firstDepartureTime = 1 / arrivalRate + serviceTime;
    let totalBlocked = 0;
    let currentCustomer = 1;

    for (let t = 0; t <= maxTime; t += timeStep) {
      const arrivals = Math.floor(t * arrivalRate);
      const departures = Math.floor(t * serviceRate);
      const isBlocked = DD1K.isCustomerBlocked(
        t,
        arrivalRate,
        serviceRate,
        capacity,
        t_i,
        systemType
      );

      if (isBlocked) {
        totalBlocked++;
      }

      const customers = DD1K.computeNOfT(
        t,
        arrivalRate,
        serviceRate,
        t_i,
        capacity,
        systemType
      );

      const waitingTime = DD1K.computeWqOfN(
        customers,
        arrivalRate,
        serviceRate,
        t_i,
        systemType
      );

      const customerNumber = Math.floor(t * arrivalRate) + 1; // Add this line

      data.push({
        time: Math.round(t).toString(), // Ensure time is rounded to whole numbers
        customer: customerNumber.toString(), // Add this line
        arrivals: arrivals,
        departures: departures,
        blocked: totalBlocked,
        customers: customers,
        waitingTime: waitingTime,
        service:
          t >= firstServiceTime &&
          (t - firstServiceTime) % serviceTime < timeStep
            ? currentCustomer
            : null,
        departure:
          t >= firstDepartureTime &&
          (t - firstDepartureTime) % serviceTime < timeStep
            ? currentCustomer++
            : null,
        customerIndex: `C${currentCustomer}`, // Ensure customerIndex is defined
      });
    }
    return data;
  };

  const basicData = generateBasicData();

  // Calculate section heights and values all at once
  const maxValues = {
    metrics: Math.max(
      ...basicData.map((d) => Math.max(d.arrivals, d.departures, d.blocked))
    ),
    customers: Math.max(...basicData.map((d) => d.customers)),
    waitingTime: Math.max(...basicData.map((d) => d.waitingTime)),
    timeline: 0.5, // Fixed height for timeline
  };

  // Calculate section height and spacing
  const maxSectionValue = Math.max(...Object.values(maxValues));
  const sectionHeight = maxSectionValue;
  const sectionSpacing = sectionHeight * 0.25;

  // Define vertical offsets
  const yAxisOffsets = {
    metrics: 0,
    customers: sectionHeight + sectionSpacing,
    timeline: (sectionHeight + sectionSpacing) * 2 + sectionSpacing,
    waitingTime: (sectionHeight + sectionSpacing) * 3 + sectionSpacing,
  };

  // Add timeline data and scale everything
  const adjustedData = basicData.map((entry) => ({
    ...entry,
    // Scale metrics
    arrivals:
      entry.arrivals * (sectionHeight / maxValues.metrics) +
      yAxisOffsets.metrics,
    departures:
      entry.departures * (sectionHeight / maxValues.metrics) +
      yAxisOffsets.metrics,
    blocked:
      entry.blocked * (sectionHeight / maxValues.metrics) +
      yAxisOffsets.metrics,
    // Scale customers
    customers:
      entry.customers * (sectionHeight / maxValues.customers) +
      yAxisOffsets.customers,
    // Scale waiting time
    waitingTime:
      entry.waitingTime * (sectionHeight / maxValues.waitingTime) +
      yAxisOffsets.waitingTime,
    // Add timeline
    timeline: entry.service
      ? yAxisOffsets.timeline + sectionHeight * 0.5
      : yAxisOffsets.timeline,
    timelineCustomer: entry.service || null,
    timelineColor: entry.service
      ? colors[entry.service % colors.length]
      : "transparent",
  }));

  const totalHeight = yAxisOffsets.waitingTime + sectionHeight;

  // Add reference lines for section divisions
  const sectionDividers = [
    sectionHeight + sectionSpacing / 2,
    yAxisOffsets.customers + sectionHeight + sectionSpacing / 2,
    yAxisOffsets.timeline + sectionHeight + sectionSpacing / 2,
  ];

  // Add section labels for Y-axis with spacing
  const yAxisTicks = [
    0,
    sectionHeight / 2,
    sectionHeight,
    yAxisOffsets.customers + sectionHeight / 2,
    yAxisOffsets.customers + sectionHeight,
    yAxisOffsets.waitingTime + sectionHeight / 2,
    totalHeight,
  ];

  // Scale factors for each section (add this before the Y-axis definition)
  const scaleFactors = {
    metrics: sectionHeight / maxValues.metrics,
    customers: sectionHeight / maxValues.customers,
    waitingTime: sectionHeight / maxValues.waitingTime,
  };

  // Instead of one timeline line, create multiple lines for each customer
  const timelineLines = Array.from(
    new Set(basicData.filter((d) => d.service).map((d) => d.service))
  ).map((customerNumber) => (
    <Line
      key={`timeline-${customerNumber}`}
      type="step"
      data={adjustedData.filter((d) => d.timelineCustomer === customerNumber)}
      dataKey="timeline"
      xAxisId="bottom"
      stroke={colors[customerNumber % colors.length]}
      name={`Customer ${customerNumber}`}
      dot={false}
      strokeWidth={3}
    />
  ));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
      <Typography variant="h6" component="h3">
        Combined Graph
      </Typography>
      <Box
        sx={{
          width: "100%",
          height: height || (isMobile ? 800 : 1000),
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
          p: { xs: 0, sm: 4 },
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={adjustedData}
            margin={{
              top: 50, // Reduced from 80
              right: 30,
              left: isMobile ? 20 : 90,
              bottom: 50, // Reduced from 80
            }}
          >
            <CartesianGrid strokeDasharray="12 12" />
            <XAxis
              dataKey="time"
              xAxisId="bottom"
              label={{
                value: "Time (t)",
                position: "insideBottom",
                offset: -10, // Adjusted from -20
              }}
              height={50} // Increased from 40
              tick={{ dy: 10 }}
              stroke={theme.palette.text.primary} // Add stroke color
              // ticks={getTimeAxisTicks(maxTime, arrivalRate)} // Add this back
            />
            <XAxis
              dataKey="customer"
              xAxisId="top"
              orientation="top"
              label={{
                value: "Customer (n)",
                position: "insideTop",
                offset: -10, // Adjusted from -20
              }}
              height={50} // Increased from 40
              tick={{ dy: -10 }}
              // ticks={Array.from({ length: 4 + 1 }, (_, i) => i.toString())} // Sequential numbers
              stroke={theme.palette.text.primary} // Add stroke color
            />
            <YAxis
              label={{
                value: "Combined Metrics",
                angle: -90,
                position: "insideLeft",
                dx: isMobile ? 10 : -20,
                dy: 90,
              }}
              allowDecimals={false}
              domain={[0, totalHeight]}
              ticks={yAxisTicks}
              tickFormatter={(value) => {
                // Convert back to original scale based on section
                if (value <= sectionHeight) {
                  return Math.round(value / scaleFactors.metrics).toString();
                } else if (value <= 2 * sectionHeight) {
                  return Math.round(
                    (value - yAxisOffsets.customers) / scaleFactors.customers
                  ).toString();
                } else {
                  return Math.round(
                    (value - yAxisOffsets.waitingTime) /
                      scaleFactors.waitingTime
                  ).toString();
                }
              }}
              stroke={theme.palette.text.primary}
            />
            {/* Add section dividers */}
            {sectionDividers.map((height) => (
              <ReferenceLine
                key={`divider-${height}`}
                y={height}
                stroke={theme.palette.divider}
                strokeDasharray="3 3"
                xAxisId={"bottom"}
              />
            ))}
            <Tooltip content={<CustomTooltip data={basicData} />} />
            {/* Add lines for each metric */}
            <Line
              type="monotone"
              dataKey="arrivals"
              xAxisId="bottom" // Specify xAxisId
              stroke={ColorMap.arrivals}
              name="Arrivals"
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="departures"
              xAxisId="bottom" // Specify xAxisId
              stroke={ColorMap.departures}
              name="Departures"
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="blocked"
              xAxisId="bottom" // Specify xAxisId
              stroke="red"
              name="Blocked"
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="stepAfter"
              dataKey="customers"
              xAxisId="bottom" // Specify xAxisId
              stroke={ColorMap.customers}
              name="Customers in System"
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="stepAfter"
              dataKey="waitingTime"
              xAxisId="top" // Ensure xAxisId matches the top XAxis
              stroke={ColorMap.waitingTime}
              name="Waiting Time"
              dot={false}
              strokeWidth={2}
            />
            {/* Replace single timeline line with multiple lines */}
            {timelineLines}
            <ReferenceLine
              x={t_i}
              xAxisId="bottom" // Explicitly set to "bottom"
              stroke={theme.palette.warning.main}
              label={{
                value: `t = t_i`,
                position: "top",
                fill: theme.palette.warning.main,
                fontSize: 12,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default CombinedGraph;
