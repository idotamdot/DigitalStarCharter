import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Star, MoreHorizontal, Globe, Sparkles, Users } from "lucide-react";

const HeroSection = () => {
  const { toast } = useToast();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    role: "",
    region: "",
  });

  // For the animated stars background
  useEffect(() => {
    const createStars = () => {
      const starsContainer = document.getElementById('starsContainer');
      if (!starsContainer) return;
      
      starsContainer.innerHTML = '';
      const numStars = 100;
      
      for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Random positions
        const left = `${Math.random() * 100}%`;
        const top = `${Math.random() * 100}%`;
        const size = `${0.2 + Math.random() * 0.3}rem`;
        const duration = `${3 + Math.random() * 7}s`;
        const delay = `${Math.random() * 5}s`;
        
        // Set star styles
        star.style.left = left;
        star.style.top = top;
        star.style.width = size;
        star.style.height = size;
        star.style.animationDuration = duration;
        star.style.animationDelay = delay;
        
        // Random brightness
        const opacity = 0.5 + Math.random() * 0.5;
        star.style.opacity = `${opacity}`;
        
        starsContainer.appendChild(star);
      }
    };
    
    createStars();
    
    return () => {
      const starsContainer = document.getElementById('starsContainer');
      if (starsContainer) {
        starsContainer.innerHTML = '';
      }
    };
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("POST", "/api/users/register", registerForm);
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      setRegisterOpen(false);
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please check your inputs and try again",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="pt-24 pb-16 relative overflow-hidden bg-[#0a0a1f] text-white min-h-[90vh] flex items-center">
      {/* Animated stars background */}
      <div id="starsContainer" className="absolute inset-0 z-0 overflow-hidden"></div>
      
      {/* Nebula/galaxy effect */}
      <div className="absolute inset-0 z-0 opacity-20 bg-gradient-radial from-blue-500 via-indigo-800 to-transparent"></div>
      <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 blur-3xl opacity-20"></div>
      <div className="absolute bottom-1/3 -left-20 w-96 h-96 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 blur-3xl opacity-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
            <div className="flex items-center mb-4 gap-2">
              <Sparkles className="h-6 w-6 text-yellow-400" />
              <span className="text-lg font-medium text-yellow-400">Digital Presence</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-tight">
              A Revolutionary Remote Work Ecosystem
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-lg">
              Join our collaborative network of technical professionals where your skills are valued, tasks are allocated based on expertise, and profits are shared equally among all contributors.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 p-1.5 bg-blue-900/30 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">Equal Profit Sharing</h3>
                  <p className="text-gray-400 mt-1">All members who complete weekly tasks receive equal profit distribution</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 p-1.5 bg-blue-900/30 rounded-lg">
                  <Globe className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">Global Constellations</h3>
                  <p className="text-gray-400 mt-1">Join professionals in your continent, represented as stars in our celestial ecosystem</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 p-1.5 bg-blue-900/30 rounded-lg">
                  <Users className="h-5 w-5 text-purple-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">AI-Driven Task Allocation</h3>
                  <p className="text-gray-400 mt-1">Tasks assigned based on skills assessment for optimal productivity</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 p-1.5 bg-blue-900/30 rounded-lg">
                  <MoreHorizontal className="h-5 w-5 text-pink-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">Flexible Role Changes</h3>
                  <p className="text-gray-400 mt-1">Change roles and upgrade skills through training modules at any time</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/join">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg text-base font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors shadow-md">
                  Join Our Constellation
                </Button>
              </Link>
              
              <Link href="/mission">
                <Button
                  variant="outline"
                  className="border-2 border-gray-500 text-white px-8 py-3 rounded-lg text-base font-semibold hover:bg-gray-800 transition-colors"
                >
                  Our Mission
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 flex items-center text-sm text-gray-300">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-blue-900 bg-blue-400 flex items-center justify-center overflow-hidden">
                  <Star className="h-4 w-4 text-yellow-300" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-blue-900 bg-purple-400 flex items-center justify-center overflow-hidden">
                  <Star className="h-4 w-4 text-yellow-300" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-blue-900 bg-pink-400 flex items-center justify-center overflow-hidden">
                  <Star className="h-4 w-4 text-yellow-300" />
                </div>
              </div>
              <span className="ml-2">Join the first 30 founding members of your region's constellation</span>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative">
            <div className="relative z-10 bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
              <div className="p-6 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
                <h3 className="text-xl font-semibold mb-1 flex items-center">
                  <Star className="h-5 w-5 text-yellow-300 mr-2" />
                  Join Our North Star Council
                </h3>
                <p className="text-sm opacity-80">Be among the first 30 members to shape our future</p>
              </div>
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-300 text-sm font-medium">
                    <span>UX Designers</span>
                    <span>8/15 filled</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{width: "53%"}}></div>
                  </div>
                  
                  <div className="flex justify-between text-gray-300 text-sm font-medium mt-4">
                    <span>Full Stack Developers</span>
                    <span>11/15 filled</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{width: "73%"}}></div>
                  </div>
                </div>
                
                <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors">
                      Apply to Join
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-gray-900 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-white">Join Our Constellation</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleRegister} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                        <Input
                          id="fullName"
                          value={registerForm.fullName}
                          onChange={(e) =>
                            setRegisterForm({
                              ...registerForm,
                              fullName: e.target.value,
                            })
                          }
                          required
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={registerForm.email}
                          onChange={(e) =>
                            setRegisterForm({
                              ...registerForm,
                              email: e.target.value,
                            })
                          }
                          required
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-username" className="text-gray-300">Username</Label>
                        <Input
                          id="reg-username"
                          value={registerForm.username}
                          onChange={(e) =>
                            setRegisterForm({
                              ...registerForm,
                              username: e.target.value,
                            })
                          }
                          required
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password" className="text-gray-300">Password</Label>
                        <Input
                          id="reg-password"
                          type="password"
                          value={registerForm.password}
                          onChange={(e) =>
                            setRegisterForm({
                              ...registerForm,
                              password: e.target.value,
                            })
                          }
                          required
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-gray-300">Role</Label>
                        <select
                          id="role"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={registerForm.role}
                          onChange={(e) =>
                            setRegisterForm({
                              ...registerForm,
                              role: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select your role</option>
                          <option value="UX Designer">UX Designer</option>
                          <option value="Full Stack Developer">Full Stack Developer</option>
                          <option value="Frontend Developer">Frontend Developer</option>
                          <option value="Backend Developer">Backend Developer</option>
                          <option value="DevOps Engineer">DevOps Engineer</option>
                          <option value="Data Scientist">Data Scientist</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="region" className="text-gray-300">Region</Label>
                        <select
                          id="region"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={registerForm.region}
                          onChange={(e) =>
                            setRegisterForm({
                              ...registerForm,
                              region: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select your region</option>
                          <option value="North America">North America</option>
                          <option value="South America">South America</option>
                          <option value="Europe">Europe</option>
                          <option value="Africa">Africa</option>
                          <option value="Asia">Asia</option>
                          <option value="Oceania">Oceania</option>
                          <option value="Antarctica">Antarctica</option>
                        </select>
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                        Join Constellation
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                
                <div className="mt-6 flex items-center justify-center space-x-3 text-gray-400 text-sm">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>The North Star Council shapes our governance</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20 z-0"></div>
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-500 rounded-full blur-3xl opacity-20 z-0"></div>
          </div>
        </div>
      </div>
      
      {/* CSS for animated stars */}
      <style jsx>{`
        .star {
          position: absolute;
          background-color: white;
          border-radius: 50%;
          animation: twinkle linear infinite;
        }
        
        @keyframes twinkle {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        .bg-gradient-radial {
          background-image: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
