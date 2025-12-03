// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { css } from 'lit';

const styles = css`
  * {
    box-sizing: border-box;
  }
  *[hidden] {
    display: none;
  }
  *[button-reset] {
    touch-action: manipulation;
    background: none;
    border: none;
    color: var(--jha-text-dark);
    cursor: pointer;
    display: block;
    font-family: -apple-system, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    font-size: 14px;
    margin: 0;
    padding: 0;
    text-align: left;
    width: 100%;
    -webkit-appearance: none;
  }
  header[dialog] {
    padding: 32px;
    border-bottom: 1px solid var(--jha-border-color, #e4e7ea);
    border-top-left-radius: 1px;
    border-top-right-radius: 1px;
    text-align: center;
    position: relative;
    font-size: 18px;
    font-weight: 400;
    color: var(--jha-text-dark, #455564);
  }
  hr {
    box-sizing: content-box;
    height: 1px;
    background-color: var(--jha-border-color);
    border: 0;
    margin-top: 16px;
    margin-bottom: 16px;
  }
`;

export { styles as jhaStyles };
