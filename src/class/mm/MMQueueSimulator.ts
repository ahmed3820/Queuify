import { exponentialRandom, roundTo4Decimals } from "@/lib/math";
import { QueueSystem } from "../QueueSystem";
import { Customer, TimeLineData } from "@/types/Simulation";
import { MmStatistics } from "@/types/mm";
import QueueServer from "./Server";
import EventQueue, { Event } from "./EventQueue";

const logEnabled = false;

export type MmSimulatorParams = {
  servers: number;
  capacity?: number;
  arrivalRate: number;
  serviceRate: number;
  numOfSimulations: number;
};

class MMQueueSimulator extends QueueSystem {
  numOfSimulations: number;
  statistics: MmStatistics;
  queueServers: QueueServer[];
  customersInQueue: Customer[];
  timelineMap: Map<number, TimeLineData>;
  arrivalCount: number; // Number of customers who arrived to the system so far
  departureCount: number;
  serviceCount: number;
  BlockCount: number;
  key: number;
  clock: number;
  eventQueue: EventQueue;

  constructor({
    servers,
    capacity = Infinity,
    arrivalRate,
    serviceRate,
    numOfSimulations,
  }: MmSimulatorParams) {
    super();
    if (arrivalRate <= 0 || serviceRate <= 0) {
      throw new Error(
        "Arrival rate and service rate must be positive and non-zero"
      );
    }

    if (servers <= 0) {
      throw new Error("Number of servers must be positive and non-zero");
    }

    if (capacity <= 0) {
      throw new Error("Capacity must be positive and non-zero");
    }
    if (numOfSimulations <= 0) {
      throw new Error("Number of simulations must be positive and non-zero");
    }

    this.arrivalRate = arrivalRate; // Average rate of customer arrivals
    this.serviceRate = serviceRate; // Average rate of service completions
    this.numOfSimulations = numOfSimulations; // Total number of customers to simulate
    this.capacity = capacity; // Capacity of the system
    this.timeLineData = []; // Stores timeline events for the simulation
    this.customers = []; // Stores data for each customer
    this.queueServers = Array.from(
      { length: servers },
      (_, i) => new QueueServer(i)
    ); // Initialize servers
    this.customersInQueue = []; // List of customers in system
    this.customers = []; // List of all customers entered the system
    this.timelineMap = new Map<number, TimeLineData>(); // Map to store timeline events
    this.arrivalCount = 0;
    this.departureCount = 0;
    this.serviceCount = 0;
    this.BlockCount = 0;
    this.key = 0;
    this.clock = 0;
    this.eventQueue = new EventQueue();
  }

  async simulate() {
    this.scheduleNextArrival(0);
    while (
      this.departureCount < this.numOfSimulations ||
      this.customersInQueue.length > 0 ||
      this.queueServers.some((server) => !server.isIdle)
    ) {
      const event = this.eventQueue.getNextEvent();
      if (event && isFinite(event.time)) {
        this.clock = roundTo4Decimals(event.time);
        if (event.type === "arrival") {
          this.handleArrival(event.customer!);
        } else if (event.type === "departure") {
          this.handleDeparture(event.server!);
        }
      } else {
        if (event === undefined) {
          break;    // No more events to process. Exiting simulation loop.
        } else {
          console.error("Invalid event time:", event?.time);
        }
      }
    }
    this.generateSimulationData();
  }

  numbersOfCustomersInSystem() {
    return (
      this.customersInQueue.length +
      this.queueServers.filter((server) => !server.isIdle).length
    );
  }

  updateTimelineData(event: Event) {
    const time = event.time;
    if (isFinite(time) && !this.timelineMap.has(time)) {
      this.timelineMap.set(time, {
        time: time,
        arrived: false,
        arrivalCount: this.arrivalCount,
        arrivalCustomers: new Set<number>(),
        blocked: null,
        blockCount: this.capacity === Infinity ? null : this.BlockCount,
        enteredService: false,
        serviceCount: this.serviceCount,
        serviceCustomers: new Set<number>(),
        departured: false,
        departureCount: this.departureCount,
        departureCustomers: new Set<number>(),
        numberOfCustomers: this.numbersOfCustomersInSystem(),
        key: this.key++,
      });
    }

    const timelineData = this.timelineMap.get(time);
    if (timelineData) {
      if (event.type === "arrival") {
        timelineData.arrived = true;
        timelineData.arrivalCount = this.arrivalCount;
        timelineData.arrivalCustomers.add(event.customer!.customerId);
        if (event.customer!.blocked) {
          timelineData.blocked = true;
        }
      } else if (event.type === "departure") {
        timelineData.departured = true;
        timelineData.departureCount = this.departureCount;
        if (event.server!.currentCustomer) {
          timelineData.departureCustomers.add(
            event.server!.currentCustomer.customerId
          );
        }
      }
    } else {
      console.error("Invalid timeline data for time:", time);
    }
  }

