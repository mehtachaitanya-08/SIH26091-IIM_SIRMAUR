/**
 * Stage A, My account: updateUser and changePin save to both the users list and the session.
 * Runs without a browser, so the in-memory store is used (the same code path writes localStorage).
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  registerUser, updateUser, changePin, getCurrentSession, getUserByPhone, authenticateByCredentials,
  CATEGORY_SC, getAllUsers
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
    assert.equal(changePin('NO-SUCH-ID', '', '1234').success, false);
  });

  // Replaces the Google-account test removed with Google sign-in (12 Nov 2026): the "no PIN" rule
  // in changePin had no other test. Without a browser, getAllUsers() hands back the in-memory list.
  it('a saved account with no PIN is refused, and gets no PIN', () => {
    const id = `NOPIN-${n}`;
    getAllUsers().push({ id, name: 'No PIN', phone: '', authProvider: 'local' });
    const r = changePin(id, '', '1234');
    assert.equal(r.success, false);
    assert.match(r.error, /no PIN/);
    assert.equal(getAllUsers().find((u) => u.id === id).pin, undefined);
  });
});
