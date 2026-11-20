/* Local persistence. Accounts and workspaces live in this browser's localStorage only. */
window.CS = window.CS || {};

(function () {
  const P = "certisift:";
  const get = (k, d) => { try { const v = localStorage.getItem(P + k); return v == null ? d : JSON.parse(v); } catch { return d; } };
  const set = (k, v) => localStorage.setItem(P + k, JSON.stringify(v));
  const del = (k) => localStorage.removeItem(P + k);
  const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const SAMPLE_EMAIL = "sample@workspace.local";

  async function hash(pw) {
    try {
      if (crypto && crypto.subtle) {
        const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("certisift|" + pw));
        return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
      }
    } catch {}
    let h = 2166136261; for (const c of "certisift|" + pw) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return "f" + (h >>> 0).toString(16);
  }

  function seedSample() {
    const specs = clone(CS.sampleSpecs);
    const verifications = [];
    const docs = CS.sampleHistory()
      .map((d) => ({ ...d, issued: (d.text.match(/Date of Issue: (\S+)/) || [])[1] }))
      .sort((a, b) => a.issued.localeCompare(b.issued));
    for (const d of docs) {
      const spec = specs.find((s) => s.id === d.specId);
      const r = CS.engine.verify(d.text, spec, verifications);
      const decision = r.verdict === "accept" ? { status: "released", note: "", at: r.issued } : r.verdict === "reject" ? { status: "rejected", note: "Returned to supplier.", at: r.issued } : { status: "released", note: "Reviewed; released with supplier notified.", at: r.issued };
      verifications.push({ id: uid(), createdAt: r.issued + "T09:30:00.000Z", specId: spec.id, specName: spec.name, text: d.text, source: "sample", fileName: null, decision, ...r });
    }
    return { name: "Sample workspace", sample: true, createdAt: new Date().toISOString(), specs, verifications };
  }

  const store = {
    SAMPLE_EMAIL,
    uid,
    get, set,
    session() { return get("session", null); },
    user() { const s = this.session(); return s ? (get("users", {})[s] || null) : null; },
    isSample() { return this.session() === SAMPLE_EMAIL; },
    async signUp({ name, company, email, password }) {
      email = email.trim().toLowerCase();
      const users = get("users", {});
      if (users[email]) throw new Error("An account with this email already exists in this browser.");
      users[email] = { name: name.trim(), company: company.trim(), email, pw: await hash(password), createdAt: new Date().toISOString() };
      set("users", users);
      set("ws:" + email, { name: company.trim() || name.trim(), sample: false, createdAt: new Date().toISOString(), specs: clone(CS.sampleSpecs), verifications: [] });
      set("session", email);
    },
    async signIn(email, password) {
      email = email.trim().toLowerCase();
      const u = get("users", {})[email];
      if (!u || u.pw !== (await hash(password))) throw new Error("Email or password is incorrect.");
      set("session", email);
    },
    enterSample() {
      const users = get("users", {});
      if (!users[SAMPLE_EMAIL]) { users[SAMPLE_EMAIL] = { name: "Sample reviewer", company: "Sample workspace", email: SAMPLE_EMAIL, pw: null, createdAt: new Date().toISOString() }; set("users", users); }
      if (!get("ws:" + SAMPLE_EMAIL)) set("ws:" + SAMPLE_EMAIL, seedSample());
      set("session", SAMPLE_EMAIL);
    },
    resetSample() { set("ws:" + SAMPLE_EMAIL, seedSample()); },
    signOut() { del("session"); },
    updateUser(patch) { const users = get("users", {}); const s = this.session(); users[s] = { ...users[s], ...patch }; set("users", users); },
    deleteAccount() { const s = this.session(); const users = get("users", {}); delete users[s]; set("users", users); del("ws:" + s); del("session"); },
    ws() { const s = this.session(); return s ? get("ws:" + s, null) : null; },
    saveWs(ws) { set("ws:" + this.session(), ws); },
    addVerification(rec) { const ws = this.ws(); rec.id = uid(); rec.createdAt = new Date().toISOString(); ws.verifications.push(rec); this.saveWs(ws); return rec; },
    updateVerification(id, patch) { const ws = this.ws(); const i = ws.verifications.findIndex((v) => v.id === id); if (i >= 0) { ws.verifications[i] = { ...ws.verifications[i], ...patch }; this.saveWs(ws); } },
    deleteVerification(id) { const ws = this.ws(); ws.verifications = ws.verifications.filter((v) => v.id !== id); this.saveWs(ws); },
    saveSpec(spec) { const ws = this.ws(); const i = ws.specs.findIndex((s) => s.id === spec.id); if (i >= 0) ws.specs[i] = spec; else ws.specs.push(spec); this.saveWs(ws); },
    deleteSpec(id) { const ws = this.ws(); ws.specs = ws.specs.filter((s) => s.id !== id); this.saveWs(ws); },
    inbox() { return get("inbox", []); },
    addInbox(msg) { const list = get("inbox", []); list.unshift({ id: uid(), at: new Date().toISOString(), ...msg }); set("inbox", list); },
    clearInbox() { set("inbox", []); },
  };
  CS.store = store;
})();
