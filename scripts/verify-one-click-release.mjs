import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'RUN-HOLDWISE-TO-TESTFLIGHT.ps1',
  'START-HOLDWISE-RELEASE.bat',
  'LAST_MILE_README.md',
  'codemagic.yaml',
  'native/ios/HoldWiseAI/project.yml',
  'native/ios/HoldWiseAI/Resources/HoldWiseAI.entitlements',
  'native/ios/HoldWiseAI/Sources/HoldWiseStoreKitBridge.swift',
];
for (const item of required) {
  if (!fs.existsSync(path.join(root, item))) throw new Error(`Missing one-click release file: ${item}`);
}
const yaml = fs.readFileSync(path.join(root, 'codemagic.yaml'), 'utf8');
for (const expected of [
  'holdwise-ios-sign-only:',
  'holdwise-ios-testflight:',
  'app-store-connect bundle-ids enable-capabilities',
  '--capability "Sign In with Apple" "In-App Purchase"',
  'app-store-connect fetch-signing-files',
  'xcode-project build-ipa',
  'codesign --verify',
  'auth: integration',
  'wscott2k8@gmail.com',
]) {
  if (!yaml.includes(expected)) throw new Error(`Codemagic release workflow missing: ${expected}`);
}
if (yaml.includes('--warn-only')) throw new Error('Code signing may not use --warn-only in the final release workflow.');

const ps = fs.readFileSync(path.join(root, 'RUN-HOLDWISE-TO-TESTFLIGHT.ps1'), 'utf8');
for (const expected of [
  'https://gitlab.com',
  'https://api.codemagic.io/apps',
  'https://api.codemagic.io/builds',
  'Read-Host $Prompt -AsSecureString',
  'holdwise-ios-sign-only',
  'holdwise-ios-testflight',
  'com.willywill.holdwiseai',
  'HOLDWISE-IOS-001',
  'Find-IpaUrls',
]) {
  if (!ps.includes(expected)) throw new Error(`Windows release launcher missing: ${expected}`);
}
for (const forbidden of [
  'AuthKey_97SL8G4294.p8-----BEGIN',
  '-----BEGIN PRIVATE KEY-----',
  'glpat-',
]) {
  if (ps.includes(forbidden)) throw new Error(`Potential secret embedded in launcher: ${forbidden}`);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const packageLock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
if (packageJson.version !== '1.3.0' || packageLock.version !== '1.3.0' || packageLock.packages?.['']?.version !== '1.3.0') {
  throw new Error('Package versions are not synchronized at 1.3.0.');
}
console.log('One-click GitLab → Codemagic → signed IPA → App Store Connect release validation passed.');
