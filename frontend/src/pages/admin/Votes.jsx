import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaFileExcel, FaFilter, FaTrashAlt } from "react-icons/fa";
import api from "../../api/client";
import { formatDate } from "../../utils/formatters";

export default function Votes() {
  const [votes, setVotes] = useState([]);
  const [elections, setElections] = useState([]);
  const [filters, setFilters] = useState({ election: "", from: "", to: "", search: "" });

  const load = async () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    const [voteRes, electionRes] = await Promise.all([
      api.get("/api/votes", { params }),
      api.get("/api/elections")
    ]);
    setVotes(voteRes.data);
    setElections(electionRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const filteredCount = useMemo(() => votes.length, [votes]);

  const onDelete = async (id) => {
    if (!window.confirm("Delete vote record?")) return;
    await api.delete(`/api/votes/${id}`);
    toast.success("Vote deleted");
    load();
  };

  const download = async () => {
    const response = await api.get("/api/votes/download", { responseType: "blob" });
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "votes_report.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-wrap space-y-6">
      <h1 className="text-2xl font-extrabold">Votes Audit</h1>
      <section className="glass grid gap-3 rounded-xl p-4 md:grid-cols-4">
        <select className="input" value={filters.election} onChange={(e) => setFilters({ ...filters, election: e.target.value })}>
          <option value="">All elections</option>
          {elections.map((election) => (
            <option key={election._id} value={election._id}>
              {election.name}
            </option>
          ))}
        </select>
        <input className="input" type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        <input className="input" type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        <input className="input" placeholder="Voter email or name" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <div className="md:col-span-4 flex gap-2">
          <button className="btn-primary" onClick={load}>
            <FaFilter />
            Apply Filters
          </button>
          <button className="btn-secondary" onClick={download}>
            <FaFileExcel />
            Export Excel
          </button>
        </div>
      </section>

      <section className="glass rounded-xl p-4">
        <p className="mb-3 text-sm text-slate-500">Showing {filteredCount} vote records</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th>Voter</th>
                <th>Election</th>
                <th>Candidate</th>
                <th>Timestamp</th>
                <th>IP Address</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {votes.map((vote) => (
                <tr key={vote._id} className="border-t border-slate-200">
                  <td className="py-2">
                    <p className="font-semibold">{vote.voter?.name}</p>
                    <p className="text-xs text-slate-500">{vote.voter?.email}</p>
                  </td>
                  <td>{vote.election?.name}</td>
                  <td>{vote.candidate?.name}</td>
                  <td>{formatDate(vote.votedAt)}</td>
                  <td title={vote.ipAddress}>{vote.ipAddress || "-"}</td>
                  <td>
                    <button className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 hover:underline" onClick={() => onDelete(vote._id)}>
                      <FaTrashAlt />
                      Delete
                    </button>
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

