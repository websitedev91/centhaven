/**
 * Categorical chart colours, in fixed order (never cycled). Validated on 2026-11-16 with the
 * dataviz palette checker against the white surface: lightness band, chroma floor, colour-blind
 * separation, normal-vision floor and 3:1 contrast all pass for the first five together.
 * Assign by series identity, in this order; a sixth series folds into "Other".
 */
export const CATEGORICAL = ['#008C7E', '#B8862B', '#5A74CC', '#C55A3C', '#9A6FC7'] as const;

/** Muted fill for "the rest" (e.g. non-billable time) when only one series is the story. */
export const MUTED_FILL = '#D7E2DE';
