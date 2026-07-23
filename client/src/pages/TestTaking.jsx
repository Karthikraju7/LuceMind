import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../api/axios";

export default function TestTaking() {
  const { testName } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTest();
  }, [testName]);

  const fetchTest = async () => {
    try {
      const res = await API.get(`/tests/${testName}`);
      setTest(res.data);
      setAnswers(new Array(res.data.questions.length).fill(null));
    } catch (err) {
      navigate("/tests");
    }
  };

  const selectAnswer = (value) => {
    const updated = [...answers];
    updated[current] = value;
    setAnswers(updated);
  };

  const next = () => {
    if (current < test.questions.length - 1) setCurrent(current + 1);
  };

  const prev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const submit = async () => {
    if (answers.includes(null)) return;
    setSubmitting(true);
    try {
      const res = await API.post("/tests/submit", {
        test_name: testName,
        answers: answers,
      });
      setResult(res.data);
    } catch (err) {}
    finally { setSubmitting(false); }
  };

  const getInterpretationColor = (interpretation) => {
    if (interpretation.toLowerCase().includes("minimal") || interpretation.toLowerCase().includes("no") || interpretation.toLowerCase().includes("low")) return "text-green-400";
    if (interpretation.toLowerCase().includes("mild")) return "text-yellow-400";
    if (interpretation.toLowerCase().includes("moderate")) return "text-orange-400";
    return "text-red-400";
  };

  if (!test) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      Loading...
    </div>
  );

  if (result) return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold mb-2">Test Complete!</h2>
        <p className="text-gray-400 mb-8">{test.name}</p>

        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-6">
          <p className="text-gray-400 text-sm mb-1">Your Score</p>
          <p className="text-5xl font-bold text-white mb-2">{result.score}</p>
          <p className="text-gray-500 text-sm mb-4">out of {result.max_score}</p>
          <p className={`text-xl font-semibold ${getInterpretationColor(result.interpretation)}`}>
            {result.interpretation}
          </p>
        </div>

        <div className="bg-indigo-900/30 border border-indigo-700 rounded-xl p-4 mb-6 text-sm text-indigo-300 text-left">
          ⚠️ This screening tool is not a clinical diagnosis. If you're concerned about your mental health, please speak with a qualified professional.
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate("/tests")}
            className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg text-sm transition"
          >
            Back to Tests
          </button>
          <button
            onClick={() => navigate("/chat")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm transition"
          >
            Talk to Lucemind
          </button>
        </div>
      </div>
    </div>
  );

  const progress = ((current + 1) / test.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-lg mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">{test.name}</h2>
            <span className="text-gray-400 text-sm">{current + 1}/{test.questions.length}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-6">
          <p className="text-gray-400 text-xs mb-3">Question {current + 1}</p>
          <p className="text-white text-lg leading-relaxed">{test.questions[current]}</p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3 mb-6">
          {test.options.map((option, i) => (
            <button
              key={i}
              onClick={() => selectAnswer(i)}
              className={`text-left px-4 py-3 rounded-xl border text-sm transition ${
                answers[current] === i
                  ? "border-indigo-500 bg-indigo-900/40 text-white"
                  : "border-gray-600 text-gray-300 hover:border-gray-400"
              }`}
            >
              <span className="text-gray-500 mr-2">{i}.</span> {option}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prev}
            disabled={current === 0}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-white px-5 py-2 rounded-lg text-sm transition"
          >
            ← Previous
          </button>

          {current < test.questions.length - 1 ? (
            <button
              onClick={next}
              disabled={answers[current] === null}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm transition"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={answers.includes(null) || submitting}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm transition"
            >
              {submitting ? "Submitting..." : "Submit ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}