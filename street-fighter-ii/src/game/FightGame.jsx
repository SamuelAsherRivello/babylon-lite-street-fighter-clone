import { useEffect, useRef, useState } from "react";
import { createMatch, resetRound, startMatch, stepMatch } from "./combat.js";
import { FIGHTERS } from "./fighters.js";
import { Content } from "../content/Content.jsx";
import fighterSheet from "../../documentation/art/fighters-original.png?url";
import { MultiplayerClient } from "@rmc/multiplayer-client";

const serverUrl = import.meta.env.VITE_MULTIPLAYER_SERVER_URL || "https://rmc-colyseus-multiplayer-server.vercel.app";

const keys = new Set();
const P1 = { left: "a", right: "d", up: "w", down: "s", punch: ["f", "g", "h"], kick: ["t", "y", "u"] };
const P2 = { left: "ArrowLeft", right: "ArrowRight", up: "ArrowUp", down: "ArrowDown", punch: ["1", "2", "3"], kick: ["4", "5", "6"] };

function readInput(map, facing) {
  const left = keys.has(map.left), right = keys.has(map.right);
  const away = facing > 0 ? left : right, toward = facing > 0 ? right : left;
  const punch = map.punch.findIndex((key) => keys.has(key));
  const kick = map.kick.findIndex((key) => keys.has(key));
  return { away, toward, up: keys.has(map.up), down: keys.has(map.down), jump: keys.has(map.up), punch: punch < 0 ? false : ["light", "medium", "heavy"][punch], kick: kick < 0 ? false : ["light", "medium", "heavy"][kick] };
}

function readGamepad(index, facing) {
  const pad = navigator.getGamepads?.()[index];
  if (!pad) return {};
  const axis = pad.axes[0] ?? 0;
  const toward = axis > 0.32 ? facing > 0 : axis < -0.32 ? facing < 0 : false;
  const away = axis < -0.32 ? facing > 0 : axis > 0.32 ? facing < 0 : false;
  return {
    toward, away, down: (pad.axes[1] ?? 0) > .45 || Boolean(pad.buttons[13]?.pressed),
    up: (pad.axes[1] ?? 0) < -.45 || Boolean(pad.buttons[12]?.pressed),
    jump: Boolean(pad.buttons[0]?.pressed),
    punch: pad.buttons[2]?.pressed ? "heavy" : pad.buttons[1]?.pressed ? "medium" : pad.buttons[0]?.pressed ? "light" : false,
    kick: pad.buttons[5]?.pressed ? "heavy" : pad.buttons[4]?.pressed ? "medium" : pad.buttons[3]?.pressed ? "light" : false,
  };
}

function Fighter({ player, index, pose }) {
  const row = ({ ryu: 0, chunLi: 1, kaida: 2 })[player.id] ?? 0;
  const frame = pose === "hit" || pose === "defeat" ? 6 : pose === "block" ? 7 : pose === "victory" || player.airborne ? 3 : player.attack ? (player.attack.pose === "kick" ? 5 : 4) : player.crouching ? 2 : player.vx ? 1 : 0;
  return <div className={`fighter fighter-${index + 1} ${player.hitFlash ? "is-hit" : ""} ${player.guarding ? "is-blocking" : ""}`} style={{ left: `${player.x / 9.6}%`, bottom: `${((520 - player.y) / 5.2) + 2}%`, "--fighter-color": FIGHTERS[player.id].color, "--fighter-trim": FIGHTERS[player.id].trim, "--sheet-x": `${frame * 100 / 7}%`, "--sheet-y": `${row * 50}%`, transform: `translateX(-50%) scaleX(${player.facing < 0 ? -1 : 1})` }} aria-label={FIGHTERS[player.id].name}>
    <div className="fighter-sprite" style={{ backgroundImage: `url(${fighterSheet})` }} />
    {player.attack?.projectile && <span className="projectile" />}
  </div>;
}

