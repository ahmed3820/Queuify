export type timeLineData = {
    time: number;
    arrived: boolean;
    blocked: boolean | null;
    blocks: number;
    arrivals: number;
    enteredService: boolean;
    serviceEnterancs: number;
    departured: boolean;
    departures: number;
    numberOfCustomers: number;
    key: number;
  };