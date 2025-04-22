import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Star, Rocket, Sparkles } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

const CTASection = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "",
    region: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // For now, just show a success message
      toast({
        title: "Application received",
        description: "Thank you for your interest in joining our constellation! We'll review your application soon.",
      });
      
      // Reset form
      setForm({
        fullName: "",
        email: "",
        role: "",
        region: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem submitting your application. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute h-full w-full">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 5 + 3}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Glowing nebula effects */}
      <div className="absolute top-1/3 -left-40 w-96 h-96 rounded-full bg-blue-500 mix-blend-screen filter blur-[120px] opacity-20 z-0"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-purple-600 mix-blend-screen filter blur-[120px] opacity-20 z-0"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center mb-4 gap-2">
              <Star className="h-6 w-6 text-yellow-400" />
              <span className="text-lg font-medium text-yellow-400">Join Our Constellation</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Become Part of Our Celestial Network
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Apply to join our revolutionary profit-sharing ecosystem where technical professionals collaborate as stars in a constellation, each contributing their unique skills to our collective success.
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 p-1.5 bg-blue-900/30 rounded-lg">
                  <Rocket className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">Equal Profit Sharing</h3>
                  <p className="text-gray-400 mt-1">Complete your weekly tasks and receive an equal share of profits, regardless of your role or seniority.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 p-1.5 bg-blue-900/30 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">Skills-Based Contribution</h3>
                  <p className="text-gray-400 mt-1">Our AI matches tasks to your skills, ensuring you're always working in your area of expertise.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
            <div className="p-6 bg-gradient-to-r from-blue-900 to-purple-900">
              <h3 className="text-xl font-semibold mb-1 flex items-center">
                <Star className="h-5 w-5 text-yellow-300 mr-2" />
                Apply to Join
              </h3>
              <p className="text-sm opacity-80">Become a star in our constellation network</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Your Name
                  </label>
                  <Input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Your Technical Role
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select your role</option>
                    <option value="UX Designer">UX Designer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Product Manager">Product Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Your Region
                  </label>
                  <select
                    name="region"
                    value={form.region}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-md font-medium text-sm hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  <Star className="mr-2 h-4 w-4" /> Apply to Join Constellation
                </Button>
              </form>
              <p className="text-xs text-gray-400 mt-4 text-center">
                Applications are reviewed by the current constellation members
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
