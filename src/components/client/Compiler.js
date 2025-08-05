// src/components/client/Compiler.js
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const Compiler = () => {
  const { state } = useLocation();
  const problem = state?.problem;

  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const defaultTestCase = { nums: [2, 7, 11, 15], target: 9 };

  const handleRun = async () => {
    setError('');
    setOutput('');

    try {
      const response = await axios.post('http://localhost:5000/api/run', {
        code,
        testCase: defaultTestCase, // You can customize this based on `problem.id`
      });
      setOutput('Output: ' + JSON.stringify(response.data.output));
    } catch (err) {
      setError('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSubmit = async () => {
    setError('');
    setOutput('');

    try {
      const response = await axios.post('http://localhost:5000/api/submit', {
        code,
        problemId: problem?.id || 1, // Optional: track which problem was submitted
      });
      setOutput('Submission Status: ' + response.data.status);
    } catch (err) {
      setError('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">
          {problem?.title || 'Two Sum Problem'}
        </h1>
        <p className="text-gray-700 mb-4">
          {problem?.description || 'Given an array of integers, return indices of the two numbers such that they add up to a specific target.'}
        </p>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Your Code</h2>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your code here..."
            className="w-full h-60 p-2 border rounded font-mono text-sm"
          />
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-800">Sample Test Case:</h3>
          <code className="text-sm text-gray-600 block mt-1">
            Input: nums = [2, 7, 11, 15], target = 9<br />
            Expected Output: [0, 1]
          </code>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleRun}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Run
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Submit
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 border rounded">
          {error && <div className="text-red-600">{error}</div>}
          {output && <div className="text-green-700">{output}</div>}
        </div>
      </div>
    </div>
  );
};

export default Compiler;
