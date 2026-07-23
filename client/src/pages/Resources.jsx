import Navbar from "../components/Navbar";

const RESOURCES = [
  {
    category: "🆘 Crisis Helplines",
    color: "border-red-700 bg-red-900/20",
    headerColor: "text-red-400",
    items: [
      {
        name: "iCall",
        description: "Free counseling by trained professionals. Call or chat.",
        link: "https://icallhelpline.org",
        contact: "9152987821",
        tag: "Free · India",
      },
      {
        name: "Vandrevala Foundation",
        description: "24/7 mental health helpline across India.",
        link: "https://www.vandrevalafoundation.com",
        contact: "1860-2662-345",
        tag: "24/7 · Free",
      },
      {
        name: "NIMHANS Helpline",
        description: "National mental health helpline by NIMHANS Bangalore.",
        link: "https://nimhans.ac.in",
        contact: "080-46110007",
        tag: "Government · Free",
      },
    ],
  },
  {
    category: "🧠 Self-Help & Learning",
    color: "border-indigo-700 bg-indigo-900/20",
    headerColor: "text-indigo-400",
    items: [
      {
        name: "Mind.org.uk",
        description: "Comprehensive mental health information and guides.",
        link: "https://www.mind.org.uk",
        tag: "Articles · Free",
      },
      {
        name: "7 Cups",
        description: "Free online chat with trained listeners anytime.",
        link: "https://www.7cups.com",
        tag: "Chat · Free",
      },
      {
        name: "Headspace",
        description: "Guided meditation and mindfulness for stress and anxiety.",
        link: "https://www.headspace.com",
        tag: "App · Freemium",
      },
      {
        name: "Wysa",
        description: "AI-powered mental health app built for students.",
        link: "https://www.wysa.com",
        tag: "App · Free",
      },
    ],
  },
  {
    category: "🎓 Student Specific",
    color: "border-teal-700 bg-teal-900/20",
    headerColor: "text-teal-400",
    items: [
      {
        name: "UGC Mental Health Guidelines",
        description: "Official mental health resources for Indian college students.",
        link: "https://www.ugc.ac.in",
        tag: "India · Official",
      },
      {
        name: "The Live Love Laugh Foundation",
        description: "Indian foundation focused on student mental health awareness.",
        link: "https://www.thelivelovelaughfoundation.org",
        tag: "India · Free",
      },
      {
        name: "YourDOST",
        description: "Online counseling platform popular among Indian college students.",
        link: "https://yourdost.com",
        tag: "India · Freemium",
      },
    ],
  },
  {
    category: "🎥 YouTube Channels",
    color: "border-yellow-700 bg-yellow-900/20",
    headerColor: "text-yellow-400",
    items: [
      {
        name: "Therapy in a Nutshell",
        description: "Mental health education in simple, digestible videos.",
        link: "https://www.youtube.com/@TherapyinaNutshell",
        tag: "YouTube · Free",
      },
      {
        name: "Kati Morton",
        description: "Licensed therapist explaining mental health concepts clearly.",
        link: "https://www.youtube.com/@KatiMorton",
        tag: "YouTube · Free",
      },
      {
        name: "Psych2Go",
        description: "Animated mental health and psychology content for students.",
        link: "https://www.youtube.com/@Psych2go",
        tag: "YouTube · Free",
      },
    ],
  },
];

export default function Resources() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-1">🌐 Resources & Helplines</h1>
        <p className="text-gray-400 text-sm mb-8">
          You are not alone. Here are trusted resources to help you through difficult times.
        </p>

        {/* Emergency Banner */}
        <div className="bg-red-900/30 border border-red-600 rounded-2xl p-4 mb-8 flex items-center gap-4">
          <span className="text-3xl">🆘</span>
          <div>
            <p className="text-red-400 font-semibold">In immediate danger?</p>
            <p className="text-gray-300 text-sm">
              Call iCall now:{" "}
              <a href="tel:9152987821" className="text-white font-bold underline">
                9152987821
              </a>{" "}
              or Vandrevala Foundation:{" "}
              <a href="tel:18602662345" className="text-white font-bold underline">
                1860-2662-345
              </a>
            </p>
          </div>
        </div>

        {/* Resource Sections */}
        <div className="flex flex-col gap-8">
          {RESOURCES.map((section) => (
            <div key={section.category}>
              <h2 className={`text-lg font-semibold mb-4 ${section.headerColor}`}>
                {section.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {section.items.map((item) => (
                  <a
                    key={item.name}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`border ${section.color} rounded-2xl p-4 hover:opacity-80 transition block`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-white font-semibold text-sm">{item.name}</p>
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full ml-2 shrink-0">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">{item.description}</p>
                    {item.contact && (
                      <p className="text-white text-xs font-semibold mt-2">📞 {item.contact}</p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-10 bg-gray-900 border border-gray-700 rounded-2xl p-4 text-center">
          <p className="text-gray-400 text-sm">
            Lucemind is a supportive companion, not a replacement for professional help.
          </p>
          <p className="text-gray-500 text-xs mt-1">
            If you're struggling, please reach out to a qualified mental health professional.
          </p>
        </div>
      </div>
    </div>
  );
}