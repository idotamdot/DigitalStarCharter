import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Star, Sparkles, Rocket, Shield, ZapIcon, Diamond, DollarSign, Users, Palette, Globe, BarChart4 } from "lucide-react";

const ConstellationFinancing = () => {
  // Animated stars effect
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; delay: number }>>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.7 + 0.3,
      delay: Math.random() * 5
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a1f]">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 relative overflow-hidden">
        {/* Animated stars */}
        <div className="absolute inset-0 overflow-hidden z-0">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
                top: `${star.y}%`,
                left: `${star.x}%`,
                opacity: star.opacity,
                animationDelay: `${star.delay}s`
              }}
            />
          ))}
        </div>

        {/* Nebula effects */}
        <div className="absolute top-40 -left-20 w-96 h-96 rounded-full bg-blue-500 mix-blend-screen filter blur-[120px] opacity-20 z-0 animate-pulse"
          style={{ animationDuration: '15s' }}></div>
        <div className="absolute bottom-40 -right-20 w-96 h-96 rounded-full bg-purple-600 mix-blend-screen filter blur-[120px] opacity-20 z-0 animate-pulse"
          style={{ animationDuration: '20s' }}></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 relative">
              <div className="w-20 h-20 rounded-full bg-blue-900/40 flex items-center justify-center">
                <DollarSign className="h-10 w-10 text-blue-400" />
              </div>
              <div className="absolute -right-2 -top-2 w-8 h-8 rounded-full bg-purple-900/40 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-6">
              Constellation Financing & Design Acquisition
            </h1>

            <p className="text-gray-300 max-w-2xl mx-auto mb-12">
              Learn how service fees are allocated and how Digital Presence's innovative profit-sharing model works to benefit all our constellation members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
            <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center mr-4">
                    <BarChart4 className="h-6 w-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-white text-xl">Fee Allocation</CardTitle>
                </div>
                <CardDescription className="text-gray-300">
                  How your constellation service fees create a sustainable ecosystem
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p className="mb-6">
                  Fees from our three service tiers (Dwarf Star, Giant Star, and Supernova) are allocated in a transparent manner to support the Digital Presence ecosystem:
                </p>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center">
                        <span className="text-yellow-400 font-bold">40%</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Initial Team Compensation</h3>
                      <p className="text-sm text-gray-300">
                        Funds the founding 30 team members (15 UX Designers and 15 Full Stack Developers) who form the North Star Council, directing the platform's growth and governance.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center">
                        <span className="text-yellow-400 font-bold">30%</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Marketing & Outreach</h3>
                      <p className="text-sm text-gray-300">
                        Dedicated to advertising our design and development services, attracting new clients, and promoting the work of Digital Presence members.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center">
                        <span className="text-yellow-400 font-bold">20%</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Platform Development</h3>
                      <p className="text-sm text-gray-300">
                        Investment in our AI-driven skills assessment and task allocation system, infrastructure, and technological improvements.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center">
                        <span className="text-yellow-400 font-bold">10%</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Community Treasury</h3>
                      <p className="text-sm text-gray-300">
                        Reserved for community-voted initiatives, special projects, and emergency funds that benefit the collective ecosystem.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/5 to-pink-600/5"></div>
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center mr-4">
                    <Palette className="h-6 w-6 text-purple-400" />
                  </div>
                  <CardTitle className="text-white text-xl">Design Work Acquisition</CardTitle>
                </div>
                <CardDescription className="text-gray-300">
                  How we source and distribute design work to our constellation
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p className="mb-6">
                  Digital Presence has a built-in system for acquiring and distributing design work to constellation members:
                </p>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center">
                        <Rocket className="h-4 w-4 text-purple-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Client Acquisition</h3>
                      <p className="text-sm text-gray-300">
                        Marketing campaigns funded by membership fees attract businesses seeking design and development services. The North Star Council also leverages their professional networks to bring in projects.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center">
                        <ZapIcon className="h-4 w-4 text-purple-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">AI-Driven Task Allocation</h3>
                      <p className="text-sm text-gray-300">
                        Our proprietary AI system analyzes member skills, availability, and project requirements to optimally distribute tasks. Each member receives their weekly assignments based on their expertise level.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center">
                        <Users className="h-4 w-4 text-purple-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Collaborative Workflow</h3>
                      <p className="text-sm text-gray-300">
                        Members work in constellation teams guided by Guiding Stars (experienced mentors). The platform facilitates collaboration, feedback, and project delivery through our unified toolset.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-purple-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Equal Profit Distribution</h3>
                      <p className="text-sm text-gray-300">
                        All active members who complete their weekly tasks receive an equal share of profits from client projects, regardless of seniority or role. This revolutionary model ensures fair compensation based on participation.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-20">
            <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/5 to-pink-600/5"></div>
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center mr-4">
                    <Globe className="h-6 w-6 text-pink-400" />
                  </div>
                  <CardTitle className="text-white text-xl">Continental Constellation Strategy</CardTitle>
                </div>
                <CardDescription className="text-gray-300">
                  How our celestial model expands across the globe
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p className="mb-6">
                  Digital Presence's organizational structure follows a celestial model, with Constellations forming around geographic regions:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="w-8 h-8 rounded-full bg-pink-900/30 flex items-center justify-center">
                        <Star className="h-4 w-4 text-yellow-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Continental Guiding Stars</h3>
                      <p className="text-sm text-gray-300">
                        Each continent has dedicated Guiding Stars who understand regional client needs, cultural contexts, and time zones, ensuring localized support while maintaining global standards.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="w-8 h-8 rounded-full bg-pink-900/30 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-yellow-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Local Client Acquisition</h3>
                      <p className="text-sm text-gray-300">
                        Regional marketing efforts target local businesses, creating a steady flow of design and development work that aligns with the skills of constellation members in each geographic area.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="w-8 h-8 rounded-full bg-pink-900/30 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-yellow-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">North Star Council Governance</h3>
                      <p className="text-sm text-gray-300">
                        The initial 30 members form the North Star Council, setting global standards and policies while continental Guiding Stars adapt implementation to regional needs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="w-8 h-8 rounded-full bg-pink-900/30 flex items-center justify-center">
                        <Diamond className="h-4 w-4 text-yellow-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Cross-Continental Collaboration</h3>
                      <p className="text-sm text-gray-300">
                        While regional focus drives efficiency, our platform facilitates cross-continental collaboration for global projects, knowledge sharing, and 24/7 productivity across time zones.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/service-selection">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 rounded-full"
              >
                <Star className="h-5 w-5 mr-2" />
                Return to Constellation Services
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConstellationFinancing;