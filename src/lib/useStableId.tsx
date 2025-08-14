import { useId, useRef } from "react";

export function useStableId(prefix?: string) {
  // Either is fine; useId() is SSR-safe and deduped.
  const reactId = useId();
  const ref = useRef<string>(prefix ? `${prefix}-${reactId}` : reactId);
  return ref.current;
}