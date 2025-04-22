import { Link } from "wouter";
import { Star, Sparkles, Globe, Mail, Users, FileText, BookOpen, HelpCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16 border-t border-gray-800 relative overflow-hidden">
      {/* Background Stars */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute h-full w-full">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 5 + 3}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
                <Star className="h-6 w-6 text-yellow-300" />
              </div>
              <span className="ml-3 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Digital Presence</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Empowering technical professionals through our celestial profit-sharing ecosystem, where each member shines as a star in our constellation.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-blue-400 hover:text-blue-300 transition-colors"
                aria-label="Twitter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-purple-400 hover:text-purple-300 transition-colors"
                aria-label="GitHub"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-pink-400 hover:text-pink-300 transition-colors"
                aria-label="Discord"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 11a5 5 0 0 1 5 5v6h-6.5a3.5 3.5 0 0 1-3.5-3.5V11" />
                  <path d="M13.5 6.5a3.5 3.5 0 0 1 7 0V13" />
                  <rect width="7" height="5" x="14" y="13" rx="1" />
                  <circle cx="5" cy="8" r="3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Constellation Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-2" />
              <span>Constellation Map</span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/">
                  <a className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                    <span className="text-xs mr-2">★</span>
                    Home
                  </a>
                </Link>
              </li>
              <li>
                <a
                  href="/#features"
                  className="text-gray-400 hover:text-blue-400 transition-colors flex items-center"
                >
                  <span className="text-xs mr-2">★</span>
                  Features
                </a>
              </li>
              <li>
                <a
                  href="/#about"
                  className="text-gray-400 hover:text-blue-400 transition-colors flex items-center"
                >
                  <span className="text-xs mr-2">★</span>
                  Our Mission
                </a>
              </li>
              <li>
                <Link href="/join">
                  <a className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                    <span className="text-xs mr-2">★</span>
                    Join Constellation
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/areas">
                  <a className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                    <span className="text-xs mr-2">★</span>
                    Constellation Areas
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <BookOpen className="h-4 w-4 text-purple-400 mr-2" />
              <span>Star Resources</span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/resources">
                  <a className="text-gray-400 hover:text-purple-400 transition-colors flex items-center">
                    <span className="text-xs mr-2">★</span>
                    Resource Library
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/forum">
                  <a className="text-gray-400 hover:text-purple-400 transition-colors flex items-center">
                    <span className="text-xs mr-2">★</span>
                    Guiding Star Forum
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/services">
                  <a className="text-gray-400 hover:text-purple-400 transition-colors flex items-center">
                    <span className="text-xs mr-2">★</span>
                    Premium Services
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/appointments">
                  <a className="text-gray-400 hover:text-purple-400 transition-colors flex items-center">
                    <span className="text-xs mr-2">★</span>
                    Book Appointments
                  </a>
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors flex items-center"
                >
                  <span className="text-xs mr-2">★</span>
                  Knowledge Base
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <Mail className="h-4 w-4 text-pink-400 mr-2" />
              <span>Contact Our Stars</span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Globe className="w-5 h-5 mt-1 mr-3 text-blue-400" />
                <span className="text-gray-400">
                  Global Digital Presence Network
                  <br />
                  <span className="text-sm">Continental Constellations Worldwide</span>
                </span>
              </li>
              <li className="flex items-center">
                <Users className="w-5 h-5 mr-3 text-purple-400" />
                <span className="text-gray-400">North Star Council Portal</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-pink-400" />
                <span className="text-gray-400">join@digitalpresence.com</span>
              </li>
            </ul>
            
            <div className="mt-8 p-3 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
              <p className="text-gray-300 text-sm">
                "The light that darkness lost the battle to."
              </p>
              <p className="text-xs text-gray-500 mt-1">- Digital Presence Motto</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Digital Presence. All members shine equally.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Constellation Charter
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Member Guidelines
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Governance
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
