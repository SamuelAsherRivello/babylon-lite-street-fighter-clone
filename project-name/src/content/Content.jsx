import { useEffect, useRef, useState } from "react";
import {
  addSpriteAnimation,
  addSprite2D,
  attachSpriteAnimationsToRenderer,
  createGridSpriteAtlas,
  createSpriteAtlasFromFrames,
  createSprite2DLayer,
  createSpriteAnimationManager,
  createSpriteFrameAnimation,
  createSpriteRenderer,
  createEngine,
  disposeEngine,
  disposeSpriteAnimationBinding,
  disposeSpriteAtlas,
  disposeSpriteRenderer,
  loadTexture2D,
  registerSpriteRenderer,
  releaseTexture,
  startEngine,
  stopEngine,
  updateSprite2D,
} from "@babylonjs/lite";
import tileUrl from "./babylon/images/concentric-squares-32.png?url";
import { contentConfig, getRenderingPolicy, pixelPerfectOptions, showcaseTileSize } from "./babylon/config.js";
import { getInitializationMessage } from "./babylon/initialization.js";
import { getShowcaseSpriteLayout } from "./babylon/pixel-perfect.js";
import { getWorldEdgeBorderLayout } from "./babylon/showcase-overlay.js";
import { useViewportInfo } from "../ui/ViewportInfoContext.jsx";

const TAU = Math.PI * 2;
const ROTATION_STEPS = 628;
const ROTATION_STEP_MS = 50;
const BACKGROUND = Object.freeze({ r: 1, g: 1, b: 1, a: 1 });
// Match the React label's #e0694b on the canvas using Babylon Lite's sprite tint.
const EDGE_ACCENT = [224 / 255, 105 / 255, 75 / 255, 1];

function createSolidPixelFrame() {
  return {
    name: "solid",
    width: 1,
    height: 1,
    pixels: new Uint8Array([255, 255, 255, 255]),
    pivot: [0.5, 0.5],
  };
}

