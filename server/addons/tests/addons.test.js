import assert from 'node:assert';
import { test, describe } from 'node:test';
import { checkStudentNameCalled, getPhoneticKey } from '../services/nameMatcher.js';
import { analyzeRules } from '../services/emphasisService.js';
import { requireAuth, requireRole } from '../middleware/addonAuth.js';
import { config } from '../config.js';

describe('Add-on Layer Unit Tests', () => {

  describe('Module 2: Fuzzy & Phonetic Name Matcher', () => {
    test('Exact student name detection', () => {
      const student = { id: 's1', name: 'Praveen Ramesh', aliases: ['Prav', 'Pravin'] };
      const result = checkStudentNameCalled('Praveen is answering the question', student, 0);
      assert.notEqual(result, null);
      assert.equal(result.studentId, 's1');
      assert.equal(result.matchType, 'exact');
    });

    test('Fuzzy name detection for speech recognition typos (Levenshtein)', () => {
      const student = { id: 's2', name: 'Alexander', aliases: ['Alex'] };
      // "Alexanderr" has edit distance 1
      const result = checkStudentNameCalled('Alexanderr please read chapter 3', student, 0);
      assert.notEqual(result, null);
      assert.equal(result.matchType, 'fuzzy_levenshtein');
    });

    test('Phonetic soundex matching (Double Metaphone style)', () => {
      const student = { id: 's3', name: 'Stephen', aliases: [] };
      const key1 = getPhoneticKey('Stephen');
      const key2 = getPhoneticKey('Steven');
      assert.equal(key1, key2);
    });

    test('20-second cooldown enforcement', () => {
      const student = { id: 's4', name: 'Maria', aliases: [] };
      const result1 = checkStudentNameCalled('Maria state your answer', student, 20000);
      assert.notEqual(result1, null);

      // Immediate second call should be blocked by 20s cooldown
      const result2 = checkStudentNameCalled('Maria please repeat', student, 20000);
      assert.equal(result2, null);
    });
  });

  describe('Module 1: Rule Engine & Cue Detection', () => {
    test('Detects EXAM_POINT tag', () => {
      const res = analyzeRules('This concept will definitely appear on the final exam');
      assert.notEqual(res, null);
      assert.equal(res.tag, 'EXAM_POINT');
    });

    test('Detects EMPHASIS tag', () => {
      const res = analyzeRules('Make sure to note this down in your notebook');
      assert.notEqual(res, null);
      assert.equal(res.tag, 'EMPHASIS');
    });

    test('Detects DEFINITION tag', () => {
      const res = analyzeRules('State is defined as data stored within a component');
      assert.notEqual(res, null);
      assert.equal(res.tag, 'DEFINITION');
    });

    test('Detects QUESTION tag', () => {
      const res = analyzeRules('What happens when we trigger a re-render');
      assert.notEqual(res, null);
      assert.equal(res.tag, 'QUESTION');
    });

    test('Detects NEW_TOPIC tag', () => {
      const res = analyzeRules('Now let us look at the next topic in React');
      assert.notEqual(res, null);
      assert.equal(res.tag, 'NEW_TOPIC');
    });
  });

  describe('Module 0: Server-side Role Middleware', () => {
    test('requireRole blocks unauthorized student from teacher routes', () => {
      config.ADDON_AUTH = true;
      const middleware = requireRole('teacher');
      let statusCalled = null;
      let jsonMessage = null;

      const req = { user: { id: 'stu1', role: 'student' } };
      const res = {
        status: (code) => {
          statusCalled = code;
          return {
            json: (obj) => { jsonMessage = obj; }
          };
        }
      };
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      middleware(req, res, next);
      assert.equal(statusCalled, 403);
      assert.equal(nextCalled, false);
      assert.ok(jsonMessage.error.includes('Requires teacher role'));
    });

    test('requireRole allows teacher access', () => {
      const middleware = requireRole('teacher');
      const req = { user: { id: 'teach1', role: 'teacher' } };
      const res = {};
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      middleware(req, res, next);
      assert.equal(nextCalled, true);
    });
  });
});
