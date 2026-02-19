import { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaCheckCircle, FaClock } from "react-icons/fa";
import api from "../../api/client";
import StatCard from "../../components/Cards/StatCard";
import ElectionCard from "../../components/Cards/ElectionCard";

const getWinnerText = (result) => {
  if (result?.winner?.name) return result.winner.name;
  if (result?.winnerReason === "tie") return "No winner (Tie)";
  if (result?.winnerReason === "no_votes") return "No winner (No votes)";
  if (result?.winnerReason === "no_candidates") return "No winner";
  return "Pending";
};

export default function Dashboard() {
  const [elections, setElections] = useState([]);
  const [results, setResults] = useState([]);

  const load = async () => {
    const [eRes, rRes] = await Promise.all([api.get("/api/voter/my-elections"), api.get("/api/voter/results")]);
    setElections(eRes.data);
    setResults(rRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const assigned = elections.length;
  const votesCast = useMemo(() => results.filter((r) => r.myVote).length, [results]);
  const pending = Math.max(assigned - votesCast, 0);
  const upcoming = elections.filter((e) => e.status === "upcoming").slice(0, 4);

  return (
    <div className="page-wrap space-y-6">
      <div className="glass rounded-xl bg-brand-primary p-5 text-white">
        <h1 className="text-2xl font-extrabold">Welcome to your voter dashboard</h1>
        <p className="mt-1 text-sm text-white/80">Track assigned elections and voting activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<FaCalendarAlt />} label="Assigned Elections" value={assigned} color="bg-brand-primary" />
        <StatCard icon={<FaCheckCircle />} label="Votes Cast" value={votesCast} color="bg-brand-primary" />
        <StatCard icon={<FaClock />} label="Pending Votes" value={pending} color="bg-brand-primary" />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold">Upcoming Elections</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {upcoming.length ? upcoming.map((e) => <ElectionCard key={e._id} election={e} />) : <p>No upcoming elections.</p>}
        </div>
      </section>

      <section className="glass rounded-xl p-4">
        <h2 className="text-lg font-bold">Recent Activity</h2>
        <div className="mt-3 space-y-2">
          {results.slice(0, 5).map((result) => (
            <p key={result.election._id} className="text-sm">
              Voted in <strong>{result.election.name}</strong> - winner:{" "}
              <strong>{getWinnerText(result)}</strong>
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}

