import test from 'node:test';
import assert from 'node:assert/strict';
import { chatStorageKey, clearChat, interruptChat, loadChat, saveChat } from './chatSessionState.ts';

function storage() {
  const data = new Map();
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: key => data.delete(key),
  };
}

const conversation = {
  sessionId: 'signed.session.token',
  messages: [
    { id: 'u', role: 'user', content: 'villas in Goa' },
    { id: 'a', role: 'assistant', content: 'Here are villas', outcome: 'complete', properties: [{ property_id: '1' }] },
  ],
};

test('close/reopen and navigation/remount restore the same session and displayed transcript', () => {
  const store = storage();
  saveChat(store, 'visitor', conversation, 1000);
  assert.deepEqual(loadChat(store, 'visitor', 2000), conversation);
  assert.deepEqual(loadChat(store, 'visitor', 3000), conversation);
});

test('accounts and visitors use isolated state', () => {
  const store = storage();
  saveChat(store, 'user-a', conversation, 1000);
  assert.equal(loadChat(store, 'user-b', 2000), null);
  assert.equal(loadChat(store, 'visitor', 2000), null);
  assert.notEqual(chatStorageKey('user-a'), chatStorageKey('visitor'));
});

test('an interrupted stream restores partial text and cards with a retry action', () => {
  const store = storage();
  const messages = [
    { id: 'u', role: 'user', content: 'with pool' },
    { id: 'a', role: 'assistant', content: 'One match', properties: [{ property_id: '1' }], streaming: true },
  ];
  saveChat(store, 'visitor', { sessionId: 'signed.session.token', messages }, 1000);
  const restored = loadChat(store, 'visitor', 2000);
  assert.equal(restored.messages[1].outcome, 'partial');
  assert.equal(restored.messages[1].streaming, false);
  assert.equal(restored.messages[1].retryText, 'with pool');
  assert.equal(restored.messages[1].properties[0].property_id, '1');
});

test('abort before any output is failed and remains retryable', () => {
  const messages = interruptChat([
    { id: 'u', role: 'user', content: 'under 2cr' },
    { id: 'a', role: 'assistant', content: '', streaming: true },
  ]);
  assert.equal(messages[1].outcome, 'failed');
  assert.equal(messages[1].retryText, 'under 2cr');
});

test('new chat clears state and stale sessions expire', () => {
  const store = storage();
  saveChat(store, 'visitor', conversation, 1000);
  assert.equal(loadChat(store, 'visitor', 31 * 60 * 1000), null);
  saveChat(store, 'visitor', conversation, 1000);
  clearChat(store, 'visitor');
  assert.equal(loadChat(store, 'visitor', 2000), null);
});

test('disabled storage does not break an active chat', () => {
  const blocked = { getItem: () => { throw new Error('blocked'); },
    setItem: () => { throw new Error('blocked'); }, removeItem: () => { throw new Error('blocked'); } };
  assert.doesNotThrow(() => saveChat(blocked, 'visitor', conversation));
  assert.equal(loadChat(blocked, 'visitor'), null);
  assert.doesNotThrow(() => clearChat(blocked, 'visitor'));
});
