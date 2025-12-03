// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { fixture, elementUpdated } from '@open-wc/testing-helpers';
import './jha-card.js';
import JhaCard from './jha-card.js';

describe('jha-card', () => {
  describe('when error message text is set', () => {
    it('should show the error message text', async () => {
      const el = await fixture<JhaCard>('<jha-card></jha-card>');
      el.errorMessage = 'foo';
      // need to await the jha-error-message
      await elementUpdated(el);
      expect(el.shadowRoot.querySelector('jha-error-message').textContent.trim()).toEqual('foo');
    });
  });
  describe('when loading and there is no data', () => {
    it('should show progress', async () => {
      const el = await fixture<JhaCard>('<jha-card></jha-card>');
      el.loading = true;
      el.hasData = false;
      await elementUpdated(el);
      expect(el.shadowRoot.querySelector('jha-progress')).toBeTruthy();
    });
  });
  describe('when not loading and there is no data', () => {
    it('No Data Message', async () => {
      const el = await fixture<JhaCard>('<jha-card></jha-card>');
      el.loading = false;
      el.hasData = false;
      el.noDataMessage = 'No Data';
      await elementUpdated(el);
      expect(el.shadowRoot.querySelector('p').textContent.trim()).toEqual('No Data');
    });
  });
});
