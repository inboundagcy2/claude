import React from "react";
import {
  AbsoluteFill,
  Composition,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const FPS = 30;
const PURPLE = "#7C3AED";
const FONT =
  "Inter, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

// Original script — same tip format as the reference, written in Zain's voice.
type Scene = {
  id: string;
  duration: number;
  caption: string;
  kind: "face" | "console" | "pages" | "queries" | "editor" | "indexing" | "cta";
  image?: string;
  focusX?: number;
};

export const SCENES: Scene[] = [
  { id: "hook", duration: 75, kind: "face", image: "faces/hook.png", focusX: 0.3,
    caption: "Google shows your site… but nobody clicks?" },
  { id: "console", duration: 75, kind: "console",
    caption: "Open Search Console. Hit Performance, then Pages." },
  { id: "pages", duration: 90, kind: "pages",
    caption: "Sort by impressions. Spot pages with views but zero clicks." },
  { id: "queries", duration: 90, kind: "queries",
    caption: "Open that page and read what people actually searched." },
  { id: "editor", duration: 105, kind: "editor",
    caption: "Rewrite your title and meta to match those exact searches." },
  { id: "indexing", duration: 75, kind: "indexing",
    caption: "Then click Request Indexing. Done." },
  { id: "cta", duration: 105, kind: "cta", image: "faces/cta.png",
    caption: "Want my team to fix this for you? Comment SEO." },
];

const TOTAL = SCENES.reduce((a, s) => a + s.duration, 0);

export const MyComposition = () => (
  <Composition
    id="GscReel"
    component={Reel}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1080}
    height={1920}
  />
);

const Reel: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0b12", fontFamily: FONT }}>
      {SCENES.map((s) => {
        const start = from;
        from += s.duration;
        return (
          <Sequence key={s.id} from={start} durationInFrames={s.duration} name={s.id}>
            <SceneView scene={s} />
            <WordCaption text={s.caption} duration={s.duration} />
          </Sequence>
        );
      })}
      <Watermark />
    </AbsoluteFill>
  );
};

const SceneView: React.FC<{ scene: Scene }> = ({ scene }) => {
  switch (scene.kind) {
    case "face":
    case "cta":
      return <FaceShot src={scene.image!} cta={scene.kind === "cta"} focusX={scene.focusX ?? 0.5} />;
    case "console":
      return <Phone tilt={-4}><ConsoleHome /></Phone>;
    case "pages":
      return <Phone tilt={3}><PagesTable /></Phone>;
    case "queries":
      return <Phone tilt={-3}><QueriesList /></Phone>;
    case "editor":
      return <Phone tilt={2}><MetaEditor /></Phone>;
    case "indexing":
      return <Phone tilt={-2}><IndexingBox /></Phone>;
  }
};

/* ---------- Face shots (Ken Burns on 16:9 photo, cropped to 9:16) ---------- */
const FaceShot: React.FC<{ src: string; cta: boolean; focusX: number }> = ({ src, cta, focusX }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.12]);
  const punch = cta ? 1 : interpolate(frame, [0, 6], [1.15, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          height: "100%",
          position: "absolute",
          left: "50%",
          transform: `translateX(-${focusX * 100}%) scale(${scale * punch})`,
          transformOrigin: `${focusX * 100}% 35%`,
        }}
      />
      <AbsoluteFill
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)" }}
      />
      {cta ? <CtaBadge /> : null}
    </AbsoluteFill>
  );
};

const CtaBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 20, fps, config: { damping: 12 } });
  return (
    <div
      style={{
        position: "absolute", top: 170, left: 0, right: 0, display: "flex",
        justifyContent: "center", transform: `scale(${s})`,
      }}
    >
      <div
        style={{
          background: "white", color: "#111", fontWeight: 900, fontSize: 64,
          padding: "22px 46px", borderRadius: 28, boxShadow: "0 20px 60px rgba(0,0,0,.4)",
        }}
      >
        Comment <span style={{ color: PURPLE }}>“SEO”</span> 👇
      </div>
    </div>
  );
};

