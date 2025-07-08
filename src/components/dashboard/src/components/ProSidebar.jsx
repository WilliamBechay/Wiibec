import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, Settings, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const ProSidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const proNavItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Profil', path: '/profile', icon: User },
        { name: 'Admin', path: '/admin', icon: Shield },
    ];

    const NavItem = ({ path, name, icon: Icon }) => (
        <NavLink
            to={path}
            className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
            }
        >
            <Icon className="w-5 h-5 mr-3" />
            <span>{name}</span>
        </NavLink>
    );

    return (
        <aside className="w-64 flex-shrink-0 bg-background border-r border-border flex flex-col p-4">
            <Link to="/" className="flex items-center space-x-3 px-4 mb-8">
                <span className="text-2xl font-bold text-foreground">WIIBEC</span>
            </Link>

            <nav className="flex-1 space-y-2">
                {proNavItems.map((item) => (
                    <NavItem key={item.name} {...item} />
                ))}
            </nav>

            <div className="mt-auto">
                <div className="p-4 border-t border-border">
                    <p className="text-sm font-medium text-foreground">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
                    <LogOut className="w-5 h-5 mr-3" />
                    Déconnexion
                </Button>
            </div>
        </aside>
    );
};

export default ProSidebar;