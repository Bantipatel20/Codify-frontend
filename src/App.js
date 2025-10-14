// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './components/LoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import ClientLayout from './components/client/ClientLayout';

import ProblemManagement from './components/admin/ProblemManagement';
import StudentManagement from './components/admin/StudentManagement';
import SubmissionTracking from './components/admin/SubmissionTracking';
import Settings from './components/admin/Settings';
import PracticeProblems from './components/client/PracticeProblems';
import Contest from './components/admin/Contest';
import Contests from './components/client/Contests';
import ContestDetails from './components/client/ContestDetails';
import ContestParticipation from './components/client/ContestParticipation';
import Submissions from './components/client/Submissions';

import Compiler from './components/client/Compiler';

const App = () => {
    return (
        <Router>
            <Routes>
                
                <Route path="/" element={<LoginPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/problems" element={<ProblemManagement />} />
                <Route path="/admin/students" element={<StudentManagement />} />
                <Route path="/admin/submissions" element={<SubmissionTracking />} />
                <Route path="/admin/settings" element={<Settings />} />
                <Route path="/admin/contests" element={<Contest />} />
                
                {/* Client Routes with Layout */}
                <Route path="/client" element={<ClientLayout />}>
                
                 
                    <Route path="practice" element={<PracticeProblems />} />
                    <Route path="contests" element={<Contests />} />
                    <Route path="submissions" element={<Submissions />} />
                    
                </Route>

                {/* Full-screen Client Routes (outside layout) */}
                <Route path="/client/practice/compiler" element={<Compiler />} />
                <Route path="/client/contests/:id" element={<ContestDetails />} />
                <Route path="/client/contests/:id/participate" element={<ContestParticipation />} />
                
                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
