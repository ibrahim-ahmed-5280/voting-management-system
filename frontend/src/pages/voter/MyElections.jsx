import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../api/client";
import ElectionCard from "../../components/Cards/ElectionCard";
import CandidateCard from "../../components/Cards/CandidateCard";
import { modalAnim } from "../../utils/animations";

export default function MyElections() {
  const [tab, setTab] = useState("all");
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    const { data } = await api.get("/api/voter/my-elections");
    setElections(data);
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const statusCount = { all: elections.length, upcoming: 0, ongoing: 0, completed: 0 };
    elections.forEach((election) => {
      if (statusCount[election.status] !== undefined) statusCount[election.status] += 1;
    });
    return statusCount;
  }, [elections]);

  const filtered = useMemo(
    () => (tab === "all" ? elections : elections.filter((e) => e.status === tab)),
    [elections, tab]
  );

  const openVote = (election) => {
    setSelectedElection(election);
    setSelectedCandidate(null);
  };

  const submitVote = async () => {
    if (!selectedElection || !selectedCandidate) return;
    try {
      await api.post("/api/votes", { election: selectedElection._id, candidate: selectedCandidate._id });
      toast.success("Vote cast successfully");
      setSelectedElection(null);
      setSelectedCandidate(null);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to cast vote");
    }
  };

  return (
    <div className="page-wrap space-y-6">
      <h1 className="text-2xl font-extrabold">My Elections</h1>
      <div className="flex flex-wrap gap-2">
        {["all", "upcoming", "ongoing", "completed"].map((item) => (
          <button
            key={item}
            className={tab === item ? "btn-primary capitalize" : "btn border border-slate-300 capitalize"}
            onClick={() => setTab(item)}
          >
            {item} ({counts[item] || 0})
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.length ? (
          filtered.map((election) => (
            <ElectionCard
              key={election._id}
              election={election}
              onVote={election.status === "ongoing" && !election.hasVoted ? openVote : undefined}
              onViewResults={election.status === "completed" ? () => navigate("/voter/results") : undefined}
            />
          ))
        ) : (
          <p className="text-sm text-slate-500">No elections found for this filter.</p>
        )}
      </div>

      <AnimatePresence>
        {selectedElection && (
          <div className="fixed inset-0 z-40 grid place-items-center bg-black/50 p-4">
            <motion.div {...modalAnim} className="glass max-h-[85vh] w-full max-w-3xl overflow-auto rounded-xl p-5">
              <h2 className="text-xl font-bold">Vote in {selectedElection.name}</h2>
              <p className="mb-3 text-sm text-slate-600">
                Select one candidate and confirm your vote.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {(selectedElection.candidates || []).map((candidate) => (
                  <CandidateCard
                    key={candidate._id}
                    candidate={candidate}
                    onSelect={setSelectedCandidate}
                    selected={selectedCandidate?._id === candidate._id}
                  />
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button className="btn-primary" onClick={submitVote} disabled={!selectedCandidate}>
                  Confirm Vote
                </button>
                <button className="btn border border-slate-300" onClick={() => setSelectedElection(null)}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
