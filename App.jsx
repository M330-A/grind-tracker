import { useState, useEffect } from "react";

const YOUTUBE = {
  "Bench Press": "https://www.youtube.com/watch?v=SCVCLChPQFY",
  "Dumbbell Flyes": "https://www.youtube.com/watch?v=eozdVDA78K0",
  "Incline Dumbbell Press": "https://www.youtube.com/watch?v=8iPEnn-ltC8",
  "Tricep Kickbacks": "https://www.youtube.com/watch?v=6SS6K3lAwZ8",
  "Overhead Tricep Extension": "https://www.youtube.com/watch?v=YbX7Wd8jQ-Q",
  "Tricep Dumbbell Press": "https://www.youtube.com/watch?v=2z8JmcrW-As",
  "Curl Bar Curls": "https://www.youtube.com/watch?v=kwG2ipFRgfo",
  "Dumbbell Rows": "https://www.youtube.com/watch?v=roCP6wCXPqo",
  "Hammer Curls": "https://www.youtube.com/watch?v=zC3nLlEvin4",
  "Concentration Curls": "https://www.youtube.com/watch?v=Jvj2wV0vOFU",
  "Dumbbell Shrugs": "https://www.youtube.com/watch?v=g6qbq4Lf1FI",
  "Dumbbell Deadlift": "https://www.youtube.com/watch?v=ytGaGIn3SjE",
  "Dumbbell Shoulder Press": "https://www.youtube.com/watch?v=qEwKCR5JCog",
  "Lateral Raises": "https://www.youtube.com/watch?v=3VcKaXpzqRo",
  "Arnold Press": "https://www.youtube.com/watch?v=6Z15_WdXmVw",
  "Dumbbell Step-Ups": "https://www.youtube.com/watch?v=aajhW7DD1EA",
  "Goblet Squats": "https://www.youtube.com/watch?v=MeIiIdhvXT4",
  "Dumbbell Lunges": "https://www.youtube.com/watch?v=D7KaRcUTQeE",
  "Front Raises": "https://www.youtube.com/watch?v=sOF0vpX2qEo",
};

const DAYS = {
  A: {
    label: "Chest + Triceps", color: "#e05c5c",
    staples: ["Bench Press", "Dumbbell Flyes", "Incline Dumbbell Press"],
    pool: ["Tricep Kickbacks", "Overhead Tricep Extension", "Tricep Dumbbell Press"],
  },
  B: {
    label: "Back + Biceps", color: "#5c9ee0",
    staples: ["Curl Bar Curls", "Dumbbell Rows", "Hammer Curls"],
    pool: ["Concentration Curls", "Dumbbell Shrugs", "Dumbbell Deadlift"],
  },
  C: {
    label: "Shoulders + Legs", color: "#7ec87e",
    staples: ["Dumbbell Shoulder Press", "Lateral Raises", "Arnold Press"],
    pool: ["Dumbbell Step-Ups", "Goblet Squats", "Dumbbell Lunges", "Front Raises"],
  },
};

const DEFAULT_WEIGHTS = {
  "Bench Press": 45, "Dumbbell Flyes": 15, "Incline Dumbbell Press": 20,
  "Tricep Kickbacks": 10, "Overhead Tricep Extension": 15, "Tricep Dumbbell Press": 15,
  "Curl Bar Curls": 20, "Dumbbell Rows": 20, "Hammer Curls": 15,
  "Concentration Curls": 12, "Dumbbell Shrugs": 25, "Dumbbell Deadlift": 30,
  "Dumbbell Shoulder Press": 20, "Lateral Raises": 10, "Arnold Press": 15,
  "Dumbbell Step-Ups": 15, "Goblet Squats": 20, "Dumbbell Lunges": 15, "Front Raises": 10,
};

const EFFORT_COLORS = { Easy: "#7ec87e", Moderate: "#f5c842", Hard: "#e05c5c" };

function pickRandom(arr, n) {
  return arr.slice().sort(function() { return Math.random() - 0.5; }).slice(0, n);
}

function getNextDay(history) {
  var order = ["A", "B", "C"];
  if (!history.length) return "A";
  var last = history[history.length - 1].day;
  return order[(order.indexOf(last) + 1) % 3];
}

