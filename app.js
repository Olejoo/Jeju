const $ = (id) => document.getElementById(id);
const peso = (n) => "₱" + Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = (n) => String(parseFloat(Number(n).toFixed(4)));
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- Navigation & theme ---------- */
function show(v) {
  document.querySelectorAll(".view").forEach((s) => s.classList.toggle("active", s.id === "view-" + v));
  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === v));
  try { location.hash = v; } catch (e) {}
  window.scrollTo(0, 0);
}
document.querySelectorAll("[data-view]").forEach((el) => el.addEventListener("click", () => show(el.dataset.view)));
$("logo").addEventListener("click", () => show("home"));

function setTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem("calclab-theme", t); } catch (e) {}
}
$("theme").addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
try { setTheme(localStorage.getItem("calclab-theme") || "light"); } catch (e) {}

/* ---------- 1: Unit converter (live) ---------- */
const MODES = {
  cf: { label: "Celsius → Fahrenheit", unit: "°F", fn: (v) => v * 9 / 5 + 32, f: (v, r) => `(${v} × 9/5) + 32 = ${r}`, rev: "fc" },
  fc: { label: "Fahrenheit → Celsius", unit: "°C", fn: (v) => (v - 32) * 5 / 9, f: (v, r) => `(${v} − 32) × 5/9 = ${r}`, rev: "cf" },
  mf: { label: "Meters → Feet", unit: "ft", fn: (v) => v * 3.28084, f: (v, r) => `${v} × 3.28084 = ${r}`, rev: "fm" },
  fm: { label: "Feet → Meters", unit: "m", fn: (v) => v / 3.28084, f: (v, r) => `${v} ÷ 3.28084 = ${r}`, rev: "mf" },
};
let mode = "cf";
function convert() {
  const m = MODES[mode];
  $("u-label").textContent = m.label;
  const raw = $("u-in").value.trim();
  const v = parseFloat(raw);
  if (raw === "" || isNaN(v)) {
    $("u-err").textContent = raw === "" ? "" : "Numbers only please.";
    $("u-out").textContent = "—";
    $("u-f").textContent = "Type a value to convert.";
    return;
  }
  $("u-err").textContent = "";
  const r = num(m.fn(v));
  $("u-out").textContent = `${r} ${m.unit}`;
  $("u-f").textContent = m.f(num(v), r);
}
function setMode(k) {
  mode = k;
  document.querySelectorAll("#u-pick button").forEach((b) => b.classList.toggle("on", b.dataset.m === k));
  convert();
}
document.querySelectorAll("#u-pick button").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.m)));
$("u-swap").addEventListener("click", () => setMode(MODES[mode].rev));
$("u-in").addEventListener("input", convert);

/* ---------- 2: Income tax ---------- */
function bracket(i) {
  if (i <= 250000)  return [0, 0, "0% — within the ₱250,000 tax-free band"];
  if (i <= 400000)  return [1, 0.20 * (i - 250000), "20% × (income − ₱250,000)"];
  if (i <= 800000)  return [2, 30000 + 0.25 * (i - 400000), "₱30,000 + 25% × (income − ₱400,000)"];
  if (i <= 2000000) return [3, 130000 + 0.30 * (i - 800000), "₱130,000 + 30% × (income − ₱800,000)"];
  if (i <= 8000000) return [4, 490000 + 0.32 * (i - 2000000), "₱490,000 + 32% × (income − ₱2,000,000)"];
  return [5, 2410000 + 0.35 * (i - 8000000), "₱2,410,000 + 35% × (income − ₱8,000,000)"];
}
function computeTax() {
  const raw = $("t-in").value.trim();
  const income = parseFloat(raw);
  if (raw === "" || isNaN(income) || income < 0) { $("t-err").textContent = "Enter a valid income (0 or more)."; return; }
  $("t-err").textContent = "";
  const [idx, tax, rule] = bracket(income);
  $("t-out").textContent = peso(tax);
  $("t-f").textContent = rule;
  [...$("t-body").rows].forEach((r, k) => r.classList.toggle("hit", k === idx));
}
$("t-go").addEventListener("click", computeTax);
$("t-in").addEventListener("keydown", (e) => e.key === "Enter" && computeTax());

