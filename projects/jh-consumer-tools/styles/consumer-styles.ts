// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { css } from 'lit';

export const baseAnchorStyles = css`
  a,
  .anchor {
    display: block;
    text-decoration: none;
    color: var(--jha-text-theme) !important;
    cursor: pointer;
    width: auto !important;
  }

  .anchor > * {
    fill: var(--jha-text-theme);
  }

  a:hover,
  .anchor:hover {
    color: var(--inline-button-text-hover-color);
    text-decoration: underline;
  }

  a:active,
  .anchor:active {
    color: var(--inline-button-text-active-color);
    text-decoration: underline;
  }
`;

export const buttonReset = css`
  button.reset,
  a.reset {
    touch-action: manipulation;
    background: none;
    border: none;
    color: var(--body-text-primary-color, var(--jha-text-dark, #191919));
    cursor: pointer;
    display: block;
    font-family:
      'Roboto',
      -apple-system,
      system-ui,
      BlinkMacSystemFont,
      'Segoe UI',
      'Helvetica Neue',
      sans-serif,
      'Apple Color Emoji',
      'Segoe UI Emoji',
      'Segoe UI Symbol';
    font-size: 14px;
    margin: 0;
    padding: 0;
    text-align: left;
    width: 100%;
    -webkit-appearance: none;
  }
  button.reset:disabled {
    cursor: default;
  }
`;

/** Apply padding like jha-list-item (primarily intended to be used inside a `<jha-list-item no-padding>` element) */
export const listItemPadding = css`
  .list-item-padding,
  button.list-item-padding,
  a.list-item-padding {
    padding-top: var(--jha-list-item-vertical-spacing, 16px);
    padding-bottom: var(--jha-list-item-vertical-spacing, 16px);
    padding-right: var(--jha-list-item-horizontal-spacing, 24px);
    padding-left: var(--jha-list-item-horizontal-spacing, 24px);
  }
`;

export const sup = css`
  sup {
    font-size: 75%;
    position: relative;
    top: 1.5px;
    vertical-align: text-top;
  }
`;

export const forms = css`
  label {
    font-size: 13px;
    font-weight: 600;
    color: var(--body-text-primary-color);
    padding: 12px 0;
    margin-bottom: 0;
  }

  input:-webkit-autofill,
  input:-internal-autofill-selected {
    -webkit-text-fill-color: var(--body-text-primary-color);
    -webkit-box-shadow: 0 0 0px 1000px var(--primary-content-background-color) inset;
  }
`;

export const fadeInUp = css`
  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translate3d(0, 15%, 0);
    }

    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  :host(.fadeinup) .fadeinup {
    animation-name: fadeInUp;
    animation-duration: 0.75s;
    animation-timing-function: cubic-bezier(0.1, 0.5, 0.1, 1);
    animation-delay: initial;
    animation-iteration-count: initial;
    animation-direction: initial;
    animation-fill-mode: backwards;
    animation-play-state: initial;
  }
`;

export const cardHeaderTitle = css`
  h1 {
    color: var(--body-text-primary-color);
    font-size: 16px;
    margin: 0;
    font-weight: 500;
    width: 100%;
  }
`;
