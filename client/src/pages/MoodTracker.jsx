import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

const EMOTION_EMOJI = {
  joy: "😊", sadness: "😢", anger: "😠",
  fear: "😨", surprise: "😲", disgust: "🤢", neutral: "😐",
};

const MOOD_OPTIONS = [
  { score: 1, emoji: "😭", label: "Terrible" },
  { score: 3, emoji: "😢", label: "Sad" },
  { score: 5, emoji: "😐", label: "Okay" },
  { score: 7, emoji: "🙂", label: "Good" },
  { score: 9, emoji: "😄", label: "Great" },
];

export default function MoodTracker() {
  const [todayMood, setTodayMood] = useState(null);
  const [history, setHistory] = useState([]);
  const [days, setDays] = useState(7);
  const [selectedScore, setSelectedScore] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchToday();
    fetchHistory();
  }, [days]);

  const fetchToday = async () => {
    try {
      const res = await API.get("/mood/today");
      if (!res.data.message) setTodayMood(res.data);
    } catch (err) {}
  };

  const fetchHistory = async () => {
    try {
      const res = await API.get(`/mood/history?days=${days}`);
      const sorted = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setHistory(sorted);
    } catch (err) {}
  };

  const saveMood = async () => {
    if (!selectedScore) return;
    setSaving(true);
    try {
      await API.post("/mood", {
        score: selectedScore,
        note: note,
        source: "manual",
      });
      setSaved(true);
      setSelectedScore(null);
      setNote("");
      fetchToday();
      fetchHistory();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {}
    finally { setSaving(false); }
  };

  const chartData = history.map((h) => ({
    date: new Date(h.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    score: h.score,
    emotion: h.emotion,
  }));

  const avgScore = history.length
    ? (history.reduce((sum, h) => sum + h.score, 0) / history.length).toFixed(1)
    : null;

  const mostFrequentEmotion = history.length
    ? Object.entries(
        history.reduce((acc, h) => {
          acc[h.emotion] = (acc[h.emotion] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-1">📊 Mood Tracker</h1>
        <p className="text-gray-400 text-sm mb-8">Track how you feel over time</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Today's Mood */}
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
            <h3 className="text-gray-400 text-sm mb-4">Today's Mood</h3>
            {todayMood ? (
              <div className="flex items-center gap-3">
                <span className="text-4xl">{EMOTION_EMOJI[todayMood.emotion] || "😐"}</span>
                <div>
                  <p className="text-white font-semibold capitalize">{todayMood.emotion}</p>
                  <p className="text-gray-400 text-sm">Score: {todayMood.score}/10</p>
                  <p className="text-gray-500 text-xs capitalize">Source: {todayMood.source}</p>
                  {todayMood.note && <p className="text-gray-400 text-xs mt-1">"{todayMood.note}"</p>}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No mood logged yet today</p>
            )}
          </div>

          {/* Stats */}
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
            <h3 className="text-gray-400 text-sm mb-4">Stats (Last {days} days)</h3>
            {history.length > 0 ? (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Average Mood</span>
                  <span className="text-white font-semibold">{avgScore}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Days Logged</span>
                  <span className="text-white font-semibold">{history.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Most Frequent</span>
                  <span className="text-white font-semibold capitalize">
                    {EMOTION_EMOJI[mostFrequentEmotion]} {mostFrequentEmotion}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No history yet</p>
            )}
          </div>
        </div>

        {/* Manual Mood Log */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-8">
          <h3 className="text-white font-semibold mb-4">Log Mood Manually</h3>
          <div className="flex gap-3 mb-4 flex-wrap">
            {MOOD_OPTIONS.map((opt) => (
              <button
                key={opt.score}
                onClick={() => setSelectedScore(opt.score)}
                className={`flex flex-col items-center px-4 py-3 rounded-xl border transition ${
                  selectedScore === opt.score
                    ? "border-indigo-500 bg-indigo-900/40"
                    : "border-gray-600 hover:border-gray-400"
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-xs text-gray-400 mt-1">{opt.label}</span>
              </button>
            ))}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)..."
            rows={2}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:border-indigo-500 mb-3"
          />
          <button
            onClick={saveMood}
            disabled={!selectedScore || saving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm transition"
          >
            {saving ? "Saving..." : saved ? "✅ Saved!" : "Save Mood"}
          </button>
        </div>

        {/* Chart */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold">Mood Over Time</h3>
            <div className="flex gap-2">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`text-xs px-3 py-1 rounded-lg border transition ${
                    days === d
                      ? "border-indigo-500 text-indigo-400"
                      : "border-gray-600 text-gray-400 hover:border-gray-400"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                  labelStyle={{ color: "#fff" }}
                  itemStyle={{ color: "#818CF8" }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={{ fill: "#6366F1", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">
              Log at least 2 days of mood to see your chart
            </p>
          )}
        </div>

      </div>
    </div>
  );
}