function buildWorkout(day, history, overrideRots) {
  var d = DAYS[day];
  var rots = overrideRots || pickRandom(d.pool, 2);
  return d.staples.concat(rots).map(function(name) {
    var w = DEFAULT_WEIGHTS[name] || 10;
    for (var i = history.length - 1; i >= 0; i--) {
      var ex = history[i].exercises.find(function(e) { return e.name === name; });
      if (ex) { w = ex.effort === "Easy" ? ex.weight + 5 : ex.weight; break; }
    }
    return { name: name, weight: w, sets: [10, 10, 10], effort: null, done: false };
  });
}

function isExReady(ex) {
  var allRepsSet = ex.sets.every(function(r) { return r !== null && r !== undefined; });
  return allRepsSet && ex.effort !== null;
}

async function storageGet(key) {
  try { var r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; }
  catch(e) { return null; }
}
async function storageSet(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); } catch(e) {}
}

function ExerciseCard(props) {
  var ex = props.ex;
  var isRotator = props.isRotator;
  var pool = props.pool;
  var onChange = props.onChange;
  var onSwap = props.onSwap;
  var [showSwap, setShowSwap] = useState(false);
  var ytLink = YOUTUBE[ex.name];
  var ready = isExReady(ex);

  function tryMarkDone() {
    if (!ready) return;
    onChange(Object.assign({}, ex, { done: !ex.done }));
  }

  return (
    <div style={{
      borderRadius: 10, padding: "11px 12px", marginBottom: 8,
      background: ex.done ? "rgba(126,200,126,0.06)" : "rgba(255,255,255,0.03)",
      border: "1px solid " + (ex.done ? "rgba(126,200,126,0.3)" : "rgba(255,255,255,0.07)"),
      borderLeft: "3px solid " + (ex.done ? "#7ec87e" : isRotator ? "#a78bfa" : "rgba(255,255,255,0.15)"),
      transition: "all 0.25s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: ex.done ? "#7ec87e" : "#f0ede8", textDecoration: ex.done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {ex.name}
          </span>
          {isRotator && (
            <span style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 4, padding: "1px 5px", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>
              RANDOM
            </span>
          )}
        </div>
        <button
          onClick={tryMarkDone}
          title={!ready ? "Set reps and effort first" : ""}
          style={{
            width: 28, height: 28, borderRadius: 7, flexShrink: 0,
            border: "1px solid " + (ex.done ? "#7ec87e" : ready ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"),
            background: ex.done ? "#7ec87e" : ready ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
            color: ex.done ? "#0d0d0f" : ready ? "#aaa" : "#333",
            fontSize: 13, cursor: ready ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}>
          {ex.done ? "+" : "o"}
        </button>
      </div>

      {!ready && !ex.done && (
        <div style={{ fontSize: 9, color: "#e05c5c", marginBottom: 6, fontWeight: 700, letterSpacing: 1 }}>
          SET REPS + EFFORT TO MARK DONE
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <button onClick={function() { onChange(Object.assign({}, ex, { weight: Math.max(5, ex.weight - 5) })); }}
          style={{ background: "rgba(224,92,92,0.15)", border: "1px solid rgba(224,92,92,0.3)", color: "#e05c5c", borderRadius: 7, width: 36, height: 30, cursor: "pointer", fontSize: 12, fontWeight: 900 }}>
          -5
        </button>
        <div style={{ flex: 1, textAlign: "center", background: "rgba(245,200,66,0.08)", borderRadius: 7, padding: "5px 0", border: "1px solid rgba(245,200,66,0.2)" }}>
          <span style={{ color: "#f5c842", fontWeight: 900, fontSize: 14 }}>{ex.weight}</span>
          <span style={{ color: "#888", fontSize: 10, marginLeft: 3 }}>lbs</span>
        </div>
        <button onClick={function() { onChange(Object.assign({}, ex, { weight: ex.weight + 5 })); }}
          style={{ background: "rgba(126,200,126,0.15)", border: "1px solid rgba(126,200,126,0.3)", color: "#7ec87e", borderRadius: 7, width: 36, height: 30, cursor: "pointer", fontSize: 12, fontWeight: 900 }}>
          +5
        </button>
      </div>

      <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
        {ex.sets.map(function(reps, i) {
          return (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ color: "#555", fontSize: 9, marginBottom: 3, textAlign: "center", fontWeight: 700 }}>SET {i + 1}</div>
              <select value={reps}
                onChange={function(e) {
                  var ns = ex.sets.map(function(s, si) { return si === i ? Number(e.target.value) : s; });
                  onChange(Object.assign({}, ex, { sets: ns, done: false }));
                }}
                style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 7, color: "#fff", padding: "6px 2px", textAlign: "center", fontSize: 12, outline: "none", boxSizing: "border-box", cursor: "pointer" }}>
                <option value={8} style={{ background: "#1a1a2e" }}>8 reps</option>
                <option value={9} style={{ background: "#1a1a2e" }}>9 reps</option>
                <option value={10} style={{ background: "#1a1a2e" }}>10 reps</option>
              </select>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 5, marginBottom: 7 }}>
        {["Easy", "Moderate", "Hard"].map(function(level) {
          var color = EFFORT_COLORS[level];
          var selected = ex.effort === level;
          return (
            <button key={level}
              onClick={function() { onChange(Object.assign({}, ex, { effort: selected ? null : level, done: false })); }}
              style={{
                flex: 1, padding: "5px 0", borderRadius: 7,
                border: "1px solid " + (selected ? color : "rgba(255,255,255,0.08)"),
                background: selected ? color + "33" : "rgba(255,255,255,0.03)",
                color: selected ? color : "#444",
                fontSize: 10, fontWeight: 800, cursor: "pointer",
              }}>
              {level}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 5 }}>
        {ytLink && (
          <a href={ytLink} target="_blank" rel="noreferrer"
            style={{ flex: 1, padding: "5px 0", borderRadius: 7, border: "1px solid rgba(255,80,80,0.25)", background: "rgba(255,80,80,0.07)", color: "#ff6b6b", fontSize: 10, fontWeight: 700, textAlign: "center", textDecoration: "none", display: "block" }}>
            TUTORIAL
          </a>
        )}
        {isRotator && (
          <button onClick={function() { setShowSwap(!showSwap); }}
            style={{ flex: 1, padding: "5px 0", borderRadius: 7, border: "1px solid rgba(167,139,250,0.25)", background: "rgba(167,139,250,0.07)", color: "#a78bfa", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
            SWAP
          </button>
        )}
      </div>

      {showSwap && isRotator && (
        <div style={{ marginTop: 8, background: "rgba(0,0,0,0.4)", borderRadius: 8, padding: 8 }}>
          <div style={{ color: "#555", fontSize: 9, marginBottom: 6, letterSpacing: 2, fontWeight: 700 }}>PICK REPLACEMENT</div>
          {pool.filter(function(p) { return p !== ex.name; }).map(function(opt) {
            return (
              <button key={opt} onClick={function() { onSwap(opt); setShowSwap(false); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "7px 8px", marginBottom: 4, background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: 6, color: "#c4b5fd", fontSize: 11, cursor: "pointer" }}>
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProgressCard(props) {
  var name = props.name;
  var data = props.data;
  var color = props.color;
  if (!data.length) return null;
  var latest = data[data.length - 1].weight;
  var first = data[0].weight;
  var gained = latest - first;
  var vals = data.map(function(d) { return d.weight; });
  var max = Math.max.apply(null, vals);
  var min = Math.min.apply(null, vals);
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "11px 13px", marginBottom: 8, border: "1px solid rgba(255,255,255,0.06)", borderLeft: "3px solid " + color }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#f0ede8", marginBottom: 2 }}>{name}</div>
          <div style={{ fontSize: 10, color: "#555" }}>{data.length} sessions</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#f5c842" }}>{latest} <span style={{ fontSize: 10, color: "#555" }}>lbs</span></div>
          {gained !== 0 && (
            <div style={{ fontSize: 10, fontWeight: 700, color: gained > 0 ? "#7ec87e" : "#e05c5c" }}>
              {gained > 0 ? "+" : ""}{gained} lbs
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 44, marginBottom: 4 }}>
        {data.map(function(d, i) {
          var h = max === min ? 44 : ((d.weight - min) / (max - min)) * 36 + 8;
          var isLast = i === data.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ width: "100%", background: isLast ? color : "#2a2a3a", borderRadius: "3px 3px 0 0", height: h, opacity: 0.4 + (i / data.length) * 0.6 }} />
              <div style={{ color: "#444", fontSize: 8 }}>{d.weight}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#444", fontSize: 9 }}>Start: {first} lbs</span>
        <span style={{ color: "#f5c842", fontSize: 9, fontWeight: 700 }}>Now: {latest} lbs</span>
      </div>
    </div>
  );
}

export default function App() {
  var [tab, setTab] = useState("Today");
  var [history, setHistory] = useState([]);
  var [bodyWeights, setBodyWeights] = useState([]);
  var [workout, setWorkout] = useState(null);
  var [currentDay, setCurrentDay] = useState("A");
  var [rotators, setRotators] = useState([]);
  var [loading, setLoading] = useState(true);
  var [saved, setSaved] = useState(false);
  var [newBW, setNewBW] = useState("");
  var [exFilter, setExFilter] = useState("All");
  var [wtFilter, setWtFilter] = useState("Weight");

  useEffect(function() {
    (async function() {
      var h = await storageGet("wt-history") || [];
      var bw = await storageGet("wt-bodyweights") || [];
      setHistory(h);
      setBodyWeights(bw);
      var day = getNextDay(h);
      setCurrentDay(day);
      var rots = pickRandom(DAYS[day].pool, 2);
      setRotators(rots);
      setWorkout(buildWorkout(day, h, rots));
      setLoading(false);
    })();
  }, []);

  function swapRotator(rotIdx, newName) {
    var newRots = rotators.map(function(r, i) { return i === rotIdx ? newName : r; });
    setRotators(newRots);
    var sc = DAYS[currentDay].staples.length;
    var w = DEFAULT_WEIGHTS[newName] || 10;
    for (var i = history.length - 1; i >= 0; i--) {
      var ex = history[i].exercises.find(function(e) { return e.name === newName; });
      if (ex) { w = ex.effort === "Easy" ? ex.weight + 5 : ex.weight; break; }
    }
    setWorkout(function(prev) {
      return prev.map(function(ex, i) {
        return i === sc + rotIdx ? { name: newName, weight: w, sets: [10, 10, 10], effort: null, done: false } : ex;
      });
    });
  }

  function updateEx(idx, updated) {
    setWorkout(function(prev) {
      return prev.map(function(ex, i) { return i === idx ? updated : ex; });
    });
  }

  async function finishWorkout() {
    var entry = {
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      day: currentDay, label: DAYS[currentDay].label, exercises: workout,
    };
    var newHistory = history.concat([entry]);
    setHistory(newHistory);
    await storageSet("wt-history", newHistory);
    setSaved(true);
    setTimeout(function() {
      setSaved(false);
      var nextDay = getNextDay(newHistory);
      setCurrentDay(nextDay);
      var rots = pickRandom(DAYS[nextDay].pool, 2);
      setRotators(rots);
      setWorkout(buildWorkout(nextDay, newHistory, rots));
    }, 2000);
  }

  async function logBW() {
    if (!newBW) return;
    var entry = { date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), weight: Number(newBW) };
    var updated = bodyWeights.concat([entry]);
    setBodyWeights(updated);
    await storageSet("wt-bodyweights", updated);
    setNewBW("");
  }

  var streak = (function() {
    if (!history.length) return 0;
    var count = 1;
    for (var i = history.length - 1; i > 0; i--) {
      var diff = (new Date(history[i].date) - new Date(history[i - 1].date)) / 86400000;
      if (diff <= 3) count++; else break;
    }
    return count;
  }());

  var doneCount = workout ? workout.filter(function(e) { return e.done; }).length : 0;
  var totalCount = workout ? workout.length : 0;
  var allDone = doneCount === totalCount && totalCount > 0;
  var dayColor = DAYS[currentDay].color;
  var stapleCount = DAYS[currentDay].staples.length;

  var allExercises = [];
  ["A","B","C"].forEach(function(d) {
    DAYS[d].staples.concat(DAYS[d].pool).forEach(function(name) {
      if (allExercises.indexOf(name) === -1) allExercises.push(name);
    });
  });

  var exFilterGroups = {
    "All": allExercises,
    "Chest+Tris": DAYS.A.staples.concat(DAYS.A.pool),
    "Back+Bis": DAYS.B.staples.concat(DAYS.B.pool),
    "Shoulders": DAYS.C.staples.concat(DAYS.C.pool),
  };

  function getProgress(name) {
    var result = [];
    history.forEach(function(s) {
      s.exercises.forEach(function(e) {
        if (e.name === name) result.push({ date: s.date, weight: e.weight });
      });
    });
    return result.slice(-10);
  }

  function getColor(name) {
    if (DAYS.A.staples.concat(DAYS.A.pool).indexOf(name) !== -1) return DAYS.A.color;
    if (DAYS.B.staples.concat(DAYS.B.pool).indexOf(name) !== -1) return DAYS.B.color;
    return DAYS.C.color;
  }

  if (loading) {
    return (
      <div style={{ background: "#0d0d0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#f5c842", fontSize: 14, letterSpacing: 4, fontWeight: 900 }}>LOADING...</div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0d0d0f", minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: 440, margin: "0 auto", color: "#f0ede8" }}>

      <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(15,15,22,0.98)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 8, letterSpacing: 4, color: "#444", fontWeight: 700 }}>YOUR IRON LOG</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#f0ede8", letterSpacing: 1, lineHeight: 1.1 }}>GRIND TRACKER</div>
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "5px 9px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ color: "#444", fontSize: 8, letterSpacing: 1, fontWeight: 700 }}>STREAK</div>
              <div style={{ color: "#f5c842", fontSize: 15, fontWeight: 900 }}>{streak}x</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "5px 9px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ color: "#444", fontSize: 8, letterSpacing: 1, fontWeight: 700 }}>TOTAL</div>
              <div style={{ color: "#a78bfa", fontSize: 15, fontWeight: 900 }}>{history.length}</div>
            </div>
          </div>
        </div>
        {workout && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 9, color: "#555", letterSpacing: 1, fontWeight: 700 }}>TODAY</span>
              <span style={{ fontSize: 9, color: allDone ? "#7ec87e" : dayColor, fontWeight: 700 }}>{doneCount}/{totalCount} done</span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg," + dayColor + ",#f5c842)", borderRadius: 4, width: (totalCount ? (doneCount / totalCount * 100) : 0) + "%", transition: "width 0.4s" }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ background: "rgba(245,150,50,0.08)", borderBottom: "1px solid rgba(245,150,50,0.15)", padding: "7px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, color: "#e8a020", fontWeight: 700 }}>NOTE:</span>
        <span style={{ fontSize: 10, color: "#888" }}>History saves in this chat session only. Deploy to keep it forever.</span>
      </div>

      <div style={{ display: "flex", gap: 2, padding: "8px 10px 0", background: "#0d0d0f" }}>
        {["Today", "History", "Progress", "Profile"].map(function(t) {
          return (
            <button key={t} onClick={function() { setTab(t); }}
              style={{ flex: 1, padding: "7px 2px", borderRadius: 8, border: "none", cursor: "pointer", background: tab === t ? dayColor : "rgba(255,255,255,0.04)", color: tab === t ? "#0d0d0f" : "#555", fontSize: 10, fontWeight: 800, letterSpacing: 0.3, transition: "all 0.2s" }}>
              {t.toUpperCase()}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px 80px" }}>

        {tab === "Today" && workout && (
          <div>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid " + dayColor + "44", borderRadius: 10, padding: "10px 12px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, color: dayColor, fontWeight: 800, letterSpacing: 2 }}>DAY {currentDay}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#f0ede8" }}>{DAYS[currentDay].label}</div>
                <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>3 sets / 8-10 reps</div>
              </div>
            </div>

            <div style={{ color: "#555", fontSize: 9, letterSpacing: 2, marginBottom: 6, fontWeight: 700 }}>STAPLES</div>
            {workout.slice(0, stapleCount).map(function(ex, i) {
              return (
                <ExerciseCard key={ex.name} ex={ex} isRotator={false} pool={[]}
                  onChange={function(u) { updateEx(i, u); }}
                  onSwap={function() {}} />
              );
            })}

            <div style={{ color: "#a78bfa", fontSize: 9, letterSpacing: 2, margin: "10px 0 6px", fontWeight: 700 }}>RANDOM PICKS</div>
            {workout.slice(stapleCount).map(function(ex, i) {
              return (
                <ExerciseCard key={ex.name} ex={ex} isRotator={true} pool={DAYS[currentDay].pool}
                  onChange={function(u) { updateEx(stapleCount + i, u); }}
                  onSwap={function(n) { swapRotator(i, n); }} />
              );
            })}

            <button onClick={finishWorkout} disabled={!allDone || saved}
              style={{
                width: "100%", padding: "13px 0", marginTop: 10, borderRadius: 10, border: "none",
                background: saved ? "linear-gradient(90deg,#4caf50,#27ae60)" : allDone ? "linear-gradient(90deg," + dayColor + ",#f5c842)" : "rgba(255,255,255,0.05)",
                color: saved ? "#fff" : allDone ? "#0d0d0f" : "#333",
                fontSize: 13, fontWeight: 900, letterSpacing: 2, cursor: allDone ? "pointer" : "default",
                transition: "all 0.3s",
                boxShadow: allDone && !saved ? "0 0 20px " + dayColor + "55" : "none",
              }}>
              {saved ? "SAVED! NICE WORK" : allDone ? "FINISH WORKOUT" : "CHECK OFF ALL EXERCISES (" + doneCount + "/" + totalCount + ")"}
            </button>
          </div>
        )}

        {tab === "History" && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, color: "#555", letterSpacing: 2, marginBottom: 10 }}>
              HISTORY - {history.length} SESSIONS
            </div>
            {history.length === 0 && (
              <div style={{ color: "#444", textAlign: "center", padding: "30px 16px", fontSize: 12 }}>
                <div style={{ marginBottom: 8, fontSize: 24 }}>--</div>
                No workouts logged yet in this session.
              </div>
            )}
            {history.slice().reverse().map(function(session, i) {
              var dc = DAYS[session.day].color;
              return (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px", marginBottom: 7, borderLeft: "3px solid " + dc }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: dc }}>Day {session.day} - {session.label}</span>
                    <span style={{ color: "#444", fontSize: 10 }}>{session.date}</span>
                  </div>
                  {session.exercises.map(function(ex) {
                    var ec = ex.effort ? EFFORT_COLORS[ex.effort] : "#444";
                    return (
                      <div key={ex.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ color: "#888", fontSize: 11 }}>{ex.name}</span>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          {ex.effort && (
                            <span style={{ background: ec + "22", color: ec, border: "1px solid " + ec + "44", borderRadius: 4, padding: "1px 5px", fontSize: 8, fontWeight: 800 }}>
                              {ex.effort.toUpperCase()}
                            </span>
                          )}
                          <span style={{ color: "#555", fontSize: 11, fontWeight: 700 }}>{ex.weight}lbs</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {tab === "Progress" && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, color: "#555", letterSpacing: 2, marginBottom: 10 }}>PROGRESS</div>

            <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
              {["Weight", "Exercises"].map(function(f) {
                return (
                  <button key={f} onClick={function() { setWtFilter(f); }}
                    style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid", fontSize: 10, fontWeight: 800, cursor: "pointer",
                      borderColor: wtFilter === f ? "#f5c842" : "rgba(255,255,255,0.1)",
                      background: wtFilter === f ? "rgba(245,200,66,0.12)" : "rgba(255,255,255,0.04)",
                      color: wtFilter === f ? "#f5c842" : "#555" }}>
                    {f === "Weight" ? "BODY WEIGHT" : "LIFTS"}
                  </button>
                );
              })}
            </div>

            {wtFilter === "Weight" && (
              <div>
                {bodyWeights.length === 0 && (
                  <div style={{ color: "#444", textAlign: "center", padding: "30px 16px", fontSize: 12 }}>No body weight entries yet. Log one in Profile.</div>
                )}
                {bodyWeights.length > 0 && (
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "11px 13px", marginBottom: 8, border: "1px solid rgba(255,255,255,0.06)", borderLeft: "3px solid #a78bfa" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#f0ede8", marginBottom: 2 }}>Body Weight</div>
                        <div style={{ fontSize: 10, color: "#555" }}>{bodyWeights.length} entries</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#a78bfa" }}>{bodyWeights[bodyWeights.length - 1].weight} <span style={{ fontSize: 10, color: "#555" }}>lbs</span></div>
                        {bodyWeights.length > 1 && (function() {
                          var diff = bodyWeights[bodyWeights.length - 1].weight - bodyWeights[0].weight;
                          return (
                            <div style={{ fontSize: 10, fontWeight: 700, color: diff <= 0 ? "#7ec87e" : "#e05c5c" }}>
                              {diff > 0 ? "+" : ""}{diff} lbs
                            </div>
                          );
                        }())}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 44, marginBottom: 6 }}>
                      {bodyWeights.slice(-12).map(function(d, i, arr) {
                        var vals = arr.map(function(x) { return x.weight; });
                        var mx = Math.max.apply(null, vals);
                        var mn = Math.min.apply(null, vals);
                        var h = mx === mn ? 44 : ((d.weight - mn) / (mx - mn)) * 36 + 8;
                        var isLast = i === arr.length - 1;
                        return (
                          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                            <div style={{ width: "100%", background: isLast ? "#a78bfa" : "#2a2a3a", borderRadius: "3px 3px 0 0", height: h, opacity: 0.4 + (i / arr.length) * 0.6 }} />
                            <div style={{ color: "#444", fontSize: 8 }}>{d.weight}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 8 }}>
                      {bodyWeights.slice().reverse().slice(0, 6).map(function(bw, i) {
                        return (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                            <span style={{ color: "#555", fontSize: 11 }}>{bw.date}</span>
                            <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: 11 }}>{bw.weight} lbs</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {wtFilter === "Exercises" && (
              <div>
                <div style={{ display: "flex", gap: 5, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
                  {["All", "Chest+Tris", "Back+Bis", "Shoulders"].map(function(g) {
                    return (
                      <button key={g} onClick={function() { setExFilter(g); }}
                        style={{ flexShrink: 0, padding: "5px 10px", borderRadius: 20, border: "1px solid", fontSize: 10, fontWeight: 700, cursor: "pointer",
                          borderColor: exFilter === g ? dayColor : "rgba(255,255,255,0.1)",
                          background: exFilter === g ? dayColor + "22" : "rgba(255,255,255,0.04)",
                          color: exFilter === g ? dayColor : "#555" }}>
                        {g}
                      </button>
                    );
                  })}
                </div>
                {history.length === 0 && (
                  <div style={{ color: "#444", textAlign: "center", padding: "30px 16px", fontSize: 12 }}>Log workouts to see lift progress!</div>
                )}
                {(exFilterGroups[exFilter] || allExercises).map(function(name) {
                  var data = getProgress(name);
                  if (!data.length) return null;
                  return <ProgressCard key={name} name={name} data={data} color={getColor(name)} />;
                })}
              </div>
            )}
          </div>
        )}

        {tab === "Profile" && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, color: "#555", letterSpacing: 2, marginBottom: 10 }}>PROFILE</div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "13px", marginBottom: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
              {[
                ["Age", "35"],
                ["Height", "5'8\""],
                ["Goal", "Muscle + Strength"],
                ["Schedule", "3x / week"],
                ["Total Sessions", String(history.length)],
                ["Streak", streak + " sessions"],
                ["Last Weight", bodyWeights.length ? bodyWeights[bodyWeights.length - 1].weight + " lbs" : "--"],
              ].map(function(row) {
                return (
                  <div key={row[0]} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ color: "#555", fontSize: 11 }}>{row[0]}</span>
                    <span style={{ color: "#f0ede8", fontSize: 11, fontWeight: 700 }}>{row[1]}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ fontSize: 10, fontWeight: 900, color: "#555", letterSpacing: 2, marginBottom: 10 }}>LOG BODY WEIGHT</div>
            <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
              <input type="number" placeholder="lbs today" value={newBW}
                onChange={function(e) { setNewBW(e.target.value); }}
                style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "#fff", padding: "9px 12px", fontSize: 13, outline: "none" }} />
              <button onClick={logBW}
                style={{ background: "linear-gradient(90deg,#f5c842,#e8a020)", border: "none", borderRadius: 9, padding: "9px 16px", color: "#0d0d0f", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
                LOG
              </button>
            </div>

            {bodyWeights.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "11px 13px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ color: "#555", fontSize: 9, letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>WEIGHT LOG</div>
                {bodyWeights.slice().reverse().slice(0, 10).map(function(bw, i) {
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ color: "#555", fontSize: 11 }}>{bw.date}</span>
                      <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: 11 }}>{bw.weight} lbs</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
