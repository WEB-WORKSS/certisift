/* Early-access form: validation, then POST to CS.business.formEndpoint if set, otherwise a pre-filled
   email to the business address. Never shows success for a request that was not sent. */
(function () {
  const form = document.querySelector("[data-lead-form]");
  if (!form) return;
  const B = CS.business, EMAIL = B.email.value, ENDPOINT = B.formEndpoint;
  const $ = (s) => form.querySelector(s);
  const status = $("[data-status]");
  const plan = new URLSearchParams(location.search).get("plan");
  if (plan && [...form.plan.options].some((o) => o.text === plan)) form.plan.value = plan;
  form.message.addEventListener("input", () => { $("[data-count]").textContent = form.message.value.length; });
  const FREE = /@(gmail|googlemail|yahoo|hotmail|outlook|live|icloud|aol|proton|protonmail|gmx|mail)\./i;
  const setErr = (k, m) => { const el = $(`[data-err="${k}"]`); if (el) el.textContent = m || ""; const i = form.elements[k]; if (i) i.setAttribute("aria-invalid", m ? "true" : "false"); };
  if (!ENDPOINT && EMAIL) { const n = document.createElement("p"); n.className = "hint"; n.textContent = `Your request opens as a pre-filled email to ${EMAIL}.`; $("[data-submit]").after(n); }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (form.website.value) return; // honeypot
    const v = Object.fromEntries(new FormData(form));
    const errs = {
      name: (v.name || "").trim().length < 2 && "Please enter your full name.",
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v.email || "").trim()) ? "Enter a valid email address." : FREE.test(v.email) && "Please use your work email.",
      company: !(v.company || "").trim() && "Company is required.",
      size: !v.size && "Select a company size.",
      use: !v.use && "Select a primary use case.",
      message: !(v.message || "").trim() && "Tell us briefly what you need to verify.",
      consent: !v.consent && "Please agree so we can reply to you.",
    };
    Object.entries(errs).forEach(([k, m]) => setErr(k, m));
    const first = Object.keys(errs).find((k) => errs[k]);
    if (first) { form.elements[first].focus(); status.textContent = ""; return; }
    const p = { name: v.name.trim(), email: v.email.trim(), company: v.company.trim(), role: (v.role || "").trim(), companySize: v.size, plan: v.plan || "", useCase: v.use, message: v.message.trim(), consent: true, source: B.domain.value };
    const btn = $("[data-submit]"); btn.disabled = true; status.className = "form-status"; status.textContent = "Sending…";
    if (ENDPOINT) {
      try {
        const r = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(p) });
        if (!r.ok) throw new Error(String(r.status));
        form.innerHTML = `<div class="form-msg ok">Thanks, your request was sent. We'll reply to ${p.email.replace(/</g, "&lt;")}.</div>`;
      } catch { status.className = "form-status form-msg err"; status.textContent = EMAIL ? `We couldn't send your request. Please email ${EMAIL} directly.` : "We couldn't send your request. Please try again later."; btn.disabled = false; }
      return;
    }
    if (EMAIL) {
      const body = `Name: ${p.name}\nEmail: ${p.email}\nCompany: ${p.company}\nRole: ${p.role || "-"}\nCompany size: ${p.companySize}\nPlan of interest: ${p.plan || "-"}\nPrimary use case: ${p.useCase}\n\n${p.message}`;
      location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`${B.name} early access: ${p.company}`)}&body=${encodeURIComponent(body)}`;
      status.textContent = `Your email app should have opened with the request ready. Press send there. If nothing opened, email ${EMAIL}.`;
      btn.disabled = false; return;
    }
    status.className = "form-status form-msg err";
    status.textContent = "The request form isn't connected yet, so nothing was sent. Please try again later.";
    btn.disabled = false;
  });
})();
