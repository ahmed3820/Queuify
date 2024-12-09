"use client";

import React from "react";
import NumberOfCustomersGraph from "./NumberOfCustomersGraph";
import WaitingTimeGraph from "./WaitingTimeGraph";
import { DD1KType } from "@/types/dd1k";
import { Box } from "@mui/material";
import CustomerFlowDiagram from "./CustomerFlowDiagram";
import ArrivalTimeline from "./ArrivalTimeline";
import ServiceTimeline from "./ServiceTimeline";
import DepartureTimeline from "./DepartureTimeline";
import CombinedGraph from "./CombinedGraph"; // Import CombinedGraph

interface DD1KGraphContainerProps {
  arrivalRate: number;
  serviceRate: number;
  capacity: number;
  t_i: number;
  systemType: DD1KType;
}

const GRAPH_HEIGHT = 300; // Height for each sub-graph

const DD1KGraphContainer: React.FC<DD1KGraphContainerProps> = (props) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          mt: 2,
        }}
      ></Box>
      <WaitingTimeGraph
        {...props}
        height={GRAPH_HEIGHT}
        subGraph={true}
        showTopAxis={false}
        showBottomAxis={true}
      />
      <CombinedGraph {...props} height={1000} /> {/* Add CombinedGraph */}
      <CustomerFlowDiagram
        {...props}
        height={GRAPH_HEIGHT}
        subGraph={true}
        showTopAxis={true}
        showBottomAxis={false}
      />
      {/* <ArrivalTimeline
        {...props}
        height={GRAPH_HEIGHT}
        subGraph={true}
        showTopAxis={false}
        showBottomAxis={false}
      />
      <ServiceTimeline
        {...props}
        height={GRAPH_HEIGHT}
        subGraph={true}
        showTopAxis={false}
        showBottomAxis={false}
      />
      <DepartureTimeline
        {...props}
        height={GRAPH_HEIGHT}
        subGraph={true}
        showTopAxis={false}
        showBottomAxis={false}
      /> */}
      <NumberOfCustomersGraph
        {...props}
        height={GRAPH_HEIGHT}
        subGraph={true}
        showTopAxis={false}
        showBottomAxis={false}
      />
    </Box>
  );
};

export default DD1KGraphContainer;
