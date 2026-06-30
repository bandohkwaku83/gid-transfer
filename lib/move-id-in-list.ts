/** Move `activeId` to `toIndex` in a copy of `ids` (used by drag-reorder UIs). */
export function moveIdInList(ids: string[], activeId: string, toIndex: number): string[] {
  const fromIndex = ids.indexOf(activeId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return ids;
  const next = [...ids];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved!);
  return next;
}
