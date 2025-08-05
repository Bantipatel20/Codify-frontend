// src/components/client/Submissions.js
import React from 'react';

const submissions = [
  { id: 1, problem: 'Two Sum', date: '2025-01-01', status: 'Passed' },
  { id: 2, problem: 'Add Two Numbers', date: '2025-01-02', status: 'Failed' },
];

const Submissions = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Submissions</h1>
      <table className="mt-4 w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Problem</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr key={submission.id}>
              <td className="border p-2">{submission.problem}</td>
              <td className="border p-2">{submission.date}</td>
              <td className="border p-2">{submission.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Submissions;
