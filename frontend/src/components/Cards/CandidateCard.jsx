import { motion } from "framer-motion";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { cardHover } from "../../utils/animations";

export default function CandidateCard({ candidate, onEdit, onDelete, onSelect, selected }) {
  return (
    <motion.div
      {...cardHover}
      className={`glass rounded-xl p-4 transition ${
        selected
          ? "border-brand-primary ring-2 ring-brand-primary bg-brand-primary/5 dark:border-white dark:ring-white dark:bg-white/10"
          : ""
      }`}
      onClick={() => onSelect?.(candidate)}
    >
      <div className="mb-3 flex items-center gap-3">
        <img
          src={candidate.photo || "https://via.placeholder.com/80x80?text=Photo"}
          alt={candidate.name}
          className="h-14 w-14 rounded-full object-cover"
        />
        <div>
          <h4 className="font-semibold">{candidate.name}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-300">
            Votes: <span className="font-semibold">{candidate.votes}</span>
          </p>
        </div>
      </div>
      <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{candidate.description}</p>
      {(onEdit || onDelete) && (
        <div className="mt-3 flex gap-2">
          {onEdit && (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-secondary hover:underline"
              onClick={() => onEdit(candidate)}
            >
              <FaEdit />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 hover:underline"
              onClick={() => onDelete(candidate)}
            >
              <FaTrashAlt />
              Delete
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

