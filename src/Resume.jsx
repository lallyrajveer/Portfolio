import { useEffect, useRef } from "react";

const GOLD = "#9A7A2E";
const DARK = "#0B1628";
const MUTED = "#5A6277";
const LIGHT = "#F4F5F8";
const BORDER = "#E0E3EC";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap');

  @media print {
    @page { margin: 0.5in; size: letter; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
    .resume-root { box-shadow: none !important; }
  }

  .resume-root {
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    color: ${DARK};
    background: #fff;
    max-width: 900px;
    margin: 0 auto;
    box-shadow: 0 4px 40px rgba(0,0,0,0.10);
  }

  .resume-root p {
    margin: 0;
    padding: 0;
  }

  .section-heading {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: ${GOLD};
    border-bottom: 2px solid ${GOLD};
    padding-bottom: 3px;
    margin-bottom: 7px;
    margin-top: 10px;
    display: block;
    overflow: hidden;
  }

  .job-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 19px;
    font-weight: 700;
    color: ${DARK};
  }

  .company {
    font-family: 'Cormorant Garamond', serif;
    font-size: 19px;
    font-weight: 700;
    color: ${GOLD};
  }

  .meta {
    font-size: 12px;
    font-weight: 600;
    color: ${MUTED};
    letter-spacing: 0.3px;
    margin-bottom: 6px;
  }

  .group-heading {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: ${GOLD};
    margin: 5px 0 3px;
    border-bottom: 1px solid ${BORDER};
    padding-bottom: 2px;
  }

  .bullet {
    font-size: 12px;
    color: ${MUTED};
    line-height: 1.5;
    margin-bottom: 3px;
    padding-left: 12px;
    position: relative;
  }

  .bullet::before {
    content: '';
    position: absolute;
    left: 0;
    top: 6px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${GOLD};
  }

  .skill-tag {
    display: inline-block;
    background: ${LIGHT};
    color: ${DARK};
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 3px;
    margin: 2px 3px 2px 0;
    border: 1px solid ${BORDER};
  }
