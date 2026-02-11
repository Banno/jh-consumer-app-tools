// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { execFile } from 'child_process';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function generateSslCerts(outputDir, domain = 'localhost') {
  await mkdir(outputDir, { recursive: true });

  const caKeyPath = join(outputDir, 'ca.key');
  const caCertPath = join(outputDir, 'ca.pem');
  const serverKeyPath = join(outputDir, 'key.pem');
  const serverCsrPath = join(outputDir, 'server.csr');
  const serverCertPath = join(outputDir, 'cert.pem');
  const caSerialPath = join(outputDir, 'ca.srl');
  const cnfPath = join(__dirname, 'openssl.cnf');

  const commands = [
    { cmd: 'openssl', args: ['genrsa', '-out', caKeyPath, '2048'] },
    {
      cmd: 'openssl',
      args: [
        'req',
        '-x509',
        '-new',
        '-nodes',
        '-key',
        caKeyPath,
        '-sha256',
        '-days',
        '365',
        '-out',
        caCertPath,
        '-subj',
        `/CN=${domain}-ca`,
      ],
    },
    { cmd: 'openssl', args: ['genrsa', '-out', serverKeyPath, '2048'] },
    { cmd: 'openssl', args: ['req', '-new', '-key', serverKeyPath, '-out', serverCsrPath, '-config', cnfPath] },
    {
      cmd: 'openssl',
      args: [
        'x509',
        '-req',
        '-in',
        serverCsrPath,
        '-CA',
        caCertPath,
        '-CAkey',
        caKeyPath,
        '-CAcreateserial',
        '-out',
        serverCertPath,
        '-days',
        '365',
        '-sha256',
        '-extfile',
        cnfPath,
        '-extensions',
        'v3_req',
      ],
    },
  ];

  // Only run the commands if the files don't exist.
  if (!existsSync(caKeyPath)) {
    await runCommand(commands[0].cmd, commands[0].args);
  }
  if (!existsSync(caCertPath)) {
    await runCommand(commands[1].cmd, commands[1].args);
  }
  if (!existsSync(serverKeyPath)) {
    await runCommand(commands[2].cmd, commands[2].args);
  }
  if (!existsSync(serverCsrPath)) {
    await runCommand(commands[3].cmd, commands[3].args);
  }
  if (!existsSync(serverCertPath)) {
    await runCommand(commands[4].cmd, commands[4].args);
  }
}

function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}
