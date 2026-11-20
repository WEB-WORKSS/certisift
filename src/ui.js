/* Shared UI helpers */
window.CS = window.CS || {};

(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const logoMark = (light) => `
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="8" fill="${light ? "#e6ef6b" : "#12211f"}"/>
      ${[0, 1, 2].map((r) => [0, 1, 2].map((c) => {
        const on = r === 2 && c === 2;
        return `<circle cx="${9 + c * 7}" cy="${9 + r * 7}" r="${on ? 2.8 : 1.9}" fill="${on ? (light ? "#0d6e5c" : "#e6ef6b") : light ? "#12211f" : "#f5f2ea"}" opacity="${on ? 1 : 0.85}"/>`;
      }).join("")).join("")}
    </svg>`;
  const logo = (href = "#/", light = false) => `<a class="logo" href="${href}" aria-label="CertiSift home">${logoMark(light)}<span>Certi<b>Sift</b></span></a>`;

  const I = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    scan: '<path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2M4 12h16"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    spec: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5M9 13h6M9 17h4"/>',
    truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>',
    report: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    rocket: '<path d="M12 15l-3-3a13 13 0 0 1 9-9c1 0 2 1 2 2a13 13 0 0 1-9 9zM9 12H5l2-4h4M12 15v4l4-2v-4M6 17c-1 1-2 4-2 4s3-1 4-2"/>',
    user: '<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    copy: '<path d="M9 9h10v10H9zM5 15V5h10"/>',
    out: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h11"/>',
    globe: '<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  };
  const icon = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ""}</svg>`;

  const verdictLabel = { accept: "Accept", hold: "Hold for review", reject: "Reject" };
  const statusLabel = { pass: "Pass", warn: "Review", fail: "Out of spec", missing: "Missing" };
  const decisionLabel = { released: "Released", "on-hold": "On hold", rejected: "Rejected" };

  const fmtDate = (s) => { if (!s) return "N/A"; const d = new Date(s); return isNaN(d) ? s : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };

  let toastT;
  function toast(msg) {
    let el = document.querySelector(".toast");
    if (!el) { el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
    el.textContent = msg; el.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), 2200);
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast("Copied to clipboard"); }
    catch { const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); toast("Copied to clipboard"); }
  }

  function download(name, content, type = "text/plain") {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function sparkline(values, opts = {}) {
    const w = 300, h = 64, pad = 6;
    if (!values.length) return "";
    const lo = Math.min(...values, opts.min ?? Infinity), hi = Math.max(...values, opts.max ?? -Infinity);
    const span = hi - lo || 1;
    const x = (i) => pad + (i * (w - pad * 2)) / Math.max(1, values.length - 1);
    const y = (v) => h - pad - ((v - lo) / span) * (h - pad * 2);
    const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    const limit = (v, c) => (v != null && isFinite(v) ? `<line x1="0" x2="${w}" y1="${y(v)}" y2="${y(v)}" stroke="${c}" stroke-dasharray="4 4" stroke-width="1"/>` : "");
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="${esc(opts.label || "Trend")}">
      ${limit(opts.max, "#b5391f")}${limit(opts.min, "#b5391f")}
      <polyline points="${pts}" fill="none" stroke="#0d6e5c" stroke-width="2" vector-effect="non-scaling-stroke"/>
      ${values.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="2.6" fill="${(opts.max != null && v > opts.max) || (opts.min != null && v < opts.min) ? "#b5391f" : "#0d6e5c"}"/>`).join("")}
    </svg>`;
  }

  CS.ui = { esc, logo, logoMark, icon, verdictLabel, statusLabel, decisionLabel, fmtDate, toast, copy, download, sparkline };
})();