  scheduleNextArrival(currentTime: number) {
    if (this.arrivalCount < this.numOfSimulations) {
      const nextArrivalTime = roundTo4Decimals(
        currentTime + exponentialRandom(this.arrivalRate)
      );
      if (isFinite(nextArrivalTime)) {
        const customer: Customer = {
          customerId: this.arrivalCount + 1,
          arrivalTime: nextArrivalTime,
          blocked: false,
        };
        this.eventQueue.addEvent({
          time: nextArrivalTime,
          type: "arrival",
          customer,
        });
      } else {
        console.error("Invalid next arrival time:", nextArrivalTime);
      }
    }
  }

  handleArrival(customer: Customer) {
    this.arrivalCount++; // Increment the number of arrivals
    customer.arrivalTime = roundTo4Decimals(customer.arrivalTime);
    if (logEnabled) {
      console.log(
        `Customer ${customer.customerId} arrived at ${customer.arrivalTime}`
      );
    }
    this.customers.push(customer);

    if (this.customersInQueue.length < this.capacity) {
      // Customer can enter the system
      this.customersInQueue.push(customer); // Add the customer to the queue
      this.tryToServeNextCustomer();
    } else {
      // Customer is blocked
      customer.blocked = true;
      customer.arrivalTime = roundTo4Decimals(customer.arrivalTime); // Ensure arrival time is set
      this.BlockCount++; // Increment the number of blocked customers
      if (logEnabled) {
        console.log(
          `Customer ${customer.customerId} is blocked at ${customer.arrivalTime}`
        );
      }
    }

    this.scheduleNextArrival(customer.arrivalTime);
    this.updateTimelineData({
      time: customer.arrivalTime,
      type: "arrival",
      customer,
    });
  }

  handleDeparture(server: QueueServer) {
    if (server.currentCustomer) {
      const customer = server.currentCustomer;
      const finishTime = roundTo4Decimals(server.finishTime); // Capture and round finishTime before finishing service
      this.customersInQueue = this.customersInQueue.filter(
        (c) => c.customerId !== customer.customerId
      );
      this.departureCount++; // Increment the number of departures
      if (logEnabled) {
        console.log(
          `Customer ${customer.customerId} departed at ${finishTime} from server ${server.id}`
        );
      }
      server.finishService();
      if (isFinite(finishTime)) {
        // Use captured finishTime
        this.updateTimelineData({
          time: finishTime,
          type: "departure",
          server,
        });
      } else {
        console.error("Invalid server finish time:", finishTime);
      }
    }

    this.tryToServeNextCustomer();
  }

  tryToServeNextCustomer() {
    const availableServer = this.queueServers.find((server) => server.isIdle);
    if (availableServer && this.customersInQueue.length > 0) {
      const customer = this.customersInQueue.shift(); // Remove the customer from the queue
      if (customer) {
        const serviceTime = availableServer.serveCustomer(
          this.clock,
          this.serviceRate,
          customer
        ); // Schedule the next departure
        if (isFinite(serviceTime) && serviceTime > 0) {
          this.serviceCount++; // Increment the number of customers entered the service
          if (logEnabled) {
            console.log(
              `Customer ${customer.customerId} started service at ${this.clock} on server ${availableServer.id} for ${serviceTime} time units`
            );
          }
          const finishTime = roundTo4Decimals(this.clock + serviceTime);
          if (isFinite(finishTime) && finishTime > this.clock) {
            this.eventQueue.addEvent({
              time: finishTime,
              type: "departure",
              server: availableServer,
            });
            this.updateServiceTimelineData(this.clock, customer.customerId);
          } else {
            console.error("Invalid finish time:", finishTime);
          }
        } else {
          console.error("Invalid service time:", serviceTime);
        }
      }
    }
  }

  updateServiceTimelineData(time: number, customerId: number) {
    if (!this.timelineMap.has(time)) {
      this.timelineMap.set(time, {
        time: time,
        arrived: false,
        arrivalCount: this.arrivalCount,
        arrivalCustomers: new Set<number>(),
        blocked: null,
        blockCount: this.capacity === Infinity ? null : this.BlockCount,
        enteredService: true,
        serviceCount: this.serviceCount,
        serviceCustomers: new Set<number>(),
        departured: false,
        departureCount: this.departureCount,
        departureCustomers: new Set<number>(),
        numberOfCustomers: this.numbersOfCustomersInSystem(),
        key: this.key++,
      });
    }

    const timelineData = this.timelineMap.get(time)!;
    timelineData.enteredService = true;
    timelineData.serviceCount = this.serviceCount;
    timelineData.serviceCustomers.add(customerId);
  }

