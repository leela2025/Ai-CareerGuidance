import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import JourneyPage from './pages/JourneyPage';
import DashboardPage from './pages/DashboardPage';
import CareerGuidancePage from './pages/CareerGuidancePage';
import RoadmapPage from './pages/RoadmapPage';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import MentorsPage from './pages/MentorsPage';
import MentorProfilePage from './pages/MentorProfilePage';
import ConnectionsPage from './pages/ConnectionsPage';
import ChatPage from './pages/ChatPage';
import ApplyMentorPage from './pages/ApplyMentorPage';
import PlatformFeedbackPage from './pages/PlatformFeedbackPage';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import StoryDetailPage from './pages/StoryDetailPage';
import SubmitStoryPage from './pages/SubmitStoryPage';
import MyStoriesPage from './pages/MyStoriesPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import SkillHealthPage from './pages/SkillHealthPage';
import SkillVerificationPage from './pages/SkillVerificationPage';
import ProjectsPage from './pages/ProjectsPage';
import AddProjectPage from './pages/AddProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-brand-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ForgotPasswordPage />} />

              {/* Protected Student Routes */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/journey"
                element={
                  <ProtectedRoute>
                    <JourneyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/career-guidance"
                element={
                  <ProtectedRoute>
                    <CareerGuidancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/roadmap"
                element={
                  <ProtectedRoute>
                    <RoadmapPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resume-analyzer"
                element={
                  <ProtectedRoute>
                    <ResumeAnalyzerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/skill-health"
                element={
                  <ProtectedRoute>
                    <SkillHealthPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/skills/:skillName/verify"
                element={
                  <ProtectedRoute>
                    <SkillVerificationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <ProjectsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/add"
                element={
                  <ProtectedRoute>
                    <AddProjectPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <ProtectedRoute>
                    <ProjectDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Mentor Connect & Real-time Chat Module Routes */}
              <Route path="/mentors" element={<MentorsPage />} />
              <Route path="/mentors/:id" element={<MentorProfilePage />} />
              <Route
                path="/mentors/apply"
                element={
                  <ProtectedRoute>
                    <ApplyMentorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/connections"
                element={
                  <ProtectedRoute>
                    <ConnectionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages/:conversationId"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />

              {/* Feedback, Success Stories & Ratings Module Routes */}
              <Route
                path="/feedback"
                element={
                  <ProtectedRoute>
                    <PlatformFeedbackPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/stories" element={<SuccessStoriesPage />} />
              <Route path="/stories/:id" element={<StoryDetailPage />} />
              <Route
                path="/stories/submit"
                element={
                  <ProtectedRoute>
                    <SubmitStoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stories/mine"
                element={
                  <ProtectedRoute>
                    <MyStoriesPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/mentors"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboardPage defaultTab="mentors" />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
