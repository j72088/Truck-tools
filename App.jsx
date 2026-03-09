import React, { useEffect, useMemo, useState } from "react";
import {
  Calculator,
  Route,
  Wallet,
  Truck,
  Save,
  Mail,
  BarChart3,
  ShieldCheck,
  History,
  Trash2,
} from "lucide-react";

function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="section-title">
      <div className="section-title-row">
        <div className="section-icon-wrap">
          <Icon className="section-icon" />
        </div>
        <h2>{title}</h2>
      </div>
      <p>{subtitle}</p>
    </div>
  );
}

function Field({ label, value, onChange, type = "number", step = "any", placeholder = "" }) {
  return (
    <label className="field">
      <div className="field-label">{label}</div>
      <input
        type={type}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
    </label>
  );
}

function Stat({ label, value, good = false, bad = false }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${good ? "good" : ""} ${bad ? "bad" : ""}`}>{value}</div>
    </div>
  );
}

function money(n) {
  const v = Number(n || 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
}

function number(n, digits = 2) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(Number(n || 0));
}

const HISTORY_KEY = "trucker-tools-history-v1";

export default function App() {
  const [tripMiles, setTripMiles] = useState(850);
  const [ratePerMile, setRatePerMile] = useState(2.35);
  const [fuelPrice, setFuelPrice] = useState(3.69);
  const [mpg, setMpg] = useState(7.2);
  const [tolls, setTolls] = useState(45);
  const [maintenance, setMaintenance] = useState(120);
  const [otherCosts, setOtherCosts] = useState(60);

  const [totalCosts, setTotalCosts] = useState(1240);
  const [cpmMiles, setCpmMiles] = useState(640);

  const [payMiles, setPayMiles] = useState(2400);
  const [centsPerMile, setCentsPerMile] = useState(58);
  const [bonuses, setBonuses] = useState(125);
  const [deductions, setDeductions] = useState(140);

  const [routeMiles, setRouteMiles] = useState(1200);
  const [hotel, setHotel] = useState(110);
  const [food, setFood] = useState(75);
  const [savedHistory, setSavedHistory] = useState([]);

  const trip = useMemo(() => {
    const gross = Number(tripMiles) * Number(ratePerMile);
    const gallons = Number(tripMiles) / Math.max(Number(mpg), 0.01);
    const fuelCost = gallons * Number(fuelPrice);
    const totalExpense = fuelCost + Number(tolls) + Number(maintenance) + Number(otherCosts);
    const net = gross - totalExpense;
    return { gross, gallons, fuelCost, totalExpense, net };
  }, [tripMiles, ratePerMile, fuelPrice, mpg, tolls, maintenance, otherCosts]);

  const cpm = useMemo(() => {
    const perMile = Number(totalCosts) / Math.max(Number(cpmMiles), 1);
    return { perMile };
  }, [totalCosts, cpmMiles]);

  const paycheck = useMemo(() => {
    const gross = Number(payMiles) * (Number(centsPerMile) / 100) + Number(bonuses);
    const net = gross - Number(deductions);
    return { gross, net };
  }, [payMiles, centsPerMile, bonuses, deductions]);

  const route = useMemo(() => {
    const gallons = Number(routeMiles) / Math.max(Number(mpg), 0.01);
    const fuelCost = gallons * Number(fuelPrice);
    const total = fuelCost + Number(tolls) + Number(hotel) + Number(food);
    return { fuelCost, total };
  }, [routeMiles, mpg, fuelPrice, tolls, hotel, food]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setSavedHistory(JSON.parse(raw));
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(savedHistory));
    } catch {
      // ignore storage errors
    }
  }, [savedHistory]);

  function saveResult(type, summary) {
    const item = {
      id: `${type}-${Date.now()}`,
      type,
      summary,
      createdAt: new Date().toLocaleString(),
    };
    setSavedHistory((prev) => [item, ...prev].slice(0, 12));
  }

  function clearHistory() {
    setSavedHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // ignore storage errors
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <div>
            <div className="brand-row">
              <Truck className="brand-icon" />
              <div className="brand-name">Trucker Tools</div>
            </div>
            <div className="brand-subtitle">Free trucking calculators built for web first, app-ready later</div>
          </div>
          <div className="pill-row desktop-only">
            <span className="pill">Free</span>
            <span className="pill">Mobile Friendly</span>
            <span className="pill">PWA Ready</span>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section container two-col">
          <div>
            <div className="hero-badge">Free-first foundation</div>
            <h1>
              Free trucking calculators that help drivers figure out <span>profit, pay, and route cost</span>
            </h1>
            <p className="hero-copy">
              This site is built to attract repeat users with genuinely useful tools. It is designed so it can later expand into Android and iPhone apps with saved history, premium exports, and more advanced features.
            </p>
            <div className="cta-row">
              <a href="#calculators" className="button primary">Use Calculators</a>
              <a href="#monetize" className="button secondary">See How It Makes Money</a>
            </div>
            <div className="feature-grid compact-grid">
              {[
                "Trip Profit Calculator",
                "Cost Per Mile Calculator",
                "Paycheck Calculator",
                "Route Cost Calculator",
              ].map((item) => (
                <div key={item} className="mini-card">{item}</div>
              ))}
            </div>
          </div>

          <Card className="gradient-card padded">
            <div className="muted-small">Why this is the right start</div>
            <div className="stack-list top-gap">
              {[
                "Useful tools can bring search traffic and repeat visits.",
                "The website can be hosted free to start.",
                "The same codebase can later become Android and iPhone apps.",
                "Premium features can be added later without rebuilding everything.",
              ].map((x) => (
                <div key={x} className="stack-item">{x}</div>
              ))}
            </div>
          </Card>
        </section>

        <section id="calculators" className="container grid-two cards-section">
          <Card className="padded">
            <SectionTitle icon={Calculator} title="Trip Profit Calculator" subtitle="Estimate gross revenue, fuel, expenses, and net profit for a trip." />
            <div className="form-grid">
              <Field label="Trip miles" value={tripMiles} onChange={(e) => setTripMiles(e.target.value)} />
              <Field label="Rate per mile ($)" value={ratePerMile} onChange={(e) => setRatePerMile(e.target.value)} />
              <Field label="Fuel price per gallon ($)" value={fuelPrice} onChange={(e) => setFuelPrice(e.target.value)} />
              <Field label="Miles per gallon" value={mpg} onChange={(e) => setMpg(e.target.value)} />
              <Field label="Tolls ($)" value={tolls} onChange={(e) => setTolls(e.target.value)} />
              <Field label="Maintenance estimate ($)" value={maintenance} onChange={(e) => setMaintenance(e.target.value)} />
              <div className="span-2"><Field label="Other costs ($)" value={otherCosts} onChange={(e) => setOtherCosts(e.target.value)} /></div>
            </div>
            <div className="stats-grid three-up top-gap">
              <Stat label="Gross revenue" value={money(trip.gross)} />
              <Stat label="Fuel gallons" value={number(trip.gallons)} />
              <Stat label="Fuel cost" value={money(trip.fuelCost)} bad={trip.fuelCost > trip.gross * 0.45} />
              <Stat label="Total expenses" value={money(trip.totalExpense)} />
              <Stat label="Net profit" value={money(trip.net)} good={trip.net >= 0} bad={trip.net < 0} />
              <Stat label="Profit per mile" value={money(trip.net / Math.max(Number(tripMiles), 1))} good={trip.net >= 0} bad={trip.net < 0} />
            </div>
            <div className="actions-row end top-gap">
              <button
                onClick={() => saveResult("Trip Profit", `Net ${money(trip.net)} on ${number(tripMiles, 0)} miles | Gross ${money(trip.gross)} | Expenses ${money(trip.totalExpense)}`)}
                className="button primary"
              >
                Save Trip Result
              </button>
            </div>
          </Card>

          <Card className="padded">
            <SectionTitle icon={BarChart3} title="Cost Per Mile Calculator" subtitle="Figure out your break-even cost per mile." />
            <div className="form-grid two-col-form">
              <Field label="Total costs ($)" value={totalCosts} onChange={(e) => setTotalCosts(e.target.value)} />
              <Field label="Total miles" value={cpmMiles} onChange={(e) => setCpmMiles(e.target.value)} />
            </div>
            <div className="stats-grid two-up top-gap">
              <Stat label="Cost per mile" value={money(cpm.perMile)} />
              <Stat label="Break-even rate" value={money(cpm.perMile)} />
            </div>
            <div className="actions-row end top-gap">
              <button
                onClick={() => saveResult("Cost Per Mile", `Break-even ${money(cpm.perMile)} per mile from ${money(totalCosts)} over ${number(cpmMiles, 0)} miles`)}
                className="button primary"
              >
                Save CPM Result
              </button>
            </div>

            <div className="nested-section">
              <SectionTitle icon={Wallet} title="Paycheck Calculator" subtitle="Estimate gross and net driver pay based on miles, CPM, bonuses, and deductions." />
              <div className="form-grid two-col-form">
                <Field label="Miles driven" value={payMiles} onChange={(e) => setPayMiles(e.target.value)} />
                <Field label="Cents per mile" value={centsPerMile} onChange={(e) => setCentsPerMile(e.target.value)} />
                <Field label="Bonuses ($)" value={bonuses} onChange={(e) => setBonuses(e.target.value)} />
                <Field label="Deductions ($)" value={deductions} onChange={(e) => setDeductions(e.target.value)} />
              </div>
              <div className="stats-grid two-up top-gap">
                <Stat label="Gross pay" value={money(paycheck.gross)} />
                <Stat label="Estimated net" value={money(paycheck.net)} good={paycheck.net >= 0} bad={paycheck.net < 0} />
              </div>
              <div className="actions-row end top-gap">
                <button
                  onClick={() => saveResult("Paycheck", `Estimated net ${money(paycheck.net)} | Gross ${money(paycheck.gross)} | ${number(payMiles, 0)} miles at ${number(centsPerMile, 0)} CPM`)}
                  className="button primary"
                >
                  Save Paycheck Result
                </button>
              </div>
            </div>
          </Card>

          <Card className="padded span-full">
            <SectionTitle icon={Route} title="Route Cost Calculator" subtitle="Estimate the cost of a trip including fuel, tolls, food, and hotel." />
            <div className="form-grid three-col-form">
              <Field label="Route miles" value={routeMiles} onChange={(e) => setRouteMiles(e.target.value)} />
              <Field label="Hotel ($)" value={hotel} onChange={(e) => setHotel(e.target.value)} />
              <Field label="Food ($)" value={food} onChange={(e) => setFood(e.target.value)} />
            </div>
            <div className="stats-grid three-up top-gap">
              <Stat label="Fuel cost" value={money(route.fuelCost)} />
              <Stat label="Trip total" value={money(route.total)} />
              <Stat label="Cost per route mile" value={money(route.total / Math.max(Number(routeMiles), 1))} />
            </div>
            <div className="actions-row end top-gap">
              <button
                onClick={() => saveResult("Route Cost", `Route total ${money(route.total)} | Fuel ${money(route.fuelCost)} | ${number(routeMiles, 0)} miles`)}
                className="button primary"
              >
                Save Route Result
              </button>
            </div>
          </Card>
        </section>

        <section className="container cards-section">
          <Card className="padded">
            <SectionTitle icon={History} title="Saved History" subtitle="Your recent saved calculator results are stored locally in this browser for quick reference." />
            <div className="actions-row between wrap-gap bottom-gap">
              <div className="muted-small">Stored locally on this device/browser</div>
              <button onClick={clearHistory} className="button secondary icon-button">
                <Trash2 className="small-icon" />
                Clear History
              </button>
            </div>
            {savedHistory.length === 0 ? (
              <div className="empty-state">No saved results yet. Use any calculator above and hit its save button.</div>
            ) : (
              <div className="history-grid">
                {savedHistory.map((item) => (
                  <div key={item.id} className="history-item">
                    <div className="history-head">
                      <div className="history-type">{item.type}</div>
                      <div className="history-date">{item.createdAt}</div>
                    </div>
                    <div className="history-summary">{item.summary}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>

        <section id="monetize" className="container grid-two cards-section">
          <Card className="padded">
            <SectionTitle icon={Save} title="Future Premium Features" subtitle="These are not turned on yet, but this site is structured to grow into them." />
            <div className="feature-grid">
              {[
                "Saved calculation history",
                "Export to PDF or CSV",
                "Weekly trip tracking",
                "Fuel and maintenance logs",
                "Advanced profit dashboard",
                "App sync across devices",
              ].map((item) => (
                <div key={item} className="mini-card">{item}</div>
              ))}
            </div>
          </Card>

          <Card className="padded">
            <SectionTitle icon={Mail} title="How This Can Make Money" subtitle="The free version brings traffic first. Monetization can be layered in later." />
            <div className="stack-list">
              <div className="stack-item">Affiliate links for fuel cards, GPS, trucking products, and finance tools</div>
              <div className="stack-item">Ads later after traffic exists</div>
              <div className="stack-item">Email capture for repeat traffic and future offers</div>
              <div className="stack-item">Premium upgrade in the eventual Android/iPhone app</div>
            </div>
          </Card>
        </section>

        <section className="container bottom-section">
          <Card className="padded wide-gradient">
            <div className="two-col bottom-grid">
              <div>
                <div className="trust-row">
                  <ShieldCheck className="small-icon green" />
                  <span>Built to start free</span>
                </div>
                <h3>This is the right first version</h3>
                <p>
                  You now have a clear website foundation with real calculator logic, a clean landing page, a monetization path, and an app-ready direction. The next step is turning this into a polished production site and optionally adding saved history and exports.
                </p>
              </div>
              <div className="side-box">
                <div className="muted-small">Best next upgrades</div>
                <div className="stack-list top-gap">
                  <div className="stack-item">Add saved results</div>
                  <div className="stack-item">Add a privacy policy and terms</div>
                  <div className="stack-item">Add SEO pages around each calculator</div>
                  <div className="stack-item">Turn it into a PWA and deploy it</div>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