  generateSimulationData() {
    // Convert timelineMap to timeLineData array and sort by time
    this.timeLineData = Array.from(this.timelineMap.values()).sort(
      (a, b) => a.time - b.time
    );

    // Calculate customer waiting times
    let totalWaitingInSystemTime = 0; // Total waiting time for all customers
    let totalWaitingInQueueTime = 0; // Total waiting time in queue for all customers
    this.customers.forEach((customer) => {
      const { arrivalTime, serviceStartTime, departureTime, blocked } =
        customer;


      // Validate times to ensure they are numbers
      if (
        typeof arrivalTime === "number" &&
        !blocked &&
        typeof serviceStartTime === "number" &&
        typeof departureTime === "number"
      ) {
        const wq = roundTo4Decimals(serviceStartTime - arrivalTime);
        customer.waitingInQueueTime = wq;
        totalWaitingInQueueTime += wq;

        const w = roundTo4Decimals(departureTime - arrivalTime);
        customer.waitingInSystemTime = w;
        totalWaitingInSystemTime += w;

        // Assert that calculated waiting times are non-negative
        console.assert(
          wq >= 0,
          `Waiting in queue time should be non-negative for customer ${customer.customerId}`
        );
        console.assert(
          w >= 0,
          `Waiting in system time should be non-negative for customer ${customer.customerId}`
        );
        // Assert that waiting times are correctly calculated
        console.assert(
          customer.waitingInQueueTime ===
            roundTo4Decimals(serviceStartTime - arrivalTime),
          `Waiting in queue time should be service start time minus arrival time for customer ${customer.customerId}`
        );
        console.assert(
          customer.waitingInSystemTime ===
            roundTo4Decimals(departureTime - arrivalTime),
          `Waiting in system time should be departure time minus arrival time for customer ${customer.customerId}`
        );
      } else if (!blocked) {
        console.error("Invalid data for customer:", customer);
      }
    });

    // Assert that the total number of arrivals equals the sum of departures and blocked customers
    console.assert(
      this.arrivalCount === this.departureCount + this.BlockCount,
      "Mismatch in arrivals, departures, and blocked customers"
    );

    // Calculate total idle server time
    const totalIdleServerTime = this.queueServers.reduce(
      (sum, server) => sum + server.totalIdleTime,
      0
    );

    // Calculate statistics for the simulation
    this.statistics = {
      totalWaitingTime: roundTo4Decimals(totalWaitingInSystemTime),
      averageWaitingTime: roundTo4Decimals(
        this.departureCount > 0
          ? totalWaitingInSystemTime / this.departureCount
          : 0
      ),
      totalWaitingTimeInQueue: roundTo4Decimals(totalWaitingInQueueTime),
      averageWaitingTimeInQueue: roundTo4Decimals(
        this.departureCount > 0
          ? totalWaitingInQueueTime / this.departureCount
          : 0
      ),
      totalIdleServerTime: roundTo4Decimals(totalIdleServerTime),
      averageIdleServerTime: roundTo4Decimals(
        this.servers > 0 ? totalIdleServerTime / this.servers : 0
      ),
      totalBlockedCustomers: this.BlockCount,
      blockingProbability: roundTo4Decimals(
        this.arrivalCount > 0 ? this.BlockCount / this.arrivalCount : 0
      ),
    };

    // Validate calculated statistics before asserting
    if (this.statistics.averageWaitingTime < 0) {
      console.error(
        "Invalid average waiting time:",
        this.statistics.averageWaitingTime
      );
    }
    if (this.statistics.averageWaitingTimeInQueue < 0) {
      console.error(
        "Invalid average waiting time in queue:",
        this.statistics.averageWaitingTimeInQueue
      );
    }
    if (this.statistics.averageIdleServerTime < 0) {
      console.error(
        "Invalid average idle server time:",
        this.statistics.averageIdleServerTime
      );
    }
    if (
      this.statistics.blockingProbability < 0 ||
      this.statistics.blockingProbability > 1
    ) {
      console.error(
        "Invalid blocking probability:",
        this.statistics.blockingProbability
      );
    }

    // Assert that the calculated statistics are valid
    console.assert(
      this.statistics.averageWaitingTime >= 0,
      "Average waiting time should be non-negative"
    );
    console.assert(
      this.statistics.averageWaitingTimeInQueue >= 0,
      "Average waiting time in queue should be non-negative"
    );
    console.assert(
      this.statistics.averageIdleServerTime >= 0,
      "Average idle server time should be non-negative"
    );
    console.assert(
      this.statistics.blockingProbability >= 0 &&
        this.statistics.blockingProbability <= 1,
      "Blocking probability should be between 0 and 1"
    );
  }
}

export default MMQueueSimulator;
