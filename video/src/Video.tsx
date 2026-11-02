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

const Placeholder: React.FC<{ label: string; title?: string; w: number | string; h: number; big?: boolean }> = ({
  label,
  title,
  w,
  h,
  big,
}) => (
  <div
    style={{
      width: w,
      height: h,
      border: `3px dashed ${C.gold}`,
      borderRadius: 18,
      backgroundColor: "rgba(216,178,106,0.08)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: big ? "center" : "flex-start",
      padding: big ? 0 : "0 36px",
      gap: 10,
      boxSizing: "border-box",
      textAlign: big ? "center" : "left",
    }}
  >
    {title ? (
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 22, letterSpacing: "0.22em", color: C.gold, textTransform: "uppercase" }}>
        {title}
      </div>
    ) : null}
    <div style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 500, fontSize: big ? 44 : 36, color: C.ivory, opacity: 0.9 }}>
      {label}
    </div>
  </div>
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
        Medina del Campo · Diócesis de Valladolid
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

const Campaign: React.FC<Extract<Seg, { k: "campaign" }>> = ({ id }) => {
  const r = useReveal(0.3);
  const r2 = useReveal(1.2);
  return (
    <AbsoluteFill>
      <Backdrop id={id} dim={0.72} />
      <div style={{ position: "absolute", left: 120, top: 150, width: 860, opacity: r, transform: `translateY(${(1 - r) * 30}px)` }}>
        <Kicker>Campaña de suscripciones</Kicker>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 104, lineHeight: 1.0, color: C.ivory, marginTop: 26 }}>
          Hazte suscriptor de tu parroquia
        </div>
        <div style={{ fontFamily: sans, fontSize: 32, lineHeight: 1.45, color: "rgba(247,241,230,0.92)", marginTop: 34 }}>
          Con una aportación periódica, por pequeña que sea, cuidas este templo y haces posible toda su labor.
        </div>
        <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 40, color: C.gold, marginTop: 34 }}>
          La Iglesia se sostiene gracias a ti.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 120,
          top: 120,
          width: 700,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          opacity: r2,
          transform: `translateY(${(1 - r2) * 30}px)`,
        }}
      >
        <Placeholder big w={700} h={420} title="Escanea y suscríbete" label="Aquí irá el código QR" />
        <Placeholder w={700} h={110} title="Cuota sugerida" label="Aquí irá la cuota" />
        <Placeholder w={700} h={110} title="Domiciliación · Bizum" label="Aquí irán los datos de la cuenta" />
      </div>
    </AbsoluteFill>
  );
};

const Info: React.FC<Extract<Seg, { k: "info" }>> = ({ id }) => {
  const r = useReveal(0.3);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cards = [
    { t: "Horarios de misas", l: "Aquí irán los horarios" },
    { t: "Despacho parroquial", l: "Aquí irá el horario del despacho" },
    { t: "Contacto", l: "Aquí irán el teléfono y el correo" },
  ];
  return (
    <AbsoluteFill>
      <Backdrop id={id} dim={0.7} />
      <div style={{ position: "absolute", left: 120, right: 120, top: 130, textAlign: "center", opacity: r }}>
        <Kicker>Parroquia de Santiago el Real</Kicker>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 96, color: C.ivory, marginTop: 20 }}>Te esperamos</div>
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 430, display: "flex", gap: 40 }}>
        {cards.map((c, i) => {
          const rr = spring({ frame: frame - s(0.9 + i * 0.5), fps, config: { damping: 200 }, durationInFrames: s(1) });
          return (
            <div key={c.t} style={{ flex: 1, opacity: rr, transform: `translateY(${(1 - rr) * 30}px)` }}>
              <Placeholder w="100%" h={300} title={c.t} label={c.l} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Closing: React.FC<Extract<Seg, { k: "closing" }>> = ({ id }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const r = useReveal(0.4);
  const r2 = useReveal(1.2);
  const toLoop = interpolate(frame, [durationInFrames - s(1.6), durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
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
      {/* Fundido final hacia el primer fotograma para que el bucle no se note */}
      <AbsoluteFill style={{ opacity: toLoop }}>
        <FrozenOpening />
      </AbsoluteFill>
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
    <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 40, color: C.ivory }}>Dios cuenta contigo</div>
    <div style={{ width: 2, height: 40, backgroundColor: "rgba(216,178,106,0.6)", margin: "0 8px" }} />
    <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 22, letterSpacing: "0.12em", color: "rgba(247,241,230,0.85)", textTransform: "uppercase" }}>
      Parroquia de Santiago el Real · Hazte suscriptor
    </div>
    <div style={{ flex: 1 }} />
    <div style={{ fontFamily: sans, fontSize: 20, color: C.gold, textAlign: "right", lineHeight: 1.3 }}>
      Escanea
      <br />y colabora
    </div>
    <div
      style={{
        width: 76,
        height: 76,
        border: `2px dashed ${C.gold}`,
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: sans,
        fontWeight: 700,
        fontSize: 18,
        color: C.ivory,
      }}
    >
      QR
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
    case "campaign":
      return <Campaign {...seg} />;
    case "info":
      return <Info {...seg} />;
    case "closing":
      return <Closing {...seg} />;
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
