import { useState, useEffect, useCallback } from "react";

// ── Paleta PIXELBITS ──────────────────────────────────────
const C = {
  bg:       "#021C1E",
  surface:  "#0A2E32",
  card:     "#0D3438",
  border:   "#1A5A60",
  borderHi: "#10B981",
  accent:   "#10B981",
  gold:     "#F5B700",
  muted:    "#4B8C93",
  text:     "#D1FAE5",
  textDim:  "#6EE7B7",
  danger:   "#EF4444",
  warn:     "#F59E0B",
  info:     "#38BDF8",
};

// ── Tipos de acción disponibles ───────────────────────────
const ACTION_TYPES = [
  { value: "key_press",       label: "Atajo de teclado",       icon: "⌨️" },
  { value: "open_program",    label: "Abrir programa/app",      icon: "🖥️" },
  { value: "close_program",   label: "Cerrar programa",         icon: "❌" },
  { value: "close_window",    label: "Cerrar ventana activa",   icon: "🪟" },
  { value: "open_url",        label: "Abrir URL",               icon: "🌐" },
  { value: "media",           label: "Control multimedia",      icon: "🎵" },
  { value: "volume",          label: "Volumen (CC)",            icon: "🔊" },
  { value: "volume_mute",     label: "Silenciar",               icon: "🔇" },
  { value: "mqtt_publish",    label: "Publicar MQTT",           icon: "📡" },
  { value: "screenshot",      label: "Captura de pantalla",     icon: "📸" },
  { value: "type_text",       label: "Escribir texto",          icon: "📝" },
  { value: "run_script",      label: "Ejecutar script/comando", icon: "⚡" },
  { value: "mouse_x",         label: "Eje X del mouse (CC)",    icon: "🖱️" },
  { value: "mouse_y",         label: "Eje Y del mouse (CC)",    icon: "🖱️" },
  { value: "brightness",      label: "Brillo pantalla (CC)",    icon: "💡" },
];

const MEDIA_COMMANDS = [
  "play_pause","next_track","prev_track","stop","mute","volume_up","volume_down"
];

const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const noteName = (n) => `${NOTE_NAMES[n % 12]}${Math.floor(n / 12) - 1}`;

// ── Config inicial ────────────────────────────────────────
const DEFAULT_CONFIG = {
  midi: { port_name: "CTK", channel: 0, note_channel: 0 },
  mqtt: { enabled: true, broker: "192.168.100.21", port: 1883, username: "", password: "", client_id: "casio_midi_controller" },
  mappings: {
    notes: {
      "60": { action: "key_press", keys: ["ctrl","alt","t"], label: "Abrir Terminal" },
      "62": { action: "open_url", url: "https://claude.ai", label: "Abrir Claude AI" },
      "64": { action: "open_program", program: "notepad", label: "Abrir Notepad" },
      "65": { action: "media", command: "play_pause", label: "Play/Pause" },
      "67": { action: "media", command: "next_track", label: "Siguiente pista" },
      "69": { action: "media", command: "prev_track", label: "Pista anterior" },
      "71": { action: "mqtt_publish", topic: "lights/SLAVE_01/command", payload: "{\"effect\":\"rainbow\"}", label: "RGB Rainbow" },
      "72": { action: "mqtt_publish", topic: "lights/SLAVE_01/command", payload: "{\"effect\":\"off\"}", label: "Luces OFF" },
      "74": { action: "screenshot", label: "Captura de pantalla" },
      "76": { action: "key_press", keys: ["win","d"], label: "Mostrar escritorio" },
      "77": { action: "open_url", url: "https://github.com/Pacheco55", label: "GitHub PIXELBITS" },
      "79": { action: "volume_mute", label: "Silenciar" },
      "83": { action: "type_text", text: "studiospixelbits@gmail.com", label: "Escribir email" },
      "84": { action: "close_window", label: "Cerrar ventana activa" },
    },
    control_change: {
      "7":  { action: "volume", label: "Volumen del sistema" },
      "10": { action: "mouse_x", label: "Mouse horizontal" },
      "11": { action: "mouse_y", label: "Mouse vertical" },
      "91": { action: "mqtt_publish", topic: "lights/SLAVE_01/command", payload: "{\"brightness\":{value}}", label: "Brillo RGB MQTT" },
    },
    program_change: {
      "0": { action: "open_program", program: "explorer", label: "Explorador de archivos" },
      "1": { action: "open_program", program: "calc", label: "Calculadora" },
      "3": { action: "key_press", keys: ["win","e"], label: "Explorador Windows" },
      "4": { action: "mqtt_publish", topic: "home/scene", payload: "\"studio\"", label: "Escena Estudio MQTT" },
    }
  },
  velocity_threshold: 10,
  octave_shift: 0
};

