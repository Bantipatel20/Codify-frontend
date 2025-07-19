import './Admin.css'
import React, { useState } from 'react';

const Admin = () => {
  // States for different sections
  const [activeSection, setActiveSection] = useState('students'); // students, exams, mcqs
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [newStudent, setNewStudent] = useState({ id: '', name: '', password: '' });
  const [newExam, setNewExam] = useState({ id: '', title: '', duration: '' });
  const [selectedExam, setSelectedExam] = useState(null);
  const [newMCQ, setNewMCQ] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });


  const handleAddStudent = (e) => {
    e.preventDefault();
    setStudents([...students, { ...newStudent, id: Date.now().toString() }]);
    setNewStudent({ id: '', name: '', password: '' });
  };


  const handleCreateExam = (e) => {
    e.preventDefault();
    setExams([...exams, { ...newExam, id: Date.now().toString(), mcqs: [] }]);
    setNewExam({ id: '', title: '', duration: '' });
  };

  // Handle MCQ addition
  const handleAddMCQ = (e) => {
    e.preventDefault();
    if (!selectedExam) return;

    const updatedExams = exams.map(exam => {
      if (exam.id === selectedExam) {
        return {
          ...exam,
          mcqs: [...exam.mcqs, { ...newMCQ, id: Date.now().toString() }]
        };
      }
      return exam;
    });

    setExams(updatedExams);
    setNewMCQ({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
  };

  // Handle option change in MCQ form
  const handleOptionChange = (index, value) => {
    const newOptions = [...newMCQ.options];
    newOptions[index] = value;
    setNewMCQ({ ...newMCQ, options: newOptions });
  };

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <button 
          onClick={() => setActiveSection('students')}
          className={activeSection === 'students' ? 'active' : ''}
        >
          Manage Students
        </button>
        <button 
          onClick={() => setActiveSection('exams')}
          className={activeSection === 'exams' ? 'active' : ''}
        >
          Manage Exams
        </button>
        <button 
          onClick={() => setActiveSection('mcqs')}
          className={activeSection === 'mcqs' ? 'active' : ''}
        >
          Add MCQs
        </button>
      </div>

      <div className="admin-content">
        {activeSection === 'students' && (
          <div className="section">
            <h2>Add New Student</h2>
            <form onSubmit={handleAddStudent}>
              <input
                type="text"
                placeholder="Student Name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newStudent.password}
                onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                required
              />
              <button type="submit">Add Student</button>
            </form>

            <h3>Student List</h3>
            <div className="student-list">
              {students.map(student => (
                <div key={student.id} className="student-item">
                  <p>Name: {student.name}</p>
                  <p>ID: {student.id}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'exams' && (
          <div className="section">
            <h2>Create New Exam</h2>
            <form onSubmit={handleCreateExam}>
              <input
                type="text"
                placeholder="Exam Title"
                value={newExam.title}
                onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={newExam.duration}
                onChange={(e) => setNewExam({ ...newExam, duration: e.target.value })}
                required
              />
              <button type="submit">Create Exam</button>
            </form>

            <h3>Exam List</h3>
            <div className="exam-list">
              {exams.map(exam => (
                <div key={exam.id} className="exam-item">
                  <p>Title: {exam.title}</p>
                  <p>Duration: {exam.duration} minutes</p>
                  <p>MCQs: {exam.mcqs?.length || 0}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'mcqs' && (
          <div className="section">
            <h2>Add MCQs to Exam</h2>
            <select
              value={selectedExam || ''}
              onChange={(e) => setSelectedExam(e.target.value)}
            >
              <option value="">Select Exam</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.title}
                </option>
              ))}
            </select>

            {selectedExam && (
              <form onSubmit={handleAddMCQ}>
                <textarea
                  placeholder="Question"
                  value={newMCQ.question}
                  onChange={(e) => setNewMCQ({ ...newMCQ, question: e.target.value })}
                  required
                />
                {newMCQ.options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                  />
                ))}
                <select
                  value={newMCQ.correctAnswer}
                  onChange={(e) => setNewMCQ({ ...newMCQ, correctAnswer: parseInt(e.target.value) })}
                >
                  {newMCQ.options.map((_, index) => (
                    <option key={index} value={index}>
                      Option {index + 1}
                    </option>
                  ))}
                </select>
                <button type="submit">Add MCQ</button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
