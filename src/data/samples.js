/*
 * Sample data for the demo workspace.
 * All suppliers, lots and results below are FICTIONAL and labelled as sample data in the UI.
 */
window.CS = window.CS || {};

CS.sampleSpecs = [
  {
    id: "spec-flour-550",
    name: "Wheat Flour Type 550",
    product: "Wheat flour",
    version: "v3",
    params: [
      { key: "moisture", name: "Moisture", aliases: ["moisture", "water content", "humidity"], unit: "%", type: "max", max: 14.5 },
      { key: "protein", name: "Protein (d.m.)", aliases: ["protein"], unit: "%", type: "range", min: 11.0, max: 13.0 },
      { key: "ash", name: "Ash (d.m.)", aliases: ["ash", "mineral content"], unit: "%", type: "max", max: 0.65 },
      { key: "falling", name: "Falling number", aliases: ["falling number", "hagberg"], unit: "s", type: "min", min: 250 },
      { key: "afb1", name: "Aflatoxin B1", aliases: ["aflatoxin b1", "afb1"], unit: "µg/kg", type: "max", max: 2.0 },
      { key: "tpc", name: "Total plate count", aliases: ["total plate count", "tpc", "aerobic plate count", "total viable count", "tvc"], unit: "cfu/g", type: "max", max: 100000 },
      { key: "ym", name: "Yeasts & moulds", aliases: ["yeasts & moulds", "yeasts and moulds", "yeast & mold", "yeast and mould", "yeasts/moulds", "y&m"], unit: "cfu/g", type: "max", max: 1000 },
      { key: "ecoli", name: "E. coli", aliases: ["e. coli", "e.coli", "escherichia coli"], unit: "cfu/g", type: "max", max: 10, exclusive: true },
      { key: "salm", name: "Salmonella", aliases: ["salmonella"], unit: "/25 g", type: "qual", expected: "absent" },
    ],
  },
  {
    id: "spec-smp",
    name: "Skimmed Milk Powder (Medium Heat)",
    product: "Skimmed milk powder",
    version: "v2",
    params: [
      { key: "moisture", name: "Moisture", aliases: ["moisture", "water content"], unit: "%", type: "max", max: 4.0 },
      { key: "protein", name: "Protein (in SNF)", aliases: ["protein"], unit: "%", type: "min", min: 34.0 },
      { key: "fat", name: "Fat", aliases: ["fat", "milk fat"], unit: "%", type: "max", max: 1.25 },
      { key: "solub", name: "Solubility index", aliases: ["solubility index", "insolubility index", "solubility"], unit: "ml", type: "max", max: 1.0 },
      { key: "tpc", name: "Total plate count", aliases: ["total plate count", "tpc", "aerobic plate count", "total viable count"], unit: "cfu/g", type: "max", max: 10000 },
      { key: "entero", name: "Enterobacteriaceae", aliases: ["enterobacteriaceae", "entero"], unit: "cfu/g", type: "max", max: 10, exclusive: true },
      { key: "salm", name: "Salmonella", aliases: ["salmonella"], unit: "/25 g", type: "qual", expected: "absent" },
      { key: "listeria", name: "Listeria monocytogenes", aliases: ["listeria monocytogenes", "listeria", "l. monocytogenes"], unit: "/25 g", type: "qual", expected: "absent" },
    ],
  },
  {
    id: "spec-cocoa",
    name: "Cocoa Powder 10/12 Alkalised",
    product: "Cocoa powder",
    version: "v1",
    params: [
      { key: "moisture", name: "Moisture", aliases: ["moisture"], unit: "%", type: "max", max: 5.0 },
      { key: "fat", name: "Cocoa butter content", aliases: ["cocoa butter", "fat content", "fat"], unit: "%", type: "range", min: 10.0, max: 12.0 },
      { key: "ph", name: "pH", aliases: ["ph"], unit: "", type: "range", min: 6.8, max: 8.0 },
      { key: "cd", name: "Cadmium", aliases: ["cadmium", "cd"], unit: "mg/kg", type: "max", max: 0.6 },
      { key: "tpc", name: "Total plate count", aliases: ["total plate count", "tpc", "aerobic plate count"], unit: "cfu/g", type: "max", max: 5000 },
      { key: "ym", name: "Yeasts & moulds", aliases: ["yeasts & moulds", "yeasts and moulds", "yeast & mold", "moulds"], unit: "cfu/g", type: "max", max: 100 },
      { key: "entero", name: "Enterobacteriaceae", aliases: ["enterobacteriaceae"], unit: "cfu/g", type: "max", max: 10, exclusive: true },
      { key: "salm", name: "Salmonella", aliases: ["salmonella"], unit: "/25 g", type: "qual", expected: "absent" },
    ],
  },
];