function PixelPerfectShowcase() {
  const { setScale, sceneBorderVisible, processingPaused } = useViewportInfo();
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const borderSpritesRef = useRef([]);
  const sceneBorderVisibleRef = useRef(sceneBorderVisible);
  const processingPausedRef = useRef(processingPaused);
  const engineRef = useRef(null);
  const engineReadyRef = useRef(false);
  const engineRunningRef = useRef(false);
  const [message, setMessage] = useState("Starting Babylon Lite…");

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    let cancelled = false;
    let disposed = false;
    let engine = null;
    let texture = null;
    let overlayAtlas = null;
    let renderer = null;
    let sprite = null;
    let overlayLayer = null;
    let borderSprites = [];
    let resizeObserver = null;
    let dprQuery = null;
    let animationBinding = null;
    let setupFinished = false;
    let failed = false;

    const removeDprQuery = () => {
      dprQuery?.removeEventListener("change", handleDprChange);
      dprQuery = null;
    };
    const observeDpr = () => {
      removeDprQuery();
      dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      dprQuery.addEventListener("change", handleDprChange, { once: true });
    };
    const updateSpriteLayout = () => {
      if (!sprite || !host) return;
      const dpr = window.devicePixelRatio || 1;
      const layout = getShowcaseSpriteLayout(host.clientWidth, host.clientHeight, dpr);
      setScale(layout.scale);
      updateSprite2D(sprite, { positionPx: layout.positionPx, sizePx: layout.sizePx });
      const edgeLayout = getWorldEdgeBorderLayout(host.clientWidth, host.clientHeight, dpr);
      borderSprites.forEach((border, index) => updateSprite2D(border, {
        ...edgeLayout[index],
        visible: sceneBorderVisibleRef.current,
      }));
    };
    function handleDprChange() {
      updateSpriteLayout();
      observeDpr();
    }
    const disposeResources = () => {
      if (disposed || !setupFinished) return;
      disposed = true;
      animationBinding && disposeSpriteAnimationBinding(animationBinding);
      if (renderer) disposeSpriteRenderer(renderer);
      if (overlayAtlas) disposeSpriteAtlas(overlayAtlas);
      if (texture) releaseTexture(texture);
      if (engine) disposeEngine(engine);
      animationBinding = null;
      renderer = null;
      borderSprites = [];
      borderSpritesRef.current = [];
      overlayAtlas = null;
      texture = null;
      engine = null;
      engineRef.current = null;
      engineReadyRef.current = false;
      engineRunningRef.current = false;
    };

    const setup = async () => {
      try {
        if (!navigator.gpu) throw new Error("WebGPU is not available in this browser.");

        const createdEngine = await createEngine(canvas, pixelPerfectOptions.engine);
        if (cancelled) {
          engine = createdEngine;
          setupFinished = true;
          disposeResources();
          return;
        }
        engine = createdEngine;
        engineRef.current = engine;

        const loadedTexture = await loadTexture2D(engine, tileUrl, pixelPerfectOptions.texture);
        if (cancelled) {
          texture = loadedTexture;
          setupFinished = true;
          disposeResources();
          return;
        }
        texture = loadedTexture;

        const atlas = createGridSpriteAtlas(texture, {
          cellWidthPx: showcaseTileSize,
          cellHeightPx: showcaseTileSize,
          columns: 1,
          rows: 1,
          pivot: [0.5, 0.5],
        });
        const layer = createSprite2DLayer(atlas, { pivot: [0.5, 0.5] });
        sprite = addSprite2D(layer, {
          positionPx: [0, 0],
          sizePx: [showcaseTileSize, showcaseTileSize],
          frame: 0,
        });

        overlayAtlas = createSpriteAtlasFromFrames(engine, [createSolidPixelFrame()], { sampling: "nearest", srgb: true });
        overlayLayer = createSprite2DLayer(overlayAtlas, { order: 1, pivot: [0.5, 0.5] });
        borderSprites = Array.from({ length: 4 }, () => addSprite2D(overlayLayer, {
          positionPx: [0, 0],
          sizePx: [1, 1],
          frame: 0,
          color: EDGE_ACCENT,
          visible: false,
        }));
        borderSpritesRef.current = borderSprites;

        renderer = createSpriteRenderer(engine, {
          layers: [layer, overlayLayer],
          clear: true,
          clearValue: BACKGROUND,
        });
        registerSpriteRenderer(renderer);

        const animationManager = createSpriteAnimationManager();
        addSpriteAnimation(animationManager, createSpriteFrameAnimation({
          setFrame(step) {
            if (!cancelled && sprite) updateSprite2D(sprite, { rotation: (step / ROTATION_STEPS) * TAU });
          },
        }, 0, ROTATION_STEPS - 1, true, ROTATION_STEP_MS));
        animationBinding = attachSpriteAnimationsToRenderer(renderer, animationManager);

        resizeObserver = new ResizeObserver(updateSpriteLayout);
        resizeObserver.observe(host);
        window.addEventListener("resize", updateSpriteLayout);
        observeDpr();
        updateSpriteLayout();

        await startEngine(engine);
        engineReadyRef.current = true;
        engineRunningRef.current = true;
        if (processingPausedRef.current) {
          stopEngine(engine);
          engineRunningRef.current = false;
        }
        if (!cancelled) setMessage("");
      } catch (error) {
        failed = true;
        console.error("Babylon Lite content initialization failed:", error);
        if (!cancelled) setMessage(getInitializationMessage(Boolean(navigator.gpu), error));
      } finally {
        setupFinished = true;
        if (cancelled || failed) disposeResources();
      }
    };

    void setup();
    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateSpriteLayout);
      removeDprQuery();
      disposeResources();
    };
  }, []);

  useEffect(() => {
    sceneBorderVisibleRef.current = sceneBorderVisible;
    borderSpritesRef.current.forEach((border) => updateSprite2D(border, { visible: sceneBorderVisible }));
  }, [sceneBorderVisible]);

  useEffect(() => {
    processingPausedRef.current = processingPaused;
    const engine = engineRef.current;
    if (!engine || !engineReadyRef.current) return;

    if (processingPaused && engineRunningRef.current) {
      stopEngine(engine);
      engineRunningRef.current = false;
    } else if (!processingPaused && !engineRunningRef.current) {
      engineRunningRef.current = true;
      void startEngine(engine);
    }
  }, [processingPaused]);

  return (
    <div ref={hostRef} className="babylon_content" data-renderer="babylon-lite" data-content-style="2d">
      <canvas ref={canvasRef} className="babylon_canvas" aria-hidden="true" />
      {message && <div className="babylon_content_message" role="status">{message}</div>}
    </div>
  );
}

export function Content() {
  const renderingPolicy = getRenderingPolicy(contentConfig);
  if (renderingPolicy === "performance-scaled-3d") {
    return (
      <div className="babylon_content babylon_content_message" data-renderer="babylon-lite" data-content-style="3d">
        3D content is selected. Configure its Babylon Lite scene with the Performance-scaled 3D policy in the integration guide.
      </div>
    );
  }
  if (renderingPolicy !== "pixel-perfect") {
    return <div className="babylon_content babylon_content_message" role="status">Select Babylon Lite with 2D content or add the renderer-specific integration described in the guide.</div>;
  }

  return <PixelPerfectShowcase />;
}
