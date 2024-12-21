import MMQueueSimulator from "./MMQueueSimulator";

const numOfServers = 1;
const capacity = Infinity;
const arrivalRate = 1/10;
const serviceRate = 1/8;
const numOfSimulations = 5;

// Instantiate the simulator
const simulator = new MMQueueSimulator({
  arrivalRate: arrivalRate,
  serviceRate: serviceRate,
  capacity: capacity,
  servers: numOfServers,
  numOfSimulations: numOfSimulations,
});

// Run the simulation and log data after completion
simulator.simulate().then(() => {
  console.log("Simulation ended");
  console.log("Simulation Statistics:", simulator.statistics);
  // console.log("Timeline Data:", simulator.timeLineData);
  console.log("Customer Data:", simulator.customers);
});