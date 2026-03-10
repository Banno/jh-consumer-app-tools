<!--
SPDX-FileCopyrightText: 2025 Jack Henry

SPDX-License-Identifier: Apache-2.0
-->

# @jack-henry/create-consumer-app

A command-line tool to generate a Jack Henry oauth consumer application, pre-configured with `@jack-henry/consumer-tools`.

## Usage

You can create a new project by running any of the following commands. You can optionally include the project name as a command-line argument.

```bash
# npm
npm create @jack-henry/consumer-app [your-project-name]

# yarn
yarn create @jack-henry/consumer-app [your-project-name]

# pnpm
pnpm create @jack-henry/consumer-app [your-project-name]
```

If you don't specify a project name, the CLI will prompt you for one.

## Features

- **Interactive Setup**: The CLI will prompt you for your project name, institution ID, client ID, client secret, API base URL, and redirect URIs.
- **Template-Based Scaffolding**: The generator copies a pre-configured template based on the `example-consumer-app`.
- **File Renaming and Content Replacement**: The generator will rename files and replace content from `example-consumer-app` to `your-project-name`.
- **Dynamic `package.json`**: The `name` field in the new project's `package.json` is automatically set to your project name.
- **Package Manager Selection**: You can choose between `npm`, `yarn (v1)`, and `yarn (v4)`.
- **Automatic Dependency Installation**: The generator runs the appropriate install command to install all necessary dependencies.
- **Next Steps Guidance**: After completion, the CLI provides instructions on how to run your new application.

## Configuration

During setup, the CLI creates a `.env` file in your project with the credentials you provide (institution ID, client ID, client secret, API URL, and redirect URIs). The `vite.config.ts` reads these variables at dev-server startup.

## Generated Project Structure

Your new project will have the following structure:

```
your-project-name/
├── src/
│   ├── components/
│   ├── routing/
│   └── your-project-name.ts
├── index.html
├── package.json
├── README.md
└── ...
```

## SSL Certificate Generation

The development server uses a self-signed SSL certificate for HTTPS. This is generated automatically when you run the `dev` command for the first time.

### How it Works

A local Certificate Authority (CA) is created in the `certs` directory of your project. This CA is then used to sign a server certificate, which is also stored in the `certs` directory.

The `vite.config.ts` is configured to use these certificates for the development server.

### Trusting the Certificate Authority

Because the CA is self-signed, your browser will not trust it by default. This will result in a privacy warning when you try to access the application.

To resolve this, you need to trust the CA certificate. The CA certificate is located at `certs/ca.pem` in your project directory.

#### macOS

1.  Open the **Keychain Access** application.
2.  Select the **System** keychain.
3.  Drag and drop the `certs/ca.pem` file into the Keychain Access window.
4.  Double-click the imported certificate.
5.  Expand the **Trust** section.
6.  Set **When using this certificate** to **Always Trust**.
7.  Close the certificate window. You may be prompted for your password.

#### Windows

1.  Double-click the `certs/ca.pem` file.
2.  Click the **Install Certificate...** button.
3.  Select **Local Machine** and click **Next**.
4.  Select **Place all certificates in the following store**.
5.  Click **Browse...** and select **Trusted Root Certification Authorities**.
6.  Click **OK**, then **Next**, then **Finish**.

#### Firefox

Firefox has its own trust store.

1.  Open Firefox and go to `about:preferences#privacy`.
2.  Scroll down to the **Certificates** section and click **View Certificates...**.
3.  Select the **Authorities** tab.
4.  Click **Import...**.
5.  Select the `certs/ca.pem` file.
6.  Check the box for **Trust this CA to identify websites**.
7.  Click **OK**.