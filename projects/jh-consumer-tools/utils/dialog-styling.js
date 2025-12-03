// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

/** styling necessary for the dialog util */
export default `
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
  @keyframes slideInLeft {
    0% {
      opacity: 1;
      transform: translate3d(100%, 0, 0);
    }

    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }
  @keyframes slideOutRight {
    0% {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }

    100% {
      opacity: 1;
      transform: translate3d(100%, 0, 0);
    }
  }
  @keyframes fadeInDown {
    0% {
      opacity: 0;
      transform: translate3d(0, -15%, 0);
    }

    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }
  @keyframes fadeOutUp {
    0% {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
    100% {
      opacity: 0;
      transform: translate3d(0, -15%, 0);
    }
  }
  @keyframes fadeOutDown {
    0% {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
    100% {
      opacity: 0;
      transform: translate3d(0, 15%, 0);
    }
  }
  @keyframes fadeIn {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }
  @keyframes fadeOut {
    0% {
      opacity: 1;
    }

    100% {
      opacity: 0;
    }
  }
  dialog + .backdrop {
    position: fixed;
    top: 0; right: 0; bottom: 0; left: 0;
    background: rgba(0,0,0,0.6);
  }
  ._dialog_overlay {
    position: fixed;
    top: 0; right: 0; bottom: 0; left: 0;
  }
  dialog {
    position: fixed;
    font-family: Roboto;
    left: 0; right: 0;
    top: 30px;
    max-width: 90%;
    min-height: 0;
    max-height: none;
    border-radius: var(--jha-dialog-border-radius, var(--jha-card-border-radius, 4px));
    box-shadow: var(--jha-card-box-shadow, var(--card-shadow));
    border: none;
    margin: auto;
    padding: 0;
    background: var(--jha-dialog-background-color, var(--jha-component-background-color, #ffffff));
    display: none;
    z-index: 9999;
    overflow: visible;
  }
  dialog[wide] {
    max-width: 800px;
  }
  dialog[drawer] {
    top: 0;
    bottom: 0;
    left: auto;
  }

  dialog.hide::backdrop {
    animation-name: fadeOut !important;
  }
  dialog[open] {
    display: block;
    animation-duration: 0.5s;
  }
  dialog::backdrop {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.6);
    animation-name: fadeIn;
    animation-duration: 0.5s;
  }
  @media screen and (min-width: 540px) {
    dialog[open] {
      animation-name: fadeInDown;
    }
    dialog[open][drawer] {
      animation-name: slideInLeft;
    }
    dialog.hide {
      animation-name: fadeOutUp;
    }
    dialog[drawer].hide {
      animation-name: slideOutRight;
    }
    dialog[drawer][drawer-size="large"] {
      width: 80%;
      max-width: unset;
    }
  }
  @media screen and (min-width: 1024px) {
    dialog[drawer][drawer-size="medium"] {
      width: 55%;
      max-width: unset;
    }
  }
  @media screen and (max-width: 540px) {
    dialog[_polyfill_modal] {  /* TODO: implement */
      top: 0;
      width: auto;
      margin: 1em;
    }
    dialog[open] {
      animation-name: fadeInUp;
    }
    dialog[open][drawer] {
      animation-name: slideInLeft;
    }
    dialog.hide {
      animation-name: fadeOutDown;
    }
    dialog[drawer].hide {
      animation-name: slideOutRight;
    }
  }
  dialog.fixed {
    position: fixed;
    top: 50%;
    transform: translate(0, -50%);
  }

  @media (max-width: 480px), (max-height: 480px) {
    dialog {
      overflow-y: auto;
      top: 0;
      bottom: 0;
      max-width: none;
      width: 100%;
      border-radius: 0;
    }
    dialog[small-mobile] {
      top: 30px;
      width: 90%;
      height: auto;
    }
    dialog[full-mobile] {
      height: 100%;;
    }
  }
  dialog[mobile-menu] {
    width: 272px;
    margin: 0;
    border: 0;
    padding: 0;
    height: 100%;
    overflow-y: auto;
    left: 0;
    top: 0;
    border-radius: 0;
  }
  dialog[mobile-menu]::backdrop {
    background: rgba(51,51,51,0.4);
  }
  dialog[open][mobile-menu] {
    animation: showMenu .3s;
  }
  dialog[mobile-menu].hide {
    animation: hideMenu .3s;
  }
  dialog:focus-visible {
    outline: none;
  }
  @keyframes showMenu {
    from {
      transform: translateX(-640px);
    }
    to {
      transform: translateX(0);
    }
  }
  @keyframes hideMenu {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-640px);
    }
  }
  body {
    scroll-behavior: smooth;
  }
  body.has-dialog {
    overflow: hidden;
  }
`;
