import { motion } from "framer-motion";
import { cardHover } from "../../utils/animations";

export default function StatCard({ icon, label, value, color = "bg-brand-primary" }) {
  return (
    <motion.div {...cardHover} className="glass rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <div className={`rounded-lg p-3 text-white ${color}`}>{icon}</div>
      </div>
    </motion.div>
  );
}