// ══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════
export default function CasioMIDIPanel() {
  const [config, setConfig]       = useState(() => JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
  const [tab, setTab]             = useState("notes");
  const [editKey, setEditKey]     = useState(null);
  const [editType, setEditType]   = useState("notes");
  const [modal, setModal]         = useState(null);
  const [toast, setToast]         = useState(null);
  const [jsonView, setJsonView]   = useState(false);
  const [search, setSearch]       = useState("");

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  // ── Helpers config ──────────────────────────────────────
  const updateMapping = (mapType, key, data) => {
    setConfig(c => ({
      ...c,
      mappings: {
        ...c.mappings,
        [mapType]: { ...c.mappings[mapType], [key]: data }
      }
    }));
  };

  const deleteMapping = (mapType, key) => {
    setConfig(c => {
      const next = { ...c.mappings[mapType] };
      delete next[key];
      return { ...c, mappings: { ...c.mappings, [mapType]: next } };
    });
    showToast("Mapeo eliminado", "warn");
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "casio_midi_config.json";
    a.click();
    showToast("JSON exportado ✓");
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        setConfig(parsed);
        showToast("Configuración importada ✓");
      } catch {
        showToast("JSON inválido", "err");
      }
    };
    reader.readAsText(file);
  };

  // ── Piano keyboard (C3–C6, 37 notas CTK-2400 range) ────
  const pianoNotes = Array.from({ length: 37 }, (_, i) => i + 48);
  const isBlack = (n) => [1,3,6,8,10].includes(n % 12);
  const hasMapped = (n) => !!config.mappings.notes[String(n)];

  const mappedTab = config.mappings[tab] || {};
  const filteredKeys = Object.keys(mappedTab).filter(k => {
    if (!search) return true;
    const m = mappedTab[k];
    return (
      k.includes(search) ||
      (m.label || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.action || "").includes(search)
    );
  });

  return (
    <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", background: C.bg, minHeight: "100vh", color: C.text, padding: "0 0 3rem" }}>

      {/* ── HEADER ── */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: C.bg }}>P</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, letterSpacing: 2, textTransform: "uppercase" }}>PIXELBITS Studio</div>
            <div style={{ fontSize: 11, color: C.muted }}>CASIO CTK-2400 · MIDI PC Controller</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={() => setJsonView(v => !v)} color={C.info}>{ jsonView ? "Vista tabla" : "Ver JSON" }</Btn>
          <label style={btnStyle(C.warn)}>
            Importar
            <input type="file" accept=".json" style={{ display: "none" }} onChange={importJSON} />
          </label>
          <Btn onClick={exportJSON} color={C.accent}>Exportar JSON</Btn>
        </div>
      </div>

      {/* ── PIANO VISUAL ── */}
      <div style={{ padding: "1rem 1.5rem 0" }}>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: 1 }}>PIANO — NOTAS MAPEADAS</div>
        <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 56, position: "relative", overflowX: "auto" }}>
          {pianoNotes.map(n => {
            const black = isBlack(n);
            const mapped = hasMapped(n);
            return (
              <div
                key={n}
                title={`${noteName(n)} (MIDI ${n})${mapped ? " — MAPEADO" : ""}`}
                onClick={() => { setEditKey(String(n)); setEditType("notes"); setModal("edit"); }}
                style={{
                  width: black ? 14 : 20,
                  height: black ? 34 : 52,
                  background: mapped ? C.accent : black ? "#1a1a1a" : "#e8e8e8",
                  border: `1px solid ${mapped ? C.accent : black ? "#333" : "#bbb"}`,
                  borderRadius: "0 0 3px 3px",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "transform 0.1s",
                  zIndex: black ? 2 : 1,
                  marginLeft: black ? -8 : 0,
                  marginRight: black ? -6 : 0,
                  boxShadow: mapped ? `0 0 8px ${C.accent}66` : "none",
                }}
              />
            );
          })}
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>
          <span style={{ color: C.accent }}>■</span> = nota mapeada · Clic en tecla para asignar acción
        </div>
      </div>

      {/* ── MQTT STATUS + MIDI SETTINGS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "1rem 1.5rem" }}>
        <SettingsCard title="MIDI" icon="🎹">
          <Row label="Puerto (nombre)">
            <input style={inputStyle()} value={config.midi.port_name}
              onChange={e => setConfig(c => ({ ...c, midi: { ...c.midi, port_name: e.target.value } }))} />
          </Row>
          <Row label="Canal notas">
            <select style={inputStyle()} value={config.midi.note_channel}
              onChange={e => setConfig(c => ({ ...c, midi: { ...c.midi, note_channel: +e.target.value } }))}>
              {Array.from({length:16},(_,i)=><option key={i} value={i}>Canal {i+1}</option>)}
            </select>
          </Row>
          <Row label="Canal CC">
            <select style={inputStyle()} value={config.midi.channel}
              onChange={e => setConfig(c => ({ ...c, midi: { ...c.midi, channel: +e.target.value } }))}>
              {Array.from({length:16},(_,i)=><option key={i} value={i}>Canal {i+1}</option>)}
            </select>
          </Row>
          <Row label="Vel. mínima">
            <input type="number" min={0} max={127} style={inputStyle()} value={config.velocity_threshold}
              onChange={e => setConfig(c => ({ ...c, velocity_threshold: +e.target.value }))} />
          </Row>
          <Row label="Octave shift">
            <input type="number" min={-4} max={4} style={inputStyle()} value={config.octave_shift}
              onChange={e => setConfig(c => ({ ...c, octave_shift: +e.target.value }))} />
          </Row>
        </SettingsCard>

        <SettingsCard title="MQTT Broker" icon="📡">
          <Row label="Habilitado">
            <Toggle value={config.mqtt.enabled}
              onChange={v => setConfig(c => ({ ...c, mqtt: { ...c.mqtt, enabled: v } }))} />
          </Row>
          <Row label="Broker IP">
            <input style={inputStyle()} value={config.mqtt.broker}
              onChange={e => setConfig(c => ({ ...c, mqtt: { ...c.mqtt, broker: e.target.value } }))} />
          </Row>
          <Row label="Puerto">
            <input type="number" style={inputStyle()} value={config.mqtt.port}
              onChange={e => setConfig(c => ({ ...c, mqtt: { ...c.mqtt, port: +e.target.value } }))} />
          </Row>
          <Row label="Usuario">
            <input style={inputStyle()} value={config.mqtt.username}
              onChange={e => setConfig(c => ({ ...c, mqtt: { ...c.mqtt, username: e.target.value } }))} />
          </Row>
          <Row label="Password">
            <input type="password" style={inputStyle()} value={config.mqtt.password}
              onChange={e => setConfig(c => ({ ...c, mqtt: { ...c.mqtt, password: e.target.value } }))} />
          </Row>
        </SettingsCard>
      </div>

      {/* ── TABS MAPEOS ── */}
      <div style={{ padding: "0 1.5rem" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {[["notes","🎵 Notas"],["control_change","🎚️ Control Change"],["program_change","🔄 Program Change"]].map(([k,l]) => (
            <button key={k} onClick={() => { setTab(k); setSearch(""); }}
              style={{ ...tabStyle(tab === k), fontFamily: "inherit" }}>
              {l}
              <span style={{ marginLeft: 6, fontSize: 10, background: tab===k ? C.bg : C.surface,
                color: tab===k ? C.accent : C.muted, padding: "1px 6px", borderRadius: 8 }}>
                {Object.keys(config.mappings[k]).length}
              </span>
            </button>
          ))}
        </div>

        {/* Buscador + Agregar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input placeholder="Buscar mapeo..." style={{ ...inputStyle(), flex: 1 }}
            value={search} onChange={e => setSearch(e.target.value)} />
          <Btn color={C.accent} onClick={() => { setEditKey(null); setEditType(tab); setModal("new"); }}>
            + Nuevo mapeo
          </Btn>
        </div>

        {/* Tabla o JSON */}
        {jsonView ? (
          <pre style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "1rem", fontSize: 11, color: C.textDim, overflow: "auto", maxHeight: 400 }}>
            {JSON.stringify(config, null, 2)}
          </pre>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filteredKeys.length === 0 && (
              <div style={{ color: C.muted, fontSize: 13, padding: "1rem 0" }}>Sin mapeos en esta sección.</div>
            )}
            {filteredKeys.sort((a,b)=>+a-+b).map(k => {
              const m = mappedTab[k];
              const at = ACTION_TYPES.find(a => a.value === m.action);
              return (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 10,
                  background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
                  padding: "8px 14px", transition: "border-color 0.2s" }}>
                  {/* Clave */}
                  <div style={{ width: 56, flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: C.muted }}>
                      {tab === "notes" ? "MIDI" : tab === "control_change" ? "CC" : "PC"}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.gold }}>
                      {tab === "notes" ? `${k} (${noteName(+k)})` : k}
                    </div>
                  </div>
                  {/* Icono acción */}
                  <div style={{ fontSize: 20, width: 28, textAlign: "center", flexShrink: 0 }}>
                    {at?.icon || "⚙️"}
                  </div>
                  {/* Descripción */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.label || at?.label || m.action}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted }}>
                      {m.action}
                      {m.keys && ` · ${m.keys.join("+")}`}
                      {m.url && ` · ${m.url}`}
                      {m.program && ` · ${m.program}`}
                      {m.command && ` · ${m.command}`}
                      {m.topic && ` · ${m.topic}`}
                      {m.text && ` · "${m.text}"`}
                      {m.script && ` · ${m.script}`}
                    </div>
                  </div>
                  {/* Acciones */}
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <Btn small color={C.info} onClick={() => {
                      setEditKey(k); setEditType(tab); setModal("edit");
                    }}>Editar</Btn>
                    <Btn small color={C.danger} onClick={() => deleteMapping(tab, k)}>✕</Btn>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL EDITAR/NUEVO ── */}
      {modal && (
        <MappingModal
          mode={modal}
          mapType={editType}
          keyVal={editKey}
          data={editKey ? (config.mappings[editType][editKey] || {}) : {}}
          onSave={(k, d) => {
            updateMapping(editType, k, d);
            setModal(null);
            showToast(modal === "new" ? "Mapeo creado ✓" : "Mapeo actualizado ✓");
          }}
          onClose={() => setModal(null)}
          existingKeys={Object.keys(config.mappings[editType])}
        />
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === "err" ? C.danger : toast.type === "warn" ? C.warn : C.accent,
          color: C.bg, padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)", animation: "fadeIn 0.2s",
          fontFamily: "inherit"
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:none } }
        * { box-sizing: border-box; }
        input, select, textarea { background: ${C.surface}; color: ${C.text}; border: 1px solid ${C.border}; border-radius: 6px; padding: 5px 10px; font-size: 12px; font-family: inherit; outline: none; }
        input:focus, select:focus { border-color: ${C.accent}; }
        option { background: ${C.bg}; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MODAL DE EDICIÓN
// ══════════════════════════════════════════════════════════
function MappingModal({ mode, mapType, keyVal, data, onSave, onClose, existingKeys }) {
  const [k, setK] = useState(keyVal || "");
  const [action, setAction] = useState(data.action || "key_press");
  const [label, setLabel] = useState(data.label || "");
  const [keys, setKeys] = useState((data.keys || []).join("+"));
  const [url, setUrl] = useState(data.url || "");
  const [program, setProgram] = useState(data.program || "");
  const [command, setCommand] = useState(data.command || "play_pause");
  const [topic, setTopic] = useState(data.topic || "");
  const [payload, setPayload] = useState(data.payload || "");
  const [text, setText] = useState(data.text || "");
  const [script, setScript] = useState(data.script || "");
  const [err, setErr] = useState("");

  const handleSave = () => {
    const kStr = String(k).trim();
    if (!kStr) { setErr("El número de clave es obligatorio."); return; }
    if (mode === "new" && existingKeys.includes(kStr)) { setErr(`La clave ${kStr} ya existe.`); return; }
    const d = { action, label };
    if (action === "key_press") d.keys = keys.split("+").map(s=>s.trim()).filter(Boolean);
    if (action === "open_program" || action === "close_program") d.program = program;
    if (action === "open_url") d.url = url;
    if (action === "media") d.command = command;
    if (action === "mqtt_publish") { d.topic = topic; d.payload = payload; }
    if (action === "type_text") d.text = text;
    if (action === "run_script") d.script = script;
    onSave(kStr, d);
  };

  const keyLabel = mapType === "notes" ? "Nota MIDI" : mapType === "control_change" ? "CC Número" : "Program #";

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background: C.card, border:`1px solid ${C.borderHi}`, borderRadius:12, padding:"1.5rem", width:480, maxWidth:"95vw", fontFamily:"inherit" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ color:C.accent, fontWeight:700, fontSize:14, textTransform:"uppercase", letterSpacing:1 }}>
            {mode === "new" ? "Nuevo mapeo" : "Editar mapeo"}
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:18, fontFamily:"inherit" }}>✕</button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <Row label={keyLabel}>
            <input style={inputStyle()} value={k} onChange={e=>setK(e.target.value)}
              disabled={mode==="edit"} type="number" min={0} max={127} />
            {mapType === "notes" && k && !isNaN(+k) &&
              <span style={{ fontSize:11, color:C.gold, marginLeft:6 }}>{noteName(+k)}</span>}
          </Row>

          <Row label="Etiqueta">
            <input style={inputStyle()} value={label} onChange={e=>setLabel(e.target.value)} placeholder="Descripción del mapeo" />
          </Row>

          <Row label="Acción">
            <select style={inputStyle()} value={action} onChange={e=>setAction(e.target.value)}>
              {ACTION_TYPES.map(a=><option key={a.value} value={a.value}>{a.icon} {a.label}</option>)}
            </select>
          </Row>

          {action === "key_press" && (
            <Row label="Teclas (+ separadas)">
              <input style={inputStyle()} value={keys} onChange={e=>setKeys(e.target.value)}
                placeholder="ctrl+alt+t  |  win+d  |  f5" />
            </Row>
          )}
          {(action === "open_program" || action === "close_program") && (
            <Row label="Programa / ruta">
              <input style={inputStyle()} value={program} onChange={e=>setProgram(e.target.value)}
                placeholder="notepad  |  C:\Ruta\app.exe" />
            </Row>
          )}
          {action === "open_url" && (
            <Row label="URL">
              <input style={inputStyle()} value={url} onChange={e=>setUrl(e.target.value)}
                placeholder="https://..." />
            </Row>
          )}
          {action === "media" && (
            <Row label="Comando">
              <select style={inputStyle()} value={command} onChange={e=>setCommand(e.target.value)}>
                {MEDIA_COMMANDS.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </Row>
          )}
          {action === "mqtt_publish" && (<>
            <Row label="Topic MQTT">
              <input style={inputStyle()} value={topic} onChange={e=>setTopic(e.target.value)}
                placeholder="lights/SLAVE_01/command" />
            </Row>
            <Row label="Payload">
              <input style={inputStyle()} value={payload} onChange={e=>setPayload(e.target.value)}
                placeholder='{"effect":"rainbow"}  |  usar {value} para CC' />
            </Row>
          </>)}
          {action === "type_text" && (
            <Row label="Texto a escribir">
              <input style={inputStyle()} value={text} onChange={e=>setText(e.target.value)}
                placeholder="texto que se tecleará..." />
            </Row>
          )}
          {action === "run_script" && (
            <Row label="Script / comando">
              <input style={inputStyle()} value={script} onChange={e=>setScript(e.target.value)}
                placeholder="python ~/script.py  |  powershell ..." />
            </Row>
          )}
        </div>

        {err && <div style={{ color:C.danger, fontSize:12, marginTop:8 }}>{err}</div>}

        <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:16 }}>
          <Btn color={C.muted} onClick={onClose}>Cancelar</Btn>
          <Btn color={C.accent} onClick={handleSave}>
            {mode === "new" ? "Crear mapeo" : "Guardar cambios"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────
function SettingsCard({ title, icon, children }) {
  return (
    <div style={{ background: C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"1rem" }}>
      <div style={{ fontSize:12, color:C.accent, fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>
        {icon} {title}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>{children}</div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12 }}>
      <div style={{ width:100, color:C.muted, flexShrink:0 }}>{label}</div>
      <div style={{ flex:1, display:"flex", alignItems:"center", gap:4 }}>{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width:36, height:20, borderRadius:10, background: value ? C.accent : C.border,
      position:"relative", cursor:"pointer", transition:"background 0.2s", flexShrink:0
    }}>
      <div style={{
        position:"absolute", top:2, left: value ? 18 : 2, width:16, height:16,
        borderRadius:"50%", background:"white", transition:"left 0.2s"
      }}/>
    </div>
  );
}

