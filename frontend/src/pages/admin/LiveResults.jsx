import { useEffect, useMemo, useState } from "react";
import { FaUsers, FaVoteYea, FaHourglassHalf } from "react-icons/fa";
import api from "../../api/client";
import StatCard from "../../components/Cards/StatCard";
import PieChart from "../../components/Charts/PieChart";
import ResultsChart from "../../components/Charts/ResultsChart";
import CountdownTimer from "../../components/CountdownTimer";
import { formatPercent } from "../../utils/formatters";

export default function LiveResults() {
  const [elections, setElections] = useState([]);
  const [voters, setVoters] = useState([]);
  const [selected, setSelected] = useState("");
  const [candidates, setCandidates] = useState([]);

  const loadAll = async () => {
    const [eRes, vRes] = await Promise.all([api.get("/api/elections"), api.get("/api/voter")]);
    setElections(eRes.data);
    setVoters(vRes.data);
    if (!selected && eRes.data.length) setSelected(eRes.data[0]._id);
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (!selected) return;
    const loadCandidates = async () => {
      const { data } = await api.get("/api/candidates", { params: { election: selected } });
      setCandidates(data);
    };
    loadCandidates();
    const timer = setInterval(loadCandidates, 30000);
    return () => clearInterval(timer);
  }, [selected]);

  const election = elections.find((e) => e._id === selected);
  const totalVoters = useMemo(
    () =>
      voters.filter((voter) =>
        (voter.assignedElections || []).some((e) => (e._id || e).toString() === selected)
      ).length,
    [voters, selected]
  );
  const votesCast = useMemo(() => candidates.reduce((acc, c) => acc + c.votes, 0), [candidates]);
  const remaining = Math.max(totalVoters - votesCast, 0);
  const pieData = candidates.map((c) => ({ name: c.name, value: c.votes }));

  return (
    <div className="page-wrap space-y-6">
      <h1 className="text-2xl font-extrabold">Live Results</h1>
      <select className="input max-w-md" value={selected} onChange={(e) => setSelected(e.target.value)}>
        {elections.map((e) => (
          <option key={e._id} value={e._id}>
            {e.name}
          </option>
        ))}
      </select>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<FaUsers />} label="Total Voters" value={totalVoters} color="bg-brand-primary" />
        <StatCard icon={<FaVoteYea />} label="Votes Cast" value={votesCast} color="bg-brand-primary" />
        <StatCard icon={<FaUsers />} label="Remaining Voters" value={remaining} color="bg-brand-primary" />
        <StatCard
          icon={<FaHourglassHalf />}
          label="Time Remaining"
          value={election ? <CountdownTimer targetDate={election.endDate} /> : "-"}
          color="bg-brand-primary"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PieChart data={pieData} title="Vote Distribution" />
        <ResultsChart candidates={candidates} title="Votes per Candidate" />
      </div>

      <section className="glass rounded-xl p-4">
        <h2 className="mb-3 text-lg font-bold">Candidate Ranking</h2>
        <div className="space-y-3">
          {candidates
            .slice()
            .sort((a, b) => b.votes - a.votes)
            .map((candidate, idx) => (
              <div key={candidate._id} className="rounded-lg border border-slate-200 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-semibold">
                    #{idx + 1} {candidate.name}
                  </p>
                  <p className="text-sm">{candidate.votes} votes</p>
                </div>
                <div className="h-2 rounded bg-slate-200">
                  <div
                    className="h-2 rounded bg-brand-primary transition-all duration-500"
                    style={{ width: formatPercent(candidate.votes, votesCast) }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">{formatPercent(candidate.votes, votesCast)}</p>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}

