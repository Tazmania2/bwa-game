import { detectManagementDashboardCachedRole } from '@utils/management-dashboard-role';
import { UserProfile } from '@utils/user-profile';
import { ROLES_LIST } from '@utils/constants';

/**
 * Indica se o utilizador pode entrar pela rota `/login-admin`
 * (perfil ADMIN na sessão ou DIRETOR por role JWT / perfil de equipa).
 */
export function canAccessAdminLogin(options: {
  roles?: string[] | null;
  isAdmin?: boolean;
  userProfile?: UserProfile | null;
}): boolean {
  if (options.isAdmin) {
    return true;
  }

  if (options.userProfile === UserProfile.DIRETOR) {
    return true;
  }

  const cachedRole = detectManagementDashboardCachedRole(options.roles);
  if (cachedRole === 'DIRETOR') {
    return true;
  }

  const roles = options.roles;
  if (!Array.isArray(roles) || roles.length === 0) {
    return false;
  }

  return roles.some((role) => {
    if (!role || typeof role !== 'string') {
      return false;
    }
    const token = role.trim().toUpperCase().replace(/-/g, '_');
    return (
      token === ROLES_LIST.ACCESS_ADMIN_PANEL ||
      token.includes('ADMIN') ||
      token === 'DIRETOR' ||
      token.includes('DIRETOR')
    );
  });
}
