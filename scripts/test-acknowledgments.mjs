// Tests for the Acknowledgments and Timeline data rules (Node's built-in TypeScript stripping).   npm run test:stage5
// Covers the conditional-rendering logic (no empty/"#"/inactive links) and the data validators, including negative cases.
import assert from 'node:assert/strict';
import { entryLinks, assertAcknowledgmentsValid, acknowledgments } from '../src/lib/acknowledgments.ts';
import { assertTimelineValid, timeline } from '../src/lib/timeline.ts';

let checks = 0;
const ok = (fn) => (fn(), checks++);

// ----- entryLinks: conditional rendering
ok(() => assert.deepEqual(entryLinks({}), { linkedin: null, website: null, email: null }));
ok(() => assert.deepEqual(entryLinks({ linkedin: '', website: '  ', email: '' }), { linkedin: null, website: null, email: null }));
ok(() => assert.equal(entryLinks({ linkedin: '#' }).linkedin, null));
ok(() => assert.equal(entryLinks({ website: 'http://insecure.example.org' }).website, null));
ok(() => assert.equal(entryLinks({ website: 'javascript:alert(1)' }).website, null));
ok(() => assert.equal(entryLinks({ website: 'example.org' }).website, null));
ok(() => assert.equal(entryLinks({ email: 'not-an-email' }).email, null));
ok(() => assert.equal(entryLinks({ email: 'mailto:a@b.co' }).email, null));
ok(() => assert.equal(entryLinks({ linkedin: 'https://www.linkedin.com/in/someone' }).linkedin, 'https://www.linkedin.com/in/someone'));
ok(() => assert.equal(entryLinks({ website: 'https://example.org' }).website, 'https://example.org/'));
ok(() => assert.deepEqual(entryLinks({ email: 'person@example.org' }).email, { address: 'person@example.org', href: 'mailto:person@example.org' }));
// Each field is independent: a missing one never affects the others.
ok(() => {
  const r = entryLinks({ website: 'https://example.org' });
  assert.ok(r.website && !r.linkedin && !r.email);
});

// ----- Acknowledgments data
ok(() => assertAcknowledgmentsValid());
ok(() => assert.ok(acknowledgments.length > 0 && acknowledgments.every((a) => a.status === 'placeholder')));
const base = { id: 'a-b', status: 'placeholder', name: '[PLACEHOLDER] x' };
ok(() => assert.throws(() => assertAcknowledgmentsValid([base, base]), /duplicate id/));
ok(() => assert.throws(() => assertAcknowledgmentsValid([{ ...base, id: 'Bad Id' }]), /lowercase-kebab/));
ok(() => assert.throws(() => assertAcknowledgmentsValid([{ ...base, name: 'Real Name' }]), /must start with \[PLACEHOLDER\]/));
ok(() => assert.throws(() => assertAcknowledgmentsValid([{ ...base, status: 'confirmed' }]), /still has a \[PLACEHOLDER\]/));
ok(() => assert.throws(() => assertAcknowledgmentsValid([{ ...base, name: ' ' }]), /empty name/));
ok(() => assert.throws(() => assertAcknowledgmentsValid([{ ...base, picture: 'https://x.org/a.jpg' }]), /inside \/public/));
ok(() => assert.throws(() => assertAcknowledgmentsValid([{ ...base, picture: '../secret.jpg' }]), /inside \/public/));
ok(() => assertAcknowledgmentsValid([{ id: 'real-one', status: 'confirmed', name: { en: 'A', he: 'א' }, picture: 'assets/people/a.jpg' }]));

// ----- Timeline data
ok(() => assertTimelineValid());
ok(() => assert.equal(timeline.filter((t) => t.current).length, 1));
ok(() => {
  const cur = timeline.find((t) => t.current);
  assert.equal(cur.id, 'developing-sensor');
  assert.equal(cur.title.en, 'Developing a sensor');
  assert.equal(cur.status, 'confirmed');
});
ok(() => assert.ok(timeline.filter((t) => t.status === 'placeholder').every((t) => !t.date), 'placeholder history is undated'));
const t1 = { id: 'one', status: 'confirmed', current: true, title: 'T', description: 'D' };
ok(() => assertTimelineValid([t1]));
ok(() => assert.throws(() => assertTimelineValid([]), /exactly one/));
ok(() => assert.throws(() => assertTimelineValid([t1, { ...t1, id: 'two' }]), /exactly one/));
ok(() => assert.throws(() => assertTimelineValid([t1, { ...t1, current: false }]), /duplicate id/));
ok(() => assert.throws(() => assertTimelineValid([t1, { id: 'p', status: 'placeholder', title: 'T', description: 'D' }]), /must start with \[PLACEHOLDER\]/));
ok(() => assert.throws(() => assertTimelineValid([t1, { id: 'c', status: 'confirmed', title: '[PLACEHOLDER] T', description: 'D' }]), /still contains/));
ok(() => assert.throws(() => assertTimelineValid([t1, { id: 'pl', status: 'confirmed', planned: true, date: { label: '2030', iso: '2030' }, title: 'T', description: 'D' }]), /must not carry a date/));
ok(() => assert.throws(() => assertTimelineValid([{ ...t1, planned: true }]), /both current and planned/));
ok(() => assert.throws(() => assertTimelineValid([t1, { id: 'p', status: 'placeholder', date: { label: '1999', iso: '1999' }, title: '[PLACEHOLDER] T', description: '[PLACEHOLDER] D' }]), /must not be current or carry a date/));

console.log(`stage 5 data rules: all ${checks} checks passed`);
