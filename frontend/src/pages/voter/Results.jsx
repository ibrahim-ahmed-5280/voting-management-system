import { useEffect, useMemo, useState } from "react";
import PieChart from "../../components/Charts/PieChart";
import ResultsChart from "../../components/Charts/ResultsChart";
import api from "../../api/client";
import { formatPercent } from "../../utils/formatters";

const getWinnerText = (result) => {
  if (result?.winner?.name) return result.winner.name;
  if (result?.winnerReason === "tie") return "No winner (Tie)";
  if (result?.winnerReason === "no_votes") return "No winner (No votes)";
  if (result?.winnerReason === "no_candidates") return "No winner";
  return "Pending";
};

export default function Results() {
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    api.get("/api/voter/results").then((res) => {
      setResults(res.data);
      if (res.data.length) setSelected(res.data[0].election._id);
    });
  }, []);

  const current = useMemo(
    () => results.find((item) => item.election._id === selected),
    [results, selected]
  );
  const total = useMemo(
    () => (current ? current.candidates.reduce((acc, c) => acc + c.votes, 0) : 0),
    [current]
  );
  const rankedCandidates = useMemo(
    () => (current ? current.candidates.slice().sort((a, b) => b.votes - a.votes) : []),
    [current]
  );
  const topCandidate = rankedCandidates[0] || null;

  return (
    <div className="page-wrap space-y-6">
      <h1 className="text-2xl font-extrabold">Election Results</h1>
      <select className="input max-w-md" value={selected} onChange={(e) => setSelected(e.target.value)}>
        {results.map((item) => (
          <option key={item.election._id} value={item.election._id}>
            {item.election.name}
          </option>
        ))}
      </select>

      {current && (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-slate-500">Total Votes</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-slate-500">Your Vote</p>
              <p className="text-xl font-bold">{current.myVote?.candidate?.name || "Not cast"}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-slate-500">Winner</p>
              <div className="mt-1 flex items-center gap-3">
                {current.winner ? (
                  <img
                    src={current.winner.photo || "https://via.placeholder.com/44x44?text=C"}
                    alt={current.winner.name}
                    className="h-11 w-11 rounded-full object-cover object-top"
                  />
                ) : topCandidate ? (
                  <img
                    src={topCandidate.photo || "https://via.placeholder.com/44x44?text=C"}
                    alt={topCandidate.name}
                    className="h-11 w-11 rounded-full object-cover object-top opacity-80"
                  />
                ) : null}
                <p className="text-xl font-bold">{getWinnerText(current)}</p>
              </div>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <PieChart data={current.candidates.map((c) => ({ name: c.name, value: c.votes }))} title="Vote Share" />
            <ResultsChart candidates={current.candidates} title="Candidate Votes" />
          </div>

          <section className="glass rounded-xl p-4">
            <h2 className="mb-3 text-lg font-bold">Candidates Ranking</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th>Rank</th>
                    <th>Candidate</th>
                    <th>Votes</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedCandidates.map((candidate, idx) => (
                      <tr key={candidate._id} className="border-t border-slate-200">
                        <td className="py-2">#{idx + 1}</td>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={candidate.photo || "https://via.placeholder.com/36x36?text=C"}
                              alt={candidate.name}
                              className="h-9 w-9 rounded-full object-cover object-top"
                            />
                            <span>{candidate.name}</span>
                          </div>
                        </td>
                        <td>{candidate.votes}</td>
                        <td>{formatPercent(candidate.votes, total)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

