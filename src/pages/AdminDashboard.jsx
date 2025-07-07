import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  return <Navigate to="/admin/dashboard" replace />;
};

export default AdminDashboard;