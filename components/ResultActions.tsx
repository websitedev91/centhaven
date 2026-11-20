'use client';

import { createContext, useContext, type ReactNode } from 'react';

/**
 * Share / print / embed buttons shown directly under the result (2026-11-20: moved up from below
 * the charts so people see them). ToolLayout provides them; CalculatorGrid renders them in the
 * result column, so every tool gets them without code of its own. Embed pages and the document
 * generators provide nothing, so nothing renders there.
 */
const ResultActionsContext = createContext<ReactNode>(null);

export function ResultActionsProvider({ actions, children }: { actions: ReactNode; children: ReactNode }) {
  return <ResultActionsContext.Provider value={actions}>{children}</ResultActionsContext.Provider>;
}

export function useResultActions(): ReactNode {
  return useContext(ResultActionsContext);
}
