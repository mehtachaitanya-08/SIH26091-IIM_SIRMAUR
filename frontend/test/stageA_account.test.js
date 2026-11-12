/**
 * Stage A, My account: updateUser and changePin save to both the users list and the session.
 * Runs without a browser, so the in-memory store is used (the same code path writes localStorage).
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  registerUser, updateUser, changePin, getCurrentSession, getUserByPhone, authenticateByCredentials,
  CATEGORY_SC, authenticateByGoogle
} from '../src/data/userDatabase.js';

let phone;
let n = 0;
beforeEach(() => {
  n += 1;
  phone = `90000000${String(n).padStart(2, '0')}`;
  const r = registerUser({ name: 'Asha', phone, pin: '1111', category: CATEGORY_SC });
  assert.equal(r.success, true);
});

describe('updateUser', () => {
  it('saves name, SC, income and district to the users list and the session', () => {
    const id = getCurrentSession().id;
    const r = updateUser(id, { name: 'Asha Devi', category: null, income: 120000, district: 'Agra' });
    assert.equal(r.success, true);
    for (const u of [getUserByPhone(phone), getCurrentSession()]) {
      assert.equal(u.name, 'Asha Devi');
      assert.equal(u.category, null);
      assert.equal(u.income, 120000);
      assert.equal(u.district, 'Agra');
    }
  });

  it('an empty income is saved as not given (null), never as 0', () => {
    const r = updateUser(getCurrentSession().id, { income: '' });
    assert.equal(r.success, true);
    assert.equal(getCurrentSession().income, null);
  });

  it('refuses a negative or non-number income, and an unknown SC answer', () => {
    const id = getCurrentSession().id;
    assert.equal(updateUser(id, { income: -5 }).success, false);
    assert.equal(updateUser(id, { income: 'abc' }).success, false);
    assert.equal(updateUser(id, { category: 'OBC' }).success, false);
  });

  it('cannot change the PIN or phone through updateUser', () => {
    const id = getCurrentSession().id;
    updateUser(id, { pin: '9999', phone: '1' });
    assert.equal(getUserByPhone(phone).pin, '1111');
  });

  it('an unknown account is refused', () => {
    assert.equal(updateUser('NOPE', { name: 'x' }).success, false);
  });
});

describe('changePin', () => {
  it('a wrong current PIN is refused and the PIN stays', () => {
    const r = changePin(getCurrentSession().id, '0000', '2222');
    assert.equal(r.success, false);
    assert.equal(getUserByPhone(phone).pin, '1111');
  });

  for (const bad of ['123', '12345', 'abcd', '12a4', '']) {
    it(`a new PIN that is not 4 digits ("${bad}") is refused`, () => {
      assert.equal(changePin(getCurrentSession().id, '1111', bad).success, false);
      assert.equal(getUserByPhone(phone).pin, '1111');
    });
  }

  it('the right current PIN and a 4-digit new PIN: sign-in works with the new PIN only', () => {
    assert.equal(changePin(getCurrentSession().id, '1111', '2222').success, true);
    assert.equal(getCurrentSession().pin, '2222');
    assert.equal(authenticateByCredentials(phone, '1111').success, false);
    assert.equal(authenticateByCredentials(phone, '2222').success, true);
  });

  it('an unknown account is refused', () => {
    assert.equal(changePin('GOOG-NOPE', '', '1234').success, false);
  });

  it('a real Google account (no PIN) is refused, with the Google reason', () => {
    const g = authenticateByGoogle({ email: `g${n}@example.org`, name: 'Google Name' }).user;
    const r = changePin(g.id, '', '1234');
    assert.equal(r.success, false);
    assert.match(r.error, /Google/);
  });
});

describe('Google sign-in keeps a name changed in My account (review finding, 12 Nov 2026)', () => {
  it('Google\'s name is used until the user changes it in My account; then the user\'s own name is kept', () => {
    const email = `keep${n}@example.org`;
    const g = authenticateByGoogle({ email, name: 'Google Name' }).user;
    assert.equal(g.name, 'Google Name');
    assert.equal(authenticateByGoogle({ email, name: 'Google Name 2' }).user.name, 'Google Name 2');
    assert.equal(updateUser(g.id, { name: 'My Own Name' }).success, true);
    const again = authenticateByGoogle({ email, name: 'Google Name' }).user;
    assert.equal(again.name, 'My Own Name');
    assert.equal(getCurrentSession().name, 'My Own Name');
  });
});
