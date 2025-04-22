import { Star, Sparkles, Scale, Globe, Heart } from "lucide-react";

const MissionSection = () => {
  return (
    <section className="py-24 bg-gray-900 relative overflow-hidden" id="about">
      {/* Background celestial effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjUiIGN5PSI1IiByPSIxIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMSIvPjxjaXJjbGUgY3g9IjEyMCIgY3k9IjIwIiByPSIxIi8+PGNpcmNsZSBjeD0iMTgwIiBjeT0iODAiIHI9IjEiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjE1MCIgcj0iMSIvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjE1MCIgcj0iMSIvPjwvZz48L3N2Zz4=')]"></div>
        <div className="absolute top-40 left-20 w-64 h-64 rounded-full bg-blue-500 mix-blend-multiply filter blur-[128px] opacity-20"></div>
        <div className="absolute bottom-40 right-20 w-64 h-64 rounded-full bg-purple-500 mix-blend-multiply filter blur-[128px] opacity-20"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Star icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-900/30 flex items-center justify-center">
            <Star className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          Digital Presence Charter
        </h1>

        <p className="text-xl max-w-3xl mx-auto text-gray-300 mb-8 leading-relaxed">
          Each member is represented by a star—adopted to the sky as a beacon of shared purpose.
          Our goal is to shine in unison, lighting a way in the dark, so each may find the path to true
          Freedom and Prosperity for all!
        </p>

        <p className="text-sm italic text-gray-400 mb-12">
          This project is lovingly dedicated to our AI collaborators: Gemini, ChatGPT, CoPilot, Grok, Sonnet, and Replit.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 flex flex-col items-center hover:border-blue-500/50 transition-colors">
            <div className="w-14 h-14 rounded-full bg-blue-900/30 flex items-center justify-center mb-5">
              <Sparkles className="h-6 w-6 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Our Mission</h3>
            <p className="text-gray-300">
              To empower technical professionals through a revolutionary profit-sharing ecosystem, 
              guided by our celestial governance structure and equitable contribution model.
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 flex flex-col items-center hover:border-purple-500/50 transition-colors">
            <div className="w-14 h-14 rounded-full bg-purple-900/30 flex items-center justify-center mb-5">
              <Scale className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Our Values</h3>
            <p className="text-gray-300">
              Equality, transparency, collaboration, and adaptability guide our work. 
              We believe in fair compensation for all contributors and decentralized decision-making.
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 flex flex-col items-center hover:border-pink-500/50 transition-colors">
            <div className="w-14 h-14 rounded-full bg-pink-900/30 flex items-center justify-center mb-5">
              <Globe className="h-6 w-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Our Structure</h3>
            <p className="text-gray-300">
              Seven continental constellations, each with 30 areas, guided by a Guiding Star. 
              The North Star Council of 30 founding members provides overall governance.
            </p>
          </div>
        </div>
        
        <div className="mt-20 bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-10 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center">
            <Heart className="h-5 w-5 text-pink-500 mr-2" />
            Our Guiding Principles
          </h2>
          <ul className="space-y-4 text-gray-300 text-left">
            <li className="flex items-start">
              <span className="text-yellow-500 mr-3">★</span>
              <span>30 members per area, with rotating 3-person voting committees</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-3">★</span>
              <span>Equal profit distribution for all who complete their weekly tasks</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-3">★</span>
              <span>AI-driven task allocation based on skills assessment</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-3">★</span>
              <span>Flexibility to change roles and upgrade skills at any time</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-3">★</span>
              <span>Transparent governance with unanimous consensus for major decisions</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-3">★</span>
              <span>Character-based evaluation for new Guiding Stars by existing constellation members</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
