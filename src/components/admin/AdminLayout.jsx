import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

const AdminLayout = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      <AdminNavbar />
      <main className="flex-1 p-6 bg-muted/40">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;