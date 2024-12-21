import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  useMediaQuery,
  alpha,
  Divider,
  useTheme,
} from "@mui/material";
import { roundTo4Decimals } from "@/lib/math";
import MMQueueSimulator from "@/class/mm/MMQueueSimulator";

interface CustomerTimeLineTableProps {
  simulator: MMQueueSimulator;
}

const CustomerTimeLineTable: React.FC<CustomerTimeLineTableProps> = ({
  simulator,
}) => {
  const theme = useTheme();
  const data = simulator.customers;
  const statistics = simulator.statistics;
  const numberOfSumulations = simulator.numOfSimulations;
  const isDarkMode = theme.palette.mode === "dark";
  const showBlockedColumn = simulator.capacity !== Infinity;

  const filteredData = data.filter(
    (row) => row.customerId > 0 && row.customerId <= numberOfSumulations
  );

  const isMobile = useMediaQuery("(max-width: 600px)");

  // Common cell styling for column dividers
  const columnDividerStyle = {
    borderRight: `1px solid ${
      isDarkMode
        ? alpha(theme.palette.divider, 0.3)
        : alpha(theme.palette.primary.light, 0.3)
    }`,
    "&:last-child": {
      borderRight: "none",
    },
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        backgroundColor: isDarkMode
          ? alpha(theme.palette.background.default, 0.9)
          : undefined,
      }}
    >
      <Table aria-label="customer timeline table">
        <TableHead
          sx={{
            backgroundColor: isDarkMode
              ? alpha(theme.palette.primary.dark, 0.7)
              : theme.palette.primary.main,
            "& .MuiTableCell-root": {
              color: isDarkMode
                ? theme.palette.primary.contrastText
                : theme.palette.primary.contrastText,
              fontWeight: "bold",
              ...columnDividerStyle,
            },
          }}
        >
          <TableRow>
            <TableCell>Customer</TableCell>
            {showBlockedColumn && <TableCell>Blocked</TableCell>}
            <TableCell>Arrival</TableCell>
            <TableCell>{isMobile ? "Service" : "Service Start"}</TableCell>
            <TableCell>{isMobile ? "WQ" : "Waiting In Queue"}</TableCell>
            <TableCell>{isMobile ? "D" : "Departure"}</TableCell>
            <TableCell>{isMobile ? "W" : "Waiting In System"}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={showBlockedColumn ? 7 : 6}
              sx={{
                padding: 0,
                borderBottom: `1px solid ${
                  isDarkMode
                    ? alpha(theme.palette.divider, 0.5)
                    : alpha(theme.palette.primary.light, 0.5)
                }`,
              }}
            >
              <Divider
                sx={{
                  backgroundColor: isDarkMode
                    ? alpha(theme.palette.divider, 0.5)
                    : alpha(theme.palette.primary.light, 0.5),
                  height: "2px",
                }}
              />
            </TableCell>
          </TableRow>
          {filteredData.map((row, index) => (
            <TableRow
              key={row.customerId}
              sx={{
                backgroundColor: isDarkMode
                  ? index % 2
                    ? alpha(theme.palette.primary.dark, 0.2)
                    : alpha(theme.palette.background.default, 0.1)
                  : index % 2
                    ? alpha(theme.palette.primary.light, 0.1)
                    : "white",
              }}
            >
              {[
                row.customerId,
                showBlockedColumn ? (row.blocked ? "Yes" : "No") : null,
                row.blocked ? "" : roundTo4Decimals(row.arrivalTime) ?? "",
                row.blocked ? "" : roundTo4Decimals(row.serviceStartTime) ?? "",
                row.blocked ? "" : roundTo4Decimals(row.waitingInQueueTime) ?? "",
                row.blocked ? "" : roundTo4Decimals(row.departureTime) ?? "",
                row.blocked ? "" : roundTo4Decimals(row.waitingInSystemTime) ?? "",
              ].map((cellContent, cellIndex) => (
                cellContent !== null && (
                  <TableCell
                    key={cellIndex}
                    sx={{
                      ...columnDividerStyle,
                      color: row.blocked && cellIndex === 1 ? "red" : isDarkMode ? theme.palette.text.primary : undefined,
                    }}
                  >
                    {cellContent}
                  </TableCell>
                )
              ))}
            </TableRow>
          ))}
          <TableRow>
            <TableCell
              colSpan={showBlockedColumn ? 7 : 6}
              sx={{
                padding: 0,
                borderBottom: `1px solid ${
                  isDarkMode
                    ? alpha(theme.palette.divider, 0.5)
                    : alpha(theme.palette.primary.light, 0.5)
                }`,
              }}
            >
              <Divider
                sx={{
                  backgroundColor: isDarkMode
                    ? alpha(theme.palette.secondary.dark, 0.5)
                    : alpha(theme.palette.secondary.light, 0.5),
                  height: "2px",
                }}
              />
            </TableCell>
          </TableRow>
          {/* total */}
          <TableRow>
            <TableCell sx={columnDividerStyle}>
              <Typography variant="subtitle2">Totals:</Typography>
            </TableCell>
            {showBlockedColumn && <TableCell sx={columnDividerStyle}></TableCell>}
            <TableCell sx={columnDividerStyle}></TableCell>
            <TableCell sx={columnDividerStyle}>
              {roundTo4Decimals(statistics.totalWaitingTime)}
            </TableCell>
            <TableCell sx={columnDividerStyle}></TableCell>
            <TableCell sx={columnDividerStyle}>
              {roundTo4Decimals(statistics.totalWaitingTimeInQueue)}
            </TableCell>
            <TableCell sx={columnDividerStyle}></TableCell>
          </TableRow>
          {/* average */}
          <TableRow
            sx={{
              fontStyle: "italic",
            }}
          >
            <TableCell sx={columnDividerStyle}>
              <Typography variant="subtitle2">Averages:</Typography>
            </TableCell>
            {showBlockedColumn && <TableCell sx={columnDividerStyle}></TableCell>}
            <TableCell sx={columnDividerStyle}></TableCell>
            <TableCell sx={columnDividerStyle}>
              {roundTo4Decimals(statistics.averageWaitingTime)}
            </TableCell>
            <TableCell sx={columnDividerStyle}></TableCell>
            <TableCell sx={columnDividerStyle}>
              {roundTo4Decimals(statistics.averageWaitingTimeInQueue)}
            </TableCell>
            <TableCell sx={columnDividerStyle}></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomerTimeLineTable;
