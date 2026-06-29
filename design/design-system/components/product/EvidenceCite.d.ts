import * as React from "react";

export interface EvidenceSource {
  label: string;
  /** Optional trailing meta, e.g. a date or count. */
  meta?: string;
}

/**
 * Provenance row attached to every AI answer — grounded-or-abstain. Lists the
 * sources a claim is based on as quiet, clickable chips.
 */
export interface EvidenceCiteProps {
  /** Sources as strings or {label, meta} objects. */
  sources?: (string | EvidenceSource)[];
  /** Eyebrow label before the chips. */
  label?: string;
  /** Called with (source, index) when a chip is clicked; omit to render static. */
  onOpen?: (source: string | EvidenceSource, index: number) => void;
  style?: React.CSSProperties;
}

export function EvidenceCite(props: EvidenceCiteProps): JSX.Element;
