// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import { exec } from 'child_process';
import { join } from 'path';
import { generateSslCerts } from './generate-certs.js';
import { existsSync } from 'fs';

export async function checkCerts(certsDir) {
  const caKeyPath = join(certsDir, 'ca.key');
  const caCertPath = join(certsDir, 'ca.pem');
  const serverKeyPath = join(certsDir, 'key.pem');
  const serverCertPath = join(certsDir, 'cert.pem');

  if (!existsSync(caKeyPath) || !existsSync(caCertPath) || !existsSync(serverKeyPath) || !existsSync(serverCertPath)) {
    console.log('Certificate files not found. Generating new ones...');
    await generateSslCerts(certsDir);
    return;
  }

  const command = `openssl x509 -enddate -noout -in ${serverCertPath}`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // If the cert doesn't exist, generate it.
        if (error.message.includes('No such file or directory')) {
          console.log('Certificate not found. Generating a new one...');
          generateSslCerts(certsDir).then(resolve).catch(reject);
        } else {
          reject(error);
        }
        return;
      }

      const notAfter = new Date(stdout.split('=')[1]);
      const now = new Date();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      if (notAfter.getTime() - now.getTime() < sevenDays) {
        console.log('Certificate is expiring soon. Generating a new one...');
        generateSslCerts(certsDir).then(resolve).catch(reject);
      } else {
        console.log('Certificate is valid.');
        resolve();
      }
    });
  });
}
