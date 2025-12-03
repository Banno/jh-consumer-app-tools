// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { createContext } from '@lit/context';
import { type User } from '../controllers/login-controller';

export interface UserContext {
  user: User;
  state: 'unauthenticated' | 'authenticated' | 'loading' | 'checking';
}

export const defaultUserContext: UserContext = {
  user: null,
  state: 'unauthenticated',
};

export const userContext = createContext<UserContext>(Symbol.for('user'));
