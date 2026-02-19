import { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaUserTie, FaUsers, FaVoteYea } from "react-icons/fa";
import api from "../../api/client";
import StatCard from "../../components/Cards/StatCard";
import PieChart from "../../components/Charts/PieChart";
import BarChart from "../../components/Charts/BarChart";
import ElectionCard from "../../components/Cards/ElectionCard";
import { formatDate } from "../../utils/formatters";

export default function Dashboard() {
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [voters, setVoters] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [eRes, cRes, vRes, voteRes] = await Promise.all([
          api.get("/api/elections"),
          api.get("/api/candidates"),
          api.get("/api/voter"),
          api.get("/api/votes")
        ]);
        if (!mounted) return;
        setElections(eRes.data);
        setCandidates(cRes.data);
        setVoters(vRes.data);
        setVotes(voteRes.data);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const statusPie = useMemo(() => {
    const counts = { upcoming: 0, ongoing: 0, completed: 0 };
    elections.forEach((e) => {
      counts[e.status] += 1;
    });
    return [
      { name: "Upcoming", value: counts.upcoming },
      { name: "Ongoing", value: counts.ongoing },
      { name: "Completed", value: counts.completed }
    ];
  }, [elections]);

  const votesBar = useMemo(
    () => elections.map((e) => ({ name: e.name, value: e.totalVotes || 0 })),
    [elections]
  );

  const ongoing = elections.filter((e) => e.status === "ongoing").slice(0, 3);

  if (loading) return <div className="page-wrap">Loading dashboard...</div>;

  return (
    <div className="page-wrap space-y-6">
      <h1 className="text-2xl font-extrabold">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<FaCalendarAlt />} label="Total Elections" value={elections.length} color="bg-brand-primary" />
        <StatCard icon={<FaUserTie />} label="Total Candidates" value={candidates.length} color="bg-brand-primary" />
        <StatCard icon={<FaUsers />} label="Total Voters" value={voters.length} color="bg-brand-primary" />
        <StatCard icon={<FaVoteYea />} label="Total Votes" value={votes.length} color="bg-brand-primary" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PieChart data={statusPie} title="Elections Status" />
        <BarChart data={votesBar} title="Votes by Election" />
      </div>

      <section>
        <h2 className="mb-3 text-xl font-bold">Ongoing Elections</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ongoing.length ? ongoing.map((e) => <ElectionCard key={e._id} election={e} />) : <p>No ongoing elections.</p>}
        </div>
      </section>

      <section className="glass overflow-x-auto rounded-xl p-4">
        <h2 className="mb-3 text-xl font-bold">Recent Votes</h2>
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="pb-2">Voter</th>
              <th className="pb-2">Election</th>
              <th className="pb-2">Candidate</th>
              <th className="pb-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {votes.slice(0, 10).map((vote) => (
              <tr key={vote._id} className="border-t border-slate-200">
                <td className="py-2">{vote.voter?.name || "-"}</td>
                <td className="py-2">{vote.election?.name || "-"}</td>
                <td className="py-2">{vote.candidate?.name || "-"}</td>
                <td className="py-2">{formatDate(vote.votedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

