import test from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../src/config/env.js';
import { analyzeReport, parseAnalysis } from '../src/services/analysis.js';

test('AI rejects malformed and incomplete provider output', () => {
  assert.throws(() => parseAnalysis('not JSON'));
  assert.throws(() => parseAnalysis('{"is_medical_report":true}'));
  assert.throws(() => parseAnalysis('{"is_medical_report":"yes"}'));
  assert.equal(parseAnalysis('{"is_medical_report":false}').is_medical_report, false);
});
test('AI client sends a bounded request and parses bilingual output', async () => {
  const originalFetch = global.fetch, originalKey = config.geminiKey;
  config.geminiKey = 'test-key';
  global.fetch = async (url, options) => {
    assert.match(url, /^https:\/\/generativelanguage.googleapis.com/);
    const body = JSON.parse(options.body);
    assert.equal(body.contents[0].parts[1].inlineData.mimeType, 'application/pdf');
    assert.equal(body.generationConfig.responseMimeType, 'application/json');
    return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify({ is_medical_report: true, summary: 'A test report', english: 'Discuss the values with your clinician.', romanUrdu: 'Apne doctor se in values par baat karein.', questions: ['What should we review?'] }) }] } }] }) };
  };
  try {
    const result = await analyzeReport({ mimeType: 'application/pdf', fileData: Buffer.from('%PDF-') });
    assert.equal(result.is_medical_report, true); assert.ok(result.romanUrdu);
    global.fetch = async () => ({ ok: false });
    await assert.rejects(() => analyzeReport({ mimeType: 'application/pdf', fileData: Buffer.from('%PDF-') }), error => error.status === 502);
  } finally { global.fetch = originalFetch; config.geminiKey = originalKey; }
});
