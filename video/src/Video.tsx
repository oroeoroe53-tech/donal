import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import sizes from "./sizes.json";
import { C, s, sans, serif } from "./theme";
import { Seg, TIMELINE, TRANSITION } from "./timeline";

const W = 1920;
const H = 1080;
const BAR = 96;

const src = (id: string) => staticFile(`fotos/${id}.jpg`);
const ratio = (id: string) => {
  const [w, h] = (sizes as Record<string, number[]>)[id];
  return w / h;
};
const isPortrait = (id: string) => ratio(id) < 1.15;
const hash = (id: string) => [...id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7);

/* ---------- utilidades de animación ---------- */

const useProgress = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return Math.min(1, frame / Math.max(1, durationInFrames - 1));
};

const useReveal = (delaySec = 0.35) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - s(delaySec), fps, config: { damping: 200 }, durationInFrames: s(1.1) });
};

/* ---------- fotografía con movimiento lento ---------- */

const KenBurns: React.FC<{ id: string; seed?: number; from?: number; style?: React.CSSProperties }> = ({
  id,
  seed,
  from,
  style,
}) => {
  const p = useProgress();
  const h = hash(id) + (seed ?? 0);
  const zoomIn = h % 2 === 0;
  const z0 = from ?? (zoomIn ? 1.0 : 1.1);
  const z1 = from !== undefined ? from + 0.08 : zoomIn ? 1.1 : 1.0;
  const dx = ((h % 5) - 2) * 0.8;
  const dy = ((h % 3) - 1) * 0.8;
  const e = Easing.inOut(Easing.sin)(p);
  const z = z0 + (z1 - z0) * e;
  return (
    <Img
      src={src(id)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${z}) translate(${dx * e}%, ${dy * e}%)`,
        ...style,
      }}
    />
  );
};

const Backdrop: React.FC<{ id: string; dim?: number }> = ({ id, dim = 0.55 }) => (
  <AbsoluteFill style={{ overflow: "hidden", backgroundColor: C.ink }}>
    <Img
      src={staticFile(`blur/${id}.jpg`)}
      style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.1)" }}
    />
    <AbsoluteFill style={{ backgroundColor: `rgba(14,11,10,${dim})` }} />
  </AbsoluteFill>
);

/** Foto a pantalla: horizontal → a sangre; vertical → fondo difuminado + foto a un lado. */
const PhotoStage: React.FC<{ id: string; side?: "left" | "right"; from?: number; dim?: number }> = ({
  id,
  side = "right",
  from,
  dim,
}) => {
  if (!isPortrait(id)) {
    return (
      <AbsoluteFill style={{ overflow: "hidden", backgroundColor: C.ink }}>
        <KenBurns id={id} from={from} />
        {dim ? <AbsoluteFill style={{ backgroundColor: `rgba(14,11,10,${dim})` }} /> : null}
      </AbsoluteFill>
    );
  }
  const w = Math.round(H * ratio(id));
  return (
    <AbsoluteFill>
      <Backdrop id={id} dim={dim ?? 0.5} />
      <div
        style={{
          position: "absolute",
          top: 0,
          height: H,
          width: w,
          [side]: 150,
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
        }}
      >
        <KenBurns id={id} from={from ?? 1.0} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- tipografía ---------- */

const Scrim: React.FC<{ from?: "bottom" | "left" }> = ({ from = "bottom" }) => (
  <AbsoluteFill
    style={{
      background:
        from === "bottom"
          ? "linear-gradient(to top, rgba(14,11,10,0.88) 0%, rgba(14,11,10,0.55) 28%, rgba(14,11,10,0) 55%)"
          : "linear-gradient(to right, rgba(14,11,10,0.9) 0%, rgba(14,11,10,0.6) 40%, rgba(14,11,10,0) 70%)",
    }}
  />
);

const Kicker: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.gold }) => (
  <div
    style={{
      fontFamily: sans,
      fontWeight: 600,
      fontSize: 24,
      letterSpacing: "0.32em",
      textTransform: "uppercase",
      color,
      display: "flex",
      alignItems: "center",
      gap: 18,
      whiteSpace: "nowrap",
    }}
  >
    <span style={{ width: 54, height: 2, backgroundColor: color, display: "inline-block" }} />
    {children}
  </div>
);

const TextBlock: React.FC<{
  kicker?: string;
  title: string;
  text?: string;
  size?: number;
  maxWidth?: number;
  left?: number;
  bottom?: number;
  delay?: number;
}> = ({ kicker, title, text, size = 76, maxWidth = 1100, left = 120, bottom = BAR + 70, delay }) => {
  const r = useReveal(delay);
  const r2 = useReveal((delay ?? 0.35) + 0.25);
  return (
    <div style={{ position: "absolute", left, bottom, maxWidth }}>
      {kicker ? (
        <div style={{ opacity: r, transform: `translateY(${(1 - r) * 20}px)`, marginBottom: 22 }}>
          <Kicker>{kicker}</Kicker>
        </div>
      ) : null}
      <div
        style={{
          fontFamily: serif,
          fontWeight: 600,
          fontSize: size,
          lineHeight: 1.04,
          color: C.ivory,
          textShadow: "0 4px 30px rgba(0,0,0,0.5)",
          opacity: r,
          transform: `translateY(${(1 - r) * 30}px)`,
        }}
      >
        {title}
      </div>
      {text ? (
        <div
          style={{
            marginTop: 26,
            fontFamily: sans,
            fontWeight: 400,
            fontSize: 32,
            lineHeight: 1.4,
            color: "rgba(247,241,230,0.9)",
            opacity: r2,
            transform: `translateY(${(1 - r2) * 20}px)`,
          }}
        >
          {text}
        </div>
      ) : null}
    </div>
  );
};

const Cross: React.FC<{ size: number; color?: string }> = ({ size, color = C.red }) => (
  <div
    style={{
      width: size * 0.77,
      height: size,
      backgroundColor: color,
      WebkitMaskImage: `url(${staticFile("cruz.png")})`,
      WebkitMaskSize: "contain",
      WebkitMaskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
    }}
  />
);

/* ---------- bloques ---------- */

const OpeningLayout: React.FC<{ showText: boolean }> = ({ showText }) => (
  <AbsoluteFill>
    <PhotoStage id="069" side="right" from={1.0} />
    <Scrim from="left" />
    {showText ? <OpeningText /> : null}
  </AbsoluteFill>
);

const OpeningText: React.FC = () => {
  const r = useReveal(1.0);
  const r2 = useReveal(1.6);
  const r3 = useReveal(2.2);
  return (
    <div style={{ position: "absolute", left: 140, top: 200, width: 900 }}>
      <div style={{ opacity: r, transform: `translateY(${(1 - r) * 20}px)` }}>
        <Cross size={120} />
        <div style={{ height: 40 }} />
        <Kicker>Día de la Iglesia Diocesana 2026</Kicker>
      </div>
      <div
        style={{
          marginTop: 30,
          fontFamily: serif,
          fontWeight: 700,
          fontSize: 140,
          lineHeight: 0.98,
          color: C.ivory,
          opacity: r2,
          transform: `translateY(${(1 - r2) * 40}px)`,
          textShadow: "0 6px 40px rgba(0,0,0,0.5)",
        }}
      >
        Dios cuenta
        <br />
        contigo
      </div>
      <div
        style={{
          marginTop: 40,
          fontFamily: sans,
          fontSize: 32,
          fontWeight: 500,
          color: "rgba(247,241,230,0.9)",
          opacity: r3,
          lineHeight: 1.4,
        }}
      >
        Parroquia de Santiago el Real
        <br />
        Medina del Campo · Archidiócesis de Valladolid
      </div>
    </div>
  );
};

const Chapter: React.FC<Extract<Seg, { k: "chapter" }>> = ({ id, num, title, sub }) => {
  const r = useReveal(0.3);
  const r2 = useReveal(0.7);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <KenBurns id={id} />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "rgba(14,11,10,0.5)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(14,11,10,0.55) 0%, rgba(14,11,10,0.2) 70%)" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", paddingBottom: BAR }}>
        <div style={{ fontFamily: serif, fontSize: 64, color: C.gold, opacity: r, fontWeight: 500 }}>{num}</div>
        <div style={{ width: 120 * r, height: 2, backgroundColor: C.gold, margin: "22px 0 34px" }} />
        <div
          style={{
            fontFamily: serif,
            fontWeight: 700,
            fontSize: 124,
            color: C.ivory,
            opacity: r,
            transform: `translateY(${(1 - r) * 30}px)`,
            textShadow: "0 6px 40px rgba(0,0,0,0.6)",
          }}
        >
          {title}
        </div>
        <div style={{ marginTop: 26, fontFamily: sans, fontSize: 34, color: "rgba(247,241,230,0.9)", opacity: r2, maxWidth: 1300 }}>
          {sub}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Hero: React.FC<Extract<Seg, { k: "hero" }>> = ({ id, kicker, title, text }) => {
  const portrait = isPortrait(id);
  return (
    <AbsoluteFill>
      <PhotoStage id={id} side="right" />
      <Scrim from={portrait ? "left" : "bottom"} />
      <TextBlock kicker={kicker} title={title} text={text} size={92} maxWidth={portrait ? 820 : 1250} />
    </AbsoluteFill>
  );
};

const Photo: React.FC<Extract<Seg, { k: "photo" }>> = ({ id, kicker, title }) => {
  const portrait = isPortrait(id);
  return (
    <AbsoluteFill>
      <PhotoStage id={id} side={hash(id) % 2 ? "right" : "left"} />
      <Scrim from="bottom" />
      <TextBlock
        kicker={kicker}
        title={title}
        size={64}
        maxWidth={portrait ? 700 : 1100}
        left={portrait && hash(id) % 2 === 0 ? W - 120 - 700 : 120}
      />
    </AbsoluteFill>
  );
};

const Tri: React.FC<Extract<Seg, { k: "tri" }>> = ({ ids, title }) => {
  const frame = useCurrentFrame();
  const gap = 8;
  const pw = (W - gap * (ids.length - 1)) / ids.length;
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      {ids.map((id, i) => {
        const o = interpolate(frame, [i * 5, i * 5 + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div
            key={id}
            style={{
              position: "absolute",
              top: 0,
              height: H,
              left: i * (pw + gap),
              width: pw,
              overflow: "hidden",
              opacity: o,
            }}
          >
            <KenBurns id={id} seed={i} />
          </div>
        );
      })}
      <Scrim from="bottom" />
      <TextBlock title={title} size={58} delay={0.4} />
    </AbsoluteFill>
  );
};

const PILLARS = [
  { id: "059", word: "Oración", line: "Rezamos unos por otros" },
  { id: "016", word: "Tiempo", line: "Regalamos horas de servicio" },
  { id: "005", word: "Cualidades", line: "Ponemos nuestros dones en común" },
  { id: "058", word: "Apoyo económico", line: "Sostenemos el templo y su labor" },
];

const Pillars: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = useReveal(0.2);
  const colW = (W - 120 * 2 - 40 * 3) / 4;
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Backdrop id="077" dim={0.75} />
      <div style={{ position: "absolute", top: 80, left: 120, right: 120, textAlign: "center", opacity: head }}>
        <Kicker>Dios cuenta contigo</Kicker>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 80, color: C.ivory, marginTop: 18 }}>
          La parroquia la sostenemos entre todos
        </div>
      </div>
      {PILLARS.map((p, i) => {
        const r = spring({ frame: frame - s(1.2 + i * 1.3), fps, config: { damping: 200 }, durationInFrames: s(1) });
        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              top: 300,
              left: 120 + i * (colW + 40),
              width: colW,
              opacity: r,
              transform: `translateY(${(1 - r) * 40}px)`,
            }}
          >
            <div style={{ height: 420, overflow: "hidden", borderRadius: 6, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
              <KenBurns id={p.id} seed={i} />
            </div>
            <div style={{ fontFamily: serif, fontSize: 40, color: C.gold, marginTop: 26 }}>0{i + 1}</div>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 54, color: C.ivory, lineHeight: 1.05, marginTop: 4 }}>{p.word}</div>
            <div style={{ fontFamily: sans, fontSize: 26, color: "rgba(247,241,230,0.85)", marginTop: 12 }}>{p.line}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Glass: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; accent?: boolean }> = ({ children, style, accent }) => (
  <div
    style={{
      backgroundColor: accent ? "rgba(94,15,18,0.82)" : "rgba(14,11,10,0.62)",
      border: `2px solid ${accent ? C.gold : "rgba(216,178,106,0.45)"}`,
      borderRadius: 22,
      padding: "34px 40px",
      boxSizing: "border-box",
      boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
      ...style,
    }}
  >
    {children}
  </div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 22, letterSpacing: "0.22em", color: C.gold, textTransform: "uppercase" }}>
    {children}
  </div>
);

const useStagger = (i: number, base = 0.8, step = 0.45) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - s(base + i * step), fps, config: { damping: 200 }, durationInFrames: s(0.9) });
};

const QR: React.FC<{ file: string; size: number }> = ({ file, size }) => (
  <div style={{ width: size, height: size, backgroundColor: "#fff", borderRadius: 16, padding: size * 0.04, boxSizing: "border-box" }}>
    <Img src={staticFile(file)} style={{ width: "100%", height: "100%" }} />
  </div>
);

const Quote: React.FC<Extract<Seg, { k: "quote" }>> = ({ id }) => {
  const r = useReveal(0.4);
  const r2 = useReveal(1.6);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <KenBurns id={id} />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "rgba(14,11,10,0.74)" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 220px", paddingBottom: BAR }}>
        <div style={{ opacity: r }}>
          <Kicker>Una puerta abierta para todos</Kicker>
        </div>
        <div
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 74,
            lineHeight: 1.18,
            color: C.ivory,
            marginTop: 40,
            opacity: r,
            transform: `translateY(${(1 - r) * 30}px)`,
            textShadow: "0 6px 40px rgba(0,0,0,0.6)",
          }}
        >
          «Tener la iglesia abierta no se mantiene por inercia: depende del compromiso y el afecto de quienes la valoran y la sienten suya.»
        </div>
        <div style={{ marginTop: 40, fontFamily: sans, fontSize: 30, color: C.gold, opacity: r2 }}>
          Cuidar de lo que es de todos es tarea compartida.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const COSTS = [
  { t: "Calefacción en invierno", v: 490 },
  { t: "Electricidad y megafonía", v: 380 },
  { t: "Limpieza, suelo y consumibles", v: 260 },
  { t: "Mantenimiento y cubiertas", v: 220 },
  { t: "Seguros de edificio y culto", v: 210 },
];

const Costs: React.FC<Extract<Seg, { k: "costs" }>> = ({ id }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r = useReveal(0.3);
  const count = Math.round(
    interpolate(frame, [s(0.8), s(3.2)], [0, 52], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }),
  );
  return (
    <AbsoluteFill>
      <Backdrop id={id} dim={0.72} />
      <div style={{ position: "absolute", left: 120, top: 110, width: 720, opacity: r }}>
        <Kicker>Transparencia y cuentas</Kicker>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 92, lineHeight: 1.0, color: C.ivory, marginTop: 24 }}>
          Lo que no se ve, pero cuesta
        </div>
        <div style={{ marginTop: 46, display: "flex", alignItems: "baseline", gap: 18 }}>
          <span style={{ fontFamily: sans, fontSize: 40, color: C.gold }}>≈</span>
          <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 210, lineHeight: 0.9, color: C.ivory }}>{count} €</span>
        </div>
        <div style={{ fontFamily: sans, fontSize: 34, color: C.gold, marginTop: 34 }}>al día</div>
        <div style={{ fontFamily: sans, fontSize: 28, lineHeight: 1.4, color: "rgba(247,241,230,0.88)", marginTop: 26 }}>
          para mantener el templo abierto, iluminado y cuidado para todo el pueblo.
        </div>
      </div>
      <Glass style={{ position: "absolute", right: 120, top: 150, width: 860 }}>
        <Label>Gastos fijos al mes</Label>
        {COSTS.map((c, i) => {
          const rr = spring({ frame: frame - s(1.2 + i * 0.4), fps, config: { damping: 200 }, durationInFrames: s(0.9) });
          return (
            <div key={c.t} style={{ marginTop: 30, opacity: rr }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: sans, fontSize: 28, color: C.ivory }}>
                <span>{c.t}</span>
                <span style={{ fontWeight: 700 }}>{c.v} €</span>
              </div>
              <div style={{ height: 12, borderRadius: 6, backgroundColor: "rgba(247,241,230,0.12)", marginTop: 12 }}>
                <div style={{ width: `${(c.v / 490) * 100 * rr}%`, height: "100%", borderRadius: 6, background: `linear-gradient(to right, ${C.red}, ${C.gold})` }} />
              </div>
            </div>
          );
        })}
        <div style={{ marginTop: 34, fontFamily: serif, fontStyle: "italic", fontSize: 32, color: C.gold }}>
          La moneda del cepillo ya no alcanza: necesitamos suscripciones.
        </div>
      </Glass>
    </AbsoluteFill>
  );
};

const TAX = [
  [5, 60, 48, "1 €"],
  [10, 120, 96, "2 €"],
  [15, 180, 144, "3 €"],
  [20, 240, 192, "4 €"],
] as const;

const Tax: React.FC<Extract<Seg, { k: "tax" }>> = ({ id }) => {
  const r = useReveal(0.3);
  const big = useReveal(1.1);
  const tab = useReveal(3.0);
  return (
    <AbsoluteFill>
      <Backdrop id={id} dim={0.7} />
      <div style={{ position: "absolute", left: 120, right: 120, top: 100, textAlign: "center", opacity: r }}>
        <Kicker>Ley de Mecenazgo · 80 % de deducción en el IRPF</Kicker>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 96, color: C.ivory, marginTop: 20 }}>Tu ayuda se multiplica</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 330,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 50,
          opacity: big,
          transform: `scale(${0.92 + 0.08 * big})`,
        }}
      >
        <Glass style={{ textAlign: "center", width: 440 }}>
          <Label>Tú aportas</Label>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 130, color: C.ivory, lineHeight: 1 }}>10 €</div>
          <div style={{ fontFamily: sans, fontSize: 26, color: "rgba(247,241,230,0.85)" }}>al mes</div>
        </Glass>
        <div style={{ fontFamily: serif, fontSize: 110, color: C.gold }}>→</div>
        <Glass accent style={{ textAlign: "center", width: 440 }}>
          <Label>A ti te cuesta</Label>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 130, color: C.ivory, lineHeight: 1 }}>2 €</div>
          <div style={{ fontFamily: sans, fontSize: 26, color: "rgba(247,241,230,0.85)" }}>Hacienda te devuelve 96 € al año</div>
        </Glass>
      </div>
      <div style={{ position: "absolute", left: 360, right: 360, top: 690, opacity: tab, display: "flex", gap: 24 }}>
        {TAX.map(([m, , , real]) => (
          <div key={m} style={{ flex: 1, textAlign: "center", borderTop: `2px solid ${C.gold}`, paddingTop: 14 }}>
            <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, color: C.ivory }}>{m} €/mes</div>
            <div style={{ fontFamily: sans, fontSize: 24, color: C.gold, marginTop: 6 }}>coste real {real}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: sans, fontSize: 22, color: "rgba(247,241,230,0.7)", opacity: tab }}>
        Deducción del 80 % sobre los primeros 250 € donados al año.
      </div>
    </AbsoluteFill>
  );
};

const HowTo: React.FC<Extract<Seg, { k: "howto" }>> = ({ id }) => {
  const r = useReveal(0.3);
  const a = useStagger(0, 0.9);
  const b = useStagger(1, 0.9);
  const c = useStagger(2, 0.9);
  const d = useReveal(2.6);
  const card = (v: number): React.CSSProperties => ({ opacity: v, transform: `translateY(${(1 - v) * 30}px)` });
  return (
    <AbsoluteFill>
      <Backdrop id={id} dim={0.74} />
      <div style={{ position: "absolute", left: 120, right: 120, top: 80, textAlign: "center", opacity: r }}>
        <Kicker>Colabora con tu parroquia</Kicker>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 88, color: C.ivory, marginTop: 16 }}>Hazte suscriptor</div>
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 290, display: "flex", gap: 36, alignItems: "stretch" }}>
        <Glass accent style={{ flex: 1.15, textAlign: "center", ...card(a) }}>
          <Label>Bizum · Donación a ONG</Label>
          <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 132, color: C.ivory, letterSpacing: "0.06em", lineHeight: 1.1, marginTop: 18 }}>07524</div>
          <div style={{ fontFamily: sans, fontSize: 24, lineHeight: 1.45, color: "rgba(247,241,230,0.9)", marginTop: 18 }}>
            En tu banco: Bizum → Donación a ONG
            <br />
            Concepto: <i>Sostenimiento Santiago</i>
          </div>
        </Glass>
        <Glass style={{ flex: 1.25, ...card(b) }}>
          <Label>Transferencia · Domiciliación</Label>
          <div style={{ fontFamily: sans, fontSize: 24, color: "rgba(247,241,230,0.8)", marginTop: 22 }}>Parroquia de Santiago el Real</div>
          <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 38, color: C.ivory, marginTop: 10, letterSpacing: "0.03em", lineHeight: 1.35 }}>
            ES70 0075 5717
            <br />
            7007 0058 3860
          </div>
          <div style={{ fontFamily: sans, fontSize: 22, lineHeight: 1.45, color: "rgba(247,241,230,0.8)", marginTop: 16 }}>
            Concepto: <i>Donativo + tu DNI</i> para la desgravación del 80 %.
          </div>
        </Glass>
        <Glass style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", ...card(c) }}>
          <Label>Online</Label>
          <div style={{ marginTop: 18 }}>
            <QR file="qr-dono.png" size={230} />
          </div>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, color: C.ivory, marginTop: 16 }}>donoamiiglesia.es</div>
          <div style={{ fontFamily: sans, fontSize: 20, color: "rgba(247,241,230,0.8)", marginTop: 6 }}>Busca «Santiago el Real, Medina del Campo»</div>
        </Glass>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 845, textAlign: "center", fontFamily: serif, fontStyle: "italic", fontSize: 38, color: C.gold, opacity: d }}>
        Pide el boletín de suscripción en el despacho o junto al cepillo.
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 920, textAlign: "center", fontFamily: sans, fontSize: 24, color: "rgba(247,241,230,0.75)", opacity: d }}>
        También con colectas, donativos, la X de la Iglesia en la Renta y herencias.
      </div>
    </AbsoluteFill>
  );
};

const DiocesanTag: React.FC<{ short?: boolean }> = ({ short }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: sans, fontWeight: 600, fontSize: 20, letterSpacing: "0.2em", color: C.gold, textTransform: "uppercase" }}>
    <Cross size={34} color={C.gold} />
    {short ? "Archidiócesis de Valladolid" : "Archidiócesis de Valladolid · Comisión para el Sostenimiento"}
  </div>
);

const Diocese: React.FC<Extract<Seg, { k: "diocese" }>> = ({ id }) => {
  const r = useReveal(0.3);
  const r2 = useReveal(1.2);
  const words = ["Compromiso", "Fe", "Generosidad"];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <KenBurns id={id} />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "rgba(14,11,10,0.68)" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", paddingBottom: BAR }}>
        <div style={{ opacity: r }}>
          <DiocesanTag />
        </div>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 132, lineHeight: 1, color: C.ivory, marginTop: 36, opacity: r, transform: `translateY(${(1 - r) * 30}px)` }}>
          Ayuda a tu parroquia
        </div>
        <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 50, color: C.gold, marginTop: 26, opacity: r2 }}>
          Con tu suscripción periódica, colaboras para que siga abierta
        </div>
        <div style={{ display: "flex", gap: 30, alignItems: "center", marginTop: 54, opacity: r2 }}>
          {words.map((w, i) => (
            <React.Fragment key={w}>
              {i > 0 ? <span style={{ width: 60, height: 2, backgroundColor: C.gold }} /> : null}
              <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 34, letterSpacing: "0.12em", color: i === 1 ? C.gold : C.ivory, textTransform: "uppercase" }}>{w}</span>
            </React.Fragment>
          ))}
        </div>
        <div style={{ fontFamily: sans, fontSize: 28, color: "rgba(247,241,230,0.85)", marginTop: 30, opacity: r2 }}>
          La vida de tu parroquia se construye día a día
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const VENTAJAS = [
  ["Comodidad", "Tú fijas la cantidad: mensual, trimestral o anual. Se gestiona sola."],
  ["Estabilidad", "Permite planificar la luz, el mantenimiento, la catequesis, la caridad…"],
  ["Continuidad", "Tu ayuda sigue presente, incluso cuando no estás."],
  ["Transparencia", "Siempre sabrás a qué se destina tu dinero."],
  ["Beneficios fiscales", "Hasta un 80 % de deducción en la Renta."],
];

const Ventajas: React.FC<Extract<Seg, { k: "ventajas" }>> = ({ id }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r = useReveal(0.3);
  return (
    <AbsoluteFill>
      <Backdrop id={id} dim={0.76} />
      <div style={{ position: "absolute", left: 120, right: 120, top: 80, opacity: r }}>
        <DiocesanTag />
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 86, color: C.ivory, marginTop: 18 }}>
          Cinco ventajas de la suscripción periódica
        </div>
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 330, display: "flex", gap: 26 }}>
        {VENTAJAS.map(([t, d], i) => {
          const v = spring({ frame: frame - s(1.0 + i * 0.7), fps, config: { damping: 200 }, durationInFrames: s(0.9) });
          return (
            <Glass key={t} accent={i === 4} style={{ flex: 1, padding: "30px 28px", opacity: v, transform: `translateY(${(1 - v) * 36}px)` }}>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 96, lineHeight: 1, color: C.gold }}>{i + 1}</div>
              <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 26, letterSpacing: "0.08em", color: C.ivory, textTransform: "uppercase", marginTop: 20 }}>{t}</div>
              <div style={{ fontFamily: sans, fontSize: 24, lineHeight: 1.45, color: "rgba(247,241,230,0.88)", marginTop: 16 }}>{d}</div>
            </Glass>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const FORMAS = [
  ["Colectas", ""],
  ["Donativos", ""],
  ["Suscripciones periódicas", "donoamiiglesia.es"],
  ["Declaración de la Renta", "Marcando la X de la Iglesia"],
  ["Herencias", "Un legado para tu parroquia"],
];

const Formas: React.FC<Extract<Seg, { k: "formas" }>> = ({ id }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r = useReveal(0.3);
  const end = useReveal(4.6);
  return (
    <AbsoluteFill>
      <Backdrop id={id} dim={0.76} />
      <div style={{ position: "absolute", left: 120, top: 90, width: 760, opacity: r }}>
        <DiocesanTag short />
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 90, lineHeight: 1.02, color: C.ivory, marginTop: 22 }}>
          Gracias por sostener tu Iglesia
        </div>
        <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 38, lineHeight: 1.35, color: C.gold, marginTop: 40, opacity: end }}>
          Un gesto libre y consciente.
          <br />
          Un compromiso con tu comunidad.
          <br />
          Una ayuda para que la parroquia siga siendo un hogar para todos.
        </div>
      </div>
      <div style={{ position: "absolute", right: 120, top: 110, width: 820 }}>
        {FORMAS.map(([t, d], i) => {
          const v = spring({ frame: frame - s(0.9 + i * 0.6), fps, config: { damping: 200 }, durationInFrames: s(0.9) });
          const hi = i === 2;
          return (
            <div
              key={t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 30,
                padding: "18px 30px",
                marginBottom: 16,
                borderRadius: 18,
                backgroundColor: hi ? "rgba(94,15,18,0.85)" : "rgba(14,11,10,0.55)",
                border: `2px solid ${hi ? C.gold : "rgba(216,178,106,0.35)"}`,
                opacity: v,
                transform: `translateX(${(1 - v) * 60}px)`,
              }}
            >
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 84, lineHeight: 1, color: C.gold, width: 60 }}>{i + 1}</div>
              <div>
                <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 34, color: C.ivory }}>{t}</div>
                {d ? <div style={{ fontFamily: sans, fontSize: 22, color: "rgba(247,241,230,0.8)", marginTop: 4 }}>{d}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Info: React.FC<Extract<Seg, { k: "info" }>> = ({ id }) => {
  const r = useReveal(0.3);
  const a = useStagger(0, 0.9);
  const b = useStagger(1, 0.9);
  const c = useStagger(2, 0.9);
  const card = (v: number): React.CSSProperties => ({ opacity: v, transform: `translateY(${(1 - v) * 30}px)` });
  const row = (k: string, v: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 20, padding: "14px 0", borderBottom: "1px solid rgba(216,178,106,0.3)" }}>
      <span style={{ fontFamily: sans, fontSize: 27, color: "rgba(247,241,230,0.88)" }}>{k}</span>
      <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 27, color: C.ivory, whiteSpace: "nowrap" }}>{v}</span>
    </div>
  );
  return (
    <AbsoluteFill>
      <Backdrop id={id} dim={0.74} />
      <div style={{ position: "absolute", left: 120, top: 80, opacity: r }}>
        <Kicker>Horario de invierno · septiembre a abril</Kicker>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 88, color: C.ivory, marginTop: 14 }}>Te esperamos</div>
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 280, display: "flex", gap: 36 }}>
        <Glass style={{ flex: 1.6, ...card(a) }}>
          <Label>Eucaristía</Label>
          {row("De lunes a sábado (excepto martes)", "19:00 h")}
          {row("Domingos", "13:00 h")}
          {row("Apertura del templo", "17:00 h")}
          {row("Hora Santa y confesiones · viernes", "18:00 h")}
          <div style={{ fontFamily: sans, fontSize: 22, lineHeight: 1.4, color: "rgba(247,241,230,0.75)", marginTop: 18 }}>
            Despacho y confesiones: desde la apertura hasta la celebración. Bautizos, bodas y visitas a enfermos: concertar con el sacerdote.
          </div>
        </Glass>
        <Glass style={{ flex: 0.95, ...card(b) }}>
          <Label>Contacto</Label>
          <div style={{ fontFamily: sans, fontSize: 30, lineHeight: 1.6, color: C.ivory, marginTop: 18 }}>
            983 801 711
            <br />
            santiagoelrealmdc@gmail.com
            <br />
            Pza. de Santiago s/n
            <br />
            Instagram @santiagoelreal.medina
          </div>
        </Glass>
        <Glass accent style={{ flex: 0.8, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", ...card(c) }}>
          <Label>WhatsApp parroquial</Label>
          <div style={{ marginTop: 18 }}>
            <QR file="qr-whatsapp.png" size={250} />
          </div>
          <div style={{ fontFamily: sans, fontSize: 22, lineHeight: 1.4, color: "rgba(247,241,230,0.9)", marginTop: 16 }}>
            Horarios, avisos y cambios
          </div>
        </Glass>
      </div>
    </AbsoluteFill>
  );
};

const Closing: React.FC<Extract<Seg, { k: "closing" }>> = ({ id }) => {
  const r = useReveal(0.4);
  const r2 = useReveal(1.2);
  return (
    <AbsoluteFill>
      <PhotoStage id={id} side="right" />
      <Scrim from="left" />
      <div style={{ position: "absolute", left: 140, top: 260, width: 860 }}>
        <div style={{ opacity: r, transform: `translateY(${(1 - r) * 30}px)` }}>
          <Cross size={90} />
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 150, color: C.ivory, marginTop: 30 }}>Gracias</div>
        </div>
        <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 54, color: C.gold, opacity: r2, marginTop: 10, lineHeight: 1.2 }}>
          Dios cuenta contigo.
          <br />
          Tu parroquia, también.
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Primer fotograma de la apertura (sin texto, zoom inicial) */
const FrozenOpening: React.FC = () => (
  <AbsoluteFill>
    <Backdrop id="069" dim={0.5} />
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 150,
        height: H,
        width: Math.round(H * ratio("069")),
        overflow: "hidden",
        boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
      }}
    >
      <Img src={src("069")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
    <Scrim from="left" />
  </AbsoluteFill>
);

/* ---------- franja fija inferior ---------- */

const BottomBar: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: BAR,
      background: "linear-gradient(to right, rgba(94,15,18,0.96), rgba(14,11,10,0.94))",
      borderTop: `2px solid ${C.gold}`,
      display: "flex",
      alignItems: "center",
      padding: "0 60px",
      gap: 22,
    }}
  >
    <Cross size={56} color={C.gold} />
    <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 40, color: C.ivory, whiteSpace: "nowrap" }}>Dios cuenta contigo</div>
    <div style={{ width: 2, height: 40, backgroundColor: "rgba(216,178,106,0.6)", margin: "0 8px" }} />
    <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 22, letterSpacing: "0.12em", color: "rgba(247,241,230,0.85)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
      Parroquia de Santiago el Real
    </div>
    <div style={{ flex: 1 }} />
    <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 20, letterSpacing: "0.16em", color: C.gold, textTransform: "uppercase", whiteSpace: "nowrap" }}>
      Colabora · Bizum ONG
    </div>
    <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 44, color: C.ivory, letterSpacing: "0.06em", border: `2px solid ${C.gold}`, borderRadius: 10, padding: "2px 20px" }}>
      07524
    </div>
  </div>
);

/* ---------- composición ---------- */

const render = (seg: Seg) => {
  switch (seg.k) {
    case "opening":
      return <OpeningLayout showText />;
    case "chapter":
      return <Chapter {...seg} />;
    case "hero":
      return <Hero {...seg} />;
    case "photo":
      return <Photo {...seg} />;
    case "tri":
      return <Tri {...seg} />;
    case "pillars":
      return <Pillars />;
    case "diocese":
      return <Diocese {...seg} />;
    case "ventajas":
      return <Ventajas {...seg} />;
    case "formas":
      return <Formas {...seg} />;
    case "quote":
      return <Quote {...seg} />;
    case "costs":
      return <Costs {...seg} />;
    case "tax":
      return <Tax {...seg} />;
    case "howto":
      return <HowTo {...seg} />;
    case "info":
      return <Info {...seg} />;
    case "closing":
      return <Closing {...seg} />;
    case "credits":
      return <CreditsCard />;
  }
};

export const totalFrames = () =>
  TIMELINE.reduce((a, seg) => a + s(seg.dur), 0) - (TIMELINE.length - 1) * s(TRANSITION);

export const ParroquiaVideo: React.FC = () => {
  const { width } = useVideoConfig();
  const k = width / W;
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <div style={{ width: W, height: H, transform: `scale(${k})`, transformOrigin: "top left", position: "relative", overflow: "hidden" }}>
        <TransitionSeries>
          {TIMELINE.flatMap((seg, i) => {
            const items = [
              <TransitionSeries.Sequence key={`s${i}`} durationInFrames={s(seg.dur)}>
                {render(seg)}
              </TransitionSeries.Sequence>,
            ];
            if (i < TIMELINE.length - 1) {
              items.push(
                <TransitionSeries.Transition
                  key={`t${i}`}
                  presentation={fade()}
                  timing={linearTiming({ durationInFrames: s(TRANSITION) })}
                />,
              );
            }
            return items;
          })}
        </TransitionSeries>
        <BottomBar />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- créditos (prueba) ---------- */
const CreditsCard: React.FC = () => {
  const r = useReveal(0.3);
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const toLoop = interpolate(frame, [durationInFrames - s(1.4), durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <Backdrop id="056" dim={0.8} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", paddingBottom: BAR, opacity: r }}>
        <Cross size={70} color={C.gold} />
        <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 40, color: "rgba(247,241,230,0.85)", marginTop: 24 }}>Créditos</div>
        {[
          ["Idea y guion", "Pablo Martín Fernández · D. Álvaro de la Riva de la Red"],
          ["Realización", "Pablo Martín Fernández"],
        ].map(([l, v]) => (
          <div key={l} style={{ marginTop: 34 }}>
            <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 20, letterSpacing: "0.28em", color: C.gold, textTransform: "uppercase" }}>{l}</div>
            <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 50, color: C.ivory, marginTop: 6 }}>{v}</div>
          </div>
        ))}
        <div style={{ marginTop: 44, fontFamily: sans, fontSize: 24, color: "rgba(247,241,230,0.7)" }}>
          Parroquia de Santiago el Real · Medina del Campo · 2026
        </div>
      </AbsoluteFill>
      {/* Fundido final hacia el primer fotograma para que el bucle no se note */}
      <AbsoluteFill style={{ opacity: toLoop }}>
        <FrozenOpening />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Credits: React.FC = () => {
  const { width } = useVideoConfig();
  const k = width / W;
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <div style={{ width: W, height: H, transform: `scale(${k})`, transformOrigin: "top left", position: "relative", overflow: "hidden" }}>
        <CreditsCard />
        <BottomBar />
      </div>
    </AbsoluteFill>
  );
};
