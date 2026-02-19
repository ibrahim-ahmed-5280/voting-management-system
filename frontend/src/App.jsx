import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./pages/AdminLogin";
import VoterLogin from "./pages/VoterLogin";
import AdminRegister from "./pages/AdminRegister";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminElections from "./pages/admin/Elections";
import CreateElection from "./pages/admin/CreateElection";
import AdminCandidates from "./pages/admin/Candidates";
import CreateCandidate from "./pages/admin/CreateCandidate";
import AdminVoters from "./pages/admin/Voters";
import CreateVoter from "./pages/admin/CreateVoter";
import BulkImportVoters from "./pages/admin/BulkImportVoters";
import AdminVotes from "./pages/admin/Votes";
import LiveResults from "./pages/admin/LiveResults";
import FinalResults from "./pages/admin/FinalResults";
import AdminProfile from "./pages/admin/Profile";
import VoterDashboard from "./pages/voter/Dashboard";
import MyElections from "./pages/voter/MyElections";
import VotePage from "./pages/voter/VotePage";
import VoterResults from "./pages/voter/Results";

function AdminShell() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function VoterShell() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<VoterLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />

      <Route element={<ProtectedRoute allowRole="admin" />}>
        <Route element={<AdminShell />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/elections" element={<AdminElections />} />
          <Route path="/admin/elections/create" element={<CreateElection />} />
          <Route path="/admin/candidates" element={<AdminCandidates />} />
          <Route path="/admin/candidates/create" element={<CreateCandidate />} />
          <Route path="/admin/voters" element={<AdminVoters />} />
          <Route path="/admin/voters/create" element={<CreateVoter />} />
          <Route path="/admin/voters/bulk-import" element={<BulkImportVoters />} />
          <Route path="/admin/votes" element={<AdminVotes />} />
          <Route path="/admin/live-results" element={<LiveResults />} />
          <Route path="/admin/final-results" element={<FinalResults />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowRole="voter" />}>
        <Route element={<VoterShell />}>
          <Route path="/voter/dashboard" element={<VoterDashboard />} />
          <Route path="/voter/elections" element={<MyElections />} />
          <Route path="/voter/vote/:electionId" element={<VotePage />} />
          <Route path="/voter/results" element={<VoterResults />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

