import { motion } from "framer-motion";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import CountdownTimer from "../CountdownTimer";
import { cardHover } from "../../utils/animations";
import { formatDateRange } from "../../utils/formatters";

const statusClasses = {
  upcoming: "bg-slate-100 text-brand-primary",
  ongoing: "bg-slate-100 text-brand-primary",
  completed: "bg-slate-100 text-brand-primary"
};

export default function ElectionCard({ election, onEdit, onDelete, onVote, onViewResults }) {
  return (
    <motion.div {...cardHover} className="glass overflow-hidden rounded-xl">
      <div
        className="h-36 bg-cover bg-center"
        style={{
          backgroundImage: election.photo
            ? `linear-gradient(135deg, rgba(21,31,46,.7), rgba(36,98,199,.45)), url(${election.photo})`
            : "linear-gradient(135deg,#151F2E,#2462C7)"
        }}
      />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="line-clamp-1 text-lg font-bold">{election.name}</h3>
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClasses[election.status]}`}>
            {election.status}
          </span>
        </div>
        <p className="text-sm text-slate-600">{formatDateRange(election.startDate, election.endDate)}</p>
        {(election.status === "ongoing" || election.status === "upcoming") && (
          <CountdownTimer targetDate={election.status === "ongoing" ? election.endDate : election.startDate} />
        )}
        <div className="flex flex-wrap gap-2">
          {onEdit && (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-secondary hover:underline"
              onClick={() => onEdit(election)}
            >
              <FaEdit />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 hover:underline"
              onClick={() => onDelete(election)}
            >
              <FaTrashAlt />
              Delete
            </button>
          )}
          {onVote && <button className="btn-success" onClick={() => onVote(election)}>Vote Now</button>}
          {onViewResults && <button className="btn-secondary" onClick={() => onViewResults(election)}>View Results</button>}
        </div>
      </div>
    </motion.div>
  );
}

