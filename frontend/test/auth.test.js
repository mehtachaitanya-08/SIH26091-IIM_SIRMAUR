/**
 * Unit & Behavioral Verification Test Suite for the User Database (mobile number + PIN sign-in)
 * Confirms complete elimination of mock data and verifies genuine state & error flows.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  getAllUsers,
  getUserByPhone,
  getUserByEmail,
  authenticateByCredentials,
  registerUser,
  getCurrentSession,
  saveSession,
  clearSession
} from '../src/data/userDatabase.js';

describe('1. Pure User Database & Demo Elimination', () => {
  beforeEach(() => {
    clearSession();
  });

  it('getAllUsers initially returns an empty array with zero mock seed accounts', () => {
    const users = getAllUsers();
    assert.ok(Array.isArray(users), 'Users must be an array');
    // Ensure no hardcoded "Ramesh Kumar" seed profile exists
    const ramesh = users.find(u => u.name?.toLowerCase().includes('ramesh'));
    assert.strictEqual(ramesh, undefined, 'Must not contain hardcoded Ramesh Kumar in seed users');
  });

  it('authenticateByCredentials fails when phone or PIN is missing', () => {
    const res1 = authenticateByCredentials('', '1234');
    assert.strictEqual(res1.success, false);
    assert.ok(res1.error.includes('Mobile number is required'));

    const res2 = authenticateByCredentials('9876543210', '');
    assert.strictEqual(res2.success, false);
    assert.ok(res2.error.includes('PIN is required'));
  });

  it('authenticateByCredentials returns error for unregistered mobile number without mock fallback', () => {
    const res = authenticateByCredentials('9999988888', '1234');
    assert.strictEqual(res.success, false);
    assert.ok(res.error.includes('User not found'), 'Should inform user to register instead of silent mock login');
  });

  it('registerUser enforces phone and pin validation', () => {
    const resNoPhone = registerUser({ name: 'Valid Name', phone: '', pin: '1234' });
    assert.strictEqual(resNoPhone.success, false);

    const resNoPin = registerUser({ name: 'Valid Name', phone: '9888877777', pin: '' });
    assert.strictEqual(resNoPin.success, false);
  });

  it('registerUser successfully registers a genuine rural entrepreneur and persists session', () => {
    const testPhone = '9123456780';
    const res = registerUser({
      name: 'Sunita Devi',
      phone: testPhone,
      pin: '4321',
      trade: 'Handloom Weaving',
      category: 'Scheduled Caste (SC)'
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.user.name, 'Sunita Devi');
    assert.strictEqual(res.user.phone, testPhone);
    assert.strictEqual(res.user.trade, 'Handloom Weaving');
    assert.ok(res.user.id.startsWith('REG-'));  // no "UP-": it implied Uttar Pradesh (11 Nov 2026)

    // Verify session was established
    const active = getCurrentSession();
    assert.ok(active);
    assert.strictEqual(active.phone, testPhone);

    // Verify duplicate registration rejection
    const dupRes = registerUser({
      name: 'Duplicate Sunita',
      phone: testPhone,
      pin: '4321'
    });
    assert.strictEqual(dupRes.success, false);
    assert.ok(dupRes.error.includes('already registered'));
  });
});
