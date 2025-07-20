import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ModuleSelection.css';

const ModuleSelection = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 1,
      name: 'Module 1 - MCQ Test',
      type: 'MCQ',
      description: 'Multiple Choice Questions',
      available: true,
      icon: '📝'
    },
    {
      id: 2,
      name: 'Module 2 - Coding Test',
      type: 'Coding',
      description: 'Solve Problem',
      available: false,
      icon: '💻'
    }
  ];

  const handleModuleSelection = (module) => {
    if (!module.available) {
      alert('This module is not available yet');
      return;
    }

    if (module.type === 'MCQ') {
      navigate('/mcq');
    }
  };

  return (
    <div className="module-selection-container">
      <h1>Select Your Test Module</h1>
      <div className="modules-grid">
        {modules.map(module => (
          <button
            key={module.id}
            className={`module-card ${!module.available ? 'disabled' : ''}`}
            onClick={() => handleModuleSelection(module)}
            disabled={!module.available}
          >
            <div className="module-icon">{module.icon}</div>
            <h2>{module.name}</h2>
            <p className="module-description">{module.description}</p>
            <div className={`module-status ${module.available ? 'available' : ''}`}>
              {module.available ? '✓ Available Now' : 'Unavailable'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModuleSelection;
