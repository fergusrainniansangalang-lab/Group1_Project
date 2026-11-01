// @file    Onboarding.js
// @folder  src/screens/
// @about   Welcome splash screen shown to first-time users.
//
// What this file does:
// - Displays the Facebook "f" logo, app name, and a brief tagline.
// - Renders a "Get Started" button that calls the onComplete callback.
// - Transitions the app from the onboarding flow into the main login screen.

import React from 'react';

export const Onboarding = ({ onComplete }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-blue-600 text-white p-6">
      <div className="text-center max-w-sm space-y-6">
        <div className="w-20 h-20 bg-white text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl font-black text-4xl">
          f
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Welcome to Facebook</h1>
        <p className="text-blue-100 text-sm leading-relaxed">
          Connect with friends, share media, and stay organized with your built-in tasks and feeds.
        </p>
        <button
          onClick={onComplete}
          className="w-full py-3.5 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:bg-blue-50 transition-all"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};