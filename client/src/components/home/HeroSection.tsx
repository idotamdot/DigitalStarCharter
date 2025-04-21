import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const HeroSection = () => {
  const { toast } = useToast();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    businessType: "",
  });

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
    <section className="pt-24 pb-16 bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 text-transparent bg-clip-text leading-tight">
              Build Your Dream Business Presence Online
            </h1>
            <p className="text-lg text-gray-700 mb-8 max-w-lg">
              All-in-one platform for sole proprietors and partnerships to develop, launch, and grow your business with expert guidance and tools.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-3 rounded-lg text-base font-semibold hover:from-primary-700 hover:to-secondary-700 transition-colors shadow-md">
                    Get Started Free
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create an account</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleRegister} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-username">Username</Label>
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <select
                        id="businessType"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={registerForm.businessType}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            businessType: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Select your business type</option>
                        <option value="Sole Proprietorship">Sole Proprietorship</option>
                        <option value="Partnership">Partnership</option>
                        <option value="LLC">LLC</option>
                        <option value="Not yet established">Not yet established</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full">
                      Register
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                className="bg-white text-gray-800 px-8 py-3 rounded-lg text-base font-semibold hover:bg-gray-100 transition-colors border border-gray-300 shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" />
                </svg>
                Watch Demo
              </Button>
            </div>
            <div className="mt-8 flex items-center text-sm text-gray-500">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
              </div>
              <span className="ml-2">Joined by 1,500+ business owners this month</span>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="relative z-10 bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
                <h3 className="text-xl font-semibold mb-1">Business Development Wizard</h3>
                <p className="text-sm opacity-80">Complete your business setup in 5 simple steps</p>
              </div>
              <div className="p-6">
                <div className="flex mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">1</div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-gray-800">Define your business</h4>
                    <div className="h-2 bg-gray-100 rounded-full mt-2 mb-1">
                      <div className="h-2 bg-primary-500 rounded-full" style={{width: "100%"}}></div>
                    </div>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                </div>
                <div className="flex mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">2</div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-gray-800">Brand development</h4>
                    <div className="h-2 bg-gray-100 rounded-full mt-2 mb-1">
                      <div className="h-2 bg-primary-500 rounded-full" style={{width: "80%"}}></div>
                    </div>
                    <p className="text-xs text-gray-500">Logo design in progress</p>
                  </div>
                </div>
                <div className="flex mb-6">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm">3</div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-gray-800">Website setup</h4>
                    <div className="h-2 bg-gray-100 rounded-full mt-2 mb-1">
                      <div className="h-2 bg-primary-500 rounded-full" style={{width: "0%"}}></div>
                    </div>
                    <p className="text-xs text-gray-500">Not started</p>
                  </div>
                </div>
                <div className="flex mb-6">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm">4</div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-gray-800">Social media strategy</h4>
                    <div className="h-2 bg-gray-100 rounded-full mt-2 mb-1">
                      <div className="h-2 bg-primary-500 rounded-full" style={{width: "0%"}}></div>
                    </div>
                    <p className="text-xs text-gray-500">Not started</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm">5</div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-gray-800">Launch & grow</h4>
                    <div className="h-2 bg-gray-100 rounded-full mt-2 mb-1">
                      <div className="h-2 bg-primary-500 rounded-full" style={{width: "0%"}}></div>
                    </div>
                    <p className="text-xs text-gray-500">Not started</p>
                  </div>
                </div>
                <Link href="/business-wizard">
                  <a className="block mt-6 w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-md font-medium text-sm transition-colors text-center">
                    Continue Setup
                  </a>
                </Link>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-secondary-100 rounded-full opacity-70 z-0"></div>
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary-100 rounded-full opacity-70 z-0"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
