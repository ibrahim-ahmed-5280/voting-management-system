import { useEffect, useMemo, useState } from "react";
import { FaCrown } from "react-icons/fa";
import api from "../../api/client";
import { formatPercent } from "../../utils/formatters";

const getOutcome = (rankedCandidates) => {
  if (!rankedCandidates.length) {
    return { type: "no_candidates", winner: null, topIds: new Set() };
  }

  const topVotes = rankedCandidates[0].votes || 0;
  if (topVotes <= 0) {
    return { type: "no_votes", winner: null, topIds: new Set() };
  }

  const tiedTop = rankedCandidates.filter((candidate) => (candidate.votes || 0) === topVotes);
  if (tiedTop.length !== 1) {
    return { type: "tie", winner: null, topIds: new Set(tiedTop.map((candidate) => candidate._id)) };
  }

  return { type: "clear", winner: rankedCandidates[0], topIds: new Set([rankedCandidates[0]._id]) };
};

const getStatusLabel = (candidate, outcome) => {
  if (outcome.type === "clear") return outcome.winner?._id === candidate._id ? "Winner" : "Loser";
  if (outcome.type === "tie") return outcome.topIds.has(candidate._id) ? "Tie" : "Loser";
  if (outcome.type === "no_votes") return "No votes";
  return "No result";
};

const getStatusClass = (status) => {
  if (status === "Winner") return "bg-brand-primary/15 text-brand-primary";
  if (status === "Loser") return "bg-slate-200 text-slate-700";
  if (status === "Tie") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
};

export default function FinalResults() {
  const [elections, setElections] = useState([]);
  const [selected, setSelected] = useState("");
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    api.get("/api/elections").then((res) => {
      const completed = res.data.filter((e) => e.status === "completed");
      setElections(completed);
      if (completed.length) setSelected(completed[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.get("/api/candidates", { params: { election: selected } }).then((res) => setCandidates(res.data));
  }, [selected]);

  const ranked = useMemo(
    () => candidates.slice().sort((a, b) => b.votes - a.votes),
    [candidates]
  );
  const total = useMemo(() => ranked.reduce((acc, c) => acc + c.votes, 0), [ranked]);
  const outcome = useMemo(() => getOutcome(ranked), [ranked]);
  const winner = outcome.winner;

  const exportCSV = () => {
    const rows = ranked.map((c, i) => `${i + 1},${c.name},${c.votes},${formatPercent(c.votes, total)}`).join("\n");
    const csv = `Rank,Name,Votes,Percentage\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "final_results.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-wrap space-y-6">
      <h1 className="text-2xl font-extrabold">Final Results</h1>
      <select className="input max-w-md" value={selected} onChange={(e) => setSelected(e.target.value)}>
        {elections.map((e) => (
          <option key={e._id} value={e._id}>
            {e.name}
          </option>
        ))}
      </select>

      {winner ? (
        <div className="glass rounded-2xl p-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-primary px-3 py-1 text-xs font-bold text-white">
            <FaCrown />
            Winner
          </p>
          <div className="flex items-center gap-4">
            <img
              src={winner.photo || "https://via.placeholder.com/80x80?text=Candidate"}
              className="h-20 w-20 rounded-full object-cover object-top"
            />
            <div>
              <h2 className="text-2xl font-extrabold">{winner.name}</h2>
              <p className="text-sm">{winner.votes} votes ({formatPercent(winner.votes, total)})</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-6">
          <p className="text-sm font-semibold text-slate-600">
            {outcome.type === "tie" && "No winner: top candidates are tied."}
            {outcome.type === "no_votes" && "No winner: this election has zero votes."}
            {outcome.type === "no_candidates" && "No winner: no candidates found."}
          </p>
        </div>
      )}

      <section className="glass rounded-xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Results Table</h2>
          <button className="btn-secondary" onClick={exportCSV}>Export Results</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th>Rank</th>
                <th>Candidate</th>
                <th>Votes</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((candidate, idx) => (
                <tr key={candidate._id} className="border-t border-slate-200">
                  <td className="py-2">#{idx + 1}</td>
                  <td className="flex items-center gap-2 py-2">
                    <img
                      src={candidate.photo || "https://via.placeholder.com/36x36?text=C"}
                      className="h-9 w-9 rounded-full object-cover object-top"
                    />
                    {candidate.name}
                  </td>
                  <td>{candidate.votes}</td>
                  <td>{formatPercent(candidate.votes, total)}</td>
                  <td>
                    {(() => {
                      const statusLabel = getStatusLabel(candidate, outcome);
                      return (
                        <span className={`rounded-full px-2 py-1 text-xs ${getStatusClass(statusLabel)}`}>
                          {statusLabel}
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

