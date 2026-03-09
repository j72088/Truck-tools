import React, { useEffect, useMemo, useState } from "react";

const HISTORY_KEY = "trucker-tools-history";

function formatMoney(value) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

function readHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function SectionCard({ title, description, children }) {
  return (
    <section className="card">
      <div className="card-head">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </section>
  );
}

function Result({ label, value, tone = "default" }) {
  return (
    <div className={`result ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function App() {
  const [trip, setTrip] = useState({
    revenue: "",
    miles: "",
    fuelCost: "",
    otherCosts: "",
  });

  const [cpm, setCpm] = useState({
    totalCosts: "",
    miles: "",
  });

  const [pay, setPay] = useState({
    miles: "",
    rate: "",
    deductions: "",
  });

  const [route, setRoute] = useState({
    miles: "",
    mpg: "",
    fuelPrice: "",
    tolls: "",
    extras: "",
  });

  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  function persist(entry) {
    const next = [entry, ...history].slice(0, 20);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }

  function clearHistory() {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }

  const tripResult = useMemo(() => {
    const revenue = Number(trip.revenue) || 0;
    const miles = Number(trip.miles) || 0;
    const fuelCost = Number(trip.fuelCost) || 0;
    const otherCosts = Number(trip.otherCosts) || 0;

    const totalCosts = fuelCost + otherCosts;
    const profit = revenue - totalCosts;
    const profitPerMile = miles > 0 ? profit / miles : 0;

    return { totalCosts, profit, profitPerMile };
  }, [trip]);

  const cpmResult = useMemo(() => {
    const totalCosts = Number(cpm.totalCosts) || 0;
    const miles = Number(cpm.miles) || 0;
    return miles > 0 ? totalCosts / miles : 0;
  }, [cpm]);

  const payResult = useMemo(() => {
    const miles = Number(pay.miles) || 0;
    const rate = Number(pay.rate) || 0;
    const deductions = Number(pay.deductions) || 0;

    const gross = miles * rate;
    const net = gross - deductions;

    return { gross, net };
  }, [pay]);

  const routeResult = useMemo(() => {
    const miles = Number(route.miles) || 0;
    const mpg = Number(route.mpg) || 0;
    const fuelPrice = Number(route.fuelPrice) || 0;
    const tolls = Number(route.tolls) || 0;
    const extras = Number(route.extras) || 0;

    const gallons = mpg > 0 ? miles / mpg : 0;
    const fuelCost = gallons * fuelPrice;
    const total = fuelCost + tolls + extras;

    return { gallons, fuelCost, total };
  }, [route]);

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Free trucking calculators</p>
          <h1>Trucker Tools</h1>
          <p className="hero-copy">
            Quick numbers for loads, routes, pay, and operating costs. Built to
            be simple, fast, and easy to use on mobile.
          </p>
        </div>

        <div className="hero-panel">
          <div>
            <strong>Included tools</strong>
            <p>Trip Profit, Cost Per Mile, Paycheck, and Route Cost</p>
          </div>
          <div>
            <strong>Saved locally</strong>
            <p>Your recent calculations stay in your browser on this device.</p>
          </div>
        </div>
      </header>

      <main className="grid">
        <SectionCard
          title="Trip Profit Calculator"
          description="Estimate profit after fuel and other trip expenses."
        >
          <div className="form-grid">
            <label>
              <span>Load revenue</span>
              <input
                type="number"
                value={trip.revenue}
                onChange={(e) => setTrip({ ...trip, revenue: e.target.value })}
              />
            </label>

            <label>
              <span>Total miles</span>
              <input
                type="number"
                value={trip.miles}
                onChange={(e) => setTrip({ ...trip, miles: e.target.value })}
              />
            </label>

            <label>
              <span>Fuel cost</span>
              <input
                type="number"
                value={trip.fuelCost}
                onChange={(e) =>
                  setTrip({ ...trip, fuelCost: e.target.value })
                }
              />
            </label>

            <label>
              <span>Other costs</span>
              <input
                type="number"
                value={trip.otherCosts}
                onChange={(e) =>
                  setTrip({ ...trip, otherCosts: e.target.value })
                }
              />
            </label>
          </div>

          <div className="results-grid">
            <Result
              label="Total costs"
              value={formatMoney(tripResult.totalCosts)}
            />
            <Result
              label="Profit"
              value={formatMoney(tripResult.profit)}
              tone={tripResult.profit >= 0 ? "good" : "bad"}
            />
            <Result
              label="Profit per mile"
              value={formatMoney(tripResult.profitPerMile)}
            />
          </div>

          <button
            className="save-btn"
            onClick={() =>
              persist({
                type: "Trip Profit",
                summary: `Profit ${formatMoney(tripResult.profit)}`,
                time: new Date().toLocaleString(),
              })
            }
          >
            Save result
          </button>
        </SectionCard>

        <SectionCard
          title="Cost Per Mile Calculator"
          description="Break down operating cost by the mile."
        >
          <div className="form-grid">
            <label>
              <span>Total operating costs</span>
              <input
                type="number"
                value={cpm.totalCosts}
                onChange={(e) =>
                  setCpm({ ...cpm, totalCosts: e.target.value })
                }
              />
            </label>

            <label>
              <span>Total miles</span>
              <input
                type="number"
                value={cpm.miles}
                onChange={(e) => setCpm({ ...cpm, miles: e.target.value })}
              />
            </label>
          </div>

          <div className="results-grid">
            <Result label="Cost per mile" value={formatMoney(cpmResult)} />
          </div>

          <button
            className="save-btn"
            onClick={() =>
              persist({
                type: "Cost Per Mile",
                summary: `CPM ${formatMoney(cpmResult)}`,
                time: new Date().toLocaleString(),
              })
            }
          >
            Save result
          </button>
        </SectionCard>

        <SectionCard
          title="Paycheck Calculator"
          description="Estimate gross and net pay from miles and rate."
        >
          <div className="form-grid">
            <label>
              <span>Miles driven</span>
              <input
                type="number"
                value={pay.miles}
                onChange={(e) => setPay({ ...pay, miles: e.target.value })}
              />
            </label>

            <label>
              <span>Rate per mile</span>
              <input
                type="number"
                step="0.01"
                value={pay.rate}
                onChange={(e) => setPay({ ...pay, rate: e.target.value })}
              />
            </label>

            <label>
              <span>Deductions</span>
              <input
                type="number"
                value={pay.deductions}
                onChange={(e) =>
                  setPay({ ...pay, deductions: e.target.value })
                }
              />
            </label>
          </div>

          <div className="results-grid">
            <Result label="Gross pay" value={formatMoney(payResult.gross)} />
            <Result
              label="Estimated net"
              value={formatMoney(payResult.net)}
              tone={payResult.net >= 0 ? "good" : "bad"}
            />
          </div>

          <button
            className="save-btn"
            onClick={() =>
              persist({
                type: "Paycheck",
                summary: `Net ${formatMoney(payResult.net)}`,
                time: new Date().toLocaleString(),
              })
            }
          >
            Save result
          </button>
        </SectionCard>

        <SectionCard
          title="Route Cost Calculator"
          description="Estimate fuel, tolls, and extra route expenses."
        >
          <div className="form-grid">
            <label>
              <span>Route miles</span>
              <input
                type="number"
                value={route.miles}
                onChange={(e) => setRoute({ ...route, miles: e.target.value })}
              />
            </label>

            <label>
              <span>Truck MPG</span>
              <input
                type="number"
                step="0.1"
                value={route.mpg}
                onChange={(e) => setRoute({ ...route, mpg: e.target.value })}
              />
            </label>

            <label>
              <span>Fuel price</span>
              <input
                type="number"
                step="0.01"
                value={route.fuelPrice}
                onChange={(e) =>
                  setRoute({ ...route, fuelPrice: e.target.value })
                }
              />
            </label>

            <label>
              <span>Tolls</span>
              <input
                type="number"
                value={route.tolls}
                onChange={(e) => setRoute({ ...route, tolls: e.target.value })}
              />
            </label>

            <label>
              <span>Other extras</span>
              <input
                type="number"
                value={route.extras}
                onChange={(e) =>
                  setRoute({ ...route, extras: e.target.value })
                }
              />
            </label>
          </div>

          <div className="results-grid">
            <Result
              label="Estimated gallons"
              value={routeResult.gallons.toFixed(2)}
            />
            <Result
              label="Fuel cost"
              value={formatMoney(routeResult.fuelCost)}
            />
            <Result
              label="Total route cost"
              value={formatMoney(routeResult.total)}
            />
          </div>

          <button
            className="save-btn"
            onClick={() =>
              persist({
                type: "Route Cost",
                summary: `Route ${formatMoney(routeResult.total)}`,
                time: new Date().toLocaleString(),
              })
            }
          >
            Save result
          </button>
        </SectionCard>
      </main>

      <section className="history card">
        <div className="card-head row">
          <div>
            <h2>Saved history</h2>
            <p>Stored only in this browser on this device.</p>
          </div>
          <button className="clear-btn" onClick={clearHistory}>
            Clear
          </button>
        </div>

        {history.length === 0 ? (
          <p className="empty">No saved calculations yet.</p>
        ) : (
          <ul className="history-list">
            {history.map((item, idx) => (
              <li key={`${item.time}-${idx}`}>
                <strong>{item.type}</strong>
                <span>{item.summary}</span>
                <small>{item.time}</small>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="footer">
        <span>Trucker Tools</span>
        <span>Free calculators for everyday trucking numbers.</span>
      </footer>
    </div>
  );
}
