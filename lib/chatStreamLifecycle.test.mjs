import test from 'node:test';
import assert from 'node:assert/strict';
import { ChatStreamLifecycle, rateLimitMessage } from './chatStreamLifecycle.ts';

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
