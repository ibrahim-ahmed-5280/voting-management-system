import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/client";
import CandidateCard from "../../components/Cards/CandidateCard";

export default function VotePage() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [eRes, cRes] = await Promise.all([
        api.get(`/api/elections/${electionId}`),
        api.get("/api/candidates", { params: { election: electionId } })
      ]);
      setElection(eRes.data);
      setCandidates(cRes.data);
    };
    load();
  }, [electionId]);

  const submit = async () => {
    if (!selected) return;
    try {
      await api.post("/api/votes", { election: electionId, candidate: selected._id });
      toast.success("Vote submitted");
      navigate("/voter/elections");
    } catch (error) {
      toast.error(error.response?.data?.message || "Vote failed");
    }
  };

  return (
    <div className="page-wrap space-y-4">
      <h1 className="text-2xl font-extrabold">Vote Page</h1>
      <p className="text-sm text-slate-600">{election?.name}</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate._id}
            candidate={candidate}
            onSelect={setSelected}
            selected={selected?._id === candidate._id}
          />
        ))}
      </div>
      <button className="btn-primary" onClick={submit} disabled={!selected}>
        Confirm Vote
      </button>
    </div>
  );
}

