import React from 'react';
import { AddonsProvider, useAddons } from './context/AddonsContext';
import { AddonErrorBoundary } from './components/ErrorBoundary';
import AddonNavbarEntry from './components/AddonNavbarEntry';
import TeacherControlPanel from './components/TeacherControlPanel';
import StudentAlertPanel from './components/StudentAlertPanel';
import AuthModal from './components/AuthModal';
import EmphasisBadge from './components/EmphasisBadge';
import MarkedMomentsList from './components/MarkedMomentsList';
import StudentSessionBanner from './components/StudentSessionBanner';
import { addonConfig } from './config';

// Non-blocking caption dispatch hook helper
export function dispatchCaptionFinalized(segment) {
  if (!segment || !segment.text) return;

  // Asynchronous fetch call - max timeout 1.5s - fail silently
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);

  fetch('/api/addons/emphasis/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      segmentId: segment.segmentId || 'seg_' + Date.now(),
      text: segment.text,
      timestamp: segment.timestamp || Date.now(),
      sessionId: segment.sessionId || null,
      slidingWindow: segment.slidingWindow || ''
    }),
    signal: controller.signal
  })
    .catch(() => {
      // Fail silently, captions continue running
    })
    .finally(() => {
      clearTimeout(timeoutId);
    });
}

export function AddonsOverlay() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useAddons();

  return (
    <AddonErrorBoundary>
      <TeacherControlPanel />
      <StudentAlertPanel />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </AddonErrorBoundary>
  );
}

export {
  AddonsProvider,
  useAddons,
  AddonNavbarEntry,
  StudentSessionBanner,
  EmphasisBadge,
  MarkedMomentsList,
  addonConfig
};
