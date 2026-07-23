import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
      <Link to="/dashboard" className="text-xl font-bold text-indigo-400">
        🧠 Lucemind
      </Link>
      <div className="flex gap-6 items-center">
        <Link to="/chat" className="text-gray-300 hover:text-white text-sm">Chat</Link>
        <Link to="/mood" className="text-gray-300 hover:text-white text-sm">Mood</Link>
        <Link to="/tests" className="text-gray-300 hover:text-white text-sm">Tests</Link>
        <Link to="/resources" className="text-gray-300 hover:text-white text-sm">Resources</Link>
        <span className="text-gray-400 text-sm">Hi, {user?.name}</span>
        <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded">
          Logout
        </button>
      </div>
    </nav>
  );
}