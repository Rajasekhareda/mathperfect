import React from 'react';
import WorksheetApp from '../worksheet/App';
import '../worksheet/index.css';

export const WorksheetsView: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-[#f2f5f9] text-[#1c2733]">
      <WorksheetApp />
    </div>
  );
};
