import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import API from "../api/axios";

const QUOTES = [
  "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, or anxious.",
  "Self-care is not self-indulgence, it is self-preservation.",
  "You are allowed to be both a masterpiece and a work in progress simultaneously.",
  "Mental health is not a destination, but a process.",
  "Be gentle with yourself, you are a child of the universe.",
  "Recovery is not one and done. It is a lifelong journey.",
];

const EMOTION_EMOJI = {
  joy: "😊",
  sadness: "😢",
  anger: "😠",
  fear: "😨",
  surprise: "😲",
  disgust: "🤢",
  neutral: "😐",
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayMood, setTodayMood] = useState(null);
  const [recentTest, setRecentTest] = useState(null);
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    fetchTodayMood();
    fetchRecentTest();
  }, []);

  const fetchTodayMood = async () => {
    try {
      const res = await API.get("/mood/today");
      if (!res.data.message) setTodayMood(res.data);
    } catch (err) {}
  };

  const fetchRecentTest = async () => {
    try {
      const res = await API.get("/tests/history/all");
      if (res.data.length > 0) setRecentTest(res.data[0]);
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Hey, {user?.name} 👋
          </h1>
          <p className="text-gray-400 mt-1">How are you feeling today?</p>
        </div>

        {/* Quote */}
        <div className="bg-indigo-900/30 border border-indigo-700 rounded-2xl p-5 mb-8">
          <p className="text-indigo-300 italic text-sm">"{quote}"</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate("/chat")}
            className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl p-6 text-left transition"
          >
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-semibold text-lg">Start Chatting</h3>
            <p className="text-indigo-200 text-sm mt-1">Talk to your AI companion</p>
          </button>

          <button
            onClick={() => navigate("/mood")}
            className="bg-purple-700 hover:bg-purple-800 rounded-2xl p-6 text-left transition"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-lg">Mood Tracker</h3>
            <p className="text-purple-200 text-sm mt-1">Track your emotional journey</p>
          </button>

          <button
            onClick={() => navigate("/tests")}
            className="bg-teal-700 hover:bg-teal-800 rounded-2xl p-6 text-left transition"
          >
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-semibold text-lg">Take a Test</h3>
            <p className="text-teal-200 text-sm mt-1">Assess your mental health</p>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Today's Mood */}
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
            <h3 className="text-gray-400 text-sm mb-3">Today's Mood</h3>
            {todayMood ? (
              <div className="flex items-center gap-3">
                <span className="text-4xl">{EMOTION_EMOJI[todayMood.emotion] || "😐"}</span>
                <div>
                  <p className="text-white font-semibold capitalize">{todayMood.emotion}</p>
                  <p className="text-gray-400 text-sm">Score: {todayMood.score}/10</p>
                  {todayMood.note && <p className="text-gray-500 text-xs mt-1">{todayMood.note}</p>}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 text-sm mb-3">No mood logged yet today.</p>
                <button
                  onClick={() => navigate("/mood")}
                  className="text-indigo-400 text-sm hover:underline"
                >
                  Log your mood →
                </button>
              </div>
            )}
          </div>

          {/* Last Test Result */}
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
            <h3 className="text-gray-400 text-sm mb-3">Last Test Result</h3>
            {recentTest ? (
              <div>
                <p className="text-white font-semibold">{recentTest.test_name}</p>
                <p className="text-gray-400 text-sm mt-1">
                  Score: {recentTest.score} — {recentTest.interpretation}
                </p>
                <p className="text-gray-600 text-xs mt-2">
                  {new Date(recentTest.taken_at).toLocaleDateString()}
                </p>
                <button
                  onClick={() => navigate("/tests")}
                  className="text-teal-400 text-sm hover:underline mt-2 block"
                >
                  Take another test →
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 text-sm mb-3">No tests taken yet.</p>
                <button
                  onClick={() => navigate("/tests")}
                  className="text-teal-400 text-sm hover:underline"
                >
                  Take your first test →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Resources Link */}
        <div className="mt-4 bg-gray-900 border border-gray-700 rounded-2xl p-5 flex justify-between items-center">
          <div>
            <h3 className="text-white font-semibold">Need immediate help?</h3>
            <p className="text-gray-400 text-sm mt-1">Access crisis helplines and mental health resources</p>
          </div>
          <button
            onClick={() => navigate("/resources")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Resources →
          </button>
        </div>

      </div>
    </div>
  );
}