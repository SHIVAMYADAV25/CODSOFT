import React from 'react';
import Sidebar from "../ui/Sidebar.js";
import './AppLayout.css';

const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-main">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;