/* Build a realistic plain-text certificate from rows. Also used to seed history. */
CS.buildCoa = function (h, rows) {
  const pad = (s, n) => (s + " ".repeat(n)).slice(0, Math.max(n, s.length + 1));
  const lines = [
    "CERTIFICATE OF ANALYSIS",
    "",
    `Supplier: ${h.supplier}`,
    `Product: ${h.product}`,
    h.lot ? `Lot No: ${h.lot}` : null,
    h.mfg ? `Date of Manufacture: ${h.mfg}` : null,
    h.exp ? `Best Before: ${h.exp}` : null,
    h.issued ? `Date of Issue: ${h.issued}` : null,
    "",
    pad("Parameter", 28) + pad("Result", 16) + pad("Unit", 10) + "Method",
    ...rows.map((r) => pad(r[0], 28) + pad(String(r[1]), 16) + pad(r[2], 10) + (r[3] || "")),
    "",
    h.signedBy ? `Approved by: ${h.signedBy}` : null,
  ];
  return lines.filter((l) => l !== null).join("\n");
};

CS.sampleDocs = [
  {
    id: "s1",
    title: "Northfield Milling — Wheat flour, compliant",
    hint: "Expected: Accept",
    specId: "spec-flour-550",
    text: CS.buildCoa(
      { supplier: "Northfield Milling Co.", product: "Wheat Flour Type 550", lot: "NFM-26311", mfg: "2026-11-07", exp: "2027-05-07", issued: "2026-11-09", signedBy: "M. Keller, QA Manager" },
      [
        ["Moisture", "13.6", "%", "ICC 110/1"],
        ["Protein (d.m.)", "12.1", "%", "ICC 105/2"],
        ["Ash (d.m.)", "0.57", "%", "ICC 104/1"],
        ["Falling Number", "318", "s", "ICC 107/1"],
        ["Aflatoxin B1", "0.4", "µg/kg", "LC-MS/MS"],
        ["Total Plate Count", "3.8 x 10^4", "cfu/g", "ISO 4833-1"],
        ["Yeasts & Moulds", "2.4 x 10^2", "cfu/g", "ISO 21527"],
        ["E. coli", "<10", "cfu/g", "ISO 16649-2"],
        ["Salmonella", "Not detected", "/25 g", "ISO 6579-1"],
      ]
    ),
  },
  {
    id: "s2",
    title: "Arden Grain — Wheat flour, aflatoxin over limit",
    hint: "Expected: Reject",
    specId: "spec-flour-550",
    text: CS.buildCoa(
      { supplier: "Arden Grain Partners", product: "Wheat Flour T550", lot: "AGP-7781-B", mfg: "2026-11-02", exp: "2027-04-30", issued: "2026-11-05", signedBy: "R. Osei, Laboratory Lead" },
      [
        ["Moisture content", "14.4", "%", "ICC 110/1"],
        ["Protein", "11.6", "%", "Kjeldahl"],
        ["Ash", "0.61", "%", "ICC 104/1"],
        ["Falling number", "276", "s", "ICC 107/1"],
        ["Aflatoxin B1", "3.4", "µg/kg", "HPLC-FLD"],
        ["TPC", "6.1E4", "cfu/g", "ISO 4833-1"],
        ["Yeast & Mold", "780", "cfu/g", "ISO 21527"],
        ["E.coli", "<10", "cfu/g", "ISO 16649-2"],
        ["Salmonella", "Absent", "/25 g", "ISO 6579-1"],
      ]
    ),
  },
  {
    id: "s3",
    title: "Halvorsen Dairy — Milk powder, incomplete certificate",
    hint: "Expected: Hold (missing test, no signature)",
    specId: "spec-smp",
    text: CS.buildCoa(
      { supplier: "Halvorsen Dairy Ingredients", product: "Skimmed Milk Powder MH", lot: "HDI-SMP-0942", mfg: "2026-10-21", exp: "2028-04-21", issued: "2026-10-24" },
      [
        ["Moisture", "3.6", "%", "ISO 5537"],
        ["Protein in SNF", "34.9", "%", "ISO 8968"],
        ["Fat", "0.9", "%", "ISO 1736"],
        ["Insolubility index", "0.5", "ml", "ISO 8156"],
        ["Aerobic plate count", "2,300", "cfu/g", "ISO 4833-1"],
        ["Enterobacteriaceae", "<10", "cfu/g", "ISO 21528-2"],
        ["Listeria monocytogenes", "Negative", "/25 g", "ISO 11290-1"],
      ]
    ),
  },
  {
    id: "s4",
    title: "Northfield Milling — Wheat flour, unusual protein",
    hint: "Expected: Hold (outlier vs supplier history)",
    specId: "spec-flour-550",
    text: CS.buildCoa(
      { supplier: "Northfield Milling Co.", product: "Wheat Flour Type 550", lot: "NFM-26318", mfg: "2026-11-14", exp: "2027-05-14", issued: "2026-11-16", signedBy: "M. Keller, QA Manager" },
      [
        ["Moisture", "13.5", "%", "ICC 110/1"],
        ["Protein (d.m.)", "12.8", "%", "ICC 105/2"],
        ["Ash (d.m.)", "0.56", "%", "ICC 104/1"],
        ["Falling Number", "322", "s", "ICC 107/1"],
        ["Aflatoxin B1", "0.5", "µg/kg", "LC-MS/MS"],
        ["Total Plate Count", "4.0 x 10^4", "cfu/g", "ISO 4833-1"],
        ["Yeasts & Moulds", "2.0 x 10^2", "cfu/g", "ISO 21527"],
        ["E. coli", "<10", "cfu/g", "ISO 16649-2"],
        ["Salmonella", "Not detected", "/25 g", "ISO 6579-1"],
      ]
    ),
  },
  {
    id: "s5",
    title: "Meridian Cocoa — Cocoa powder, values copied from last lot",
    hint: "Expected: Hold (possible copied certificate)",
    specId: "spec-cocoa",
    text: CS.buildCoa(
      { supplier: "Meridian Cocoa Trading", product: "Cocoa Powder 10/12 Alkalised", lot: "MCT-11-2026-04", mfg: "2026-11-03", exp: "2028-11-03", issued: "2026-11-06", signedBy: "L. Duarte, Quality Officer" },
      [
        ["Moisture", "3.9", "%", "AOAC 931.04"],
        ["Cocoa butter", "10.8", "%", "AOAC 963.15"],
        ["pH", "7.4", "", "AOAC 970.21"],
        ["Cadmium", "0.31", "mg/kg", "ICP-MS"],
        ["Total plate count", "1,800", "cfu/g", "ISO 4833-1"],
        ["Yeasts & moulds", "40", "cfu/g", "ISO 21527"],
        ["Enterobacteriaceae", "<10", "cfu/g", "ISO 21528-2"],
        ["Salmonella", "Not detected", "/25 g", "ISO 6579-1"],
      ]
    ),
  },
];

