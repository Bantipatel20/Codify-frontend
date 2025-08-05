// src/components/client/PerformanceTracking.js
import React from 'react';

const performanceData = [
  { id: 1, date: '2025-01-01', score: 85 },
  { id: 2, date: '2025-01-02', score: 90 },
];

const PerformanceTracking = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Performance Tracking</h1>
      <table className="mt-4 w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Date</th>
            <th className="border p-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {performanceData.map((data) => (
            <tr key={data.id}>
              <td className="border p-2">{data.date}</td>
              <td className="border p-2">{data.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PerformanceTracking;
