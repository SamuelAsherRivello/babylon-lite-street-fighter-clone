import { createContext, useContext } from "react";

export const ViewportInfoContext = createContext({
  scale: 2,
  setScale: () => {},
  sceneBorderVisible: false,
  processingPaused: false,
});

export function useViewportInfo() {
  return useContext(ViewportInfoContext);
}
