import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-6 md:p-8" data-testid="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
