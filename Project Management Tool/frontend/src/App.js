import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';

import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Projects from './components/Projects';
import AppLayout from './layouts/AppLayout';
import ProjectDetail from './components/ProjectDetail';
import AllTasks from './components/AllTasks.js';
import MyTasks from './components/MyTasks.js';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* Default route */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            }
          />
          <Route
  path="/projects/:id"
  element={
    <AppLayout>
      <ProjectDetail />
    </AppLayout>
  }
/>

<Route
  path="/tasks"
  element={
    <AppLayout>
      <AllTasks />
    </AppLayout>
  }
/>

<Route
  path="/my-tasks"
  element={
    <AppLayout>
      <MyTasks />
    </AppLayout>
  }
/>

          {/* Other routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/projects" element={<Projects />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;