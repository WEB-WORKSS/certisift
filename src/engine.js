/*
 * CertiSift verification engine (runs fully in the browser).
 *   extract(text)                  -> header fields + raw lines
 *   verify(text, spec, history)    -> checks, verdict, extracted results
 * Works on text-based certificates (pasted text, .txt, .csv).
 */
window.CS = window.CS || {};

(function () {
  const SUP = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-" };
  const QUAL_ABSENT = /\b(not\s+detected|n\.?d\.?|absent|negative|neg\.?|none\s+detected|not\s+found|nil)\b/i;
  const QUAL_PRESENT = /\b(detected|present|positive|pos\.?)\b/i;
  const NUM = /([<>≤≥]=?)?\s*(\d+(?:[.,]\d+)*)\s*(?:(?:x|×|\*)\s*10\s*\^?\s*(-?\d+)|[eE]\s*([+-]?\d+))?/;

  function normNumber(s) {
    // "2,300" -> 2300 ; "13,6" -> 13.6 ; "1.234,5" -> 1234.5
    if (s.includes(",") && s.includes(".")) return s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
    if (/^\d{1,3}(,\d{3})+$/.test(s)) return s.replace(/,/g, "");
    return s.replace(",", ".");
  }

  function parseResult(raw) {
    if (raw == null) return null;
    let s = String(raw).trim().replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, (c) => SUP[c]);
    s = s.replace(/10\s*(-?\d+)\b/g,(m, e, off, str) => (/[x×*]\s*$/.test(str.slice(0, off)) ? "10^" + e : m));
    if (!s) return null;
    if (QUAL_ABSENT.test(s)) return { qual: "absent", raw: String(raw).trim() };
    const m = s.match(NUM);
    if (m && m.index <= 3) {
      let value = parseFloat(normNumber(m[2]));
      const exp = m[3] ?? m[4];
      if (exp != null) value = value * Math.pow(10, parseInt(exp, 10));
      let op = m[1] || "";
      op = op.replace("≤", "<=").replace("≥", ">=");
      return { value, op, raw: m[0].trim() };
    }
    if (QUAL_PRESENT.test(s)) return { qual: "present", raw: String(raw).trim() };
    return null;
  }

  function parseDate(s) {
    if (!s) return null;
    s = s.trim();
    let m = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    m = s.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
    if (m) return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1])); // dd.mm.yyyy
    const t = Date.parse(s);
    return isNaN(t) ? null : new Date(t);
  }
  const iso = (d) => (d ? d.toISOString().slice(0, 10) : null);

  const HEADER = [
    ["supplier", /^\s*(supplier|manufacturer|vendor|producer|issued\s+by)\s*[:\-]\s*(.+)$/i],
    ["product", /^\s*(product(?:\s+name)?|material|item|description)\s*[:\-]\s*(.+)$/i],
    ["lot", /^\s*((?:lot|batch)(?:\s*(?:no\.?|number|#|code))?)\s*[:\-]\s*(.+)$/i],
    ["mfg", /^\s*(date\s+of\s+manufacture|production\s+date|manufactur(?:ing|e)\s+date|mfg\.?\s*date|produced\s+on)\s*[:\-]\s*(.+)$/i],
    ["exp", /^\s*(best\s+before(?:\s+date)?|expiry(?:\s+date)?|expiration(?:\s+date)?|use\s+by|bbe)\s*[:\-]\s*(.+)$/i],
    ["issued", /^\s*(date\s+of\s+issue|issue\s+date|report\s+date|date\s+issued|certificate\s+date|date)\s*[:\-]\s*(.+)$/i],
    ["signedBy", /^\s*(approved\s+by|signed(?:\s+by)?|authori[sz]ed\s+by|released\s+by|checked\s+by)\s*[:\-]\s*(.+)$/i],
  ];

  function splitLine(line) {
    if (/[\t;]/.test(line) || /,\s*\S/.test(line.replace(/\d,\d{3}\b/g, ""))) {
      const parts = line.split(/[\t;]|(?<!\d),|,(?!\d{3}\b)/).map((x) => x.trim().replace(/^"|"$/g, ""));
      if (parts.length >= 2) return parts.filter((x, i) => x !== "" || i === 0);
    }
    return line.split(/\s{2,}/).map((x) => x.trim()).filter(Boolean);
  }

  function extract(text) {
    const lines = String(text || "").replace(/\r/g, "").split("\n");
    const header = {};
    const headerLines = new Set();
    lines.forEach((line, i) => {
      for (const [key, re] of HEADER) {
        if (header[key]) continue;
        const m = line.match(re);
        if (m) {
          header[key] = m[2].trim().replace(/^[,;]+|[,;]+$/g, "");
          headerLines.add(i);
          break;
        }
      }
    });
    return { header, lines, headerLines };
  }

  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  function aliasRe(a) {
    return new RegExp("(^|[^a-z0-9])" + escapeRe(a.toLowerCase()) + "(?=$|[^a-z0-9])", "i");
  }

  const UNIT_EQ = { "ppb": "µg/kg", "µg/kg": "µg/kg", "ppm": "mg/kg", "mg/kg": "mg/kg", "g/100g": "%", "%": "%", "%w/w": "%", "cfu/g": "cfu/g", "ufc/g": "cfu/g", "/25g": "/25g", "in25g": "/25g", "per25g": "/25g", "s": "s", "sec": "s", "seconds": "s", "ml": "ml" };
  function normUnit(u) {
    if (u == null) return "";
    const k = String(u).toLowerCase().replace(/μ/g, "µ").replace(/\bug\b|ug\//g, (x) => x.replace("ug", "µg")).replace(/\s+/g, "");
    return UNIT_EQ[k] || k;
  }
  const looksLikeUnit = (s) => s && s.length <= 12 && !/^(iso|aoac|icc|lc|hplc|icp|kjeldahl|method)/i.test(s) && !/\d{3,}/.test(s);

  function findParam(param, ex, used) {
    const aliases = [...param.aliases].sort((a, b) => b.length - a.length);
    for (const alias of aliases) {
      const re = aliasRe(alias);
      for (let i = 0; i < ex.lines.length; i++) {
        if (used.has(i) || ex.headerLines.has(i)) continue;
        const line = ex.lines[i];
        const am = line.match(re);
        if (!am) continue;
        const segs = splitLine(line);
        let result = null, unit = "", method = "";
        const nameIdx = segs.findIndex((s) => re.test(s));
        if (segs.length >= 2 && nameIdx >= 0) {
          for (let j = nameIdx + 1; j < segs.length; j++) {
            const r = parseResult(segs[j]);
            if (r) {
              result = r;
              const rest = segs[j].slice(segs[j].indexOf(r.raw) + r.raw.length).trim();
              if (rest && looksLikeUnit(rest)) unit = rest;
              else if (looksLikeUnit(segs[j + 1])) { unit = segs[j + 1]; method = segs.slice(j + 2).join(" "); }
              else method = segs.slice(j + 1).join(" ");
              break;
            }
          }
        }
        if (!result) {
          // single-spaced fallback: text after alias
          const after = line.slice(am.index + am[0].length).replace(/^\s*\([^)]*\)/, "");
          const r = parseResult(after.replace(/^[\s:=-]+/, ""));
          if (r) {
            result = r;
            const rest = after.slice(after.indexOf(r.raw) + r.raw.length).trim().split(/\s+/)[0];
            if (looksLikeUnit(rest)) unit = rest;
          }
        }
        if (result) {
          used.add(i);
          return { line: i, lineText: line.trim(), result, unit, method };
        }
      }
    }
    return null;
  }

  function limitText(p) {
    const u = p.unit ? " " + p.unit : "";
    if (p.type === "range") return `${p.min} – ${p.max}${u}`;
    if (p.type === "max") return `${p.exclusive ? "<" : "≤"} ${fmt(p.max)}${u}`;
    if (p.type === "min") return `≥ ${fmt(p.min)}${u}`;
    return `${p.expected === "absent" ? "Absent / not detected" : p.expected}${u ? " in" + u.replace("/", " ") : ""}`;
  }
  function fmt(n) {
    if (n == null || isNaN(n)) return String(n);
    if (Math.abs(n) >= 10000) return n.toLocaleString("en-US");
    return String(+n.toFixed(4));
  }

  function evaluate(p, found) {
    if (!found) return { status: "missing", detail: "Test not reported on the certificate." };
    const r = found.result;
    const out = { value: r.qual ? r.qual : (r.op ? r.op + " " : "") + fmt(r.value), unit: found.unit };
    const unitWarn = p.unit && found.unit && normUnit(p.unit) !== normUnit(found.unit) ? `Unit "${found.unit}" differs from specification "${p.unit}".` : "";

    if (p.type === "qual") {
      if (r.qual === "absent") return { ...out, value: "Not detected", status: unitWarn ? "warn" : "pass", detail: unitWarn || "Meets requirement." };
      if (r.qual === "present") return { ...out, value: "Detected", status: "fail", detail: "Pathogen / contaminant reported as present." };
      return { ...out, status: "warn", detail: "Result could not be interpreted as absent or present." };
    }
    if (r.qual === "absent") {
      return p.type === "max" ? { ...out, value: "Not detected", status: "pass", detail: "Below detection limit." } : { ...out, status: "warn", detail: "Reported as not detected; a measured value is required." };
    }
    if (r.qual === "present") return { ...out, status: "warn", detail: "Qualitative result where a measured value is required." };

    const v = r.value, op = r.op;
    let status = "pass", detail = "Within specification.";
    if (p.type === "max") {
      if (op.startsWith(">")) { status = "warn"; detail = "Reported as greater-than; cannot confirm compliance."; }
      else if (op.startsWith("<")) { status = v <= p.max ? "pass" : "warn"; detail = status === "pass" ? "Below reporting limit." : "Reporting limit above specification limit."; }
      else if (p.exclusive ? v >= p.max : v > p.max) { status = "fail"; detail = `Exceeds maximum by ${fmt(+(v - p.max).toPrecision(3))}${p.unit ? " " + p.unit : ""}.`; }
      else if (v >= p.max * 0.98) { status = "warn"; detail = "Within specification but less than 2% from the limit."; }
    } else if (p.type === "min") {
      if (op.startsWith("<")) { status = "fail"; detail = "Reported below a value; minimum not demonstrated."; }
      else if (v < p.min) { status = "fail"; detail = `Below minimum by ${fmt(+(p.min - v).toPrecision(3))}${p.unit ? " " + p.unit : ""}.`; }
      else if (v <= p.min * 1.02) { status = "warn"; detail = "Within specification but less than 2% from the limit."; }
    } else if (p.type === "range") {
      const margin = (p.max - p.min) * 0.05;
      if (op) { status = "warn"; detail = "Bound reported instead of a value."; }
      else if (v < p.min || v > p.max) { status = "fail"; detail = v < p.min ? "Below specified range." : "Above specified range."; }
      else if (v - p.min < margin || p.max - v < margin) { status = "warn"; detail = "Within range but close to a limit."; }
    }
    if (status === "pass" && unitWarn) { status = "warn"; detail = unitWarn; }
    return { ...out, status, detail, numeric: op ? null : v };
  }

  function stats(arr) {
    const n = arr.length;
    const mean = arr.reduce((a, b) => a + b, 0) / n;
    const sd = Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, n - 1));
    return { n, mean, sd };
  }

  /**
   * @param text    certificate text
   * @param spec    specification object
   * @param history prior verification records (any supplier); filtered internally
   * @param today   Date used for expiry checks
   */
  function verify(text, spec, history, today) {
    today = today || new Date();
    const ex = extract(text);
    const h = ex.header;
    const used = new Set();
    const checks = [];

    // Document checks
    const doc = (label, ok, detail, failStatus) => checks.push({ kind: "document", label, status: ok ? "pass" : failStatus || "warn", detail });
    doc("Supplier identified", !!h.supplier, h.supplier || "Supplier name not found.");
    doc("Product identified", !!h.product, h.product || "Product name not found.");
    doc("Lot / batch number", !!h.lot, h.lot || "Lot or batch number missing — traceability gap.");
    doc("Authorised signature", !!h.signedBy, h.signedBy || "No approver or signatory stated.");
    const issued = parseDate(h.issued), mfg = parseDate(h.mfg), exp = parseDate(h.exp);
    doc("Issue date", !!issued, issued ? iso(issued) : "Certificate issue date missing.");
    if (exp) {
      const expired = exp < today;
      doc("Shelf life", !expired, expired ? `Expired on ${iso(exp)}.` : `Best before ${iso(exp)}.`, "fail");
    } else doc("Shelf life", false, "Best-before / expiry date missing.");
    if (mfg && issued && mfg > issued) doc("Date consistency", false, "Manufacture date is after the certificate issue date.");
    if (issued && issued > today) doc("Date consistency", false, "Certificate is dated in the future.");

    // Parameter checks (longest aliases first to avoid collisions)
    const ordered = [...spec.params].sort((a, b) => Math.max(...b.aliases.map((x) => x.length)) - Math.max(...a.aliases.map((x) => x.length)));
    const found = {};
    ordered.forEach((p) => (found[p.key] = findParam(p, ex, used)));
    const results = spec.params.map((p) => {
      const f = found[p.key];
      const e = evaluate(p, f);
      const c = { kind: "param", key: p.key, label: p.name, limit: limitText(p), method: f ? f.method : "", source: f ? f.lineText : "", ...e };
      checks.push(c);
      return c;
    });

    // Anomaly checks vs supplier history
    const prior = (history || []).filter((r) => r.specId === spec.id && h.supplier && r.supplier && r.supplier.toLowerCase() === h.supplier.toLowerCase());
    if (h.lot) {
      const same = prior.find((r) => r.lot && r.lot.toLowerCase() === h.lot.toLowerCase());
      if (same) checks.push({ kind: "anomaly", label: "Lot number reuse", status: "warn", detail: same.text.trim() === String(text).trim() ? `This certificate was already verified on ${same.createdAt.slice(0, 10)}.` : `Lot ${h.lot} already appears on a different certificate from ${same.createdAt.slice(0, 10)}.` });
    }
    const last = prior.slice().sort((a, b) => (a.issued || a.createdAt).localeCompare(b.issued || b.createdAt)).pop();
    if (last) {
      const numericNow = results.filter((c) => c.numeric != null);
      const identical = numericNow.filter((c) => {
        const pc = last.checks.find((x) => x.key === c.key);
        return pc && pc.numeric != null && pc.numeric === c.numeric;
      });
      if (identical.length >= 4 && identical.length >= numericNow.length * 0.6 && last.lot !== h.lot) {
        checks.push({ kind: "anomaly", label: "Possible copied certificate", status: "warn", detail: `${identical.length} of ${numericNow.length} measured values are identical to lot ${last.lot || "(previous)"}. Request raw lab data.` });
      }
    }
    results.forEach((c) => {
      if (c.numeric == null) return;
      const vals = prior.map((r) => (r.checks.find((x) => x.key === c.key) || {}).numeric).filter((x) => x != null);
      if (vals.length < 4) return;
      const s = stats(vals);
      const sdEff = Math.max(s.sd, Math.abs(s.mean) * 0.01);
      if (!sdEff) return;
      const z = (c.numeric - s.mean) / sdEff;
      if (Math.abs(z) >= 3.5) {
        checks.push({ kind: "anomaly", key: c.key, label: `Unusual result: ${c.label}`, status: "warn", detail: `${fmt(c.numeric)} vs. supplier average ${fmt(+s.mean.toPrecision(4))} over ${s.n} lots (${z > 0 ? "+" : ""}${z.toFixed(1)}σ).` });
      }
    });

    // Extra lines that look like results but aren't in the spec
    const extras = [];
    ex.lines.forEach((l, i) => {
      if (used.has(i) || ex.headerLines.has(i)) return;
      const segs = splitLine(l);
      if (segs.length >= 2 && /[a-z]/i.test(segs[0]) && parseResult(segs[1]) && !/^parameter/i.test(segs[0])) extras.push(segs[0]);
    });

    const verdict = checks.some((c) => c.status === "fail") ? "reject" : checks.some((c) => c.status !== "pass") ? "hold" : "accept";
    const count = (s) => checks.filter((c) => c.status === s).length;
    return {
      supplier: h.supplier || null,
      product: h.product || null,
      lot: h.lot || null,
      mfg: iso(mfg),
      exp: iso(exp),
      issued: iso(issued),
      signedBy: h.signedBy || null,
      checks,
      extras,
      verdict,
      summary: { pass: count("pass"), warn: count("warn"), fail: count("fail"), missing: count("missing"), params: spec.params.length, extracted: results.filter((r) => r.status !== "missing").length },
    };
  }

  CS.engine = { parseResult, extract, verify, limitText, fmt, normUnit, stats };
})();
