import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axios";

const EMOTION_EMOJI = {
  joy: "😊", sadness: "😢", anger: "😠",
  fear: "😨", surprise: "😲", disgust: "🤢", neutral: "😐",
};

const CRISIS_HELPLINES = (
  <div className="bg-red-900/40 border border-red-500 rounded-xl p-4 mb-4 text-sm">
    <p className="text-red-400 font-semibold mb-2">🆘 If you're in crisis, please reach out:</p>
    <p className="text-red-300">iCall: <a href="tel:9152987821" className="underline">9152987821</a></p>
    <p className="text-red-300">Vandrevala Foundation: <a href="tel:18602662345" className="underline">1860-2662-345</a></p>
  </div>
);

function formatTime(dateStr) {
  const date = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showCrisis, setShowCrisis] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    setMessages([{
      role: "assistant",
      content: "Hi there 👋 I'm Lucemind, your mental health companion. How are you feeling today?",
    }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const fetchSessions = async () => {
    try {
      const res = await API.get("/chat/sessions");
      setSessions(res.data);
    } catch (err) {}
  };

  const loadSession = async (id) => {
    try {
      const res = await API.get(`/chat/session/${id}`);
      setMessages(res.data.messages);
      setSessionId(id);
      setShowSidebar(false);
    } catch (err) {}
  };

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await API.delete(`/chat/session/${id}`);
      setSessions((prev) => prev.filter((s) => s._id !== id));
      if (sessionId === id) newChat();
    } catch (err) {}
    finally { setDeletingId(null); }
  };

  const newChat = () => {
    setMessages([{
      role: "assistant",
      content: "Hi there 👋 I'm Lucemind, your mental health companion. How are you feeling today?",
    }]);
    setSessionId(null);
    setShowCrisis(false);
    setShowSidebar(false);
  };

  const sendMessage = async () => {
  if (!input.trim() || loading) return;
  const userText = input;
  setMessages((prev) => [...prev, { role: "user", content: userText }]);
  setInput("");
  setLoading(true);

  try {
    const res = await API.post("/chat", {
      message: userText,
      session_id: sessionId,
    });
    setSessionId(res.data.session_id);
    if (res.data.is_crisis) setShowCrisis(true);
    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        role: "user",
        content: userText,
        emotion: res.data.emotion,
        mood_score: res.data.mood_score,
      };
      return [
        ...updated,
        {
          role: "assistant",
          content: res.data.reply,
        },
      ];
    });
    fetchSessions();
  } catch (err) {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Sorry, something went wrong. Please try again." },
    ]);
  } finally {
    setLoading(false);
  }
};

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-5xl mx-auto w-full px-4 py-6 gap-4">

        {/* Sidebar */}
        <div className={`${showSidebar ? "flex" : "hidden"} md:flex flex-col w-64 bg-gray-900 border border-gray-700 rounded-2xl p-4 gap-2`}>
          <button
            onClick={newChat}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded-lg mb-2 transition font-semibold"
          >
            + New Chat
          </button>
          <p className="text-gray-500 text-xs mb-1">Past Sessions</p>
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[70vh]">
            {sessions.length === 0 && <p className="text-gray-600 text-xs">No past sessions</p>}
            {sessions.map((s) => (
              <div
                key={s._id}
                onClick={() => loadSession(s._id)}
                className={`flex items-center justify-between text-xs bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 cursor-pointer transition group ${sessionId === s._id ? "border border-indigo-500" : ""}`}
              >
                <span className="text-gray-400 group-hover:text-white truncate">
                  {formatTime(s.created_at)}
                </span>
                <button
                  onClick={(e) => deleteSession(e, s._id)}
                  className="text-gray-600 hover:text-red-400 ml-2 transition shrink-0"
                  title="Delete session"
                >
                  {deletingId === s._id ? "..." : "🗑️"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="md:hidden text-gray-400 hover:text-white mr-2"
              >☰</button>
              <span className="text-2xl">🧠</span>
              <div>
                <p className="font-semibold text-white text-sm">Lucemind</p>
                <p className="text-green-400 text-xs">● Online</p>
              </div>
            </div>
            <button
              onClick={newChat}
              className="text-gray-400 hover:text-white text-xs border border-gray-600 hover:border-gray-400 px-3 py-1 rounded-lg transition"
            >
              New Chat
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
            {showCrisis && CRISIS_HELPLINES}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-gray-800 text-gray-100 rounded-bl-sm"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.role === "user" && msg.emotion && msg.mood_score !== undefined && (
                    <p className="text-xs mt-2 opacity-60">
                      {EMOTION_EMOJI[msg.emotion]} {msg.emotion} · mood {msg.mood_score}/10
                    </p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm text-sm text-gray-400 animate-pulse">
                  Lucemind is typing...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-700 flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder="Share what's on your mind... (Enter to send, Shift+Enter for new line)"
              className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:border-indigo-500 overflow-hidden"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm transition shrink-0"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}