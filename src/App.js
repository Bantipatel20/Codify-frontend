// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import ClientLayout from './components/client/ClientLayout';
import ClientDashboard from './components/client/ClientDashboard';
import ProblemManagement from './components/admin/ProblemManagement';
import StudentManagement from './components/admin/StudentManagement';
import SubmissionTracking from './components/admin/SubmissionTracking';
import Settings from './components/admin/Settings';
import PracticeProblems from './components/client/PracticeProblems';
import Contest from './components/admin/Contest';
import Submissions from './components/client/Submissions';
import PerformanceTracking from './components/client/PerformanceTracking';
import ProfilePage from './components/client/ProfilePage';
import TwoSumProblem from './components/client/Compiler';
const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/problems" element={<ProblemManagement />} />
                <Route path="/admin/students" element={<StudentManagement />} />
                <Route path="/admin/submissions" element={<SubmissionTracking />} />
                <Route path="/admin/settings" element={<Settings />} />
                <Route path="/admin/contests" element={<Contest />} />
                
                {/* Client Routes with Layout */}
                <Route path="/client" element={<ClientLayout />}>
    <Route index element={<Navigate to="/client/dashboard" replace />} />
    <Route path="dashboard" element={<ClientDashboard />} />
    <Route path="practice" element={<PracticeProblems />} />
    <Route path="submissions" element={<Submissions />} />
    <Route path="performance" element={<PerformanceTracking />} />
    <Route path="profile" element={<ProfilePage />} />
    <Route path="practice/complier" element={<TwoSumProblem />} /> {/* Compiler route */}
</Route>
            </Routes>
        </Router>
    );
};

export default App;
