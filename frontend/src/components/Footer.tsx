import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gray-50 border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-gray-600">
        <p className="mb-2">© {new Date().getFullYear()} All rights reserved.</p>
        <div className="flex items-center justify-center gap-4">
          <a href="#privacy" className="hover:text-gray-900">Privacy</a>
          <span className="text-gray-300">•</span>
          <a href="#terms" className="hover:text-gray-900">Terms</a>
          <span className="text-gray-300">•</span>
          <a href="#contact" className="hover:text-gray-900">Contact</a>
        </div>
      </div>
    </footer>
  );
};
