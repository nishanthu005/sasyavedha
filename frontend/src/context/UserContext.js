import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock user data - in production, this would come from auth API
    const mockUser = {
      id: 'user123',
      name: 'Agricultural Manager',
      email: 'manager@sasyavedha.com',
      role: 'admin', // admin, manager, supervisor, user
      organization: 'Green Valley Agro Corp',
      permissions: [
        'view_dashboard',
        'manage_farms',
        'view_analytics',
        'manage_team',
        'manage_inventory',
        'generate_reports'
      ],
      subscription: {
        plan: 'enterprise',
        farms: 50,
        users: 25,
        features: ['all']
      }
    };

    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 500);
  }, []);

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || user?.role === 'admin';
  };

  const canAccessFeature = (feature) => {
    if (user?.role === 'admin') return true;
    
    const rolePermissions = {
      admin: ['all'],
      manager: ['view_dashboard', 'manage_farms', 'view_analytics', 'manage_inventory'],
      supervisor: ['view_dashboard', 'manage_farms', 'view_analytics'],
      user: ['view_dashboard']
    };

    return rolePermissions[user?.role]?.includes(feature) || rolePermissions[user?.role]?.includes('all');
  };

  const updateProfile = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const value = {
    user,
    loading,
    hasPermission,
    canAccessFeature,
    updateProfile,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isSupervisor: user?.role === 'supervisor',
    isUser: user?.role === 'user'
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

