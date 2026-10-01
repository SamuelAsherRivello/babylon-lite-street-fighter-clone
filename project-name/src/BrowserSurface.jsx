import { useLayoutEffect, useRef, useState } from "react";
import { defaultLayout, fitViewport, validateLayout } from "./layout.js";

function rectangle(x, y, width, height) {
  return { left: x, top: y, width, height };
}

export function BrowserSurface({ layout = defaultLayout, children, ui, gutters = {}, onViewportResize }) {
  const surfaceRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    const measure = () => setSize({ width: surface.clientWidth, height: surface.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(surface);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const viewport = document.getElementById("viewport");
    if (viewport && onViewportResize) {
      const update = () => onViewportResize(viewport.getBoundingClientRect());
      update();
      const observer = new ResizeObserver(update);
      observer.observe(viewport);
      return () => observer.disconnect();
    }
    return undefined;
  }, [size, layout, onViewportResize]);

  let error;
  try { validateLayout(layout); } catch (failure) { error = failure.message; }
  const viewport = error ? null : fitViewport(size.width, size.height, layout);
  const regions = viewport && {
    top: rectangle(0, 0, size.width, viewport.y),
    bottom: rectangle(0, viewport.y + viewport.height, size.width, viewport.y),
    left: rectangle(0, viewport.y, viewport.x, viewport.height),
    right: rectangle(viewport.x + viewport.width, viewport.y, viewport.x, viewport.height),
  };

  return (
    <div ref={surfaceRef} id="browser_surface" style={layout.gutterBackground ? { "--gutter-color": layout.gutterBackground } : undefined}>
      {error ? <div className="layout_error" role="alert">{error}</div> : <>
        {Object.entries(regions).map(([side, style]) => (
          <div key={side} className={`gutter gutter_${side}`} style={style}>{gutters[side]}</div>
        ))}
        <div id="viewport" data-orientation={layout.orientation} style={{ ...rectangle(viewport.x, viewport.y, viewport.width, viewport.height), "--project-viewport-width": `${viewport.width}px`, "--project-viewport-height": `${viewport.height}px` }}>
          {/* React app content belongs here. A future Babylon Lite integration can mount a canvas
              in this layer, initialize/resize/dispose its renderer using React lifecycle, and
              clean up correctly on StrictMode remounts. Camera, texture filtering/mipmaps,
              anti-aliasing and DPR-aware backing size are renderer responsibilities.
              See documentation/layout-and-game-integration.md for policies and diagnostics. */}
          <div id="content_layer">{children}</div>
          <div id="ui_layer">{ui}</div>
        </div>
      </>}
    </div>
  );
}
