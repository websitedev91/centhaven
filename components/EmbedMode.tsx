'use client';

import { createContext, useContext, type ReactNode } from 'react';

/**
 * True inside /embed/[slug] (DESIGN.md §9: calculator + result only). Extras such as charts,
 * scenario compare and the mobile result bar check it and render nothing in an embed.
 */
const EmbedContext = createContext(false);

export function EmbedProvider({ children }: { children: ReactNode }) {
  return <EmbedContext.Provider value={true}>{children}</EmbedContext.Provider>;
}

export function useEmbed(): boolean {
  return useContext(EmbedContext);
}
