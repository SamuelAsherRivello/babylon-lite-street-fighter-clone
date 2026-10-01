import { useCallback, useEffect, useState } from "react";
import versionText from "../../version.txt?raw";
import { BrowserSurface } from "./BrowserSurface.jsx";
import { aspectRatioPresets, defaultLayout } from "./layout.js";
import { Menu } from "./Menu.jsx";

const fullscreenStorageKey = "github-repository-template.fullscreen";
const repositoryUrl = "https://github.com/SamuelAsherRivello/github-repository-template";

export function Corner({ position, children }) {
  return <div className={`corner corner_${position}`}>{children}</div>;
}

function GitHubMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.64 0 8.13c0 3.59 2.29 6.64 5.47 7.71.4.08.55-.18.55-.4 0-.2-.01-.86-.01-1.56-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.15-.28-.15-.68-.53-.01-.54.63-.01 1.08.59 1.23.83.72 1.23 1.87.88 2.33.67.07-.53.28-.88.51-1.08-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.62.82-2.19-.08-.2-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.5 7.5 0 0 1 8 3.82c.68 0 1.36.09 2 .28 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.96.08 2.16.51.57.82 1.29.82 2.19 0 3.14-1.87 3.83-3.65 4.04.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .22.15.48.55.4A8.02 8.02 0 0 0 16 8.13C16 3.64 12.42 0 8 0Z" />
    </svg>
  );
}

export function App({ layout = defaultLayout, content = null, gutters = {} }) {
  const [orientationOverride, setOrientationOverride] = useState(null);
  const landscape = (orientationOverride ?? layout.orientation) === "landscape";
  const portrait = !landscape;
  const activeLayout = orientationOverride === null ? layout : {
    ...layout,
    orientation: orientationOverride,
    ...aspectRatioPresets[orientationOverride],
  };
  const [fullscreenPreferred, setFullscreenPreferred] = useState(() => {
    return localStorage.getItem(fullscreenStorageKey) === "true";
  });
  const [viewportPixels, setViewportPixels] = useState({ width: 0, height: 0 });
  const [windowPixels, setWindowPixels] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [devicePixelRatio, setDevicePixelRatio] = useState(window.devicePixelRatio);
  const [hudVisible, setHudVisible] = useState(true);
  const [activePanel, setActivePanel] = useState(null);
  const updateViewportPixels = useCallback((rect) => {
    setViewportPixels((current) => {
      const next = { width: Math.round(rect.width), height: Math.round(rect.height) };
      return current.width === next.width && current.height === next.height ? current : next;
    });
  }, []);

  const versionNumber = versionText.trim().replace(/^version=/, "").replace(/^v/, "");

  useEffect(() => {
    const updateWindowPixels = () => {
      setWindowPixels({ width: window.innerWidth, height: window.innerHeight });
      setDevicePixelRatio(window.devicePixelRatio);
    };
    window.addEventListener("resize", updateWindowPixels);
    return () => window.removeEventListener("resize", updateWindowPixels);
  }, []);

  useEffect(() => {
    const handleShortcut = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      const key = event.key.toLowerCase();
      if (key === "f") toggleFullscreen();
      if (key === "p") setOrientationOverride((current) => current === "portrait" ? "landscape" : "portrait");
      if (key === "h") setHudVisible((visible) => !visible);
      if (key === "c") setActivePanel((panel) => panel === "config" ? null : "config");
      if (key === "s") setActivePanel((panel) => panel === "stats" ? null : "stats");
      if (event.key === "Escape") setActivePanel(null);
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  });

  useEffect(() => {
    localStorage.setItem(fullscreenStorageKey, fullscreenPreferred ? "true" : "false");
  }, [fullscreenPreferred]);

  useEffect(() => {
    const syncFullscreenState = () => {
      setFullscreenPreferred(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        if (!document.fullscreenElement) {
          setFullscreenPreferred(true);
        }
      }
    } catch {
      setFullscreenPreferred(false);
    }
  };

  return (
    <BrowserSurface layout={activeLayout} gutters={gutters} onViewportResize={updateViewportPixels} ui={<>
      {hudVisible && <Corner position="top_left">
        <div id="project_title" className="corner_body">
          GitHub Repository Template
        </div>
      </Corner>}
      {hudVisible && <Corner position="top_right">
        <a href={repositoryUrl} target="_blank" rel="noopener noreferrer" aria-label="View the repository on GitHub" tabIndex={-1}>
          <GitHubMark />
        </a>
      </Corner>}
      {hudVisible && <Corner position="bottom_left">
        <section id="settings" aria-labelledby="settings_title">
          <div id="settings_title" className="corner_title">(C) Config</div>
          {hudVisible && <label className="corner_body settings_option"><span>(F) Fullscreen</span><input id="fullscreen_toggle" type="checkbox" checked={fullscreenPreferred} onChange={toggleFullscreen} /></label>}
          {hudVisible && <label className="corner_body settings_option"><span>(P) Portrait</span><input id="portrait_checkbox" type="checkbox" checked={portrait} onChange={(event) => setOrientationOverride(event.target.checked ? "portrait" : "landscape")} /></label>}
          <label className="corner_body settings_option"><span>(H) HUD</span><input id="hud_checkbox" type="checkbox" checked={hudVisible} onChange={(event) => setHudVisible(event.target.checked)} /></label>
        </section>
      </Corner>}
      {hudVisible && <Corner position="bottom_right">
        <section id="stats" aria-labelledby="stats_title">
          <div id="stats_title" className="corner_title">(S) Stats</div>
          <div id="version" className="corner_body">v{versionNumber}</div>
          <div className="corner_body">DPR: {devicePixelRatio}</div>
          <div id="aspect_ratio" className="corner_body">{activeLayout.label ?? `${activeLayout.width}:${activeLayout.height}`} Aspect</div>
          <div className="corner_body">{windowPixels.width}x{windowPixels.height} Window</div>
          <div className="corner_body">{viewportPixels.width}x{viewportPixels.height} Viewport</div>
        </section>
      </Corner>}
      {activePanel && <Menu title={activePanel === "config" ? "(C) Config" : "(S) Stats"} onClose={() => setActivePanel(null)}>
          {activePanel === "config" ? <div className="panel_options">
            <label className="settings_option"><span>(F) Fullscreen</span><input type="checkbox" checked={fullscreenPreferred} onChange={toggleFullscreen} /></label>
            <label className="settings_option"><span>(P) Portrait</span><input type="checkbox" checked={portrait} onChange={(event) => setOrientationOverride(event.target.checked ? "portrait" : "landscape")} /></label>
            <label className="settings_option"><span>(H) HUD</span><input type="checkbox" checked={hudVisible} onChange={(event) => setHudVisible(event.target.checked)} /></label>
          </div> : <div className="panel_options"><div>v{versionNumber}</div><div>DPR: {devicePixelRatio}</div><div>{activeLayout.label ?? `${activeLayout.width}:${activeLayout.height}`} Aspect</div><div>{windowPixels.width}x{windowPixels.height} Window</div><div>{viewportPixels.width}x{viewportPixels.height} Viewport</div></div>}
      </Menu>}
    </>}>{content}</BrowserSurface>
  );
}