/* Deterministic history so the sample workspace has supplier trends. */
CS.sampleHistory = function () {
  let seed = 42;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 0.5; // approx N(0,1)
  const v = (mean, sd, dp) => (mean + gauss() * sd).toFixed(dp);
  const date = (m, d) => `2026-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const docs = [];

  for (let m = 4; m <= 10; m++) {
    docs.push({
      specId: "spec-flour-550",
      text: CS.buildCoa(
        { supplier: "Northfield Milling Co.", product: "Wheat Flour Type 550", lot: `NFM-26${100 + m * 10}`, mfg: date(m, 8), exp: date(m, 8).replace("2026", "2027"), issued: date(m, 10), signedBy: "M. Keller, QA Manager" },
        [
          ["Moisture", v(13.6, 0.12, 1), "%"], ["Protein (d.m.)", v(12.0, 0.08, 1), "%"], ["Ash (d.m.)", v(0.57, 0.01, 2), "%"],
          ["Falling Number", v(315, 6, 0), "s"], ["Aflatoxin B1", v(0.5, 0.08, 1), "µg/kg"], ["Total Plate Count", `${v(4.0, 0.4, 1)} x 10^4`, "cfu/g"],
          ["Yeasts & Moulds", `${v(2.3, 0.3, 1)} x 10^2`, "cfu/g"], ["E. coli", "<10", "cfu/g"], ["Salmonella", "Not detected", "/25 g"],
        ]
      ),
    });
    const wet = m === 6 || m === 9; // recurring moisture failures
    docs.push({
      specId: "spec-flour-550",
      text: CS.buildCoa(
        { supplier: "Arden Grain Partners", product: "Wheat Flour T550", lot: `AGP-${7000 + m * 70}-A`, mfg: date(m, 3), exp: date(m, 3).replace("2026", "2027"), issued: date(m, 6), signedBy: "R. Osei, Laboratory Lead" },
        [
          ["Moisture content", wet ? v(14.8, 0.08, 1) : v(14.1, 0.1, 1), "%"], ["Protein", v(11.7, 0.15, 1), "%"], ["Ash", v(0.61, 0.015, 2), "%"],
          ["Falling number", v(280, 10, 0), "s"], ["Aflatoxin B1", v(1.1, 0.25, 1), "µg/kg"], ["TPC", `${v(6.0, 0.6, 1)}E4`, "cfu/g"],
          ["Yeast & Mold", v(700, 80, 0), "cfu/g"], ["E.coli", "<10", "cfu/g"], ["Salmonella", "Absent", "/25 g"],
        ]
      ),
    });
    if (m % 2 === 0) {
      docs.push({
        specId: "spec-smp",
        text: CS.buildCoa(
          { supplier: "Halvorsen Dairy Ingredients", product: "Skimmed Milk Powder MH", lot: `HDI-SMP-0${880 + m * 5}`, mfg: date(m, 14), exp: date(m, 14).replace("2026", "2028"), issued: date(m, 17), signedBy: "K. Lind, QA" },
          [
            ["Moisture", v(3.6, 0.1, 1), "%"], ["Protein in SNF", v(34.8, 0.2, 1), "%"], ["Fat", v(0.9, 0.05, 1), "%"],
            ["Insolubility index", v(0.5, 0.05, 1), "ml"], ["Aerobic plate count", v(2400, 300, 0), "cfu/g"], ["Enterobacteriaceae", "<10", "cfu/g"],
            ["Salmonella", "Negative", "/25 g"], ["Listeria monocytogenes", "Negative", "/25 g"],
          ]
        ),
      });
    }
  }
  // Meridian: previous lot carries identical values to sample s5 (copied certificate scenario)
  docs.push({
    specId: "spec-cocoa",
    text: CS.buildCoa(
      { supplier: "Meridian Cocoa Trading", product: "Cocoa Powder 10/12 Alkalised", lot: "MCT-09-2026-02", mfg: "2026-09-04", exp: "2028-09-04", issued: "2026-09-08", signedBy: "L. Duarte, Quality Officer" },
      [["Moisture", "4.2", "%"], ["Cocoa butter", "11.1", "%"], ["pH", "7.3", ""], ["Cadmium", "0.28", "mg/kg"], ["Total plate count", "2,100", "cfu/g"], ["Yeasts & moulds", "50", "cfu/g"], ["Enterobacteriaceae", "<10", "cfu/g"], ["Salmonella", "Not detected", "/25 g"]]
    ),
  });
  docs.push({
    specId: "spec-cocoa",
    text: CS.buildCoa(
      { supplier: "Meridian Cocoa Trading", product: "Cocoa Powder 10/12 Alkalised", lot: "MCT-10-2026-03", mfg: "2026-10-02", exp: "2028-10-02", issued: "2026-10-06", signedBy: "L. Duarte, Quality Officer" },
      [["Moisture", "3.9", "%"], ["Cocoa butter", "10.8", "%"], ["pH", "7.4", ""], ["Cadmium", "0.31", "mg/kg"], ["Total plate count", "1,800", "cfu/g"], ["Yeasts & moulds", "40", "cfu/g"], ["Enterobacteriaceae", "<10", "cfu/g"], ["Salmonella", "Not detected", "/25 g"]]
    ),
  });
  return docs;
};
