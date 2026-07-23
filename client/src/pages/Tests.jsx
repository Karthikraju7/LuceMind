import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../api/axios";

const TEST_COLORS = {
  "PHQ-9": { bg: "bg-blue-900/30", border: "border-blue-700", btn: "bg-blue-600 hover:bg-blue-700", emoji: "😔" },
  "GAD-7": { bg: "bg-yellow-900/30", border: "border-yellow-700", btn: "bg-yellow-600 hover:bg-yellow-700", emoji: "😰" },
  "PSS-10": { bg: "bg-red-900/30", border: "border-red-700", btn: "bg-red-600 hover:bg-red-700", emoji: "😤" },
  "Burnout": { bg: "bg-purple-900/30", border: "border-purple-700", btn: "bg-purple-600 hover:bg-purple-700", emoji: "🥵" },
};

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
    fetchHistory();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await API.get("/tests");
      setTests(res.data);
    } catch (err) {}
  };

  const fetchHistory = async () => {
    try {
      const res = await API.get("/tests/history/all");
      setHistory(res.data);
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-1">📝 Self Assessment Tests</h1>
        <p className="text-gray-400 text-sm mb-8">
          These are standard mental health screening tools. They are not diagnostic — always consult a professional for proper evaluation.
        </p>

        {/* Test Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {tests.map((test) => {
            const style = TEST_COLORS[test.id] || { bg: "bg-gray-900/30", border: "border-gray-700", btn: "bg-gray-600 hover:bg-gray-700", emoji: "📋" };
            const lastResult = history.find((h) => h.test_name === test.id);
            return (
              <div key={test.id} className={`${style.bg} border ${style.border} rounded-2xl p-5`}>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-3xl">{style.emoji}</span>
                  {lastResult && (
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-lg">
                      Last: {lastResult.score}/{lastResult.test_name === "PHQ-9" ? 27 : lastResult.test_name === "GAD-7" ? 21 : 40}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-white mb-1">{test.name}</h3>
                <p className="text-gray-400 text-sm mb-1">{test.description}</p>
                <p className="text-gray-500 text-xs mb-4">{test.question_count} questions</p>
                {lastResult && (
                  <p className="text-xs text-gray-400 mb-3">
                    Last result: <span className="text-white">{lastResult.interpretation}</span>
                  </p>
                )}
                <button
                  onClick={() => navigate(`/tests/${test.id}`)}
                  className={`${style.btn} text-white text-sm px-4 py-2 rounded-lg transition`}
                >
                  {lastResult ? "Retake Test" : "Start Test"}
                </button>
              </div>
            );
          })}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4">Test History</h3>
            <div className="flex flex-col gap-3">
              {history.map((result, i) => (
                <div key={i} className="flex justify-between items-center border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-white text-sm font-medium">{result.test_name}</p>
                    <p className="text-gray-400 text-xs">{result.interpretation}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-semibold">{result.score}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(result.taken_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}