`;

const experience = [
  {
    title: "Financial Planning & Analysis Manager",
    company: "Verizon",
    period: "Feb 2022 – Present",
    location: "Ashburn, VA",
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
          "Led KPI reporting and performance analysis for Verizon Business's enterprise wireless segment, supporting a base of 30M+ business postpaid connections and ~$13.9B in annual wireless service revenue and 68K–292K quarterly net add targets.",
          "Developed high-impact business analyses of Wireless KPIs for executive reviews, modeling performance scenarios to analyze risks and opportunities and delivering actionable recommendations that improved upgrade subsidy revenue.",
          "Automated daily KPI reporting to executives using AI tools, saving the team 500+ hours annually while eliminating manual errors and ensuring 100% data consistency and accuracy.",
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
          "Streamlined reporting, forecasting, and budgeting processes across sales, business, and corporate units — reducing time spent by 60% and achieving a 90% increase in accuracy.",
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
    period: "May 2020 – Apr 2021",
    location: "Arlington, VA",
    groups: [
      {
        heading: "",
        items: [
          "Led monthly financial consolidation setup and statement production using Microsoft Dynamics SL and Prophix, ensuring accuracy through meticulous reviews and corrections.",
          "Streamlined bank reconciliation processes by reviewing and clearing two years of reconciling items, developed a process, and reconciled intercompany accounts for accurate transaction representation.",
          "Prepared crucial financial documents including BDO Form 990, Form 990-T, Indirect Cost Rate proposals, and bank covenant tests, ensuring regulatory compliance and supporting financial agreements.",
        ],
      },
    ],
  },
  {
    title: "Supervisor, Financial Reporting",
    company: "Gannett",
    period: "May 2017 – Nov 2019",
    location: "McLean, VA",
    groups: [
      {
        heading: "",
        items: [
          "Managed comprehensive SEC reporting, meticulously preparing and filing 10-K and 10-Q reports, including financial statements, footnotes, MD&A, and XBRL tagging, while also producing other investor communications materials.",
          "Contributed to month-end close and consolidation processes by preparing schedules and entries, developing internal financial statements, and ensuring department compliance with internal controls and accounting standards.",
          "Significantly improved financial reporting efficiency by automating processes to shorten monthly closing by 85%, which saved costs on hiring additional personnel.",
        ],
      },
    ],
  },
  {
    title: "Senior Accountant",
    company: "First Republic",
    period: "Jan 2016 – Jan 2017",
    location: "San Francisco, CA",
    groups: [
      {
        heading: "",
        items: [
          "Managed comprehensive financial transactions, meticulously recording data, organizing documentation, and performing daily reconciliations to ensure accuracy and compliance.",
          "Generated critical financial reports including 10Q, 10K, and Call Reports, contributing to month-end close activities and certifying General Ledger accounts for precise financial reporting.",
        ],
      },
    ],
  },
  {
    title: "Audit Associate I & II",
    company: "Grant Thornton",
    period: "Sep 2013 – Dec 2015",
    location: "San Francisco, CA",
    groups: [
      {
        heading: "",
        items: [
          "Led financial statement audits from planning to execution, effectively managing budgets, timelines, and quality while often assuming an in-charge role for public, private and non-profit clients.",
          "Adapted to various work environments (client sites, office, remote) and acted as a brand ambassador for the firm.",
        ],
      },
    ],
  },
];

const skills = {
  "Finance & Strategy": ["Forecasting & Budgeting", "Financial Modeling", "KPI Development", "Strategic Decision Support", "Data Visualization", "Ad-Hoc Analysis", "Variance Analysis", "Audit", "Accounting", "SEC Reporting", "Process Optimization"],
  "Tools & Technology": ["Claude", "Gemini", "NotebookLM", "CoPilot", "ChatGPT", "Google App Script", "Advanced Excel", "SQL", "Tableau", "Qlik", "Alteryx", "Oracle", "SAP", "Hyperion / Essbase", "Dynamics SL", "Prophix", "Workiva", "ThoughtSpot"],
  "Interpersonal": ["Leadership", "Collaboration", "Communication", "Mentorship", "Problem Solving", "Emotional Intelligence", "Adaptability", "Discipline", "Integrity", "Accountability"],
};

export default function Resume({ onBack }) {
  const resumeRef = useRef(null);

  useEffect(() => {
    document.title = "Resume — Rajveer Sidhu";
    return () => { document.title = "Rajveer Sidhu | FP&A Portfolio"; };
  }, []);

  const handleDownload = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf()
      .set({
        margin: [4, 6, 4, 6],
        filename: "Rajveer_Sidhu_Resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "letter", orientation: "portrait" },
      })
      .from(resumeRef.current)
      .save();
  };


  return (
    <>
      <style>{styles}</style>

      {/* Toolbar — hidden on print */}
      <div className="no-print" style={{ background: DARK, padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: "#fff", fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600 }}>
          Rajveer <span style={{ color: GOLD }}>Sidhu</span> — Resume
        </span>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            onClick={handleDownload}
            style={{
              background: GOLD, color: DARK, border: "none", borderRadius: 4,
              padding: "9px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer",
              letterSpacing: 0.5,
            }}
          >
            Download PDF
          </button>
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.7)", fontSize: 18, lineHeight: 1,
              width: 34, height: 34, borderRadius: "50%", display: "flex",
              alignItems: "center", justifyContent: "center", transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            title="Close"
          >✕</button>
        </div>
      </div>

      <div ref={resumeRef} className="resume-root" style={{ position: "relative" }}>

        {/* Header */}
        <div style={{ background: DARK, padding: "16px 36px 14px", position: "relative" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, color: "#fff", lineHeight: 1 }}>
              Rajveer <span style={{ color: "#fff" }}>Sidhu</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: 3, textTransform: "uppercase", marginTop: 6 }}>
              Financial Planning & Analysis Manager
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
              <a href="mailto:lallyrajveer@gmail.com" style={{ color: GOLD, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>✉ lallyrajveer@gmail.com</a>
              <span>·</span>
              <span style={{ color: GOLD, display: "inline-flex", alignItems: "center", gap: 4 }}>📞 209-207-8989</span>
              <span>·</span>
              <a href="https://www.linkedin.com/in/sidhurajveer/" target="_blank" rel="noreferrer" style={{ color: GOLD, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={GOLD}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
              <span>·</span>
              <a href="https://your-website.com" target="_blank" rel="noreferrer" style={{ color: GOLD, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>🌐 Website</a>
            </div>
          </div>
          {/* Accent rule */}
          <div style={{ height: 2, background: `linear-gradient(90deg, ${GOLD}, transparent)`, marginTop: 18, borderRadius: 2 }} />
        </div>

        <div style={{ padding: "10px 36px 16px" }}>

          {/* Summary */}
          <div className="section-heading">Professional Summary</div>
          <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.75 }}>
            Finance professional at the intersection of FP&A and AI, with deep expertise in financial planning, accounting, and strategic financial analysis. Specializes in identifying risks and opportunities within complex financial data and translating insights into clear recommendations for leadership. Leverages AI and automation to strengthen forecasting, planning, and reporting processes. A collaborative leader committed to mentoring interns and driving continuous improvement.
          </div>

          {/* Experience */}
          <div className="section-heading">Professional Experience</div>
          {experience.map((job, i) => (
            <div key={i} style={{ marginBottom: 8, ...(i === 1 ? { pageBreakBefore: "always" } : {}) }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "nowrap", gap: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexShrink: 0 }}>
                  <span className="job-title">{job.title}</span>
                  <span style={{ color: BORDER }}>·</span>
                  <span className="company">{job.company}</span>
                </div>
                <span className="meta" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>{job.period} · {job.location}</span>
              </div>
              {job.groups.map((g, gi) => (
                <div key={gi}>
                  {g.heading && <div className="group-heading">{g.heading}</div>}
                  {g.items.map((b, bi) => (
                    <div key={bi} className="bullet">{b}</div>
                  ))}
                </div>
              ))}
            </div>
          ))}

          {/* Skills */}
          <div className="section-heading">Skills</div>
          <div>
            {Object.entries(skills).map(([cat, tags]) => (
              <div key={cat} className="bullet" style={{ marginBottom: 4 }}>
                <strong style={{ color: DARK }}>{cat}:</strong>{" "}
                <span style={{ color: MUTED }}>{tags.join(", ")}</span>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="section-heading">Education</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px" }}>
            {[
              { name: "B.S. Business Administration - Accounting", issuer: "San Jose State University" },
              { name: "Financial Modeling & Valuation Analyst (FMVA®)", issuer: "Corporate Finance Institute" },
              { name: "AI For Finance Specialization", issuer: "Corporate Finance Institute" },
              { name: "Finance & Quantitative Modeling Specialization", issuer: "Wharton Online" },
              { name: "Business and Financial Modeling Specialization", issuer: "Wharton Online" },
              { name: "Google Data Analytics Professional Certificate", issuer: "Google" },
            ].map((c, i) => (
              <div key={i} style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: DARK }}>{c.name}</div>
                <div style={{ fontSize: 10, color: MUTED }}>{c.issuer}</div>
              </div>
            ))}
          </div>


        </div>
      </div>
    </>
  );
}
