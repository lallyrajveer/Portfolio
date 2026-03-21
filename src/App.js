import { useState, Suspense } from "react";
import { projects as allProjects } from "./projects/index.js";
import Resume from "./Resume.jsx";
import { WirelessProvider } from "./projects/WirelessContext.js";
import { NetflixProvider } from "./projects/NetflixContext.js";

// ── Helpers ──────────────────────────────────────────────────
const CAT_COLORS = {
  Budgeting:         { bg: "#EBF5EC", text: "#1E6B2E" },
  Forecasting:       { bg: "#EBF0FB", text: "#1E3A8A" },
  "Variance Analysis":{ bg: "#FEF3EC", text: "#9A3412" },
  "Board Reporting": { bg: "#F5EBF8", text: "#6B21A8" },
  Modeling:          { bg: "#ECFAF8", text: "#0F5345" },
  "Streaming Market Analysis":  { bg: "#FFF8EB", text: "#92400E" },
  "Cloud Infrastructure":       { bg: "#E8F0FE", text: "#174EA6" },
  Other:             { bg: "#F3F4F6", text: "#374151" },
};

function CollapsibleJob({ title, company, forceOpen, onToggle, children }) {
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 12px", marginBottom: forceOpen ? 16 : 4 }}>
        <button
          onClick={onToggle}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 20, height: 20, borderRadius: "50%",
            background: forceOpen ? "#C9A84C" : "#F0F1F5",
            color: forceOpen ? "#fff" : "#C9A84C",
            border: "none", cursor: "pointer",
            fontSize: 14, fontWeight: 700, lineHeight: 1, flexShrink: 0,
          }}
        >{forceOpen ? "−" : "+"}</button>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "#0B1628" }}>{title}</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "#C9A84C" }}>{company}</div>
      </div>
      {forceOpen && children}
    </div>
  );
}

