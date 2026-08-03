import { canAccessAdminLogin } from './admin-login-access';
import { UserProfile } from './user-profile';
import { ROLES_LIST } from './constants';

describe('canAccessAdminLogin', () => {
  it('allows session ADMIN', () => {
    expect(canAccessAdminLogin({ isAdmin: true, roles: [] })).toBe(true);
  });

  it('allows DIRETOR profile', () => {
    expect(
      canAccessAdminLogin({ isAdmin: false, userProfile: UserProfile.DIRETOR, roles: [] })
    ).toBe(true);
  });

  it('allows JWT DIRETOR role', () => {
    expect(
      canAccessAdminLogin({
        isAdmin: false,
        userProfile: UserProfile.JOGADOR,
        roles: ['DIRETOR'],
      })
    ).toBe(true);
  });

  it('allows ADMIN role string', () => {
    expect(
      canAccessAdminLogin({
        isAdmin: false,
        userProfile: UserProfile.JOGADOR,
        roles: [ROLES_LIST.ACCESS_ADMIN_PANEL],
      })
    ).toBe(true);
  });

  it('rejects JOGADOR / GESTOR without admin or diretor', () => {
    expect(
      canAccessAdminLogin({
        isAdmin: false,
        userProfile: UserProfile.JOGADOR,
        roles: ['ACCESS_PLAYER_PANEL'],
      })
    ).toBe(false);

    expect(
      canAccessAdminLogin({
        isAdmin: false,
        userProfile: UserProfile.GESTOR,
        roles: ['GESTOR'],
      })
    ).toBe(false);
  });
});
