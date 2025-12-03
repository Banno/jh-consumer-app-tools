// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

export interface OauthUserAddress {
  locality: string;
  postal_code: string;
  region: string;
  street_address: string;
}

export interface OauthUser {
  sub: string;
  given_name: string;
  family_name: string;
  name: string;
  address: OauthUserAddress;
  email: string;
  nickname: string;
  picture: string;
  preferred_username: string;
  // 'https://api.banno.com/consumer/claim/institution_id': string;// JR: not sure why we had this property
  at_hash: string;
  aud: string;
  exp: number;
  iat: number;
  iss: string;
}

export interface UserInfoAddress {
  streetAddress: string;
  streetAddress2: string;
  streetAddress3?: string;
  streetAddress4?: string;
  city: string;
  state: string;
  zip: string;
}

export interface LastEulaAcceptance {
  acceptedAt: string;
  eulaId: string;
  userId: string;
}

export interface Organization {
  organizationId: string;
  status: 'Active' | 'Pending' | 'Disabled' | 'Reset' | 'Dormant' | 'Locked' | 'PasswordExpired';
  adminLevel: 'Admin' | 'Viewer' | 'User';
}

export interface UserInfo {
  userId: string;
  id: string;
  email: string;
  userType: 'Individual' | 'Company';
  firstName: string;
  middleName: string;
  lastName: string;
  institutionId: string;
  username: string;
  phoneNumber: string;
  address: UserInfoAddress;
  userVerified: boolean;
  userAddedDateTime: string;
  businessName?: string;
  preferredName?: string;
  lastEulaAcceptance?: LastEulaAcceptance;
  organization?: Organization;
}

export interface User extends OauthUser {
  profile?: UserInfo;
}

export class LoginController {
  static get user(): User | null {
    const userJson = sessionStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Validates the user's authentication status by calling `GET /validate`.
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const response = await fetch('/validate');

      if (!response.ok) {
        throw new Error();
      }

      const user = (await response.json()) as User;
      const existingUser = LoginController.user || {};
      const merged = { ...existingUser, ...user };
      sessionStorage.setItem('user', JSON.stringify(merged));
      if (!merged.profile) {
        await LoginController.getUserInfo(user.sub);
      }
      return true;
    } catch (error) {
      sessionStorage.removeItem('user');
      return false;
    }
  }

  static async getUserInfo(userId: string): Promise<User | null> {
    try {
      const response = await fetch(`/a/consumer/api/v0/users/${userId}`);

      if (!response.ok) {
        throw new Error();
      }

      // TODO: move this into the isAuthenticated function
      const userProfile = (await response.json()) as UserInfo;
      const existingUser = LoginController.user;
      const merged = { ...existingUser, profile: { ...existingUser?.profile, ...userProfile } };
      sessionStorage.setItem('user', JSON.stringify(merged));
      return merged;
    } catch (error) {
      sessionStorage.removeItem('user');
      return null;
    }
  }

  /**
   * Redirects to the authentication endpoint
   */
  static redirectToAuth(returnPath: string = '/'): void {
    window.location.href = `/auth?returnPath=${encodeURIComponent(returnPath)}`;
  }

  /**
   * Clears user session from cache
   */
  static logout(): void {
    sessionStorage.removeItem('user');
  }
}

export default LoginController;
