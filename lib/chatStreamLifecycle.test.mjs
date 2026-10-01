import test from 'node:test';
import assert from 'node:assert/strict';
import { ChatRequestSlot, ChatStreamLifecycle, rateLimitMessage } from './chatStreamLifecycle.ts';

test('normal stream completes once', () => {
  const stream = new ChatStreamLifecycle(new AbortController().signal);
  assert.equal(stream.accept('token'), true);
  assert.equal(stream.accept('done'), true);
  assert.doesNotThrow(() => stream.assertComplete(true));
  assert.equal(stream.accept('error', 'late error'), false);
});

test('frontend abort prevents completion and further updates', () => {
  const controller = new AbortController();
  const stream = new ChatStreamLifecycle(controller.signal);
  controller.abort();
  assert.equal(stream.accept('token'), false);
  assert.throws(() => stream.assertComplete(true), { name: 'AbortError' });
});

test('truncated and missing-done streams remain incomplete', () => {
  const stream = new ChatStreamLifecycle(new AbortController().signal);
  stream.accept('token');
  assert.throws(() => stream.assertComplete(true), /before completion/);
  assert.throws(() => stream.assertComplete(false), /empty streaming response/);
});

test('terminal error is reported once without becoming a completed answer', () => {
  const stream = new ChatStreamLifecycle(new AbortController().signal);
  stream.accept('error', 'provider failed');
  assert.equal(stream.accept('error', 'duplicate'), false);
  assert.equal(stream.accept('done'), false);
  assert.equal(stream.error, 'provider failed');
  assert.throws(() => stream.assertComplete(true), /provider failed/);
});

test('429 response gives the server retry time when available', () => {
  assert.equal(rateLimitMessage('5'), 'Too many requests. Try again in 5 seconds.');
  assert.equal(rateLimitMessage(null), 'Too many requests. Please try again shortly.');
  assert.equal(rateLimitMessage('invalid'), 'Too many requests. Please try again shortly.');
});

test('a newer request invalidates stale responses and only its cleanup ends loading', () => {
  const slot = new ChatRequestSlot();
  const old = slot.begin();
  const current = slot.begin();
  assert.equal(old.signal.aborted, true);
  assert.equal(slot.isCurrent(old), false);
  assert.equal(slot.finish(old), false);
  assert.equal(slot.active, true);
  assert.equal(slot.isCurrent(current), true);
  assert.equal(slot.finish(current), true);
  assert.equal(slot.active, false);
});

test('cancel and unmount terminate a request without accepting late completion', () => {
  const slot = new ChatRequestSlot();
  const current = slot.begin();
  const lifecycle = new ChatStreamLifecycle(current.signal);
  slot.cancel();
  assert.equal(current.signal.aborted, true);
  assert.equal(lifecycle.accept('done'), false);
  assert.equal(slot.finish(current), true);
  const remounted = slot.begin();
  slot.reset();
  assert.equal(remounted.signal.aborted, true);
  assert.equal(slot.active, false);
});
