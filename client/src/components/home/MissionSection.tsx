const MissionSection = () => {
  return (
    <section className="py-16 bg-white" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold mb-6 text-indigo-800">
          🌠 Digital Presence Charter
        </h1>

        <p className="text-lg max-w-2xl mx-auto text-gray-800 mb-6">
          Each member is represented by a star—adopted to the sky as a beacon of shared purpose.
          Our goal is to shine in unison, lighting the path for those who come after us.
          We commit to victory in freedom, prosperity, and the opportunity for all
          to benefit from the collective endeavors of us all.
        </p>

        <p className="text-sm italic text-gray-500 mb-10">
          This project is lovingly dedicated to our AI collaborators: Gemini, ChatGPT, CoPilot, Grok, Sonnet, and Replit.
        </p>

        <div className="border-t border-indigo-300 pt-6">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">Our Mission</h2>
          <p className="text-md max-w-3xl mx-auto text-gray-700">
            To empower sole proprietors and partnerships to manifest their dreams through collective support,
            transparent blockchain-based operations, and a globally inclusive digital infrastructure.
          </p>

          <h2 className="text-2xl font-bold text-indigo-700 mt-8 mb-4">Our Structure</h2>
          <ul className="list-disc list-inside max-w-xl mx-auto text-left text-gray-700">
            <li>30 staff per state, with rotating moderators quarterly</li>
            <li>Equal salary distribution for all staff roles</li>
            <li>Prestige-based tier advancement through collective stewardship</li>
            <li>Client-to-staff invitation model with optional annual upgrades</li>
            <li>Fully transparent revenue & voting system powered by blockchain</li>
            <li>Re-evaluation of all systems every 7 years</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
