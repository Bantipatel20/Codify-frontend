import React, { useState } from 'react';

// Static MCQ data (will be replaced with backend data later)
const mcqData = [
  {
    id: 1,
    question: 'Which of the following is not a feature of Object-Oriented Programming?',
    options: ['Inheritance', 'Encapsulation', 'Compilation', 'Polymorphism'],
    correctAnswer: 2 // Index of correct answer
  },
  {
    id: 2,
    question: 'Which programming language is React built with?',
    options: ['Python', 'JavaScript', 'Java', 'C++'],
    correctAnswer: 1
  },
  {
    id: 3,
    question: 'Which OOP concept allows a subclass to provide a specific implementation of a method already defined in its superclass?',
    options: ['Inheritance3', 'Method Overriding', 'Data Hiding', 'Constructor'],
    correctAnswer: 1
  }
];

const MCQ = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const handleAnswerSelect = (optionIndex) => {
    setSelectedAnswer(optionIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === mcqData[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < mcqData.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowScore(true);
    }
  };

  if (showScore) {
    return (
      <div className="mcq-container">
        <div className="score-section">
          <h2>Exam Completed!</h2>
          <p>Your score: {score} out of {mcqData.length}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mcq-container">
      <div className="question-section">
        <h2>Question {currentQuestion + 1} of {mcqData.length}</h2>
        <p className="question">{mcqData[currentQuestion].question}</p>
      </div>
      <div className="options-section">
        {mcqData[currentQuestion].options.map((option, index) => (
          <button
            key={index}
            className={`option-button ${selectedAnswer === index ? 'selected' : ''}`}
            onClick={() => handleAnswerSelect(index)}
          >
            {option}
          </button>
        ))}
      </div>
      <button 
        className="next-button"
        onClick={handleNext}
        disabled={selectedAnswer === null}
      >
        {currentQuestion + 1 === mcqData.length ? 'Submit' : 'Next'}
      </button>
    </div>
  );
};

export default MCQ;
