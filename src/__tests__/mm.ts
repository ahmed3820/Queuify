import { mm } from "@/lib/mm";
import { MMCharacteristics } from "@/types/mm";

const precision = 6; // Define the precision for comparison

const mm_tests = [
  {
    validSystem: true,
    serviceRate: 60,
    arrivalRate: 50,
    servers: 1,
    capacity: undefined,
    expectedRho: 5 / 6,
    expectedP0: 1 / 6,
    expectedL: 5,
    expectedLq: 25 / 6,
    expectedW: 1 / 10,
    expectedWq: 1 / 12,
  },
  {
    validSystem: true,
    serviceRate: 1 / 8,
    arrivalRate: 1 / 10,
    servers: 1,
    capacity: undefined,
    expectedL: 4,
    expectedW: 40,
    expectedWq: 32,
  },
  {
    validSystem: true,
    serviceRate: 1 / 8,
    arrivalRate: 1 / 9,
    servers: 1,
    capacity: undefined,
    expectedL: 8,
    expectedW: 72,
    expectedWq: 64,
  },
  {
    validSystem: true,
    serviceRate: 2.4,
    arrivalRate: 2,
    servers: 1,
    capacity: undefined,
    expectedL: 5,
    expectedLq: 4.166667,
    expectedW: 2.5,
    expectedWq: 2 + 1 / 12,
  },
  {
    validSystem: true,
    serviceRate: 2.4,
    arrivalRate: 2,
    servers: 1,
    capacity: 5,
    expectedL: 1.978828,
    expectedLq: 1.229416,
    expectedW: 1.100211,
    expectedWq: 0.683545,
  },
  {
    validSystem: true,
    serviceRate: 3,
    arrivalRate: 6,
    servers: 3,
    capacity: undefined,
    expectedL: 26 / 9,
    expectedLq: 8 / 9,
    expectedW: 13 / 27,
    expectedWq: 4 / 27,
  },
  {
    validSystem: true,
    serviceRate: 1 / 6,
    arrivalRate: 1,
    servers: 3,
    capacity: 7,
    expectedL: 6.063103,
    expectedLq: 504 / 163,
    expectedW: 12.244248,
    expectedWq: 6.244248,
  },
  {
    validSystem: false,
    serviceRate: 2,
    arrivalRate: 10,
    servers: 3,
  },
  {
    validSystem: false,
    serviceRate: 3,
    arrivalRate: 5,
    servers: 1,
  }
];

describe("mm function", () => {
  mm_tests.forEach((test, index) => {
    it(`should return correct MMCharacteristics for test case ${index + 1}`, () => {
      const { serviceRate, arrivalRate, servers, capacity, ...expectedValues } =
        test;

      const result = mm(serviceRate, arrivalRate, servers, capacity);
      const expected: MMCharacteristics = {
        validSystem: expectedValues.validSystem,
        servers: servers,
        capacity: capacity,
        serviceRate: serviceRate,
        arrivalRate: arrivalRate,
        rho: expectedValues.expectedRho,
        P0: expectedValues.expectedP0,
        L: expectedValues.expectedL,
        Lq: expectedValues.expectedLq,
        W: expectedValues.expectedW,
        Wq: expectedValues.expectedWq,
      };

        expect(result.validSystem).toEqual(expected.validSystem);


      if (expectedValues.expectedL !== undefined) {
        expect(result.L.toFixed(precision)).toEqual(
          expected.L.toFixed(precision)
        );
      }
      if (expectedValues.expectedLq !== undefined) {
        expect(result.Lq.toFixed(precision)).toEqual(
          expected.Lq.toFixed(precision)
        );
      }
      if (expectedValues.expectedP0 !== undefined) {
        expect(result.P0.toFixed(precision)).toEqual(
          expected.P0.toFixed(precision)
        );
      }
      if (expectedValues.expectedW !== undefined) {
        expect(result.W.toFixed(precision)).toEqual(
          expected.W.toFixed(precision)
        );
      }
      if (expectedValues.expectedWq !== undefined) {
        expect(result.Wq.toFixed(precision)).toEqual(
          expected.Wq.toFixed(precision)
        );
      }
    });
  });
});