function Btn({ children, onClick, color, small }) {
  return (
    <button onClick={onClick} style={{
      background:"transparent", border:`1px solid ${color}`, color, borderRadius:6,
      padding: small ? "3px 10px" : "5px 14px", fontSize: small ? 11 : 12,
      cursor:"pointer", fontFamily:"inherit", fontWeight:600, transition:"background 0.15s",
      whiteSpace:"nowrap"
    }}
    onMouseEnter={e => e.currentTarget.style.background = color + "22"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      {children}
    </button>
  );
}

const btnStyle = (color) => ({
  background:"transparent", border:`1px solid ${color}`, color, borderRadius:6,
  padding:"5px 14px", fontSize:12, cursor:"pointer", fontFamily:"'JetBrains Mono', monospace",
  fontWeight:600, display:"inline-flex", alignItems:"center"
});

const inputStyle = () => ({
  background: C.surface, color: C.text, border:`1px solid ${C.border}`,
  borderRadius:6, padding:"4px 8px", fontSize:12, fontFamily:"inherit", width:"100%", outline:"none"
});

const tabStyle = (active) => ({
  background: active ? C.surface : "transparent",
  border: `1px solid ${active ? C.borderHi : C.border}`,
  color: active ? C.accent : C.muted,
  borderRadius: 6, padding:"5px 14px", fontSize:12, cursor:"pointer",
  fontFamily:"inherit", fontWeight: active ? 700 : 400, transition:"all 0.15s"
});
