// src/components/client/PracticeProblems.js
import React from 'react';
// import TwoSumProblem from './Compiler';
import { useNavigate } from 'react-router-dom';

const problems = [
  { id: 1, title: 'Two Sum', difficulty: 'Easy' },
  { id: 2, title: 'Add Two Numbers', difficulty: 'Medium' },
  { id: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium' },
];

const PracticeProblems = () => {
   const navigate = useNavigate();
 function gotocomplerHandler(problem) {
  navigate('/client/practice/complier', { state: { problem } });
}

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-6">Practice Problems</h1>
      <ul className="mt-4 space-y-4">
        {problems.map((problem) => (
          <li key={problem.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-lg">{problem.title}</h2>
              <p className="text-gray-600">Difficulty: {problem.difficulty}</p>
            </div>
            <button 
              className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
              onClick={() => gotocomplerHandler(problem)}
 
            >
              Solve
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PracticeProblems;
