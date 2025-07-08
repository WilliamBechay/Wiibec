import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, BarChart2, FileText, Map, Settings } from 'lucide-react';

const navItems = [
  { name: 'Mailing', path: '/admin/mailing', icon: Mail },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
  { name: 'Logs', path: '/admin/logs', icon: FileText },
  { name: 'Sitemap', path: '/admin/sitemap', icon: Map },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-background border-r border-border p-4 flex flex-col">
      <div className="mb-8">
        <h2 className="text-lg font-semibold tracking-tight">Admin Panel</h2>
      </div>
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;