/* ---------- 3: Loops ---------- */
function runLoops() {
  const raw = $("a-in").value.trim();
  const n = Number(raw);
  if (raw === "" || !Number.isInteger(n) || n < 1) { $("a-err").textContent = "Enter a positive whole number."; return; }
  if (n > 500) { $("a-err").textContent = "Keep N at 500 or below."; return; }
  $("a-err").textContent = "";

  // Factorial — while loop
  let fact = 1n, i = 1n;
  while (i <= BigInt(n)) { fact *= i; i++; }

  // Sum — do-while loop
  let sum = 0, j = 1;
  do { sum += j; j++; } while (j <= n);

  // Average — for loop
  let total = 0;
  for (let k = 1; k <= n; k++) { total += k; }
  const avg = total / n;

  const fs = fact.toString();
  $("a-f").textContent = fs.length > 18 ? `${fs[0]}.${fs.slice(1, 6)}e+${fs.length - 1}` : fact.toLocaleString("en-US");
  $("a-f").title = fs;
  $("a-s").textContent = sum.toLocaleString("en-US");
  $("a-a").textContent = avg.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
$("a-go").addEventListener("click", runLoops);
$("a-in").addEventListener("keydown", (e) => e.key === "Enter" && runLoops());

/* ---------- 4: Payroll ---------- */
const rows = [];
function draw() {
  $("p-body").innerHTML = rows.map((r, i) => `<tr>
    <td>${i + 1}</td><td>${esc(r.name)}</td><td class="r">${r.days}</td><td class="r">${peso(r.rate)}</td>
    <td class="r">${peso(r.gross)}</td><td class="r">${peso(r.ded)}</td><td class="r"><b>${peso(r.net)}</b></td>
    <td><button class="x" data-i="${i}" title="Delete">×</button></td></tr>`).join("");
  $("p-empty").style.display = rows.length ? "none" : "block";
  $("s-n").textContent = rows.length;
  $("s-g").textContent = peso(rows.reduce((s, r) => s + r.gross, 0));
  $("s-t").textContent = peso(rows.reduce((s, r) => s + r.net, 0));
}
$("p-add").addEventListener("click", () => {
  const name = $("p-name").value.trim();
  const days = parseFloat($("p-days").value);
  const rate = parseFloat($("p-rate").value);
  const ded = $("p-ded").value.trim() === "" ? 0 : parseFloat($("p-ded").value);
  if (!name) return ($("p-err").textContent = "Name is required.");
  if ([days, rate, ded].some((x) => isNaN(x) || x < 0)) return ($("p-err").textContent = "Days, rate and deduction must be numbers (0 or more).");
  const gross = days * rate;
  if (ded > gross) return ($("p-err").textContent = "Deduction can't be bigger than gross pay.");
  $("p-err").textContent = "";
  rows.push({ name, days, rate, gross, ded, net: gross - ded });
  ["p-name", "p-days", "p-rate", "p-ded"].forEach((id) => ($(id).value = ""));
  draw();
});
$("p-body").addEventListener("click", (e) => {
  const b = e.target.closest(".x");
  if (b) { rows.splice(Number(b.dataset.i), 1); draw(); }
});
$("p-del").addEventListener("click", () => {
  const n = parseInt($("p-line").value, 10);
  if (isNaN(n) || n < 1 || n > rows.length) return ($("p-derr").textContent = rows.length ? `Pick a line from 1 to ${rows.length}.` : "Nothing to delete yet.");
  $("p-derr").textContent = "";
  rows.splice(n - 1, 1);
  $("p-line").value = "";
  draw();
});

/* ---------- Init ---------- */
draw();
convert();
const h = (location.hash || "").slice(1);
show(["unit", "tax", "arith", "payroll"].includes(h) ? h : "home");