/* ---------- Phone/laptop-screen framing for the UI walkthrough ---------- */
const Phone: React.FC<{ tilt: number; children: React.ReactNode }> = ({ tilt, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.08]);
  const enter = interpolate(frame, [0, 8], [40, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 30%, #2a2340, #0b0b12)" }}>
      <AbsoluteFill
        style={{
          transform: `translateY(${enter}px) rotate(${tilt * 0.4}deg) scale(${zoom})`,
          padding: "150px 60px 420px",
        }}
      >
        <div
          style={{
            flex: 1, background: "#fff", borderRadius: 36, overflow: "hidden",
            boxShadow: "0 40px 120px rgba(0,0,0,.6)", border: "10px solid #1c1c24",
            display: "flex", flexDirection: "column",
          }}
        >
          <div style={{ height: 70, background: "#f1f3f4", display: "flex", alignItems: "center", padding: "0 30px", gap: 14 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <div key={c} style={{ width: 20, height: 20, borderRadius: 10, background: c }} />
            ))}
            <div style={{ marginLeft: 20, flex: 1, height: 40, background: "#fff", borderRadius: 20, fontSize: 22, color: "#666", display: "flex", alignItems: "center", paddingLeft: 20 }}>
              search console · yourwebsite.com
            </div>
          </div>
          <div style={{ flex: 1, padding: 40, color: "#202124" }}>{children}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Cursor: React.FC<{ x: number[]; y: number[]; at: number[] }> = ({ x, y, at }) => {
  const frame = useCurrentFrame();
  const cx = interpolate(frame, at, x, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cy = interpolate(frame, at, y, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: cx, top: cy, fontSize: 64, filter: "drop-shadow(0 4px 6px rgba(0,0,0,.4))" }}>
      👆
    </div>
  );
};

const ConsoleHome: React.FC = () => {
  const frame = useCurrentFrame();
  const active = frame > 40;
  return (
    <div style={{ position: "relative", height: "100%" }}>
      <div style={{ fontSize: 56, fontWeight: 700, marginBottom: 30 }}>Performance</div>
      <div style={{ display: "flex", gap: 16, marginBottom: 50 }}>
        {["7 days", "28 days", "3 months"].map((t, i) => (
          <div key={t} style={{ fontSize: 28, padding: "12px 22px", borderRadius: 12, border: "2px solid #dadce0", background: i === 2 ? "#e8f0fe" : "#fff", color: i === 2 ? "#1a73e8" : "#444" }}>{t}</div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 40, borderBottom: "2px solid #eee", fontSize: 32, fontWeight: 600 }}>
        {["QUERIES", "PAGES", "COUNTRIES"].map((t) => {
          const on = t === "PAGES" && active;
          return (
            <div key={t} style={{ paddingBottom: 18, color: on ? "#1a73e8" : "#666", borderBottom: on ? "6px solid #1a73e8" : "6px solid transparent" }}>{t}</div>
          );
        })}
      </div>
      <div style={{ marginTop: 40, display: "flex", gap: 24 }}>
        <Stat label="Total clicks" value="38" color="#4285f4" />
        <Stat label="Impressions" value="24.6K" color="#5e35b1" />
      </div>
      <Cursor x={[600, 330]} y={[700, 330]} at={[5, 38]} />
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div style={{ flex: 1, background: color, color: "#fff", borderRadius: 18, padding: 28 }}>
    <div style={{ fontSize: 26, opacity: 0.9 }}>{label}</div>
    <div style={{ fontSize: 64, fontWeight: 800 }}>{value}</div>
  </div>
);

const ROWS = [
  ["/services/ai-receptionist", 0, 4120],
  ["/blog/whatsapp-automation", 0, 3380],
  ["/real-estate-crm", 1, 2710],
  ["/ghl-setup-dubai", 0, 1960],
  ["/lead-gen-uk", 2, 1450],
  ["/pricing", 3, 920],
] as const;

const PagesTable: React.FC = () => {
  const frame = useCurrentFrame();
  const sorted = frame > 25;
  const highlight = frame > 45;
  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#5f6368", paddingBottom: 20, borderBottom: "2px solid #eee" }}>
        <div style={{ flex: 1 }}>Top pages</div>
        <div style={{ width: 130, textAlign: "right" }}>Clicks</div>
        <div style={{ width: 230, textAlign: "right", color: sorted ? "#1a73e8" : "#5f6368" }}>{sorted ? "↓ " : ""}Impressions</div>
      </div>
      {ROWS.map(([url, c, imp], i) => {
        const hot = highlight && c === 0;
        return (
          <div key={url} style={{ display: "flex", fontSize: 30, padding: "26px 10px", borderBottom: "1px solid #f0f0f0", background: hot ? "#fde7ef" : "transparent", borderRadius: 12, opacity: interpolate(frame, [i * 2, i * 2 + 8], [0, 1], { extrapolateRight: "clamp" }) }}>
            <div style={{ flex: 1, color: "#1a0dab" }}>{url}</div>
            <div style={{ width: 130, textAlign: "right", fontWeight: hot ? 800 : 400, color: hot ? "#d81b60" : "#202124" }}>{c}</div>
            <div style={{ width: 230, textAlign: "right" }}>{imp.toLocaleString("en-US")}</div>
          </div>
        );
      })}
      <Cursor x={[500, 830]} y={[800, -20]} at={[0, 22]} />
    </div>
  );
};

const QUERIES = [
  "ai receptionist for clinics",
  "ai phone answering service uk",
  "virtual receptionist ai cost",
  "24/7 ai call answering",
  "ai receptionist for real estate",
];

const QueriesList: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "relative" }}>
      <div style={{ fontSize: 30, color: "#5f6368" }}>Page: /services/ai-receptionist</div>
      <div style={{ fontSize: 44, fontWeight: 700, margin: "20px 0 30px" }}>Top queries</div>
      {QUERIES.map((q, i) => {
        const sel = frame > 30 + i * 10;
        return (
          <div key={q} style={{ fontSize: 34, padding: "22px 20px", marginBottom: 10, borderRadius: 12, background: sel ? "#d2e3fc" : "#f8f9fa", transition: "none" }}>
            {q}
          </div>
        );
      })}
    </div>
  );
};

