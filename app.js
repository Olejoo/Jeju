/* ============ Helpers ============ */
const $ = (id) => document.getElementById(id);
const peso = (n) => "₱" + Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const trim = (n) => String(parseFloat(Number(n).toFixed(4)));

/* ============ Navigation & theme ============ */
function show(view) {
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + view));
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === view));
  try { location.hash = view; } catch (e) {}
  window.scrollTo(0, 0);
}
document.querySelectorAll("[data-view]").forEach((el) => el.addEventListener("click", () => show(el.dataset.view)));
$("homeLink").addEventListener("click", () => show("home"));

function setTheme(t) {
  document.documentElement.dataset.theme = t;
  $("themeBtn").textContent = t === "dark" ? "☾" : "☀";
  try { localStorage.setItem("theme", t); } catch (e) {}
}
$("themeBtn").addEventListener("click", () =>
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
try { setTheme(localStorage.getItem("theme") || "light"); } catch (e) { setTheme("light"); }

/* ============ Assignment 1: Unit conversion ============ */
const UNITS = {
  c:  { name: "Celsius",    sym: "°C", to: "f",  tname: "Fahrenheit", tsym: "°F",
        fn: (v) => v * 9 / 5 + 32,  formula: (v, r) => `(${v} × 9/5) + 32 = ${r} °F` },
  f:  { name: "Fahrenheit", sym: "°F", to: "c",  tname: "Celsius",    tsym: "°C",
        fn: (v) => (v - 32) * 5 / 9, formula: (v, r) => `(${v} − 32) × 5/9 = ${r} °C` },
  m:  { name: "Meters",     sym: "m",  to: "ft", tname: "Feet",       tsym: "ft",
        fn: (v) => v * 3.28084,     formula: (v, r) => `${v} × 3.28084 = ${r} ft` },
  ft: { name: "Feet",       sym: "ft", to: "m",  tname: "Meters",     tsym: "m",
        fn: (v) => v / 3.28084,     formula: (v, r) => `${v} ÷ 3.28084 = ${r} m` },
};
let unit = "c";

function convert() {
  const raw = $("u-value").value.trim();
  const v = parseFloat(raw);
  if (raw === "" || isNaN(v)) { $("u-error").textContent = "Please enter a valid number."; return; }
  $("u-error").textContent = "";
  const u = UNITS[unit];
  const r = trim(u.fn(v));
  $("u-title").textContent = `${u.name} to ${u.tname}`;
  $("u-eq").textContent = `${trim(v)} ${u.sym} equals`;
  $("u-result").textContent = r;
  $("u-rsym").textContent = u.tsym;
  $("u-rname").textContent = u.tname;
  $("u-formula").textContent = u.formula(trim(v), r);
}
document.querySelectorAll(".unit-btn").forEach((b) =>
  b.addEventListener("click", () => {
    unit = b.dataset.unit;
    document.querySelectorAll(".unit-btn").forEach((x) => x.classList.toggle("active", x === b));
    $("u-suffix").textContent = UNITS[unit].sym;
    $("u-hint").textContent = `Converting ${UNITS[unit].name} to ${UNITS[unit].tname}`;
    if ($("u-value").value.trim() !== "") convert();
  }));
$("u-convert").addEventListener("click", convert);
$("u-value").addEventListener("keydown", (e) => e.key === "Enter" && convert());

/* ============ Assignment 2: Income tax ============ */
function computeTax(income) {
  if (income <= 250000)  return { tax: 0, text: "0% — income is within the ₱250,000 exemption." };
  if (income <= 400000)  return { tax: 0.20 * (income - 250000), text: `20% of the excess over ₱250,000` };
  if (income <= 800000)  return { tax: 30000 + 0.25 * (income - 400000), text: `₱30,000 + 25% of the excess over ₱400,000` };
  if (income <= 2000000) return { tax: 130000 + 0.30 * (income - 800000), text: `₱130,000 + 30% of the excess over ₱800,000` };
  if (income <= 8000000) return { tax: 490000 + 0.32 * (income - 2000000), text: `₱490,000 + 32% of the excess over ₱2,000,000` };
  return { tax: 2410000 + 0.35 * (income - 8000000), text: `₱2,410,000 + 35% of the excess over ₱8,000,000` };
}
function runTax() {
  const raw = $("t-income").value.trim();
  const income = parseFloat(raw);
  if (raw === "" || isNaN(income) || income < 0) {
    $("t-error").textContent = "Please enter a valid, non-negative income.";
    return;
  }
  $("t-error").textContent = "";
  const { tax, text } = computeTax(income);
  $("t-result").textContent = peso(tax);
  $("t-msg").textContent = `Taxable income: ${peso(income)}`;
  $("t-break").textContent = `Bracket used: ${text}`;
}
$("t-calc").addEventListener("click", runTax);
$("t-income").addEventListener("keydown", (e) => e.key === "Enter" && runTax());

/* ============ Assignment 3: Factorial / Sum / Average ============ */
function runArith() {
  const raw = $("a-n").value.trim();
  const n = Number(raw);
  const err = $("a-error");
  if (raw === "" || !Number.isInteger(n) || n < 1) { err.textContent = "Please enter a positive whole number."; return; }
  if (n > 500) { err.textContent = "Please use N of 500 or less."; return; }
  err.textContent = "";

  // Factorial — WHILE loop
  let fact = 1n, i = 1n;
  while (i <= BigInt(n)) { fact *= i; i++; }

  // Sum — DO-WHILE loop
  let sum = 0, j = 1;
  do { sum += j; j++; } while (j <= n);

  // Average — FOR loop
  let total = 0;
  for (let k = 1; k <= n; k++) { total += k; }
  const avg = total / n;

  $("a-fact").textContent = fact.toString().length > 30
    ? fact.toString()[0] + "." + fact.toString().slice(1, 8) + " × 10^" + (fact.toString().length - 1)
    : fact.toLocaleString("en-US");
  $("a-fact").title = fact.toString();
  $("a-sum").textContent = sum.toLocaleString("en-US");
  $("a-avg").textContent = avg.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
$("a-calc").addEventListener("click", runArith);
$("a-n").addEventListener("keydown", (e) => e.key === "Enter" && runArith());

/* ============ Assignment 4: Simple payroll ============ */
const payroll = [];
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function renderPayroll() {
  const body = $("p-body");
  body.innerHTML = payroll.map((r, i) => `
    <tr><td>${i + 1}</td><td>${esc(r.name)}</td>
    <td class="r">${r.days}</td><td class="r">${peso(r.rate)}</td>
    <td class="r">${peso(r.gross)}</td><td class="r">${peso(r.ded)}</td><td class="r"><b>${peso(r.net)}</b></td></tr>`).join("");
  if (payroll.length) {
    const g = payroll.reduce((s, r) => s + r.gross, 0);
    const d = payroll.reduce((s, r) => s + r.ded, 0);
    const n = payroll.reduce((s, r) => s + r.net, 0);
    body.innerHTML += `<tr class="totals"><td></td><td>Total</td><td></td><td></td><td class="r">${peso(g)}</td><td class="r">${peso(d)}</td><td class="r">${peso(n)}</td></tr>`;
  }
  $("p-empty").style.display = payroll.length ? "none" : "block";
  $("p-count").textContent = `${payroll.length} EMPLOYEE${payroll.length === 1 ? "" : "S"}`;
}
$("p-add").addEventListener("click", () => {
  const name = $("p-name").value.trim();
  const days = parseFloat($("p-days").value);
  const rate = parseFloat($("p-rate").value);
  const ded = $("p-ded").value.trim() === "" ? 0 : parseFloat($("p-ded").value);
  const err = $("p-error");
  if (!name) { err.textContent = "Please enter the employee name."; return; }
  if (isNaN(days) || days < 0 || isNaN(rate) || rate < 0 || isNaN(ded) || ded < 0) {
    err.textContent = "Days worked, daily rate and deduction must be valid non-negative numbers."; return;
  }
  const gross = days * rate;
  if (ded > gross) { err.textContent = "Deduction cannot be greater than gross pay."; return; }
  err.textContent = "";
  payroll.push({ name, days, rate, gross, ded, net: gross - ded });
  ["p-name", "p-days", "p-rate", "p-ded"].forEach((id) => ($(id).value = ""));
  renderPayroll();
});
$("p-del").addEventListener("click", () => {
  const line = parseInt($("p-line").value, 10);
  const err = $("p-derror");
  if (isNaN(line) || line < 1 || line > payroll.length) {
    err.textContent = payroll.length ? `Enter a line number from 1 to ${payroll.length}.` : "There are no records to delete.";
    return;
  }
  err.textContent = "";
  payroll.splice(line - 1, 1);
  $("p-line").value = "";
  renderPayroll();
});

/* ============ Init ============ */
renderPayroll();
convert();
const start = (location.hash || "").replace("#", "");
show(["unit", "tax", "arith", "payroll"].includes(start) ? start : "home");
