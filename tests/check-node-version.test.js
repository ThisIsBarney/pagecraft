const test = require('node:test');
const assert = require('node:assert/strict');

const {
  checkVersion,
  compareVersions,
  parseVersion,
} = require('../scripts/check-node-version.js');

test('parseVersion parses valid semver strings', () => {
  assert.deepEqual(parseVersion('v18.17.0'), [18, 17, 0]);
  assert.deepEqual(parseVersion('20.4.1'), [20, 4, 1]);
});

test('parseVersion returns null for invalid semver strings', () => {
  assert.equal(parseVersion('18.17'), null);
  assert.equal(parseVersion('latest'), null);
});

test('compareVersions compares each semver segment', () => {
  assert.equal(compareVersions([18, 17, 0], [18, 17, 0]), 0);
  assert.equal(compareVersions([18, 18, 0], [18, 17, 9]), 1);
  assert.equal(compareVersions([18, 9, 0], [18, 17, 0]), -1);
});

test('checkVersion validates >= ranges without parseFloat bugs', () => {
  assert.equal(checkVersion('v18.17.0', '>=18.17.0'), true);
  assert.equal(checkVersion('v18.18.0', '>=18.17.0'), true);
  assert.equal(checkVersion('v18.9.0', '>=18.17.0'), false);
  assert.equal(checkVersion('v17.20.0', '>=18.17.0'), false);
});

test('checkVersion falls back to permissive mode for unsupported ranges', () => {
  assert.equal(checkVersion('v18.17.0', '^18.17.0'), true);
});
