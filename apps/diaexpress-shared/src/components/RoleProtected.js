import React, { useMemo } from 'react';
import { useAuthUser } from '../auth/AuthContext';
import { useDevAdminSession } from '../auth/useDevAdminSession';

const normaliseRoles = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return [value];
};

const RoleProtected = ({ role, children }) => {
  const authUser = useAuthUser();
  const devSession = useDevAdminSession();

  const roles = useMemo(() => {
    const collected = new Set();

    if (devSession.isActive) {
      collected.add('admin');
    }

    const dbRole = authUser?.dbUser?.role;
    if (dbRole) {
      collected.add(String(dbRole));
    }

    const dbRoles = authUser?.dbUser?.roles;
    normaliseRoles(dbRoles).forEach((entry) => collected.add(String(entry)));

    if (!collected.size) {
      // DB role is authoritative. Until backend profile is loaded, treat as client for UX only.
      collected.add('client');
    }

    return Array.from(collected).map((value) => String(value).toLowerCase());
  }, [authUser, devSession.isActive]);

  const requiredRole = role ? String(role).toLowerCase() : null;
  const isAllowed = !requiredRole || roles.includes(requiredRole);

  if (!isAllowed) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        ⛔ Accès non autorisé
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleProtected;