function HealthBar({ value, reverse = false }) {
  return <div className={`health-track ${reverse ? "reverse" : ""}`}><div className="health-fill" style={{ width: `${value}%` }} /></div>;
}

export function FightGame() {
  const matchRef = useRef(createMatch());
  const [view, setView] = useState(() => structuredClone(matchRef.current));
  const [screen, setScreen] = useState(() => new URLSearchParams(location.search).has("room") ? "online" : "menu");
  const [selected, setSelected] = useState(["ryu", "chunLi"]);
  const [onlineCode, setOnlineCode] = useState(() => new URLSearchParams(location.search).get("room")?.toUpperCase().slice(0, 6) || "");
  const [onlineFighter, setOnlineFighter] = useState("ryu");
  const [onlineState, setOnlineState] = useState({ status: "idle", players: [], gameState: null, sessionId: null, seat: null, code: "", error: "" });
  const [onlinePaused, setOnlinePaused] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [volume, setVolume] = useState(0.45);
  const audioRef = useRef(null);
  const masterGainRef = useRef(null), musicTimerRef = useRef(null), nextNoteRef = useRef(0), musicStepRef = useRef(0);
  const audioOnRef = useRef(false), lastSfxEventRef = useRef(""), lastNetworkEventRef = useRef(-1);
  const screenRef = useRef(screen), clientRef = useRef(null), sequenceRef = useRef(0), onlinePausedRef = useRef(false);
  screenRef.current = screen;
  onlinePausedRef.current = onlinePaused;
  audioOnRef.current = audioOn;

  useEffect(() => {
    const down = (event) => { keys.add(event.key.length === 1 ? event.key.toLowerCase() : event.key); if (event.key.startsWith("Arrow")) event.preventDefault(); };
    const up = (event) => keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);
    const clear = () => keys.clear();
    const touchDown = (event) => { const key = event.target.closest("[data-key]")?.dataset.key; if (key) { keys.add(key); event.preventDefault(); } };
    const touchUp = (event) => { const key = event.target.closest("[data-key]")?.dataset.key; if (key) { keys.delete(key); event.preventDefault(); } };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up); window.addEventListener("blur", clear);
    window.addEventListener("pointerdown", touchDown); window.addEventListener("pointerup", touchUp); window.addEventListener("pointercancel", touchUp);
    let tick = 0;
    const loop = setInterval(() => {
      tick++;
      if (screenRef.current === "onlineFight") {
        const client = clientRef.current, state = client?.state, match = state?.gameState;
        if (state?.status === "connected" && match?.phase === "fight" && match.fighters?.length === 2 && tick % 3 === 0) {
          const seat = match.players?.findIndex((player) => player.id === state.sessionId);
          const fighter = match.fighters[seat >= 0 ? seat : 0];
          const keyboard = readInput(P1, fighter.facing), pad = readGamepad(0, fighter.facing);
          const input = onlinePausedRef.current ? { away: false, toward: false, up: false, down: false, jump: false, punch: false, kick: false } : Object.fromEntries(Object.keys(keyboard).map((key) => [key, pad[key] || keyboard[key]]));
          client.send("input", { ...input, seq: ++sequenceRef.current });
        }
        return;
      }
      const model = matchRef.current;
      if (screenRef.current === "fight" && model.phase === "fight") {
        const keyboard = [readInput(P1, model.players[0].facing), readInput(P2, model.players[1].facing)];
        const pads = [readGamepad(0, model.players[0].facing), readGamepad(1, model.players[1].facing)];
        const inputs = keyboard.map((input, i) => Object.fromEntries(Object.keys(input).map((key) => [key, pads[i][key] || input[key]])));
        stepMatch(model, inputs);
        if (model.event && model.event !== lastSfxEventRef.current) { lastSfxEventRef.current = model.event; if (audioOnRef.current) playSfx(); }
        if (model.phase === "round-over") {
          window.setTimeout(() => { if (matchRef.current.phase === "round-over") { resetRound(matchRef.current); setView(structuredClone(matchRef.current)); } }, 2400);
        }
        if (model.phase === "match-over") setScreen("results");
        setView(structuredClone(model));
      }
    }, 1000 / 60);
    return () => { clearInterval(loop); clearInterval(musicTimerRef.current); clientRef.current?.disconnect(); audioRef.current?.close(); window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", clear); window.removeEventListener("pointerdown", touchDown); window.removeEventListener("pointerup", touchUp); window.removeEventListener("pointercancel", touchUp); };
  }, []);

  const startLocal = () => { matchRef.current = createMatch({ fighters: selected }); startMatch(matchRef.current); setView(structuredClone(matchRef.current)); setScreen("fight"); };
  const togglePause = () => { matchRef.current.paused = !matchRef.current.paused; setView(structuredClone(matchRef.current)); };
  const reset = () => { matchRef.current = createMatch({ fighters: selected }); setView(structuredClone(matchRef.current)); setScreen("select"); };
  const connectOnline = (options) => {
    clientRef.current?.disconnect();
    const client = new MultiplayerClient(serverUrl, "street-fighter-ii", options);
    clientRef.current = client;
    client.subscribe((state) => {
      setOnlineState((old) => state.status === "reconnecting" ? { ...state, gameState: old.gameState } : { ...state });
      const serial = state.gameState?.event?.serial;
      if (serial !== undefined && serial !== lastNetworkEventRef.current) { lastNetworkEventRef.current = serial; if (audioOnRef.current) playSfx(); }
      const own = state.gameState?.players?.find((player) => player.id === state.sessionId);
      if (own) setOnlineFighter(own.fighter);
      if (state.status === "reconnecting" || state.gameState?.phase === "countdown" || state.gameState?.phase === "fight" || state.gameState?.phase === "round-over" || state.gameState?.phase === "match-over") setScreen("onlineFight");
      else if (state.status === "connected" && state.gameState?.phase === "lobby") setScreen("online");
      else if (state.status === "error" || state.status === "full") setScreen("online");
    });
    void client.connect();
  };
  const leaveOnline = () => { clientRef.current?.disconnect(); clientRef.current = null; setOnlineState({ status: "idle", players: [], gameState: null, sessionId: null, seat: null, code: "", error: "" }); setOnlinePaused(false); setScreen("menu"); };
  const shareInvite = async () => {
    if (!onlineState.code) return;
    const url = new URL(location.href); url.searchParams.set("room", onlineState.code);
    try { await navigator.clipboard.writeText(url.toString()); } catch { window.prompt("Copy this invite link", url.toString()); }
  };
  const audioEngine = () => {
    if (!audioRef.current) {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const master = context.createGain(); master.gain.value = volume; master.connect(context.destination);
      audioRef.current = context; masterGainRef.current = master;
    }
    return audioRef.current;
  };
  const startMusic = async () => {
    const context = audioEngine(); await context.resume();
    clearInterval(musicTimerRef.current);
    nextNoteRef.current = context.currentTime + 0.05; musicStepRef.current = 0;
    const melody = [76, null, 79, 83, null, 81, 79, null, 74, null, 76, 79, 81, null, 79, null];
    const bass = [40, null, null, null, 47, null, null, null, 36, null, null, null, 43, null, null, null];
    const hz = (note) => 440 * 2 ** ((note - 69) / 12);
    musicTimerRef.current = window.setInterval(() => {
      while (nextNoteRef.current < context.currentTime + 0.12) {
        const step = musicStepRef.current % melody.length, time = nextNoteRef.current;
        const play = (note, type, peak, duration) => {
          if (note == null) return;
          const oscillator = context.createOscillator(), envelope = context.createGain();
          oscillator.type = type; oscillator.frequency.setValueAtTime(hz(note), time);
          envelope.gain.setValueAtTime(0.0001, time); envelope.gain.linearRampToValueAtTime(peak, time + 0.012); envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
          oscillator.connect(envelope).connect(masterGainRef.current); oscillator.start(time); oscillator.stop(time + duration + 0.02);
        };
        play(melody[step], "square", 0.035, 0.18); play(bass[step], "triangle", 0.065, 0.34);
        if (step % 4 === 0) {
          const kick = context.createOscillator(), hit = context.createGain();
          kick.type = "sine"; kick.frequency.setValueAtTime(110, time); kick.frequency.exponentialRampToValueAtTime(48, time + 0.11);
          hit.gain.setValueAtTime(0.12, time); hit.gain.exponentialRampToValueAtTime(0.0001, time + 0.13);
          kick.connect(hit).connect(masterGainRef.current); kick.start(time); kick.stop(time + 0.14);
        }
        nextNoteRef.current += 60 / 124 / 2; musicStepRef.current++;
      }
    }, 25);
  };
  const toggleAudio = async () => {
    if (audioOn) { clearInterval(musicTimerRef.current); musicTimerRef.current = null; setAudioOn(false); }
    else { await startMusic(); setAudioOn(true); }
  };
  useEffect(() => {
    if (masterGainRef.current && audioRef.current) masterGainRef.current.gain.setTargetAtTime(audioOn ? volume : 0, audioRef.current.currentTime, 0.025);
  }, [audioOn, volume]);
  const playSfx = () => {
    if (!audioOn) return;
    const audio = audioEngine();
    const oscillator = audio.createOscillator(), gain = audio.createGain(); oscillator.type = "square"; oscillator.frequency.value = 180 + Math.random() * 420; gain.gain.setValueAtTime(0.04, audio.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.09); oscillator.connect(gain).connect(masterGainRef.current); oscillator.start(); oscillator.stop(audio.currentTime + 0.09);
  };

  const remote = onlineState.gameState;
  const shown = screen === "onlineFight" && remote?.fighters?.length === 2
    ? { ...view, ...remote, players: remote.fighters, event: remote.event?.text || "", announcement: remote.event?.text || "" }
    : view;
  const playing = screen === "fight" || screen === "onlineFight";
  const lobbyPlayers = remote?.players || onlineState.players;
  const localSeat = lobbyPlayers.find((player) => player.id === onlineState.sessionId);
  const opponent = lobbyPlayers.find((player) => player.id !== onlineState.sessionId);
  const overlay = () => {
    if (screen === "menu") return <div className="title-card"><p className="eyebrow">A NEW ARCADE DUEL</p><h1>WORLD<br/><em>WARRIORS</em></h1><p>Three fighters. One world championship.</p><button className="primary-button" onClick={() => setScreen("select")}>START GAME</button><div className="mode-actions"><button onClick={() => { setOnlineCode(""); setScreen("online"); }}>ONLINE DUEL</button><button onClick={toggleAudio}>{audioOn ? "SOUND OFF" : "SOUND ON"}</button></div>{audioOn && <label className="volume-control">MUSIC / EFFECTS <input aria-label="Music and effects volume" type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))}/></label>}</div>;
    if (screen === "select") return <div className="select-panel"><p className="eyebrow">CHOOSE YOUR WARRIOR</p><h2>SELECT FIGHTERS</h2><div className="fighter-cards">{Object.values(FIGHTERS).map((fighter) => <button key={fighter.id} className={`fighter-card ${selected.includes(fighter.id) ? "selected" : ""}`} onClick={() => setSelected((current) => current[0] === fighter.id ? [fighter.id, current[1]] : [current[0], fighter.id])}><div className="card-art" style={{ backgroundImage: `url(${fighterSheet})`, backgroundPosition: `50% ${({ ryu: 0, chunLi: 50, kaida: 100 })[fighter.id]}%` }}/><strong>{fighter.name}</strong><small>{fighter.role} · {fighter.title}</small></button>)}</div><div className="select-actions"><label>P1 <select value={selected[0]} onChange={(event) => setSelected((old) => [event.target.value, old[1]])}>{Object.values(FIGHTERS).map((fighter) => <option key={fighter.id} value={fighter.id}>{fighter.name}</option>)}</select></label><label>P2 <select value={selected[1]} onChange={(event) => setSelected((old) => [old[0], event.target.value])}>{Object.values(FIGHTERS).map((fighter) => <option key={fighter.id} value={fighter.id}>{fighter.name}</option>)}</select></label></div><button className="primary-button" onClick={startLocal}>FIGHT! — LOCAL 2 PLAYER</button><button className="back-button" onClick={() => setScreen("menu")}>BACK</button></div>;
    if (screen === "online") return <div className="online-panel"><p className="eyebrow">CHALLENGE A FRIEND</p><h2>ONLINE DUEL</h2><p>Invite codes connect two fighters in a server-hosted match.</p><div className="connection-status">{onlineState.error || (onlineState.status === "idle" ? "READY TO CONNECT" : onlineState.status.toUpperCase())}</div>{["idle", "error", "full"].includes(onlineState.status) ? <><input value={onlineCode} onChange={(event) => setOnlineCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))} placeholder="ROOM CODE" aria-label="Room code"/><button className="primary-button" onClick={() => connectOnline(onlineCode ? { code: onlineCode } : { create: true })}>{onlineCode ? "JOIN DUEL" : "CREATE INVITE"}</button></> : <><div className="room-code">{onlineState.code || "CONNECTING…"}</div>{onlineState.code && <button className="back-button" onClick={shareInvite}>COPY INVITE LINK</button>}<label className="online-select">YOUR FIGHTER <select value={onlineFighter} onChange={(event) => { setOnlineFighter(event.target.value); clientRef.current?.send("select", { fighter: event.target.value }); }}>{Object.values(FIGHTERS).map((fighter) => <option key={fighter.id} value={fighter.id}>{fighter.name}</option>)}</select></label><p>{opponent ? `Opponent: ${FIGHTERS[opponent.fighter]?.name || "Connected"}` : "Waiting for your opponent to join…"}</p><p>{localSeat?.ready ? "You are ready. Waiting for the other fighter…" : "Choose a fighter, then ready up."}</p><button className="primary-button" disabled={!opponent || remote?.phase !== "lobby"} onClick={() => clientRef.current?.send("ready", { ready: !localSeat?.ready })}>{localSeat?.ready ? "CANCEL READY" : "READY"}</button></>}<button className="back-button" onClick={leaveOnline}>LEAVE DUEL</button></div>;
    if (screen === "onlineFight" && shown.phase === "match-over") return <div className="round-announcement"><p>{shown.announcement}</p><button className="primary-button" onClick={() => clientRef.current?.send("rematch", { ready: true })}>READY FOR REMATCH</button><button className="back-button" onClick={leaveOnline}>LEAVE DUEL</button></div>;
    if (screen === "onlineFight" && shown.phase === "countdown") return <div className="round-announcement"><p>ROUND {shown.round} — GET READY</p><small>{Math.ceil(remote.countdown)}</small></div>;
    if (screen === "onlineFight" && shown.phase === "round-over") return <div className="round-announcement"><p>{shown.announcement}</p><small>Next round…</small></div>;
    if (screen === "onlineFight" && onlinePaused) return <div className="round-announcement"><p>PAUSED LOCALLY</p><button className="primary-button" onClick={() => setOnlinePaused(false)}>RESUME</button></div>;
    if (screen === "onlineFight" && onlineState.status === "reconnecting") return <div className="round-announcement"><p>RECONNECTING…</p><small>Reclaiming your fighter seat</small><button className="back-button" onClick={leaveOnline}>LEAVE DUEL</button></div>;
    if (screen === "onlineFight" && shown.phase === "reconnecting") return <div className="round-announcement"><p>OPPONENT DISCONNECTED</p><small>Rejoin window {Math.ceil(remote.reconnectRemaining)}s</small><button className="back-button" onClick={leaveOnline}>LEAVE DUEL</button></div>;
    if (screen === "fight" && shown.paused) return <div className="round-announcement"><p>PAUSED</p><button className="primary-button" onClick={togglePause}>RESUME</button></div>;
    return <div className="round-announcement"><p>{shown.announcement}</p><button className="primary-button" onClick={reset}>{shown.phase === "match-over" ? "REMATCH" : "RETURN TO SELECT"}</button><button className="back-button" onClick={() => setScreen("menu")}>MAIN MENU</button></div>;
  };

  return <main className="fight-game" onPointerDown={playSfx}>
    <Content />
    <header className="fight-hud"><section className="fighter-status"><strong>{FIGHTERS[shown.players[0].id].name}</strong><HealthBar value={shown.players[0].health} /><small>{FIGHTERS[shown.players[0].id].title}</small></section><div className="round-clock"><span>{String(Math.ceil(shown.time)).padStart(2, "0")}</span><small>ROUND {shown.round}</small></div><section className="fighter-status right"><strong>{FIGHTERS[shown.players[1].id].name}</strong><HealthBar value={shown.players[1].health} reverse /><small>{FIGHTERS[shown.players[1].id].title}</small></section></header>
    <div className="match-score"><span>{"● ".repeat(shown.wins[0])}</span><span>{"● ".repeat(shown.wins[1])}</span></div>
    <section className="arena" aria-label="Fighting game arena"><div className="arena-sky"/><div className="arena-ground"/><div className="arena-floor"/>{shown.players.map((player, index) => <Fighter key={index} player={player} index={index} pose={shown.phase === "match-over" ? (shown.winner === `p${index + 1}` ? "victory" : "defeat") : player.hitFlash ? "hit" : player.guarding ? "block" : null} />)}
      {playing && shown.phase === "fight" && (screen === "onlineFight" || shown.eventUntil > shown.elapsed) && shown.event && <div className="impact-text">{shown.event}</div>}
      {(!playing || shown.phase !== "fight" || (screen === "fight" && shown.paused) || (screen === "onlineFight" && (onlinePaused || onlineState.status === "reconnecting"))) && <div className="game-overlay">{overlay()}</div>}
    </section>
    <footer className="fight-controls"><div><b>{screen === "onlineFight" ? "YOU" : "P1"}</b> A / D Move · W Jump · S Crouch · F/G/H Punch · T/Y/U Kick · Back Guard</div><button onClick={() => screen === "onlineFight" ? setOnlinePaused((paused) => !paused) : togglePause()}>{screen === "onlineFight" ? onlinePaused ? "RESUME" : "PAUSE" : shown.paused ? "RESUME" : "PAUSE"}</button><div>{screen === "onlineFight" ? "Opponent uses their own controls" : <><b>P2</b> ← / → Move · ↑ Jump · ↓ Crouch · 1/2/3 Punch · 4/5/6 Kick</>}</div></footer>
    <aside className="move-list"><span>RYU: ↓↘→ + P HADOUKEN · →↓↘ + P SHORYUKEN · ↓↙← + K TATSUMAKI</span><span>CHUN-LI: RAPID K HYAKURETSUKYAKU · ↓↑ + K SPINNING BIRD · →→ + K LIGHTNING STEP</span><span>KAIDA: ↓↘→ + P CINDER ARC · →↓↘ + K COMET HEEL · ←→ + P ASHEN COUNTER</span></aside>
    <div className="touch-controls"><div className="touch-pad"><button data-key="a">◀</button><button data-key="w">▲</button><button data-key="s">▼</button><button data-key="d">▶</button></div><div className="touch-attacks">{["f","g","h","t","y","u"].map((key,i)=><button key={key} data-key={key}>{["LP","MP","HP","LK","MK","HK"][i]}</button>)}</div></div>
  </main>;
}
