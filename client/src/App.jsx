import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Classroom from './pages/Classroom';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Settings from './pages/Settings';
import JoinSession from './pages/JoinSession';
import SignAvatar from './pages/SignAvatar';
import { AddonsProvider, AddonsOverlay } from './addons';

export default function App() {
  return (
    <AddonsProvider>
      <BrowserRouter>
        {/* Toast notifications container */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1C1C1F',
              color: '#F5F0E8',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '12px',
              fontFamily: '"DM Sans", sans-serif',
              borderRadius: '8px'
            },
            success: {
              iconTheme: {
                primary: '#4ADE80',
                secondary: '#1C1C1F',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF4D4D',
                secondary: '#1C1C1F',
              },
            },
          }}
        />
        <AddonsOverlay />
        <Routes>
          <Route path="/join/:sessionId" element={<JoinSession />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="classroom" element={<Classroom />} />
            <Route path="avatar" element={<SignAvatar />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Landing />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AddonsProvider>
  );
}