const typed = (text: string, frame: number, start: number, cps = 1.4) =>
  text.slice(0, Math.max(0, Math.floor((frame - start) * cps)));

const MetaEditor: React.FC = () => {
  const frame = useCurrentFrame();
  const title = "AI Receptionist for UK Clinics | Answer Every Call 24/7";
  const desc = "Never miss a patient call again. Our AI receptionist books appointments 24/7. Book a free demo today.";
  return (
    <div>
      <div style={{ border: "2px solid #eee", borderRadius: 18, padding: 26, marginBottom: 36 }}>
        <div style={{ fontSize: 24, color: "#5f6368" }}>yourwebsite.com › ai-receptionist</div>
        <div style={{ fontSize: 34, color: "#1a0dab", fontWeight: 600, margin: "8px 0", minHeight: 84 }}>{typed(title, frame, 5)}</div>
        <div style={{ fontSize: 26, color: "#4d5156", minHeight: 70 }}>{typed(desc, frame, 45, 2.4)}</div>
      </div>
      <Field label="SEO title" value={typed(title, frame, 5)} />
      <Field label="Meta description" value={typed(desc, frame, 45, 2.4)} tall />
      <div style={{ height: 14, borderRadius: 7, background: "#e0e0e0", marginTop: 10 }}>
        <div style={{ height: 14, borderRadius: 7, background: "#34a853", width: `${interpolate(frame, [5, 95], [10, 100], { extrapolateRight: "clamp" })}%` }} />
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; value: string; tall?: boolean }> = ({ label, value, tall }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>{label}</div>
    <div style={{ fontSize: 28, border: "2px solid #c6c6c6", borderRadius: 12, padding: 18, minHeight: tall ? 130 : 50 }}>
      {value}<span style={{ color: PURPLE }}>|</span>
    </div>
  </div>
);

const IndexingBox: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clicked = frame > 30;
  const pop = spring({ frame: frame - 32, fps, config: { damping: 10 } });
  return (
    <div style={{ position: "relative", paddingTop: 120 }}>
      <div style={{ fontSize: 30, color: "#5f6368", marginBottom: 20 }}>URL inspection · /services/ai-receptionist</div>
      <div style={{ border: "2px solid #eee", borderRadius: 18, padding: 36, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 32 }}>Page changed?</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", background: clicked ? "#188038" : "#1a73e8", padding: "18px 28px", borderRadius: 12 }}>
          {clicked ? "✓ REQUESTED" : "REQUEST INDEXING"}
        </div>
      </div>
      <div style={{ marginTop: 60, fontSize: 40, fontWeight: 800, color: "#188038", transform: `scale(${pop})`, textAlign: "center" }}>
        Indexing requested ✅
      </div>
      <Cursor x={[300, 760]} y={[700, 250]} at={[0, 26]} />
    </div>
  );
};

/* ---------- Word-by-word purple captions ---------- */
const WordCaption: React.FC<{ text: string; duration: number }> = ({ text, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  const per = (duration - 6) / words.length;
  const idx = Math.min(words.length - 1, Math.floor(frame / per));
  const chunkSize = 2;
  const chunkStart = Math.floor(idx / chunkSize) * chunkSize;
  const chunk = words.slice(chunkStart, chunkStart + chunkSize);
  const pop = spring({ frame: frame - chunkStart * per, fps, config: { damping: 14, stiffness: 220 } });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 330 }}>
      <div
        style={{
          background: PURPLE, color: "#fff", fontSize: 86, fontWeight: 900,
          padding: "16px 40px", borderRadius: 26, letterSpacing: -1,
          transform: `scale(${0.85 + 0.15 * pop})`, boxShadow: "0 16px 40px rgba(0,0,0,.45)",
          textShadow: "0 3px 0 rgba(0,0,0,.25)", maxWidth: 960, textAlign: "center",
        }}
      >
        {chunk.map((w, i) => (
          <span key={i} style={{ color: chunkStart + i === idx ? "#FDE047" : "#fff" }}>
            {w}{i < chunk.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Watermark: React.FC = () => (
  <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,.85)", fontSize: 34, fontWeight: 800, letterSpacing: 2, fontFamily: FONT, textShadow: "0 2px 8px rgba(0,0,0,.6)" }}>
    @ZAINNAVEED · INBOUND AGENCY
  </div>
);
