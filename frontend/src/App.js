import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ResumePage from './pages/ResumePage';
import EducationPage from './pages/EducationPage';
import JobSearchPage from './pages/JobSearchPage';
import ApplicationPage from './pages/ApplicationPage';
import NotificationsPage from './pages/NotificationsPage';
import AchievementsPage from './pages/AchievementsPage'
import LeaveManagementPage from './pages/LeaveManagementPage';
import TerminationRequestPage from './pages/TerminationRequestPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/education" element={<EducationPage />} />
        <Route path="/job-search" element={<JobSearchPage />} />
        <Route path="/applications" element={<ApplicationPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/leave-management" element={<LeaveManagementPage />} />
        <Route path="/termination-request" element={<TerminationRequestPage />} />
      </Routes>
    </Router>
  );
}

export default App;

