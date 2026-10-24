import { useState, useEffect, useCallback, useRef } from "react";
import {
  numberToSpanish,
  normalize,
  RANGES,
  rangeIndex,
  pickNumber,
} from "./spanish.js";

const STORAGE_KEY = "es-numbers-app-v1";
const emptyStats = () => RANGES.map(() => ({ correct: 0, incorrect: 0 }));
const allActive = () => RANGES.map(() => true);

function loadSaved() {
  try {
    const p = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (
      Array.isArray(p?.stats) && p.stats.length === RANGES.length &&
      Array.isArray(p?.activeRanges) && p.activeRanges.length === RANGES.length
    ) {
      return p;
    }
  } catch {
    /* brak lub uszkodzone dane */
  }
  return { stats: emptyStats(), activeRanges: allActive() };
}

export default function App() {
  const [initial] = useState(loadSaved);
  const [stats, setStats] = useState(initial.stats);
  const [activeRanges, setActiveRanges] = useState(initial.activeRanges);
  const [current, setCurrent] = useState(() => pickNumber(initial.activeRanges));
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // { kind: "ok" | "bad", text }
  const [hadWrongAttempt, setHadWrongAttempt] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const inputRef = useRef(null);

  // Trwały zapis statystyk i wybranych przedziałów
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ stats, activeRanges }));
    } catch {
      /* np. tryb prywatny */
    }
  }, [stats, activeRanges]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [current]);

  const newNumber = useCallback(() => {
    setCurrent(pickNumber(activeRanges));
    setAnswer("");
    setFeedback(null);
    setHadWrongAttempt(false);
    setRevealed(false);
  }, [activeRanges]);

  const reveal = useCallback(() => {
    if (!hadWrongAttempt || revealed) return;
    setRevealed(true);
    setFeedback({ kind: "bad", text: `Odpowiedź: ${numberToSpanish(current)}` });
  }, [hadWrongAttempt, revealed, current]);

  // Skróty: N - nowa liczba, M - pokaż odpowiedź (nie podczas pisania)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (document.activeElement === inputRef.current) return;
      if (e.key === "n" || e.key === "N") newNumber();
      if (e.key === "m" || e.key === "M") reveal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [newNumber, reveal]);

  const bump = (idx, field) =>
    setStats((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: s[field] + 1 } : s))
    );

  const check = () => {
    if (!answer.trim()) {
      setFeedback({ kind: "bad", text: "Wpisz odpowiedź." });
      return;
    }
    const correct = numberToSpanish(current);
    const isCorrect = normalize(answer) === normalize(correct);
    const idx = rangeIndex(current);

    if (isCorrect) {
      // Poprawna odpowiedź po pomyłce nie liczy się, jeśli pokazano odpowiedź.
      if (hadWrongAttempt && revealed) {
        setFeedback({
          kind: "bad",
          text: "Poprawnie, ale to się nie liczy — odpowiedź była już pokazana.",
        });
        return;
      }
      bump(idx, "correct");
      setFeedback({ kind: "ok", text: `Poprawnie! (${correct})` });
    } else {
      bump(idx, "incorrect");
      setHadWrongAttempt(true);
      setFeedback({ kind: "bad", text: "Źle. Spróbuj ponownie." });
    }
  };

  const toggleRange = (i) =>
    setActiveRanges((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  const totalCorrect = stats.reduce((s, x) => s + x.correct, 0);
  const totalIncorrect = stats.reduce((s, x) => s + x.incorrect, 0);

  return (
    <>
      <button className="stats-toggle" onClick={() => setShowStats((v) => !v)}>
        Statystyki
      </button>

      {showStats && (
        <div className="stats-panel">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Przedział</th>
                <th>Popr.</th>
                <th>Błęd.</th>
              </tr>
            </thead>
            <tbody>
              {RANGES.map((r, i) => (
                <tr key={r.start}>
                  <td>
                    <input
                      type="checkbox"
                      checked={activeRanges[i]}
                      onChange={() => toggleRange(i)}
                    />
                  </td>
                  <td className="range">
                    {r.start}-{r.end}
                  </td>
                  <td>{stats[i].correct}</td>
                  <td>{stats[i].incorrect}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td></td>
                <td className="range">Razem</td>
                <td>{totalCorrect}</td>
                <td>{totalIncorrect}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <main className="card">
        <div className="kicker">napisz po hiszpańsku</div>
        <div className="number">{current}</div>
        <input
          ref={inputRef}
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check()}
          autoComplete="off"
          placeholder="tu wpisz odpowiedź"
        />
        <div className="buttons">
          <button onClick={check}>(Enter) Sprawdź</button>
          <button onClick={newNumber}>(N) Nowa liczba</button>
          <button onClick={reveal} disabled={!hadWrongAttempt || revealed}>
            (M) Pokaż odpowiedź
          </button>
        </div>
        <div className={`feedback ${feedback?.kind ?? ""}`}>{feedback?.text}</div>
      </main>
    </>
  );
}
