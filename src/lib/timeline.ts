import { timeline as timelineData } from '../data/timeline.mjs';
import type { Localized } from './references';
import type { RouteId } from './routes';

export interface TimelineItem {
  id: string;
  status: 'confirmed' | 'placeholder';
  current?: boolean;
  planned?: boolean;
  date?: { label: Localized; iso?: string };
  title: Localized;
  description: Localized;
  link?: { route: RouteId; hash?: string; label: Localized };
  project?: Localized;
}

/** All milestones in display order (src/data/timeline.mjs). */
export const timeline = timelineData as unknown as TimelineItem[];

/**
 * Fails the build with a readable message when the data breaks a rule, so a bad edit never ships:
 * unique ids, exactly one current milestone, placeholders carry the [PLACEHOLDER] prefix, confirmed items do not,
 * planned items are not dated with an iso value, `current` and `planned` are not combined.
 */
export function assertTimelineValid(items: TimelineItem[] = timeline): void {
  const problems: string[] = [];
  const ids = new Set<string>();
  const text = (v: Localized) => (typeof v === 'string' ? [v] : [v.en, v.he]);
  for (const item of items) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(item.id)) problems.push(`"${item.id}": id must be lowercase-kebab`);
    if (ids.has(item.id)) problems.push(`"${item.id}": duplicate id`);
    ids.add(item.id);
    const marked = [...text(item.title), ...text(item.description)].map((t) => /^\s*\[PLACEHOLDER\]/.test(t));
    if (item.status === 'placeholder' && marked.some((m) => !m)) problems.push(`"${item.id}": placeholder text must start with [PLACEHOLDER]`);
    if (item.status === 'confirmed' && marked.some(Boolean)) problems.push(`"${item.id}": confirmed item still contains [PLACEHOLDER] text`);
    if (item.current && item.planned) problems.push(`"${item.id}": cannot be both current and planned`);
    if (item.planned && item.date?.iso) problems.push(`"${item.id}": a planned item must not carry a date`);
    if (item.status === 'placeholder' && (item.current || item.date?.iso)) problems.push(`"${item.id}": a placeholder must not be current or carry a date`);
  }
  const current = items.filter((i) => i.current);
  if (current.length !== 1) problems.push(`exactly one item must have current: true (found ${current.length})`);
  if (problems.length) throw new Error(`Invalid timeline data (src/data/timeline.mjs):\n  - ${problems.join('\n  - ')}`);
}
