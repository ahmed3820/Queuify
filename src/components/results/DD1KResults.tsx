import React from 'react';

const DD1KResults = ({ results }) => {
  return (
    <div>
      <p>System utilization (ρ): {results.rho}</p>
      <p>Probability of 0 customers (P0): {results.P0}</p>
      <p>Average number of customers in the system (L): {results.L}</p>
      <p>Average number of customers in the queue (Lq): {results.Lq}</p>
      <p>Average time a customer spends in the system (W): {results.W}</p>
      <p>Average time a customer spends in the queue (Wq): {results.Wq}</p>
      <p>Blocking Probability (PB): {results.blockingProbability}</p>
    </div>
  );
};

export default DD1KResults;