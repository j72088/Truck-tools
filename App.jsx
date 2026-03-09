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
}  const [route, setRoute] = useState({
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
                onChange={(e) =>
                  setTrip({ ...trip, revenue: e.target.value })
                }
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
  const cpmResult = useMemo(() => {
    const totalCosts = Number(cpm.totalCosts) || 0
    const miles = Number(cpm.miles) || 0
    return miles > 0 ? totalCosts / miles : 0
  }, [cpm])

  const payResult = useMemo(() => {
    const miles = Number(pay.miles) || 0
    const rate = Number(pay.rate) || 0
    const deductions = Number(pay.deductions) || 0
    const gross = miles * rate
    const net = gross - deductions
    return { gross, net }
  }, [pay])

  const routeResult = useMemo(() => {
    const miles = Number(route.miles) || 0
    const mpg = Number(route.mpg) || 0
    const fuelPrice = Number(route.fuelPrice) || 0
    const tolls = Number(route.tolls) || 0
    const extras = Number(route.extras) || 0
    const gallons = mpg > 0 ? miles / mpg : 0
    const fuelCost = gallons * fuelPrice
    const total = fuelCost + tolls + extras
    return { gallons, fuelCost, total }
  }, [route])

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Free trucking calculators</p>
          <h1>Trucker Tools</h1>
          <p className="hero-copy">
            Quick numbers for loads, routes, pay, and operating costs. Built to be simple, fast, and easy to use on mobile.
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
        <SectionCard title="Trip Profit Calculator" description="Estimate profit after fuel and other trip expenses.">
          <div className="form-grid">
            <label><span>Load revenue</span><input type="number" value={trip.revenue} onChange={(e) => setTrip({ ...trip, revenue: e.target.value })} /></label>
            <label><span>Total miles</span><input type="number" value={trip.miles} onChange={(e) => setTrip({ ...trip, miles: e.target.value })} /></label>
            <label><span>Fuel cost</span><input type="number" value={trip.fuelCost} onChange={(e) => setTrip({ ...trip, fuelCost: e.target.value })} /></label>
            <label><span>Other costs</span><input type="number" value={trip.otherCosts} onChange={(e) => setTrip({ ...trip, otherCosts: e.target.value })} /></label>
          </div>
          <div className="results-grid">
            <Result label="Total costs" value={formatMoney(tripResult.totalCosts)} />
            <Result label="Profit" value={formatMoney(tripResult.profit)} tone={tripResult.profit >= 0 ? 'good' : 'bad'} />
            <Result label="Profit per mile" value={formatMoney(tripResult.profitPerMile)} />
          </div>
          <button className="save-btn" onClick={() => persist({ type: 'Trip Profit', summary: `Profit ${formatMoney(tripResult.profit)}`, time: new Date().toLocaleString() })}>Save result</button>
        </SectionCard>

        <SectionCard title="Cost Per Mile Calculator" description="Break down operating cost by the mile.">
          <div className="form-grid">
            <label><span>Total operating costs</span><input type="number" value={cpm.totalCosts} onChange={(e) => setCpm({ ...cpm, totalCosts: e.target.value })} /></label>
            <label><span>Total miles</span><input type="number" value={cpm.miles} onChange={(e) => setCpm({ ...cpm, miles: e.target.value })} /></label>
          </div>
          <div className="results-grid">
            <Result label="Cost per mile" value={formatMoney(cpmResult)} />
          </div>
          <button className="save-btn" onClick={() => persist({ type: 'Cost Per Mile', summary: `CPM ${formatMoney(cpmResult)}`, time: new Date().toLocaleString() })}>Save result</button>
        </SectionCard>

        <SectionCard title="Paycheck Calculator" description="Estimate gross and net pay from miles and rate.">
          <div className="form-grid">
            <label><span>Miles driven</span><input type="number" value={pay.miles} onChange={(e) => setPay({ ...pay, miles: e.target.value })} /></label>
            <label><span>Rate per mile</span><input type="number" step="0.01" value={pay.rate} onChange={(e) => setPay({ ...pay, rate: e.target.value })} /></label>
            <label><span>Deductions</span><input type="number" value={pay.deductions} onChange={(e) => setPay({ ...pay, deductions: e.target.value })} /></label>
          </div>
          <div className="results-grid">
            <Result label="Gross pay" value={formatMoney(payResult.gross)} />
            <Result label="Estimated net" value={formatMoney(payResult.net)} tone={payResult.net >= 0 ? 'good' : 'bad'} />
          </div>
          <button className="save-btn" onClick={() => persist({ type: 'Paycheck', summary: `Net ${formatMoney(payResult.net)}`, time: new Date().toLocaleString() })}>Save result</button>
        </SectionCard>

        <SectionCard title="Route Cost Calculator" description="Estimate fuel, tolls, and extra route expenses.">
          <div className="form-grid">
            <label><span>Route miles</span><input type="number" value={route.miles} onChange={(e) => setRoute({ ...route, miles: e.target.value })} /></label>
            <label><span>Truck MPG</span><input type="number" step="0.1" value={route.mpg} onChange={(e) => setRoute({ ...route, mpg: e.target.value })} /></label>
            <label><span>Fuel price</span><input type="number" step="0.01" value={route.fuelPrice} onChange={(e) => setRoute({ ...route, fuelPrice: e.target.value })} /></label>
            <label><span>Tolls</span><input type="number" value={route.tolls} onChange={(e) => setRoute({ ...route, tolls: e.target.value })} /></label>
            <label><span>Other extras</span><input type="number" value={route.extras} onChange={(e) => setRoute({ ...route, extras: e.target.value })} /></label>
          </div>
          <div className="results-grid">
            <Result label="Estimated gallons" value={routeResult.gallons.toFixed(2)} />
            <Result label="Fuel cost" value={formatMoney(routeResult.fuelCost)} />
            <Result label="Total route cost" value={formatMoney(routeResult.total)} />
          </div>
          <button className="save-btn" onClick={() => persist({ type: 'Route Cost', summary: `Route ${formatMoney(routeResult.total)}`, time: new Date().toLocaleString() })}>Save result</button>
        </SectionCard>
      </main>

      <section className="history card">
        <div className="card-head row">
          <div>
            <h2>Saved history</h2>
            <p>Stored only in this browser on this device.</p>
          </div>
          <button className="clear-btn" onClick={() => { setHistory([]); localStorage.removeItem('trucker-tools-history') }}>Clear</button>
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
  )
}
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
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(savedHistory));
    } catch {}
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
    } catch {}
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-emerald-400" />
              <div className="text-xl font-black tracking-tight">Trucker Tools</div>
            </div>
            <div className="text-xs text-slate-400 mt-1">Free trucking calculators built for web first, app-ready later</div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
            <span className="rounded-full border border-slate-700 px-3 py-1">Free</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">Mobile Friendly</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">PWA Ready</span>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-4 py-14 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 mb-5">
              Free-first foundation
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Free trucking calculators that help drivers figure out <span className="text-emerald-400">profit, pay, and route cost</span>
            </h1>
            <p className="mt-5 text-lg text-slate-300 max-w-2xl">
              This site is built to attract repeat users with genuinely useful tools. It is designed so it can later expand into Android and iPhone apps with saved history, premium exports, and more advanced features.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#calculators" className="rounded-2xl bg-emerald-400 text-slate-950 px-5 py-3 font-bold hover:scale-[1.02] transition">Use Calculators</a>
            </div>
            <div className="mt-8 grid sm:grid-cols-2 gap-3 max-w-2xl">
              {[
                "Trip Profit Calculator",
                "Cost Per Mile Calculator",
                "Paycheck Calculator",
                "Route Cost Calculator",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Card className="p-6 md:p-8 bg-gradient-to-br from-slate-900 to-slate-950">
            <div className="text-sm text-slate-400">Quick overview</div>
            <div className="mt-5 space-y-4">
              {[
                "Estimate trip profit in seconds.",
                "Check break-even cost per mile.",
                "Estimate driver pay after bonuses and deductions.",
                "Compare fuel and route costs before rolling.",
              ].map((x) => (
                <div key={x} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-slate-300">{x}</div>
              ))}
            </div>
          </Card>
        </section>

        <section id="calculators" className="max-w-7xl mx-auto px-4 pb-16 grid xl:grid-cols-2 gap-6">
          <Card className="p-6">
            <SectionTitle icon={Calculator} title="Trip Profit Calculator" subtitle="Estimate gross revenue, fuel, expenses, and net profit for a trip." />
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Trip miles" value={tripMiles} onChange={(e) => setTripMiles(e.target.value)} />
              <Field label="Rate per mile ($)" value={ratePerMile} onChange={(e) => setRatePerMile(e.target.value)} />
              <Field label="Fuel price per gallon ($)" value={fuelPrice} onChange={(e) => setFuelPrice(e.target.value)} />
              <Field label="Miles per gallon" value={mpg} onChange={(e) => setMpg(e.target.value)} />
              <Field label="Tolls ($)" value={tolls} onChange={(e) => setTolls(e.target.value)} />
              <Field label="Maintenance estimate ($)" value={maintenance} onChange={(e) => setMaintenance(e.target.value)} />
              <div className="md:col-span-2">
                <Field label="Other costs ($)" value={otherCosts} onChange={(e) => setOtherCosts(e.target.value)} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">$1            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => saveResult("Trip Profit", `Net ${money(trip.net)} on ${number(tripMiles, 0)} miles | Gross ${money(trip.gross)} | Expenses ${money(trip.totalExpense)}`)}
                className="rounded-2xl bg-emerald-400 text-slate-950 px-4 py-3 font-bold hover:scale-[1.02] transition"
              >
                Save Trip Result
              </button>
            </div>
          </Card>

          <Card className="p-6">
            <SectionTitle icon={BarChart3} title="Cost Per Mile Calculator" subtitle="Figure out your break-even cost per mile." />
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Total costs ($)" value={totalCosts} onChange={(e) => setTotalCosts(e.target.value)} />
              <Field label="Total miles" value={cpmMiles} onChange={(e) => setCpmMiles(e.target.value)} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <Stat label="Cost per mile" value={money(cpm.perMile)} />
              <Stat label="Break-even rate" value={money(cpm.perMile)} />
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => saveResult("Cost Per Mile", `Break-even ${money(cpm.perMile)} per mile from ${money(totalCosts)} over ${number(cpmMiles, 0)} miles`)}
                className="rounded-2xl bg-emerald-400 text-slate-950 px-4 py-3 font-bold hover:scale-[1.02] transition"
              >
                Save CPM Result
              </button>
            </div>

            <div className="mt-10">
              <SectionTitle icon={Wallet} title="Paycheck Calculator" subtitle="Estimate gross and net driver pay based on miles, CPM, bonuses, and deductions." />
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Miles driven" value={payMiles} onChange={(e) => setPayMiles(e.target.value)} />
                <Field label="Cents per mile" value={centsPerMile} onChange={(e) => setCentsPerMile(e.target.value)} />
                <Field label="Bonuses ($)" value={bonuses} onChange={(e) => setBonuses(e.target.value)} />
                <Field label="Deductions ($)" value={deductions} onChange={(e) => setDeductions(e.target.value)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <Stat label="Gross pay" value={money(paycheck.gross)} />
                <Stat label="Estimated net" value={money(paycheck.net)} good={paycheck.net >= 0} bad={paycheck.net < 0} />
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => saveResult("Paycheck", `Estimated net ${money(paycheck.net)} | Gross ${money(paycheck.gross)} | ${number(payMiles, 0)} miles at ${number(centsPerMile, 0)} CPM`)}
                  className="rounded-2xl bg-emerald-400 text-slate-950 px-4 py-3 font-bold hover:scale-[1.02] transition"
                >
                  Save Paycheck Result
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-6 xl:col-span-2">
            <SectionTitle icon={Route} title="Route Cost Calculator" subtitle="Estimate the cost of a trip including fuel, tolls, food, and hotel." />
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Route miles" value={routeMiles} onChange={(e) => setRouteMiles(e.target.value)} />
              <Field label="Hotel ($)" value={hotel} onChange={(e) => setHotel(e.target.value)} />
              <Field label="Food ($)" value={food} onChange={(e) => setFood(e.target.value)} />
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <Stat label="Fuel cost" value={money(route.fuelCost)} />
              <Stat label="Trip total" value={money(route.total)} />
              <Stat label="Cost per route mile" value={money(route.total / Math.max(Number(routeMiles), 1))} />
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => saveResult("Route Cost", `Route total ${money(route.total)} | Fuel ${money(route.fuelCost)} | ${number(routeMiles, 0)} miles`)}
                className="rounded-2xl bg-emerald-400 text-slate-950 px-4 py-3 font-bold hover:scale-[1.02] transition"
              >
                Save Route Result
              </button>
            </div>
          </Card>
        </section>

        <section className="max-w-7xl mx-auto px-4 pb-16">
          <Card className="p-6">
            <SectionTitle icon={History} title="Saved History" subtitle="Your recent saved calculator results are stored locally in this browser for quick reference." />
            <div className="flex justify-between items-center gap-4 mb-4">
              <div className="text-sm text-slate-400">Stored locally on this device/browser</div>
              <button onClick={clearHistory} className="rounded-2xl border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-900 inline-flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Clear History
              </button>
            </div>
            {savedHistory.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-slate-400">No saved results yet. Use any calculator above and hit its save button.</div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-4">
                {savedHistory.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-bold text-white">{item.type}</div>
                      <div className="text-xs text-slate-500">{item.createdAt}</div>
                    </div>
                    <div className="mt-2 text-slate-300 text-sm">{item.summary}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>

        <section className="max-w-7xl mx-auto px-4 pb-20">
          <Card className="p-6 md:p-8 bg-gradient-to-br from-emerald-500/10 to-slate-900">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 text-emerald-300 text-sm mb-3">
                  <ShieldCheck className="h-4 w-4" />
                  Simple and useful
                </div>
                <h3 className="text-3xl md:text-4xl font-black tracking-tight">Built to help drivers run the numbers faster</h3>
                <p className="mt-4 text-slate-300 max-w-2xl">
                  Use these calculators to estimate trip profit, cost per mile, paycheck totals, and route expenses without digging through spreadsheets.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <div className="text-sm text-slate-400">Included tools</div>
                <div className="mt-4 space-y-3 text-slate-300">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">Trip Profit Calculator</div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">Cost Per Mile Calculator</div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">Paycheck Calculator</div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">Route Cost Calculator</div>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
