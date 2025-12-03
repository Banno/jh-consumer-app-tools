// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { createContext } from '@lit/context';
import { type Institution } from '../types/institution';

export interface InstitutionContext {
  institution: Institution;
  state: 'initial' | 'loading' | 'ready' | 'error';
}

export const defaultInstitutionContext: InstitutionContext = {
  institution: banno.web.config,
  state: 'initial',
};

export const institutionContext = createContext<InstitutionContext>(Symbol.for('institution'));