function CollapsibleClients({ clients, forceOpen }) {
  const [open, setOpen] = useState(false);
  const isOpen = forceOpen !== undefined ? forceOpen : open;
  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          width: "100%", background: "none", border: "none",
          borderBottom: "1px solid #F0F1F5", paddingBottom: 6,
          cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 18, height: 18, borderRadius: "50%",
          background: "#C9A84C", color: "#fff",
          fontSize: 13, fontWeight: 700, lineHeight: 1, flexShrink: 0,
        }}>{isOpen ? "−" : "+"}</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#C9A84C" }}>Clients Audited</span>
      </button>
      {isOpen && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 8 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "7px 14px", background: "#F4F5F8", color: "#0B1628", fontWeight: 600, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", borderRadius: "4px 0 0 0" }}>Company</th>
              <th style={{ textAlign: "left", padding: "7px 14px", background: "#F4F5F8", color: "#0B1628", fontWeight: 600, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", borderRadius: "0 4px 0 0" }}>Industry</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(([name, industry], i) => (
              <tr key={name} style={{ background: i % 2 === 0 ? "#fff" : "#F9FAFB" }}>
                <td style={{ padding: "8px 14px", color: "#0B1628", fontWeight: 500, borderBottom: "1px solid #F0F1F5" }}>{name}</td>
                <td style={{ padding: "8px 14px", color: "#6B7490", borderBottom: "1px solid #F0F1F5" }}>{industry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function CollapsibleGroup({ heading, items, forceOpen }) {
  const [open, setOpen] = useState(false);
  const isOpen = forceOpen !== undefined ? forceOpen : open;
  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          width: "100%", background: "none", border: "none",
          borderBottom: "1px solid #F0F1F5", paddingBottom: 6,
          cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 18, height: 18, borderRadius: "50%",
          background: "#C9A84C", color: "#fff",
          fontSize: 13, fontWeight: 700, lineHeight: 1, flexShrink: 0,
        }}>{isOpen ? "−" : "+"}</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#C9A84C" }}>{heading}</span>
      </button>
      {isOpen && (
        <ul style={{ margin: 0, paddingLeft: 18, listStyle: "none", marginTop: 8 }}>
          {items.map((b, i) => (
            <li key={i} style={{ fontSize: 13, color: "#5A6277", lineHeight: 1.8, marginBottom: 6, paddingLeft: 0, position: "relative" }}>
              <span style={{ position: "absolute", left: -16, top: 9, width: 4, height: 4, borderRadius: "50%", background: "#C9A84C", display: "block" }}/>
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryPill({ cat }) {
  const c = CAT_COLORS[cat] || CAT_COLORS.Other;
  return (
    <span style={{
      background: c.bg, color: c.text,
      fontSize: 10, fontWeight: 700, letterSpacing: 1,
      textTransform: "uppercase", padding: "3px 10px", borderRadius: 3,
    }}>{cat}</span>
  );
}

// ── Netflix Integrated Workflow Diagram ──────────────────────
const WORKFLOW_NODES = [
  {
    id:    "netflix-streaming-analysis",
    step:  "01",
    role:  "Foundation",
    title: "Streaming Market Analysis",
    desc:  "Benchmarks Netflix against four streaming peers across subscribers, revenue, ARM, and churn.",
    tags:  ["Market sizing", "Peer benchmarking", "Churn context"],
  },
  {
    id:    "netflix-revenue-forecast",
    step:  "02",
    role:  "Model",
    title: "Revenue Forecast",
    desc:  "Driver-based model projecting Netflix revenue through FY2027.",
    tags:  ["Bear / Consensus / Bull", "Sensitivity analysis"],
  },
  {
    id:    "netflix-board-report",
    step:  "03",
    role:  "Output",
    title: "Executive Deck",
    desc:  "Scenario-driven executive view with KPIs, revenue charts, and strategic priorities.",
    tags:  ["Live scenario sync", "Strategic priorities", "Exec-ready"],
  },
];

const CONNECTOR_LABELS = [
  { top: "Peer data informs", bottom: "model assumptions" },
  { top: "Model outputs drive", bottom: "scenario projections" },
];

function NetflixWorkflow() {
  const [hovered, setHovered] = useState(null);
  return (
    <section style={{ background: "#060E1A", padding: "64px 56px", borderTop: "1px solid rgba(201,168,76,0.10)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 24, height: 24, background: "#E50914", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 12 }}>N</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#E50914" }}>Netflix Revenue Forecast</span>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color: "#fff", margin: "0 0 10px" }}>
            One Integrated FP&A Workflow
          </h2>
        </div>

        {/* Flow */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 112px 1fr 112px 1fr", alignItems: "stretch" }}>

          {WORKFLOW_NODES.map((node, i) => (
            <div key={node.id} style={{ display: "contents" }}>
              {/* Card */}
              <div
                onClick={() => window.open(`#/project/${node.id}`, "_blank")}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: hovered === node.id ? "rgba(201,168,76,0.07)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${hovered === node.id ? "rgba(201,168,76,0.40)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 10,
                  padding: "24px 22px",
                  cursor: "pointer",
                  transition: "all 0.18s",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Title */}
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: "#fff", marginBottom: 10 }}>
                  {node.title}
                </div>

                {/* Description */}
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, marginBottom: 18, flex: 1 }}>
                  {node.desc}
                </div>

                {/* CTA */}
                <div style={{ fontSize: 11, color: hovered === node.id ? "#C9A84C" : "rgba(201,168,76,0.5)", fontWeight: 700, letterSpacing: 0.5, transition: "color 0.18s", fontFamily: "'Outfit', sans-serif" }}>
                  Open →
                </div>
              </div>

              {/* Connector (between cards only) */}
              {i < WORKFLOW_NODES.length - 1 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 8px" }}>
                  {/* Arrow line */}
                  <div style={{ width: "100%", display: "flex", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.3)" }} />
                    <div style={{ color: "#C9A84C", fontSize: 16, lineHeight: 1, marginLeft: 2 }}>▶</div>
                  </div>
                  {/* Label */}
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.5, fontFamily: "'Outfit', sans-serif" }}>
                    {CONNECTOR_LABELS[i].top}<br />{CONNECTOR_LABELS[i].bottom}
                  </div>
                </div>
              )}
            </div>
          ))}

        </div>


      </div>
    </section>
  );
}

// ── Google Cloud Workflow Diagram ────────────────────────────
const GC_COLORS = ["#4285F4", "#EA4335", "#34A853"]; // Blue, Red, Green per card
const GC_COLORS_ALPHA = ["rgba(66,133,244,", "rgba(234,67,53,", "rgba(52,168,83,"];

const GC_WORKFLOW_NODES = [
  {
    id:   "google-cloud-capex",
    step: "01",
    role: "Foundation",
    title: "Peer Benchmarking",
    desc: "Benchmarks Alphabet CapEx efficiency against AWS and Microsoft across 4 KPIs (2020–2024).",
    tags: ["CapEx Intensity", "Cloud CAGR", "Op Margin"],
  },
  {
    id:   "google-cloud-capex",
    step: "02",
    role: "Model",
    title: "Scenario Modeling",
    desc: "Bear / Base / Bull scenarios with 1,000-iteration Monte Carlo simulation per scenario.",
    tags: ["P10 / P50 / P90", "Uniform sampling", "3-year forecast"],
  },
  {
    id:   "google-cloud-capex",
    step: "03",
    role: "Output",
    title: "Investment Recommendation",
    desc: "CapEx investment guidance framed for Google Cloud Finance senior leadership.",
    tags: ["$55–65B/yr base", "Performance-gated trigger", "Exec-ready"],
  },
];

const GC_CONNECTOR_LABELS = [
  { top: "KPIs anchor",       bottom: "scenario ranges"      },
  { top: "Simulation drives", bottom: "investment thesis"    },
];

function GoogleCloudWorkflow() {
  const [hovered, setHovered] = useState(null);
  return (
    <section style={{ background: "#060E1A", padding: "64px 56px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          {/* Google "G" four-color dot row */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginBottom: 16 }}>
            {["#4285F4","#EA4335","#FBBC05","#34A853"].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            ))}
            <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
              Google Cloud CapEx Benchmarking
            </span>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color: "#fff", margin: "0 0 10px" }}>
            End-to-End Cloud Finance Analysis
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.32)", margin: 0, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
            From 10-K data through Monte Carlo simulation to an executive investment recommendation.
          </p>
        </div>

        {/* Flow */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 1fr 100px 1fr", alignItems: "stretch" }}>
          {GC_WORKFLOW_NODES.map((node, i) => {
            const color      = GC_COLORS[i];
            const colorAlpha = GC_COLORS_ALPHA[i];
            const isHovered  = hovered === i;
            return (
              <div key={i} style={{ display: "contents" }}>
                <div
                  onClick={() => window.open(`#/project/${node.id}`, "_blank")}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: isHovered ? `${colorAlpha}0.07)` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isHovered ? `${colorAlpha}0.5)` : "rgba(255,255,255,0.07)"}`,
                    borderTop: `3px solid ${color}`,
                    borderRadius: 10,
                    padding: "24px 22px",
                    cursor: "pointer",
                    transition: "all 0.18s",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Step + role */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 800, letterSpacing: 1.5,
                      color: color, textTransform: "uppercase",
                      background: `${colorAlpha}0.12)`,
                      border: `1px solid ${colorAlpha}0.25)`,
                      borderRadius: 4, padding: "2px 8px",
                    }}>
                      {node.step} · {node.role}
                    </span>
                  </div>

                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 600, color: "#fff", marginBottom: 10 }}>
                    {node.title}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", lineHeight: 1.7, marginBottom: 18, flex: 1 }}>
                    {node.desc}
                  </div>

                  <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                    color: isHovered ? color : `${colorAlpha}0.4)`,
                    transition: "color 0.18s", fontFamily: "'Outfit', sans-serif",
                  }}>
                    Open →
                  </div>
                </div>

                {i < GC_WORKFLOW_NODES.length - 1 && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>
                    {/* Multi-color connector line: Blue → Yellow → Green */}
                    <div style={{ width: "100%", display: "flex", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${GC_COLORS[i]}, #FBBC05, ${GC_COLORS[i+1]})` }} />
                      <div style={{ color: GC_COLORS[i+1], fontSize: 14, lineHeight: 1, marginLeft: 2 }}>▶</div>
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", textAlign: "center", lineHeight: 1.6, fontFamily: "'Outfit', sans-serif" }}>
                      {GC_CONNECTOR_LABELS[i].top}<br />{GC_CONNECTOR_LABELS[i].bottom}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

// ── Project Modal (live preview) ─────────────────────────────

// ── Project Card ─────────────────────────────────────────────
function ProjectCard({ project, onClick }) {
  const [hovered, setHovered] = useState(false);
  const handleClick = () => {
    if (project.fileUrl) {
      const a = document.createElement("a");
      a.href = project.fileUrl;
      a.download = project.fileUrl.split("/").pop();
      a.click();
    } else {
      onClick();
    }
  };
  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: hovered ? "1.5px solid #C9A84C" : "1.5px solid #E8EAF0",
        borderRadius: 10, overflow: "hidden", cursor: "pointer",
        transition: "all 0.22s ease",
        boxShadow: hovered ? "0 12px 36px rgba(11,22,40,0.1)" : "0 2px 8px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-3px)" : "none",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Card top bar */}
      <div style={{
        background: hovered ? "#0B1628" : "#F4F5F8",
        padding: "18px 20px",
        transition: "background 0.22s",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <CategoryPill cat={project.category} />
        {project.featured && (
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
            color: hovered ? "#C9A84C" : "#9BA3B8",
            transition: "color 0.22s",
          }}>★ Featured</span>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: "20px 22px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 19, fontWeight: 600, color: "#0B1628",
          marginBottom: 10, lineHeight: 1.25,
        }}>{project.title}</h3>
        <p style={{ fontSize: 13, color: "#6B7490", lineHeight: 1.65, flex: 1, marginBottom: 16 }}>
          {project.description}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid #F0F1F5" }}>
          <span style={{ fontSize: 11, color: "#9BA3B8" }}>{project.date}</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {project.tags.slice(0, 3).map(t => (
              <span key={t} style={{ fontSize: 10, color: "#6B7490", background: "#F3F4F6", padding: "2px 8px", borderRadius: 3 }}>#{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Preview indicator */}
      <div style={{
        padding: "10px 22px",
        background: hovered ? "#C9A84C" : "#F9FAFB",
        transition: "background 0.22s",
        textAlign: "center",
        fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
        color: hovered ? "#0B1628" : "#9BA3B8",
      }}>
        {project.component ? "View Live Preview →" : project.fileUrl ? "Download Excel →" : "View Details →"}
      </div>
    </div>
  );
}

// ── Contact Modal ─────────────────────────────────────────────
function ContactModal({ onClose }) {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          message: form.message,
        }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    border: "1px solid #E8EAF0", borderRadius: 6,
    fontSize: 13, color: "#0B1628", fontFamily: "'Outfit', sans-serif",
    outline: "none", transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(6,14,26,0.75)",
      backdropFilter: "blur(6px)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 12,
        width: "100%", maxWidth: 480,
        boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ background: "#0B1628", padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "#fff" }}>Get in Touch</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>I'll get back to you promptly</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ padding: "28px 28px 24px" }}>
          {status === "success" ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#0B1628", marginBottom: 8 }}>Message sent!</div>
              <div style={{ fontSize: 13, color: "#6B7490", marginBottom: 24 }}>Thanks for reaching out. I'll be in touch soon.</div>
              <button onClick={onClose} style={{ background: "#C9A84C", color: "#0B1628", border: "none", borderRadius: 6, padding: "10px 24px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Close</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "#9BA3B8", display: "block", marginBottom: 6 }}>Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Jane Smith"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#C9A84C"}
                    onBlur={e => e.target.style.borderColor = "#E8EAF0"}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "#9BA3B8", display: "block", marginBottom: 6 }}>Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="jane@company.com"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#C9A84C"}
                    onBlur={e => e.target.style.borderColor = "#E8EAF0"}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "#9BA3B8", display: "block", marginBottom: 6 }}>Company</label>
                <input
                  value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  placeholder="Acme Corp"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#C9A84C"}
                  onBlur={e => e.target.style.borderColor = "#E8EAF0"}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "#9BA3B8", display: "block", marginBottom: 6 }}>Message *</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="What's on your mind?"
                  style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
                  onFocus={e => e.target.style.borderColor = "#C9A84C"}
                  onBlur={e => e.target.style.borderColor = "#E8EAF0"}
                />
              </div>
              {status === "error" && (
                <div style={{ fontSize: 12, color: "#C0392B", marginBottom: 12 }}>Something went wrong. Please try again or email me directly at lallyrajveer@gmail.com</div>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                style={{
                  width: "100%", background: "#C9A84C", color: "#0B1628",
                  border: "none", borderRadius: 6, padding: "12px",
                  fontWeight: 700, fontSize: 13, letterSpacing: 0.5,
                  cursor: status === "sending" ? "default" : "pointer",
                  opacity: status === "sending" ? 0.7 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {status === "sending" ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Experience Timeline ───────────────────────────────────────
const EXPERIENCE_DATA = [
  {
    title: "Financial Planning & Analysis Manager",
    company: "Verizon",
    groups: [
      {
        heading: "Financial Planning & Forecasting",
        items: [
          "Led financial planning and forecasting for the ~$1B Wireline Products portfolio, ensuring strategic alignment and achieving a 15% improvement in E/R Margin for security subscription services.",
          "Designed and built automated, complex driver based financial models from the ground up, embedding advanced scenario planning and sensitivity analysis capabilities to stress-test financial assumptions and support critical strategic decisions.",
          "Provided critical leadership by consistently transitioning between high-level strategic visioning and the development of deep, detailed bottoms-up financial models necessary to drive effective execution.",
        ],
      },
      {
        heading: "Wireless KPI Analysis & Reporting",
        items: [
          "Led KPI reporting and performance analysis for Verizon Business's enterprise wireless segment, supporting a base of 13M+ Subs and ~$6.7B in annual wireless service revenue.",
          "Developed high-impact business analyses of Wireless KPIs for executive reviews, modeling performance scenarios to analyze risks and opportunities and delivering actionable recommendations that improved upgrade subsidy revenue.",
          "Automated daily KPI reporting to executives using AI tools, saving the team 500+ hours annually while eliminating manual errors and ensuring 100% data consistency and accuracy.",
          "Produced monthly analyses of business trends and budget variances for Wireline products and Wireless KPIs, supporting 268K–292K quarterly net add targets and management review sessions.",
        ],
      },
      {
        heading: "Cross-Functional Collaboration & Stakeholder Engagement",
        items: [
          "Partnered extensively with Sales, Marketing, Product, and Operations teams to gather key business drivers, translating market dynamics into operational realities to align financial forecasts with strategic objectives.",
          "Synthesized data from multiple complex sources into cohesive, high-level narratives and regularly presented complex financial insights to senior leadership, driving actionable executive decision-making and influencing resource allocation.",
          "Resolved complex, high-priority ad hoc financial requests during month-end close by efficiently planning and implementing solutions across multiple concurrent priorities in a fast-paced, ambiguous environment.",
        ],
      },
      {
        heading: "Data, Systems & Process Improvement",
        items: [
          "Defined critical data requirements for the Business Intelligence team, optimizing planning, forecasting, and reporting processes, and conducting strategic business analysis with overlays and commentary to drive actionable insights.",
          "Streamlined reporting, forecasting, and budgeting processes across sales, business, and corporate units, reducing time spent by 60% and achieving a 90% increase in accuracy.",
          "Directed the design and user-acceptance-testing of assigned financial models within the 1EPM planning tool to simplify, standardize, and automate planning and reporting, improving operational efficiency by up to 40%.",
        ],
      },
      {
        heading: "People Leadership & Recognition",
        items: [
          "Mentored Finance Leadership Development candidates and interns, cultivating a results-driven and collaborative finance culture with hands-on technical training in finance tools.",
          "Spearheaded workload transition to cover key team members' extended leaves, effectively managing a 50% increase in scope while sustaining all personal project deadlines.",
          "Recognized three times with Verizon \"Spotlight\" Awards for excellence in Leadership Core Values, Living the Credo, and Teamwork.",
        ],
      },
    ],
  },
  {
    title: "Financial Reporting Manager",
    company: "American Society of Clinical Oncology",
    groups: [
      {
        heading: "Consolidation & Financial Statements",
        items: [
          "Led the monthly consolidation process and produced financial statements for a ~$130–160M revenue nonprofit (501(c)(3)), utilizing Microsoft Dynamics SL and Prophix. Conducted thorough reviews and implemented corrections to ensure accuracy and compliance.",
          "Led the setup of consolidation in Microsoft Dynamics SL, including the elimination company, validating results to ensure accurate consolidated reporting across ASCO's multi-entity structure.",
        ],
      },
      {
        heading: "Reconciliations",
        items: [
          "Reviewed and cleared 2 years of reconciling items across bank reconciliations and developed a process ensuring accuracy and completeness of financial records supporting ASCO's ~$200M+ total asset base.",
          "Reconciled intercompany accounts across ASCO's affiliated entities, including the Association for Clinical Oncology and Conquer Cancer Foundation, ensuring accurate representation of transactions between consolidated entities.",
        ],
      },
      {
        heading: "Compliance & Regulatory Reporting",
        items: [
          "Acquired data from various teams and completed Form 990 and Form 990-T in a timely manner, a critical compliance obligation for a tax-exempt organization with ~$148M in annual expenses and significant program service revenues (~86% of total revenue).",
          "Prepared the Indirect Cost Rate proposal, utilizing comprehensive data analysis to support federal grant compliance, essential for an organization receiving federal grant funding and subject to single audit requirements.",
          "Prepared bank covenant tests, ensuring compliance with financial agreements and maintaining positive relationships with financial institutions supporting ASCO's balance sheet.",
        ],
      },
    ],
  },
  {
    title: "Supervisor, Financial Reporting",
    company: "Gannett",
    groups: [
      {
        heading: "SEC Reporting",
        items: [
          "Prepared quarterly and annual reports on SEC Forms 10-K and 10-Q, ensuring adherence to U.S. GAAP and SEC regulations. This included meticulous preparation of financial statements, footnotes, MD&A, and XBRL tagging across all reporting periods.",
          "Produced other SEC filings and investor communications, including press releases, investor conference materials, registration statements, and proxy statements for a company with over 110 million monthly readers across USA TODAY and 100+ local media brands.",
        ],
      },
      {
        heading: "Financial Statements & Close",
        items: [
          "Prepared internal financial statements and reports supporting executive decision-making for a business generating ~$3.0B in annual revenues, with digital revenues reaching $1.0B (31.6% of total) by 2017.",
          "Prepared monthly schedules supporting the month-end close and consolidation process across Gannett's single reporting segment spanning 33 U.S. states and Guam.",
          "Consolidation-Level Entries: Analyzed various accounts and prepared consolidation-level entries for the consolidated entity, including USA TODAY NETWORK and Newsquest (UK subsidiary), ensuring accuracy in multi-currency financial consolidation.",
        ],
      },
      {
        heading: "Compliance & Controls",
        items: [
          "Maintained department compliance with internal controls, policies, and procedures for a large accelerated filer subject to PCAOB audit standards and Sarbanes-Oxley Section 404 requirements.",
          "Conducted research and analysis of accounting treatment for complex transactions including acquisitions, restructuring charges, and pension obligations, including a $421.9M long-term pension liability as of year-end 2017.",
        ],
      },
      {
        heading: "Analysis & Process Improvement",
        items: [
          "Addressed ad hoc financial information requests and conducted analysis to support cross-departmental decision-making for a company with over 20,000 employees.",
          "Designed a consolidated external financial reporting infrastructure using automation tools that shortened the monthly closing procedure by 85%, reducing the need for additional headcount during high-volume reporting periods.",
          "Coordinated responses to external audit questions and prepared supporting documents, facilitating smooth PCAOB audit processes for the annual 10-K filing covering ~$3.0B in revenues.",
        ],
      },
    ],
  },
  {
    title: "Senior Accountant",
    company: "First Republic Bank",
    groups: [
      {
        heading: "Revenue & Fee Accounting",
        items: [
          "Recorded and reconciled loan origination fees, commitment fees, and service charges in compliance with ASC 310 and bank-specific revenue recognition policies.",
          "Managed fee income accruals for wealth management and private banking services, ensuring accurate monthly revenue recognition across business lines.",
          "Prepared journal entries for interest income on loans and investment securities, supporting the bank's net interest margin reporting.",
        ],
      },
      {
        heading: "Foreign Exchange & Derivatives",
        items: [
          "Processed and reconciled FX spot and forward transactions for high-net-worth clients, ensuring accurate trade capture and settlement in multi-currency accounts.",
          "Assisted in the accounting for interest rate swaps and hedging instruments under ASC 815, including fair value adjustments and hedge effectiveness documentation.",
        ],
      },
      {
        heading: "General Ledger & Reconciliations",
        items: [
          "Performed daily and monthly reconciliations of general ledger accounts, resolving breaks between the core banking system and the GL within established SLAs.",
          "Certified balance sheet accounts as part of the month-end close process, including intercompany eliminations and suspense account clearances.",
          "Collaborated with operations and treasury teams to investigate and clear aged reconciling items, reducing outstanding items by over 40%.",
        ],
      },
      {
        heading: "Financial Reporting & Compliance",
        items: [
          "Contributed to the preparation of regulatory filings including the FFIEC Call Report, ensuring accurate classification of assets, liabilities, and off-balance-sheet exposures.",
          "Supported the 10-Q and 10-K preparation process by providing supporting schedules and tie-outs for footnote disclosures.",
          "Assisted in SOX 404 compliance by documenting key controls over financial reporting and providing evidence for internal and external auditors.",
        ],
      },
    ],
  },
  {
    title: "Audit Associate I & II",
    company: "Grant Thornton",
    groups: [
      {
        heading: "Audit Execution & Technical Research",
        items: [
          "Assisted in planning and executing financial statement audits for clients with average annual revenues of ~$400 million.",
          "Performed substantive testing under PCAOB standards across key cycles including cash, revenue, equity, debt, and intangibles at all assertion levels.",
          "Executed SOX 404 testing, evaluating design and operating effectiveness of internal controls over financial reporting.",
        ],
      },
      {
        heading: "Client Engagement & Communication",
        items: [
          "Communicated with clients to gather audit evidence and provided updates on accounting and regulatory matters affecting their organization.",
          "Reviewed 10-K and 10-Q SEC filings and reconciled financial data to supporting schedules; reported findings to senior team members.",
          "Worked across client sites, office, and remote settings, adapting to engagement needs and team expectations.",
        ],
      },
      {
        heading: "Team Leadership & Professional Development",
        items: [
          "Supported senior associates in mentoring newer interns, contributing to team training and knowledge-sharing.",
          "Represented Grant Thornton at campus recruiting and professional networking events.",
          "Completed formal technical training programs in U.S. GAAP, PCAOB standards, and audit methodology.",
        ],
      },
    ],
    clients: [
      ["MarkLogic", "Enterprise Software / NoSQL Database"],
      ["Accuray", "Medical Technology / Radiation Therapy"],
      ["Delivery Agent", "E-Commerce / TV Commerce / Media"],
      ["Chronicle Books", "Publishing"],
      ["Bounty Hunter Rare Wine & Spirits", "Luxury Retail / Wine & Spirits"],
      ["Gump's", "Luxury Retail / Home Décor"],
      ["McGrath RentCorp", "B2B Equipment & Modular Rental"],
      ["Traditional Medicinals", "Consumer Goods / Herbal Wellness"],
      ["Focus Ventures", "Venture Capital"],
      ["Dominican University of California", "Higher Education"],
    ],
  },
];

// expandLevel: 0 = all collapsed, 1 = jobs open (groups closed), 2 = jobs + groups open
function ExperienceTimeline() {
  const [expandLevel, setExpandLevel] = useState(0);
  const [jobStates, setJobStates] = useState(() => EXPERIENCE_DATA.map(() => false));
  const [resetKey, setResetKey] = useState(0);

  const handleToggleButton = () => {
    if (expandLevel === 0) {
      setExpandLevel(1);
      setJobStates(EXPERIENCE_DATA.map(() => true));
    } else if (expandLevel === 1) {
      setExpandLevel(2);
    } else {
      setExpandLevel(0);
      setJobStates(EXPERIENCE_DATA.map(() => false));
      setResetKey(k => k + 1); // remount groups to clear individual open states
    }
  };

  const handleJobToggle = (idx) => {
    setExpandLevel(0);
    setJobStates(s => s.map((v, i) => i === idx ? !v : v));
  };

  const buttonLabel =
    expandLevel === 0 ? "Expand All" :
    expandLevel === 1 ? "Expand Groups" :
    "Collapse All";

  const forceGroupOpen = expandLevel === 2 ? true : undefined;

  return (
    <>
      {/* Expand / Collapse All control */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
        <button
          onClick={handleToggleButton}
          style={{
            background: "none", border: "1.5px solid #C9A84C", borderRadius: 4,
            color: "#C9A84C", fontSize: 11, fontWeight: 700, letterSpacing: 1,
            textTransform: "uppercase", padding: "6px 16px", cursor: "pointer",
          }}
        >
          {buttonLabel}
        </button>
      </div>
      <div style={{ position: "relative" }}>
        {/* Vertical timeline line */}
        <div style={{ position: "absolute", left: 0, top: 8, bottom: 0, width: 2, background: "linear-gradient(to bottom, #C9A84C, rgba(201,168,76,0.1))" }}/>
        {EXPERIENCE_DATA.map(({ title, company, groups, clients }, idx) => (
          <div key={idx} style={{ paddingLeft: 36, marginBottom: 52, position: "relative" }}>
            {/* Timeline dot */}
            <div style={{ position: "absolute", left: -6, top: 6, width: 14, height: 14, borderRadius: "50%", background: "#C9A84C", border: "2px solid #fff", boxShadow: "0 0 0 2px #C9A84C" }}/>
            <CollapsibleJob
              title={title}
              company={company}
              forceOpen={expandLevel > 0 ? true : jobStates[idx]}
              onToggle={() => handleJobToggle(idx)}
            >
              {groups && (
                <div key={resetKey} style={{ marginTop: 4 }}>
                  {groups.map(({ heading, items }) => (
                    <CollapsibleGroup key={heading} heading={heading} items={items} forceOpen={forceGroupOpen} />
                  ))}
                </div>
              )}
              {clients && (
                <div key={`clients-${resetKey}`} style={{ marginTop: 4 }}>
                  <CollapsibleClients clients={clients} forceOpen={forceGroupOpen} />
                </div>
              )}
            </CollapsibleJob>
          </div>
        ))}
      </div>
      {/* Bottom expand/collapse control */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <button
          onClick={handleToggleButton}
          style={{
            background: "none", border: "1.5px solid #C9A84C", borderRadius: 4,
            color: "#C9A84C", fontSize: 11, fontWeight: 700, letterSpacing: 1,
            textTransform: "uppercase", padding: "6px 16px", cursor: "pointer",
          }}
        >
          {buttonLabel}
        </button>
      </div>
    </>
  );
}

// ── Project page (renders when URL hash is #/project/:id) ────
function ProjectPage() {
  const id = window.location.hash.replace("#/project/", "");
  const project = allProjects.find(p => p.id === id);
  if (!project) return <div style={{ padding: 60, textAlign: "center", color: "#9BA3B8", fontFamily: "'Outfit', sans-serif" }}>Project not found.</div>;
  const Comp = project.component;
  return (
    <WirelessProvider>
      <NetflixProvider>
        <Suspense fallback={<div style={{ padding: 60, textAlign: "center", color: "#9BA3B8" }}>Loading…</div>}>
          {Comp ? <Comp /> : <div style={{ padding: 60, textAlign: "center", color: "#9BA3B8" }}>No live preview available.</div>}
        </Suspense>
      </NetflixProvider>
    </WirelessProvider>
  );
}

// ── Main App ─────────────────────────────────────────────────
export default function App() {
  const [search, setSearch] = useState("");
  const [showContact, setShowContact] = useState(false);
  const [showResume, setShowResume] = useState(false);

  // Render project fullscreen when opened in a new tab via hash routing
  if (window.location.hash.startsWith("#/project/")) {
    return <ProjectPage />;
  }

  const filtered = allProjects.filter(p =>
    !search ||
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const featured = allProjects.filter(p => p.featured);

  return (
    <WirelessProvider>
    <div style={{ fontFamily: "'Outfit', sans-serif", background: "#fff", color: "#0B1628", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        ::selection { background: #C9A84C33; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .d1 { animation-delay: 0.1s; opacity: 0; }
        .d2 { animation-delay: 0.25s; opacity: 0; }
        .d3 { animation-delay: 0.4s; opacity: 0; }
        .d4 { animation-delay: 0.55s; opacity: 0; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(11,22,40,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(201,168,76,0.15)",
        padding: "0 56px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "all 0.3s ease",
      }}>
        {/* Left: Name */}
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "#fff", letterSpacing: 0.5, flex: 1 }}>
          Rajveer <span style={{ color: "#C9A84C" }}>Sidhu</span>
        </div>

        {/* Center: Nav links */}
        <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
          {[["projects",""]].map(([id, label]) => (
            <a key={id} href={`#${id}`} style={{
              color: "rgba(255,255,255,0.6)", textDecoration: "none",
              fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase",
              transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "#C9A84C"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}
            >{label}</a>
          ))}
        </div>

        {/* Right: Contact links */}
        <div style={{ display: "flex", gap: 20, alignItems: "center", flex: 1, justifyContent: "flex-end" }}>
          <a href="https://www.linkedin.com/in/sidhurajveer/" target="_blank" rel="noreferrer"
            style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", transition: "color 0.2s", display: "flex", alignItems: "center", gap: 6 }}
            onMouseEnter={e => { e.currentTarget.style.color = "#C9A84C"; e.currentTarget.querySelector("svg").style.fill = "#C9A84C"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.querySelector("svg").style.fill = "rgba(255,255,255,0.5)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)" style={{ transition: "fill 0.2s", flexShrink: 0 }}>
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </a>
          <button
            onClick={() => setShowResume(true)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600,
              letterSpacing: 1, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6,
              padding: 0, transition: "color 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#C9A84C"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
          >📄 Resume</button>
          <button
            onClick={() => setShowContact(true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, padding: 0, transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#C9A84C"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
          >✉️ Contact</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" style={{
        background: "#0B1628",
        display: "none", alignItems: "center", justifyContent: "center",
        padding: "28px 56px 24px", position: "relative", overflow: "hidden",
      }}>
        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.035,
          backgroundImage: "linear-gradient(#C9A84C 1px,transparent 1px),linear-gradient(90deg,#C9A84C 1px,transparent 1px)",
          backgroundSize: "64px 64px",
        }}/>
        <div style={{ position: "absolute", top: -60, right: -60, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,168,76,0.07) 0%,transparent 70%)" }}/>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 820, textAlign: "center", width: "100%" }}>
          <h1 className="fade-up d2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px,4vw,48px)", fontWeight: 600, lineHeight: 1.05, color: "#fff", marginBottom: 4 }}>
            Rajveer <span style={{ color: "#C9A84C" }}>Sidhu</span>
          </h1>
          <p className="fade-up d2" style={{ fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.4)", letterSpacing: 3.5, textTransform: "uppercase", marginBottom: 0 }}>
            Financial Planning &amp; Analysis Manager
          </p>

          {/* Stats */}
          <div className="fade-up d3" style={{ display: "none", justifyContent: "center", gap: 52, marginBottom: 48, paddingTop: 28, paddingBottom: 28, borderTop: "1px solid rgba(201,168,76,0.2)", borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
            {[["10+","Years Experience"],["5","Core Disciplines"],[allProjects.length.toString(),"Projects Shared"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 600, color: "#C9A84C", lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1.2, marginTop: 5 }}>{l}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: "96px 56px", background: "#F8F6F1" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 780, margin: "0 auto" }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C9A84C", marginBottom: 24 }}>
              About Me
            </div>
            {[
              "Hi, I'm a finance professional working at the intersection of FP&A and AI. I bring over 10 years of expertise in financial audit, accounting, planning, forecasting, and strategic analysis.",
              "Currently, I'm a Financial Planning & Analysis Manager where my work sits at the intersection of numbers and narrative. I don't just report what happened, I identify the risks and opportunities within complex financial data, quantify their impact, and translate them into clear recommendations that help leadership take action.",
              "I actively integrate AI into my workflow at every stage: automating recurring variance commentary that previously took a full day, compressing multi-scenario model builds from days to hours, and generating first-draft board narratives directly from data. The measurable result is more time on interpretation and less on production, which is where the actual finance value is.",
              "This portfolio reflects that approach. The strategic analyses, visualizations, and even this website were built in collaboration with AI platforms. I believe AI will play a key role in the future of FP&A, and I'm exploring how to leverage these tools to deliver better insights every day.",
            ].map((para, i) => (
              <p key={i} style={{ fontSize: 15, color: "#5A6277", lineHeight: 1.85, marginBottom: 18 }}>{para}</p>
            ))}
          </div>
          <div style={{ display: "none" }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C9A84C", marginBottom: 20 }}>Core Competencies</div>
            {[
              ["📐","Financial Modeling","Multi-scenario models built for executive decision-making"],
              ["📊","Budgeting & Forecasting","Annual plans and rolling forecasts tied to business strategy"],
              ["📋","Board Reporting","Executive packages distilling financials into clear narratives"],
              ["🔍","Variance Analysis","Actuals vs. budget deep-dives with root-cause commentary"],
              ["📈","Competitive Analysis","Real-time performance visibility for finance and operations"],
            ].map(([icon, name, desc]) => (
              <div key={name} style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "16px 20px", background: "#fff",
                border: "1px solid #E8EAF0", borderRadius: 6, marginBottom: 10,
                transition: "border-color 0.2s, box-shadow 0.2s", cursor: "default",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="#C9A84C"; e.currentTarget.style.boxShadow="0 4px 16px rgba(201,168,76,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="#E8EAF0"; e.currentTarget.style.boxShadow="none"; }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 6, background: "#0B1628", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0B1628" }}>{name}</div>
                  <div style={{ fontSize: 12, color: "#9BA3B8", marginTop: 2 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORK HISTORY ── */}
      <section id="experience" style={{ padding: "96px 56px", background: "#fff", display: "none" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C9A84C", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <span style={{ display: "block", width: 48, height: 2, background: "#C9A84C" }}/> Professional Experience <span style={{ display: "block", width: 48, height: 2, background: "#C9A84C" }}/>
          </div>
          <ExperienceTimeline />
        </div>
      </section>

      {/* ── EDUCATION & SKILLS ── */}
      <section id="education" style={{ padding: "96px 56px", background: "#0B1628", display: "none" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C9A84C", marginBottom: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <span style={{ display: "block", width: 48, height: 2, background: "#C9A84C" }}/> Education &amp; Skills <span style={{ display: "block", width: 48, height: 2, background: "#C9A84C" }}/>
          </div>

          {/* Education & Certifications sub-block */}
          <div style={{ marginBottom: 64 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 40, alignItems: "start" }}>

              {/* Education */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>Education</div>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "24px 28px" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 4 }}>
                    B.S. Business Administration: Accounting
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#C9A84C" }}>San Jose State University</div>
                </div>
              </div>

              {/* Continuing Education */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>Continuing Education</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { name: "Financial Modeling & Valuation Analyst (FMVA®)", issuer: "Corporate Finance Institute" },
                    { name: "AI For Finance Specialization", issuer: "Corporate Finance Institute" },
                    { name: "Finance & Quantitative Modeling Specialization", issuer: "Wharton Online" },
                    { name: "Business and Financial Modeling Specialization", issuer: "Wharton Online" },
                    { name: "Google Data Analytics Professional Certificate", issuer: "Google" },
                  ].map((c) => (
                    <div key={c.name} style={{
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
                      padding: "18px 20px",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(201,168,76,0.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4, lineHeight: 1.4 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: "#C9A84C", fontWeight: 600, letterSpacing: 0.3 }}>{c.issuer}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 64 }} />

          {/* Skills sub-block */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>Skills</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {[
              {
                icon: "📐",
                label: "Finance & Strategy",
                color: "#C9A84C",
                skills: ["Forecasting & Budgeting", "Financial Modeling", "KPI Development", "Strategic Decision Support", "Data Visualization", "Ad-Hoc Analysis", "Audit", "Accounting", "SEC Reporting", "Process Optimization"],
              },
              {
                icon: "🤝",
                label: "Interpersonal",
                color: "#2196A3",
                skills: ["Leadership", "Collaboration", "Communication", "Strategic Influence", "Mentorship", "Problem Solving", "Emotional Intelligence", "Adaptability", "Discipline", "Integrity", "Accountability"],
              },
              {
                icon: "🛠️",
                label: "Tools & Technology",
                color: "#7B4F9E",
                skills: ["Advanced Excel", "SQL", "Tableau", "Qlik", "Alteryx", "Oracle", "SAP", "Hyperion / Essbase", "Dynamics SL", "Prophix", "Workiva", "ThoughtSpot", "Google App Script", "CoPilot", "Gemini", "NotebookLM", "ChatGPT", "Claude"],
              },
            ].map(({ icon, label, color, skills }) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8, padding: "28px 24px",
                transition: "border-color 0.2s, background 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#fff" }}>{label}</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {skills.map(s => (
                    <span key={s} style={{
                      fontSize: 11, fontWeight: 600, padding: "5px 11px",
                      borderRadius: 4, background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.65)",
                      letterSpacing: 0.3,
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
            </div>

          {/* Clifton Strengths subsection */}
          <div style={{ marginTop: 48, paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
                <a href="https://www.gallup.com/cliftonstrengths/en/252137/home.aspx" target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#C9A84C"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
                >Clifton Strengths Top 10</a>
              </div>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }}/>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Gallup · Dec 2024 · Leading with <span style={{ color: "rgba(255,255,255,0.5)" }}>Executing</span></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
              {[
                { rank: 1, name: "Arranger", domain: "Executing", color: "#7B4F9E" },
                { rank: 2, name: "Responsibility", domain: "Executing", color: "#7B4F9E" },
                { rank: 3, name: "Achiever", domain: "Executing", color: "#7B4F9E" },
                { rank: 4, name: "Discipline", domain: "Executing", color: "#7B4F9E" },
                { rank: 5, name: "Connectedness", domain: "Relationship Building", color: "#2196A3" },
                { rank: 6, name: "Context", domain: "Strategic Thinking", color: "#2A7A4F" },
                { rank: 7, name: "Analytical", domain: "Strategic Thinking", color: "#2A7A4F" },
                { rank: 8, name: "Ideation", domain: "Strategic Thinking", color: "#2A7A4F" },
                { rank: 9, name: "Strategic", domain: "Strategic Thinking", color: "#2A7A4F" },
                { rank: 10, name: "Focus", domain: "Executing", color: "#7B4F9E" },
              ].map(({ rank, name, domain, color }) => (
                <div key={name} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 6, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
                  transition: "border-color 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#C9A84C", minWidth: 20 }}>#{rank}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{name}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color, marginTop: 3 }}>{domain}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED ── */}
      {false && featured.length > 0 && (
        <section style={{ padding: "80px 56px", background: "#0B1628" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C9A84C", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
              Featured Work <span style={{ display: "block", width: 48, height: 2, background: "#C9A84C" }}/>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {featured.map(p => <ProjectCard key={p.id} project={p} onClick={() => window.open(`#/project/${p.id}`, "_blank")} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── NETFLIX WORKFLOW ── */}
      <NetflixWorkflow />

      {/* ── GOOGLE CLOUD WORKFLOW ── */}
      <GoogleCloudWorkflow />

      {/* ── ALL PROJECTS ── */}
      <section id="projects" style={{ padding: "96px 56px", background: "#fff", display: "none" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C9A84C", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <span style={{ display: "block", width: 48, height: 2, background: "#C9A84C" }}/> Projects <span style={{ display: "block", width: 48, height: 2, background: "#C9A84C" }}/>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
            <div style={{ display: "none" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9BA3B8", fontSize: 14 }}>🔍</span>
              <input
                placeholder="Search projects…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: "9px 14px 9px 36px", border: "1px solid #E8EAF0", borderRadius: 4, fontSize: 13, color: "#0B1628", outline: "none", fontFamily: "Outfit,sans-serif", width: 260, transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor="#C9A84C"}
                onBlur={e => e.target.style.borderColor="#E8EAF0"}
              />
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔎</div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: "#0B1628", marginBottom: 8 }}>No projects found</p>
              <p style={{ fontSize: 14, color: "#9BA3B8" }}>Try a different search or category filter.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
              {filtered.map(p => <ProjectCard key={p.id} project={p} onClick={() => window.open(`#/project/${p.id}`, "_blank")} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#060E1A", padding: "20px 56px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(201,168,76,0.08)" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", margin: 0 }}>© 2026 Rajveer Sidhu · All Rights Reserved</p>
      </footer>

      {/* ── MODAL ── */}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
      {showResume && (
        <div style={{ position: "fixed", inset: 0, background: "#fff", zIndex: 200, overflowY: "auto" }}>
          <Resume onBack={() => setShowResume(false)} />
        </div>
      )}
    </div>
    </WirelessProvider>
  );
}
