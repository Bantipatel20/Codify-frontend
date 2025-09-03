// src/components/admin/Contest.js
import React, { useState, useEffect } from 'react';
import { HiStar, HiPlus, HiUsers, HiCode, HiCalendar, HiClock, HiPencil, HiTrash, HiPlay, HiStop, HiChartBar, HiFilter, HiArrowLeft, HiX } from 'react-icons/hi';
import { contestAPI, problemsAPI, userAPI } from '../../services/api';

// Manual Problem Creation Component
const ManualProblemModal = ({ onClose, onSave }) => {
  const [problem, setProblem] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    category: 'General',
    points: 100,
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    sampleInput: '',
    sampleOutput: '',
    explanation: '',
    testCases: [
      { input: '', expectedOutput: '', isHidden: false }
    ]
  });

  const handleAddTestCase = () => {
    setProblem({
      ...problem,
      testCases: [...problem.testCases, { input: '', expectedOutput: '', isHidden: false }]
    });
  };

  const handleRemoveTestCase = (index) => {
    setProblem({
      ...problem,
      testCases: problem.testCases.filter((_, i) => i !== index)
    });
  };

  const handleTestCaseChange = (index, field, value) => {
    const updatedTestCases = problem.testCases.map((testCase, i) => 
      i === index ? { ...testCase, [field]: value } : testCase
    );
    setProblem({ ...problem, testCases: updatedTestCases });
  };

  const handleSave = () => {
    if (!problem.title.trim() || !problem.description.trim()) {
      alert('Title and description are required');
      return;
    }
    
    // Generate a temporary ID for the manual problem
    const manualProblem = {
      ...problem,
      _id: `manual_${Date.now()}`,
      isManual: true,
      createdAt: new Date().toISOString()
    };
    
    onSave(manualProblem);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Create Manual Problem</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Problem Title *</label>
              <input
                type="text"
                value={problem.title}
                onChange={(e) => setProblem({...problem, title: e.target.value})}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                placeholder="Enter problem title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <input
                type="text"
                value={problem.category}
                onChange={(e) => setProblem({...problem, category: e.target.value})}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                placeholder="e.g., Arrays, Strings, Dynamic Programming"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
              <select
                value={problem.difficulty}
                onChange={(e) => setProblem({...problem, difficulty: e.target.value})}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Points</label>
              <input
                type="number"
                value={problem.points}
                onChange={(e) => setProblem({...problem, points: parseInt(e.target.value) || 0})}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                min="1"
                max="1000"
              />
            </div>
          </div>

          {/* Problem Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Problem Description *</label>
            <textarea
              value={problem.description}
              onChange={(e) => setProblem({...problem, description: e.target.value})}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white h-32"
              placeholder="Describe the problem statement..."
              required
            />
          </div>

          {/* Input/Output Format */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Input Format</label>
              <textarea
                value={problem.inputFormat}
                onChange={(e) => setProblem({...problem, inputFormat: e.target.value})}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white h-24"
                placeholder="Describe the input format..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Output Format</label>
              <textarea
                value={problem.outputFormat}
                onChange={(e) => setProblem({...problem, outputFormat: e.target.value})}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white h-24"
                placeholder="Describe the output format..."
              />
            </div>
          </div>

          {/* Constraints */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Constraints</label>
            <textarea
              value={problem.constraints}
              onChange={(e) => setProblem({...problem, constraints: e.target.value})}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white h-20"
              placeholder="e.g., 1 ≤ n ≤ 10^5, 1 ≤ arr[i] ≤ 10^9"
            />
          </div>

          {/* Sample Input/Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sample Input</label>
              <textarea
                value={problem.sampleInput}
                onChange={(e) => setProblem({...problem, sampleInput: e.target.value})}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white h-24"
                placeholder="Enter sample input..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sample Output</label>
              <textarea
                value={problem.sampleOutput}
                onChange={(e) => setProblem({...problem, sampleOutput: e.target.value})}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white h-24"
                placeholder="Enter expected output..."
              />
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Explanation (Optional)</label>
            <textarea
              value={problem.explanation}
              onChange={(e) => setProblem({...problem, explanation: e.target.value})}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white h-24"
              placeholder="Explain the sample case..."
            />
          </div>

          {/* Test Cases */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-300">Test Cases</label>
              <button
                type="button"
                onClick={handleAddTestCase}
                className="flex items-center space-x-1 bg-green-500/20 text-green-400 px-3 py-2 rounded-lg hover:bg-green-500/30 text-sm"
              >
                <HiPlus className="w-4 h-4" />
                <span>Add Test Case</span>
              </button>
            </div>

            <div className="space-y-4">
              {problem.testCases.map((testCase, index) => (
                <div key={index} className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">Test Case {index + 1}</h4>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-2 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          checked={testCase.isHidden}
                          onChange={(e) => handleTestCaseChange(index, 'isHidden', e.target.checked)}
                          className="w-4 h-4 text-purple-600"
                        />
                        <span>Hidden</span>
                      </label>
                      {problem.testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTestCase(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <HiX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Input</label>
                      <textarea
                        value={testCase.input}
                        onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm h-20"
                        placeholder="Enter test input..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Expected Output</label>
                      <textarea
                        value={testCase.expectedOutput}
                        onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm h-20"
                        placeholder="Enter expected output..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg"
          >
            Save Problem
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal Components
const CreateContestModal = ({ 
  newContest, 
  setNewContest, 
  problems, 
  students, 
  getFilteredStudents, 
  onSubmit, 
  onClose 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showManualProblemModal, setShowManualProblemModal] = useState(false);
  const [manualProblems, setManualProblems] = useState([]);
  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleProblemToggle = (problemId) => {
    const isSelected = newContest.selectedProblems.includes(problemId);
    if (isSelected) {
      setNewContest({
        ...newContest,
        selectedProblems: newContest.selectedProblems.filter(id => id !== problemId)
      });
    } else {
      setNewContest({
        ...newContest,
        selectedProblems: [...newContest.selectedProblems, problemId]
      });
    }
  };

  const handleManualProblemSave = (problem) => {
    setManualProblems([...manualProblems, problem]);
    setNewContest({
      ...newContest,
      selectedProblems: [...newContest.selectedProblems, problem._id]
    });
  };

  const handleRemoveManualProblem = (problemId) => {
    setManualProblems(manualProblems.filter(p => p._id !== problemId));
    setNewContest({
      ...newContest,
      selectedProblems: newContest.selectedProblems.filter(id => id !== problemId)
    });
  };

  // Custom submit handler that passes manual problems
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e, manualProblems);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Create New Contest</h2>
            <p className="text-gray-400">Step {currentStep} of {totalSteps}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">Contest Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Contest Title *</label>
                    <input
                      type="text"
                      value={newContest.title}
                      onChange={(e) => setNewContest({...newContest, title: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                      placeholder="Enter contest title"
                      maxLength="200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Duration *</label>
                    <input
                      type="text"
                      value={newContest.duration}
                      onChange={(e) => setNewContest({...newContest, duration: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                      placeholder="e.g., 2 hours"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Date *</label>
                    <input
                      type="datetime-local"
                      value={newContest.startDate}
                      onChange={(e) => setNewContest({...newContest, startDate: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">End Date *</label>
                    <input
                      type="datetime-local"
                      value={newContest.endDate}
                      onChange={(e) => setNewContest({...newContest, endDate: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                  <textarea
                    value={newContest.description}
                    onChange={(e) => setNewContest({...newContest, description: e.target.value})}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white h-32"
                    placeholder="Describe the contest..."
                    maxLength="1000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Participants</label>
                  <input
                    type="number"
                    value={newContest.maxParticipants}
                    onChange={(e) => setNewContest({...newContest, maxParticipants: parseInt(e.target.value)})}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                    min="1"
                    max="1000"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Select Problems - UPDATED */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">
                    Select Problems ({newContest.selectedProblems.length} selected)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowManualProblemModal(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    <HiPlus className="text-sm" />
                    <span>Create Problem</span>
                  </button>
                </div>

                {/* Manual Problems Section */}
                {manualProblems.length > 0 && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Manual Problems ({manualProblems.length})</h4>
                    <div className="space-y-3">
                      {manualProblems.map((problem) => (
                        <div key={problem._id} className="bg-blue-500/20 border border-blue-500 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h5 className="text-white font-semibold">{problem.title}</h5>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                  problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {problem.difficulty}
                                </span>
                                <span className="text-gray-400 text-sm">{problem.category}</span>
                                <span className="text-purple-400 text-sm">{problem.points} points</span>
                                <span className="text-blue-400 text-sm">Manual</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveManualProblem(problem._id)}
                              className="text-red-400 hover:text-red-300 ml-3"
                            >
                              <HiTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Existing Problems */}
                <div>
                  <h4 className="text-white font-medium mb-3">Existing Problems ({problems.length})</h4>
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {problems.map((problem) => (
                      <div 
                        key={problem._id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          newContest.selectedProblems.includes(problem._id)
                            ? 'bg-purple-500/20 border-purple-500'
                            : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => handleProblemToggle(problem._id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold">{problem.title}</h4>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {problem.difficulty}
                              </span>
                              <span className="text-gray-400 text-sm">{problem.category}</span>
                              <span className="text-purple-400 text-sm">{problem.points} points</span>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={newContest.selectedProblems.includes(problem._id)}
                            onChange={() => handleProblemToggle(problem._id)}
                            className="w-5 h-5 text-purple-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Participant Selection */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">Participant Selection</h3>
                
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">ℹ</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Participant Registration</h4>
                      <p className="text-gray-300 text-sm">
                        Configure how students can register for this contest. Registration is handled after contest creation.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Registration Method</label>
                    <select
                      value={newContest.participantSelection}
                      onChange={(e) => setNewContest({...newContest, participantSelection: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                    >
                      <option value="manual">Manual Registration</option>
                      <option value="department">Department Based</option>
                      <option value="semester">Semester Based</option>
                      <option value="division">Division Based</option>
                      <option value="batch">Batch Based</option>
                    </select>
                  </div>
                </div>

                {/* Filter Criteria */}
                {newContest.participantSelection !== 'manual' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                        <select
                          value={newContest.filterCriteria.department || ''}
                          onChange={(e) => setNewContest({
                            ...newContest,
                            filterCriteria: {...newContest.filterCriteria, department: e.target.value}
                          })}
                          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                        >
                          <option value="">All Departments</option>
                          <option value="AIML">AIML</option>
                          <option value="CSE">CSE</option>
                          <option value="IT">IT</option>
                          <option value="ECE">ECE</option>
                          <option value="MECH">MECH</option>
                          <option value="CIVIL">CIVIL</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Semester</label>
                        <select
                          value={newContest.filterCriteria.semester || ''}
                          onChange={(e) => setNewContest({
                            ...newContest,
                            filterCriteria: {...newContest.filterCriteria, semester: e.target.value ? parseInt(e.target.value) : null}
                          })}
                          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                        >
                          <option value="">All Semesters</option>
                          {[1,2,3,4,5,6,7,8].map(sem => (
                            <option key={sem} value={sem}>{sem}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Division</label>
                        <select
                          value={newContest.filterCriteria.division || ''}
                          onChange={(e) => setNewContest({
                            ...newContest,
                            filterCriteria: {...newContest.filterCriteria, division: e.target.value ? parseInt(e.target.value) : null}
                          })}
                          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                        >
                          <option value="">All Divisions</option>
                          {[1,2,3,4].map(div => (
                            <option key={div} value={div}>{div}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Batch</label>
                        <select
                          value={newContest.filterCriteria.batch || ''}
                          onChange={(e) => setNewContest({
                            ...newContest,
                            filterCriteria: {...newContest.filterCriteria, batch: e.target.value}
                          })}
                          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                        >
                          <option value="">All Batches</option>
                          <option value="A1">A1</option>
                          <option value="B1">B1</option>
                          <option value="C1">C1</option>
                          <option value="D1">D1</option>
                          <option value="A2">A2</option>
                          <option value="B2">B2</option>
                          <option value="C2">C2</option>
                          <option value="D2">D2</option>
                          <option value="A3">A3</option>
                          <option value="B3">B3</option>
                          <option value="C3">C3</option>
                          <option value="D3">D3</option>
                          <option value="A4">A4</option>
                          <option value="B4">B4</option>
                          <option value="C4">C4</option>
                          <option value="D4">D4</option>
                        </select>
                      </div>
                    </div>

                    {/* Student ID Filter Only */}
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3">Student Number Filter</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Student ID Filter</label>
                          <select
                            value={newContest.filterCriteria.studentIdFilter || ''}
                            onChange={(e) => setNewContest({
                              ...newContest,
                              filterCriteria: {...newContest.filterCriteria, studentIdFilter: e.target.value}
                            })}
                            className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                          >
                            <option value="">All Students</option>
                            <option value="even">Even Student IDs Only</option>
                            <option value="odd">Odd Student IDs Only</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs mt-2">
                        Filter students based on their student ID ending digit (even/odd)
                      </p>
                    </div>
                  </div>
                )}

                {/* Registration Summary */}
                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Registration Summary</h4>
                  <p className="text-gray-300 text-sm">
                    Registration Method: <span className="text-blue-400 font-medium">{newContest.participantSelection}</span>
                  </p>
                  <p className="text-gray-300 text-sm">
                    Max Participants: <span className="text-purple-400 font-medium">{newContest.maxParticipants}</span>
                  </p>
                  <p className="text-gray-300 text-sm">
                    Eligible Students: <span className="text-green-400 font-medium">{getFilteredStudents().length}</span>
                  </p>
                  <p className="text-gray-300 text-sm">
                    Manual Problems: <span className="text-cyan-400 font-medium">{manualProblems.length}</span>
                  </p>
                  {newContest.participantSelection !== 'manual' && (
                    <div className="mt-2 text-xs text-gray-400">
                      <p>Filter Criteria:</p>
                      <ul className="ml-4 list-disc">
                        {newContest.filterCriteria.department && <li>Department: {newContest.filterCriteria.department}</li>}
                        {newContest.filterCriteria.semester && <li>Semester: {newContest.filterCriteria.semester}</li>}
                        {newContest.filterCriteria.division && <li>Division: {newContest.filterCriteria.division}</li>}
                        {newContest.filterCriteria.batch && <li>Batch: {newContest.filterCriteria.batch}</li>}
                        {newContest.filterCriteria.studentIdFilter && <li>Student IDs: {newContest.filterCriteria.studentIdFilter}</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Settings */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">Contest Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Show Leaderboard</h4>
                      <p className="text-gray-400 text-sm">Display leaderboard to participants</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={newContest.settings.showLeaderboard}
                      onChange={(e) => setNewContest({
                        ...newContest,
                        settings: {...newContest.settings, showLeaderboard: e.target.checked}
                      })}
                      className="w-5 h-5 text-purple-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Show Leaderboard During Contest</h4>
                      <p className="text-gray-400 text-sm">Allow participants to see rankings while contest is active</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={newContest.settings.showLeaderboardDuringContest}
                      onChange={(e) => setNewContest({
                        ...newContest,
                        settings: {...newContest.settings, showLeaderboardDuringContest: e.target.checked}
                      })}
                      className="w-5 h-5 text-purple-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Allow Late Submission</h4>
                      <p className="text-gray-400 text-sm">Accept submissions after contest ends</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={newContest.settings.allowLateSubmission}
                      onChange={(e) => setNewContest({
                        ...newContest,
                        settings: {...newContest.settings, allowLateSubmission: e.target.checked}
                      })}
                      className="w-5 h-5 text-purple-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Allow View Problems Before Start</h4>
                      <p className="text-gray-400 text-sm">Let participants see problems before contest begins</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={newContest.settings.allowViewProblemsBeforeStart}
                      onChange={(e) => setNewContest({
                        ...newContest,
                        settings: {...newContest.settings, allowViewProblemsBeforeStart: e.target.checked}
                      })}
                      className="w-5 h-5 text-purple-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Freeze Leaderboard</h4>
                      <p className="text-gray-400 text-sm">Hide leaderboard updates near contest end</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={newContest.settings.freezeLeaderboard}
                      onChange={(e) => setNewContest({
                        ...newContest,
                        settings: {...newContest.settings, freezeLeaderboard: e.target.checked}
                      })}
                      className="w-5 h-5 text-purple-600"
                    />
                  </div>

                  {newContest.settings.freezeLeaderboard && (
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <label className="block text-white font-medium mb-2">Freeze Time (minutes before end)</label>
                      <input
                        type="number"
                        value={newContest.settings.freezeTime}
                        onChange={(e) => setNewContest({
                          ...newContest,
                          settings: {...newContest.settings, freezeTime: parseInt(e.target.value) || 60}
                        })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        min="1"
                        max="300"
                        placeholder="60"
                      />
                    </div>
                  )}

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <label className="block text-white font-medium mb-2">Penalty per Wrong Submission</label>
                    <input
                      type="number"
                      value={newContest.settings.penaltyPerWrongSubmission}
                      onChange={(e) => setNewContest({
                        ...newContest,
                        settings: {...newContest.settings, penaltyPerWrongSubmission: parseInt(e.target.value) || 0}
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                      min="0"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Contest Rules</label>
                    <textarea
                      value={newContest.rules}
                      onChange={(e) => setNewContest({...newContest, rules: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white h-32"
                      placeholder="Enter contest rules and guidelines..."
                      maxLength="2000"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg"
                >
                  Create Contest
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Manual Problem Modal */}
      {showManualProblemModal && (
        <ManualProblemModal
          onClose={() => setShowManualProblemModal(false)}
          onSave={handleManualProblemSave}
        />
      )}
    </div>
  );
};

// Keep the rest of your component (ParticipantsModal, LeaderboardModal, etc.) exactly as they are...

const ParticipantsModal = ({ contest, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Contest Participants</h2>
            <p className="text-gray-400">{contest.title}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-white">
                Total Participants: <span className="text-blue-400 font-semibold">{contest.participants?.length || 0}</span>
              </span>
              <span className="text-white">
                Max Capacity: <span className="text-purple-400 font-semibold">{contest.maxParticipants}</span>
              </span>
              <span className="text-white">
                Registration: <span className="text-green-400 font-semibold">
                  {contest.participantSelection === 'manual' ? 'Manual' : 'Automatic'}
                </span>
              </span>
              <span className="text-white">
                Active: <span className="text-yellow-400 font-semibold">
                  {contest.activeParticipantsCount || 0}
                </span>
              </span>
            </div>
          </div>

          {(!contest.participants || contest.participants.length === 0) ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiUsers className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Participants Yet</h3>
              <p className="text-gray-400">Participants will appear here once they register</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contest.participants.map((participant, index) => (
                <div key={participant._id || participant.userId || index} className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {(participant.name || 'Unknown').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{participant.name || 'Unknown User'}</h4>
                        <p className="text-gray-400 text-sm">
                          {participant.email} • {participant.department} • Sem {participant.semester} • Div {participant.division} • {participant.batch}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-purple-400 font-semibold text-lg">{participant.score || 0}</p>
                          <p className="text-gray-400 text-xs">Score</p>
                        </div>
                        <div>
                          <p className="text-blue-400 font-semibold">{participant.submissions || 0}</p>
                          <p className="text-gray-400 text-xs">Submissions</p>
                        </div>
                        <div>
                          <p className="text-green-400 text-sm">
                            {participant.registrationTime ? 
                              new Date(participant.registrationTime).toLocaleDateString() : 
                              'Date unknown'
                            }
                          </p>
                          <p className="text-gray-400 text-xs">Registered</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Show problems attempted */}
                  {participant.problemsAttempted && participant.problemsAttempted.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-gray-400 text-sm mb-2">Problems Attempted:</p>
                      <div className="flex flex-wrap gap-2">
                        {participant.problemsAttempted.map((problem, idx) => (
                          <span key={idx} className={`px-2 py-1 rounded text-xs font-medium ${
                            problem.solved ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            Problem {idx + 1} ({problem.attempts} attempts) - {problem.score} pts
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const LeaderboardModal = ({ contest, onClose }) => {
  // Use the contest's built-in leaderboard method or create mock data
  const leaderboard = contest.getLeaderboard ? contest.getLeaderboard() : 
    contest.participants?.map((participant, index) => ({
      rank: index + 1,
      name: participant.name || 'Unknown User',
      email: participant.email,
      score: participant.score || 0,
      submissions: participant.submissions || 0,
      solvedProblems: participant.problemsAttempted?.filter(p => p.solved).length || 0,
      totalProblems: contest.problems?.length || 0,
      lastActivityTime: participant.lastActivityTime ? 
        new Date(participant.lastActivityTime).toLocaleTimeString() : 
        'No activity'
    })).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.submissions !== b.submissions) return a.submissions - b.submissions;
      return new Date(a.lastActivityTime) - new Date(b.lastActivityTime);
    }).map((item, index) => ({...item, rank: index + 1})) || [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Contest Leaderboard</h2>
            <p className="text-gray-400">{contest.title}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <span className="text-gray-400">
                Total Points: <span className="text-purple-400 font-semibold">{contest.totalPoints || 0}</span>
              </span>
              <span className="text-gray-400">
                Success Rate: <span className="text-green-400 font-semibold">{contest.successRate || 0}%</span>
              </span>
              <span className="text-gray-400">
                Avg Score: <span className="text-blue-400 font-semibold">{contest.analytics?.averageScore?.toFixed(1) || 0}</span>
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiChartBar className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Submissions Yet</h3>
              <p className="text-gray-400">The leaderboard will update as participants submit solutions</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Rank</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Participant</th>
                    <th className="text-center py-3 px-4 text-gray-300 font-semibold">Score</th>
                    <th className="text-center py-3 px-4 text-gray-300 font-semibold">Solved</th>
                    <th className="text-center py-3 px-4 text-gray-300 font-semibold">Submissions</th>
                    <th className="text-center py-3 px-4 text-gray-300 font-semibold">Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((participant) => (
                    <tr key={participant.email} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            participant.rank === 1 ? 'bg-yellow-500 text-black' :
                            participant.rank === 2 ? 'bg-gray-400 text-black' :
                            participant.rank === 3 ? 'bg-amber-600 text-white' :
                            'bg-gray-700 text-white'
                          }`}>
                            {participant.rank}
                          </div>
                          {participant.rank <= 3 && (
                            <span className="text-yellow-400">
                              {participant.rank === 1 ? '🥇' : participant.rank === 2 ? '🥈' : '🥉'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">{participant.name}</p>
                          <p className="text-gray-400 text-sm">{participant.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-2xl font-bold text-purple-400">{participant.score}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-green-400 font-semibold">
                          {participant.solvedProblems}/{participant.totalProblems}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-blue-400 font-semibold">{participant.submissions}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-gray-400 text-sm">{participant.lastActivityTime}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Contest = ({ onBack }) => {
    // State management
    const [contests, setContests] = useState([]);
    const [problems, setProblems] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
    const [selectedContest, setSelectedContest] = useState(null);
    const [filters, setFilters] = useState({
        status: 'All',
        department: 'All',
        dateRange: 'All'
    });

    // Updated new contest form state - REMOVED roll number filter
    const [newContest, setNewContest] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        duration: '',
        rules: 'Standard contest rules apply',
        maxParticipants: 100,
        selectedProblems: [],
        participantSelection: 'manual',
        filterCriteria: {
            department: '',
            semester: null,
            division: null,
            batch: '',
            studentIdFilter: '' // Only student ID filter remains
        },
        settings: {
            allowLateSubmission: false,
            showLeaderboard: true,
            showLeaderboardDuringContest: true,
            freezeLeaderboard: false,
            freezeTime: 60,
            allowViewProblemsBeforeStart: false,
            penaltyPerWrongSubmission: 0
        }
    });

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Load contests, problems, and users concurrently
                const [contestsResponse, problemsResponse, usersResponse] = await Promise.all([
                    contestAPI.getAllContests(),
                    problemsAPI.getAllProblems({ limit: 100 }),
                    userAPI.getAllUsers({ limit: 100 })
                ]);

                if (contestsResponse.success) {
                    setContests(contestsResponse.data);
                }

                if (problemsResponse.success) {
                    // Transform problems to match expected format
                    const transformedProblems = problemsResponse.data.map(problem => ({
                        _id: problem._id,
                        title: problem.title,
                        difficulty: problem.difficulty,
                        category: problem.category || 'General',
                        points: problem.points || getDifficultyPoints(problem.difficulty)
                    }));
                    setProblems(transformedProblems);
                }

                if (usersResponse.success) {
                    // Transform users to match expected format
                    const transformedUsers = usersResponse.data.users.map(user => ({
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        department: user.department,
                        semester: user.semester || 1,
                        division: user.division || 1,
                        batch: user.batch || 'A1',
                        studentId: user.studentId || user._id // Use studentId or fallback to _id
                    }));
                    setStudents(transformedUsers);
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const getDifficultyPoints = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 100;
            case 'Medium': return 200;
            case 'Hard': return 300;
            default: return 100;
        }
    };

    // Helper function to extract numeric value from string
    const extractNumericValue = (value) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const match = value.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
        }
        return 0;
    };

    // Helper function to check if number is even/odd
    const isEvenNumber = (value) => {
        const num = extractNumericValue(value);
        return num % 2 === 0;
    };

    // Updated filter function - REMOVED roll number filtering
    const getFilteredStudents = () => {
        if (newContest.participantSelection === 'manual') return students;
        
        return students.filter(student => {
            const { department, semester, division, batch, studentIdFilter } = newContest.filterCriteria;
            
            // Basic filters
            const basicMatch = (!department || student.department === department) &&
                              (!semester || student.semester === semester) &&
                              (!division || student.division === division) &&
                              (!batch || student.batch === batch);
            
            if (!basicMatch) return false;
            
            // Student ID filter only
            if (studentIdFilter) {
                const idIsEven = isEvenNumber(student.studentId);
                if (studentIdFilter === 'even' && !idIsEven) return false;
                if (studentIdFilter === 'odd' && idIsEven) return false;
            }
            
            return true;
        });
    };

    // Utility functions
    const getStatusColor = (status) => {
        switch (status) {
            case 'Upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'Active': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            case 'Cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-500/20 text-green-400';
            case 'Medium': return 'bg-yellow-500/20 text-yellow-400';
            case 'Hard': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    // Contest management functions - FIXED to handle manual problems properly
    const handleCreateContest = async (e, manualProblems = []) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            console.log('🎯 Starting contest creation...');
            console.log('📝 Manual problems received:', manualProblems.length);
            console.log('🔧 Selected problems:', newContest.selectedProblems);

            // Validate required fields first
            if (!newContest.title.trim()) {
                throw new Error('Contest title is required');
            }
            
            if (!newContest.description.trim()) {
                throw new Error('Contest description is required');
            }
            
            if (!newContest.startDate) {
                throw new Error('Start date is required');
            }
            
            if (!newContest.endDate) {
                throw new Error('End date is required');
            }
            
            if (!newContest.duration.trim()) {
                throw new Error('Duration is required');
            }
            
            if (new Date(newContest.startDate) >= new Date(newContest.endDate)) {
                throw new Error('End date must be after start date');
            }
            
            if (newContest.selectedProblems.length === 0) {
                throw new Error('At least one problem must be selected');
            }

            // Create a combined problems array for lookup
            const combinedProblems = [...problems, ...manualProblems];
            console.log('🔍 Combined problems for lookup:', combinedProblems.length);

            // Prepare problems data for backend - match ContestProblemSchema exactly
            const selectedProblemsData = newContest.selectedProblems.map((problemId, index) => {
                console.log(`🔍 Processing problem ID: ${problemId}`);
                
                const problem = combinedProblems.find(p => p._id === problemId);
                if (!problem) {
                    console.error(`❌ Problem not found: ${problemId}`);
                    console.error('Available problems:', combinedProblems.map(p => ({ id: p._id, title: p.title })));
                    throw new Error(`Problem with ID ${problemId} not found`);
                }
                
                console.log(`✅ Found problem: ${problem.title} (Manual: ${!!problem.isManual})`);
                
                // Create base problem data
                const problemData = {
                    problemId: problem._id, // This will be a string for manual problems
                    title: problem.title,
                    difficulty: problem.difficulty,
                    category: problem.category || 'General',
                    points: problem.points || getDifficultyPoints(problem.difficulty),
                    order: index + 1,
                    solvedCount: 0,
                    attemptCount: 0
                };

                // If it's a manual problem, include the full problem details
                if (problem.isManual) {
                    console.log(`📝 Adding manual problem data for: ${problem.title}`);
                    problemData.manualProblem = {
                        description: problem.description,
                        inputFormat: problem.inputFormat,
                        outputFormat: problem.outputFormat,
                        constraints: problem.constraints,
                        sampleInput: problem.sampleInput,
                        sampleOutput: problem.sampleOutput,
                        explanation: problem.explanation,
                        testCases: problem.testCases || []
                    };
                }

                return problemData;
            });

            console.log('📊 Problems data prepared:', selectedProblemsData.length);
            console.log('📝 Manual problems in data:', selectedProblemsData.filter(p => p.manualProblem).length);

            // Prepare filter criteria - ensure it matches FilterCriteriaSchema
            const filterCriteria = {};
            
            
            if (newContest.filterCriteria.department) {
                filterCriteria.department = newContest.filterCriteria.department;
            }
            if (newContest.filterCriteria.semester) {
                filterCriteria.semester = newContest.filterCriteria.semester;
            }
            if (newContest.filterCriteria.division) {
                filterCriteria.division = newContest.filterCriteria.division;
            }
            if (newContest.filterCriteria.batch) {
                filterCriteria.batch = newContest.filterCriteria.batch;
            }

            // Prepare settings - ensure all boolean values are proper
            const settings = {
                allowLateSubmission: Boolean(newContest.settings.allowLateSubmission),
                showLeaderboard: Boolean(newContest.settings.showLeaderboard),
                showLeaderboardDuringContest: Boolean(newContest.settings.showLeaderboardDuringContest),
                freezeLeaderboard: Boolean(newContest.settings.freezeLeaderboard),
                freezeTime: parseInt(newContest.settings.freezeTime) || 60,
                allowViewProblemsBeforeStart: Boolean(newContest.settings.allowViewProblemsBeforeStart),
                penaltyPerWrongSubmission: parseInt(newContest.settings.penaltyPerWrongSubmission) || 0
            };

            // Prepare the contest data according to your backend schema
            const contestData = {
                title: newContest.title.trim(),
                description: newContest.description.trim(),
                startDate: new Date(newContest.startDate).toISOString(),
                endDate: new Date(newContest.endDate).toISOString(),
                duration: newContest.duration.trim(),
                rules: newContest.rules.trim() || 'Standard contest rules apply',
                maxParticipants: parseInt(newContest.maxParticipants) || 100,
                problems: selectedProblemsData,
                createdBy: localStorage.getItem('userId') || '68ad4516c3be4979ebac1d49',
                participantSelection: newContest.participantSelection || 'manual',
                filterCriteria: filterCriteria,
                settings: settings
            };

            console.log('📤 Sending contest data to backend:');
            console.log('- Title:', contestData.title);
            console.log('- Problems count:', contestData.problems.length);
            console.log('- Manual problems count:', contestData.problems.filter(p => p.manualProblem).length);
            console.log('- Problem IDs:', contestData.problems.map(p => p.problemId));

            const response = await contestAPI.createContest(contestData);
            
            if (response.success) {
                console.log('✅ Contest created successfully!');
                alert('Contest created successfully!');
                resetNewContestForm();
                setShowCreateModal(false);
                // Reload contests
                window.location.reload();
            } else {
                console.error('❌ Contest creation failed:', response);
                alert(`Failed to create contest: ${response.error}`);
            }
        } catch (error) {
            console.error('❌ Error creating contest:', error);
            alert(`Error creating contest: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const resetNewContestForm = () => {
        setNewContest({
            title: '',
            description: '',
            startDate: '',
            endDate: '',
            duration: '',
            rules: 'Standard contest rules apply',
            maxParticipants: 100,
            selectedProblems: [],
            participantSelection: 'manual',
            filterCriteria: {
                department: '',
                semester: null,
                division: null,
                batch: '',
                studentIdFilter: ''
            },
            settings: {
                allowLateSubmission: false,
                showLeaderboard: true,
                showLeaderboardDuringContest: true,
                freezeLeaderboard: false,
                freezeTime: 60,
                allowViewProblemsBeforeStart: false,
                penaltyPerWrongSubmission: 0
            }
        });
    };

    const handleDeleteContest = async (contestId) => {
        if (window.confirm('Are you sure you want to delete this contest?')) {
            try {
                const response = await contestAPI.deleteContest(contestId);
                if (response.success) {
                    alert('Contest deleted successfully!');
                    window.location.reload();
                } else {
                    alert(`Failed to delete contest: ${response.error}`);
                }
            } catch (error) {
                console.error('Error deleting contest:', error);
                alert(`Error deleting contest: ${error.message}`);
            }
        }
    };

    const handleStartContest = async (contestId) => {
        try {
            const response = await contestAPI.updateContestStatus(contestId, 'Active');
            if (response.success) {
                alert('Contest started successfully!');
                window.location.reload();
            } else {
                alert(`Failed to start contest: ${response.error}`);
            }
        } catch (error) {
            console.error('Error starting contest:', error);
            alert(`Error starting contest: ${error.message}`);
        }
    };

    const handleEndContest = async (contestId) => {
        try {
            const response = await contestAPI.updateContestStatus(contestId, 'Completed');
            if (response.success) {
                alert('Contest ended successfully!');
                window.location.reload();
            } else {
                alert(`Failed to end contest: ${response.error}`);
            }
        } catch (error) {
            console.error('Error ending contest:', error);
            alert(`Error ending contest: ${error.message}`);
        }
    };

    const filteredContests = contests.filter(contest => {
        return (filters.status === 'All' || contest.status === filters.status) &&
               (filters.department === 'All' || contest.participants?.some(p => p.department === filters.department));
    });

    const tabs = [
        { id: 'overview', name: 'Overview', icon: HiStar },
        { id: 'active', name: 'Active Contests', icon: HiPlay },
        { id: 'completed', name: 'Completed', icon: HiChartBar }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-xl">Loading contests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                {onBack && (
                    <div className="mb-6">
                        <button
                            onClick={onBack}
                            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors p-3 hover:bg-white/10 rounded-lg"
                            title="Back to Admin Dashboard"
                        >
                            <HiArrowLeft className="text-xl" />
                            <span className="font-medium">Back to Dashboard</span>
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl mb-6">
                        <HiStar className="text-3xl text-white" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4">Contest Management Hub</h1>
                    <p className="text-gray-300 text-xl">Create, manage, and monitor programming contests with manual problem creation</p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                                }`}
                            >
                                <IconComponent className="text-lg" />
                                <span className="font-medium">{tab.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Action Buttons */}
                        <div className="flex flex-wrap justify-center gap-4">
                            <button 
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                            >
                                <HiPlus className="text-lg" />
                                <span className="font-medium">Create Contest</span>
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Total Contests</p>
                                        <p className="text-3xl font-bold text-white">{contests.length}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                        <HiStar className="text-blue-400 text-xl" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Active Contests</p>
                                        <p className="text-3xl font-bold text-green-400">
                                            {contests.filter(c => c.status === 'Active').length}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                        <HiPlay className="text-green-400 text-xl" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Total Participants</p>
                                        <p className="text-3xl font-bold text-purple-400">
                                            {contests.reduce((sum, c) => sum + (c.participants?.length || 0), 0)}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                        <HiUsers className="text-purple-400 text-xl" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Total Submissions</p>
                                        <p className="text-3xl font-bold text-yellow-400">
                                            {contests.reduce((sum, c) => sum + (c.analytics?.totalSubmissions || 0), 0)}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                                        <HiCode className="text-yellow-400 text-xl" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <HiFilter className="text-blue-400 text-xl" />
                                <h3 className="text-lg font-semibold text-white">Filter Contests</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                                    <select 
                                        value={filters.status}
                                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Upcoming">Upcoming</option>
                                        <option value="Active">Active</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                                    <select 
                                        value={filters.department}
                                        onChange={(e) => setFilters({...filters, department: e.target.value})}
                                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                                    >
                                        <option value="All">All Departments</option>
                                        <option value="AIML">AIML</option>
                                        <option value="CSE">CSE</option>
                                        <option value="IT">IT</option>
                                        <option value="ECE">ECE</option>
                                        <option value="MECH">MECH</option>
                                        <option value="CIVIL">CIVIL</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                                    <select 
                                        value={filters.dateRange}
                                        onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                                    >
                                        <option value="All">All Time</option>
                                        <option value="Today">Today</option>
                                        <option value="This Week">This Week</option>
                                        <option value="This Month">This Month</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Contests List */}
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-white/20">
                                <h2 className="text-2xl font-bold text-white">All Contests ({filteredContests.length})</h2>
                            </div>
                            
                            {filteredContests.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <HiStar className="text-3xl text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">No Contests Found</h3>
                                    <p className="text-gray-400 mb-6">Create your first contest to get started</p>
                                    <button 
                                        onClick={() => setShowCreateModal(true)}
                                        className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                                    >
                                        Create Contest
                                    </button>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-600">
                                    {filteredContests.map((contest) => (
                                        <div key={contest._id} className="p-6 hover:bg-gray-700/30 transition-all duration-300">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-4 mb-3">
                                                        <h3 className="text-xl font-bold text-white">{contest.title}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(contest.status)}`}>
                                                            {contest.status}
                                                        </span>
                                                        {contest.settings?.freezeLeaderboard && (
                                                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                                                                Frozen Board
                                                            </span>
                                                        )}
                                                        {contest.problems?.some(p => p.manualProblem) && (
                                                            <span className="px-2 py-1 rounded text-xs font-medium bg-cyan-500/20 text-cyan-400">
                                                                Manual Problems
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <p className="text-gray-300 mb-4 max-w-2xl">{contest.description}</p>
                                                    
                                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                                                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                                                            <HiCalendar className="w-4 h-4" />
                                                            <span>{formatDate(contest.startDate)}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                                                            <HiClock className="w-4 h-4" />
                                                            <span>{contest.duration}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                                                            <HiUsers className="w-4 h-4" />
                                                            <span>{contest.participants?.length || 0}/{contest.maxParticipants}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                                                            <HiCode className="w-4 h-4" />
                                                            <span>{contest.problems?.length || 0} problems</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                                                            <HiChartBar className="w-4 h-4" />
                                                            <span>{contest.analytics?.totalSubmissions || 0} submissions</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                                                            <span>🎯</span>
                                                            <span>{contest.totalPoints || 0} pts total</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {contest.problems?.slice(0, 3).map((problem, index) => (
                                                            <span key={index} className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                                                                {problem.title} ({problem.points}pts)
                                                                {problem.manualProblem && <span className="ml-1 text-cyan-400">📝</span>}
                                                            </span>
                                                        ))}
                                                        {contest.problems?.length > 3 && (
                                                            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400">
                                                                +{contest.problems.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col space-y-2 ml-6">
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedContest(contest);
                                                            setShowParticipantsModal(true);
                                                        }}
                                                        className="flex items-center space-x-1 bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-500/30 text-sm"
                                                    >
                                                        <HiUsers className="w-4 h-4" />
                                                        <span>Participants</span>
                                                    </button>
                                                    
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedContest(contest);
                                                            setShowLeaderboardModal(true);
                                                        }}
                                                        className="flex items-center space-x-1 bg-green-500/20 text-green-400 px-3 py-2 rounded-lg hover:bg-green-500/30 text-sm"
                                                    >
                                                        <HiChartBar className="w-4 h-4" />
                                                        <span>Leaderboard</span>
                                                    </button>
                                                    
                                                    {contest.status === 'Upcoming' && (
                                                        <button 
                                                            onClick={() => handleStartContest(contest._id)}
                                                            className="flex items-center space-x-1 bg-purple-500/20 text-purple-400 px-3 py-2 rounded-lg hover:bg-purple-500/30 text-sm"
                                                        >
                                                            <HiPlay className="w-4 h-4" />
                                                            <span>Start</span>
                                                        </button>
                                                    )}
                                                    
                                                    {contest.status === 'Active' && (
                                                        <button 
                                                            onClick={() => handleEndContest(contest._id)}
                                                            className="flex items-center space-x-1 bg-orange-500/20 text-orange-400 px-3 py-2 rounded-lg hover:bg-orange-500/30 text-sm"
                                                        >
                                                            <HiStop className="w-4 h-4" />
                                                            <span>End</span>
                                                        </button>
                                                    )}
                                                    
                                                    <button 
                                                        className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded-lg hover:bg-yellow-500/30 text-sm"
                                                    >
                                                        <HiPencil className="w-4 h-4" />
                                                        <span>Edit</span>
                                                    </button>
                                                    
                                                    <button 
                                                        onClick={() => handleDeleteContest(contest._id)}
                                                        className="flex items-center space-x-1 bg-red-500/20 text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/30 text-sm"
                                                    >
                                                        <HiTrash className="w-4 h-4" />
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Active Contests Tab */}
                {activeTab === 'active' && (
                    <div className="space-y-6">
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-6">Currently Active Contests</h2>
                            
                            {contests.filter(c => c.status === 'Active').length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <HiPlay className="text-3xl text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">No Active Contests</h3>
                                    <p className="text-gray-400">All contests are either upcoming or completed</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {contests.filter(c => c.status === 'Active').map(contest => (
                                        <div key={contest._id} className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white mb-2">{contest.title}</h3>
                                                    <p className="text-gray-300 mb-4">{contest.description}</p>
                                                    <div className="flex items-center space-x-6 text-sm">
                                                        <span className="text-green-400">🟢 Live Now</span>
                                                        <span className="text-gray-400">
                                                            {contest.participants?.length || 0} participants
                                                        </span>
                                                        <span className="text-gray-400">
                                                            {contest.analytics?.totalSubmissions || 0} submissions
                                                        </span>
                                                        <span className="text-gray-400">
                                                            Avg Score: {contest.analytics?.averageScore?.toFixed(1) || 0}
                                                        </span>
                                                        <span className="text-gray-400">
                                                            Success Rate: {contest.successRate || 0}%
                                                        </span>
                                                        <span className="text-gray-400">
                                                            Ends: {formatDate(contest.endDate)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedContest(contest);
                                                        setShowLeaderboardModal(true);
                                                    }}
                                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                                                >
                                                    View Live Results
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Completed Tab */}
                {activeTab === 'completed' && (
                    <div className="space-y-6">
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-6">Completed Contests</h2>
                            
                            {contests.filter(c => c.status === 'Completed').length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <HiChartBar className="text-3xl text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">No Completed Contests</h3>
                                    <p className="text-gray-400">Completed contests will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {contests.filter(c => c.status === 'Completed').map(contest => (
                                        <div key={contest._id} className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white mb-2">{contest.title}</h3>
                                                    <p className="text-gray-300 mb-4">{contest.description}</p>
                                                    <div className="flex items-center space-x-6 text-sm">
                                                        <span className="text-gray-400">✅ Completed</span>
                                                        <span className="text-gray-400">
                                                            {contest.participants?.length || 0} participants
                                                        </span>
                                                        <span className="text-gray-400">
                                                            {contest.analytics?.totalSubmissions || 0} submissions
                                                        </span>
                                                        <span className="text-gray-400">
                                                            Success Rate: {contest.successRate || 0}%
                                                        </span>
                                                        <span className="text-gray-400">
                                                            Total Points: {contest.totalPoints || 0}
                                                        </span>
                                                        <span className="text-gray-400">
                                                            Ended: {formatDate(contest.endDate)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedContest(contest);
                                                        setShowLeaderboardModal(true);
                                                    }}
                                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                                                >
                                                    View Results
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Contest Modal */}
            {showCreateModal && (
                <CreateContestModal
                    newContest={newContest}
                    setNewContest={setNewContest}
                    problems={problems}
                    students={students}
                    getFilteredStudents={getFilteredStudents}
                    onSubmit={handleCreateContest}
                    onClose={() => {
                        setShowCreateModal(false);
                        resetNewContestForm();
                    }}
                />
            )}

            {/* Participants Modal */}
            {showParticipantsModal && selectedContest && (
                <ParticipantsModal
                    contest={selectedContest}
                    onClose={() => {
                        setShowParticipantsModal(false);
                        setSelectedContest(null);
                    }}
                />
            )}

            {/* Leaderboard Modal */}
            {showLeaderboardModal && selectedContest && (
                <LeaderboardModal
                    contest={selectedContest}
                    onClose={() => {
                        setShowLeaderboardModal(false);
                        setSelectedContest(null);
                    }}
                />
            )}
        </div>
    );
};

export default Contest;
