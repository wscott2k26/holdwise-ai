import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'codemagic.yaml',
  'native/ios/HoldWiseAI/project.yml',
  'native/ios/HoldWiseAI/Resources/Info.plist',
  'native/ios/HoldWiseAI/Resources/PrivacyInfo.xcprivacy',
  'native/ios/HoldWiseAI/Sources/HoldWiseStoreKitBridge.swift',
];

for (const item of required) {
  if (!fs.existsSync(path.join(root, item))) {
    throw new Error(`Missing current release file: ${item}`);
  }
}

const yaml = fs.readFileSync(path.join(root, 'codemagic.yaml'), 'utf8');
for (const expected of [
  'holdwise-ios-testflight:',
  'feature/holdwise-light-premium-v6',
  'BUNDLE_ID: com.willywill.holdwiseai',
  'MARKETING_VERSION: 1.4.0',
  'APPLE_TEAM_ID: CY5N965N53',
  'app-store-connect fetch-signing-files "$BUNDLE_ID"',
  '--type IOS_APP_STORE',
  '--create',
  'keychain add-certificates',
  'xcode-project use-profiles',
  'xcode-project build-ipa',
  'codesign --verify --deep --strict',
  'security cms -D -i',
  'auth: integration',
  'submit_to_testflight: true',
  'submit_to_app_store: false',
]) {
  if (!yaml.includes(expected)) {
    throw new Error(`Codemagic TestFlight workflow missing: ${expected}`);
  }
}

// The release workflow must create/fetch signing files inside the build. An
// environment-level ios_signing prefetch fails before scripts can create a new
// profile for a newly registered bundle ID.
if (yaml.includes('ios_signing:')) {
  throw new Error('Codemagic release workflow may not require an existing ios_signing profile before scripts run.');
}
if (yaml.includes('--warn-only')) {
  throw new Error('Code signing may not use --warn-only in the final release workflow.');
}

const project = fs.readFileSync(path.join(root, 'native/ios/HoldWiseAI/project.yml'), 'utf8');
for (const expected of [
  'MARKETING_VERSION: 1.4.0',
  'PRODUCT_BUNDLE_IDENTIFIER: com.willywill.holdwiseai',
  'PRODUCT_NAME: HoldWise AI',
  'IPHONEOS_DEPLOYMENT_TARGET: 15.0',
]) {
  if (!project.includes(expected)) {
    throw new Error(`Native iOS project release contract missing: ${expected}`);
  }
}
if (project.includes('CODE_SIGNING_ALLOWED: NO')) {
  throw new Error('Native iOS project may not globally disable Release code signing.');
}

const storeKit = fs.readFileSync(path.join(root, 'native/ios/HoldWiseAI/Sources/HoldWiseStoreKitBridge.swift'), 'utf8');
for (const productID of [
  'holdwise.premium.monthly',
  'holdwise.premium.yearly',
  'holdwise.premium.lifetime',
]) {
  if (!storeKit.includes(productID)) {
    throw new Error(`StoreKit release bridge missing product: ${productID}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const packageLock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
const releaseVersion = packageJson.version;
if (!releaseVersion || packageLock.version !== releaseVersion || packageLock.packages?.['']?.version !== releaseVersion) {
  throw new Error(`Package versions are not synchronized at ${releaseVersion || 'the package version'}.`);
}
if (releaseVersion !== '1.4.0') {
  throw new Error(`Unexpected HoldWise release version: ${releaseVersion}`);
}

console.log('GitHub → Codemagic → signed IPA → TestFlight release validation passed.');
