import React, { useState } from "react";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, Sparkles, Star, StarIcon, Stars, ArrowRight } from "lucide-react";
import { GOVERNANCE_ROLES } from "@shared/governance";

// Convert governance roles to the format expected by this component
const roles = GOVERNANCE_ROLES
  .filter(role => role.id !== "member") // Exclude basic member role from application
  .map(role => ({
    id: role.id,
    title: role.title,
    description: role.description,
    requirements: role.requirements,
    badges: ["Novice", "Intermediate", "Advanced", "Expert", "Master"],
    isPriorityForCouncil: role.level === "council-member" || role.votingRights,
    councilQuota: role.id === "guiding-star" ? 7 : role.id === "area-leader" ? 210 : 15, // Rough estimates
  }));

export default function JoinConstellation() {
  const [selectedTab, setSelectedTab] = useState("overview");

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-900 to-blue-950">
      {/* Animated stars background */}
      <div className="absolute inset-0 z-0">
        <div className="stars-small"></div>
        <div className="stars-medium"></div>
        <div className="stars-large"></div>
      </div>

      <div className="container relative z-10 py-12 mx-auto px-4 md:px-6">
        <div className="mb-8">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-white hover:text-white/80 hover:bg-white/10"
          >
            <Link href="/">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
                Back to Home
              </span>
            </Link>
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-400 to-purple-500 px-4 py-1 rounded-full mb-4 animate-pulse">
              <Stars className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Join Our Constellation</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 mb-4">
              Become a Star in Our Galaxy
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Join our global network of remote technical professionals, where profit is shared equally, and your skills shine brightest.
            </p>
          </div>

          <Tabs defaultValue="overview" onValueChange={setSelectedTab} className="mb-12">
            <TabsList className="grid grid-cols-2 max-w-md mx-auto bg-black/20">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card className="bg-black/40 backdrop-blur-md border-blue-900/50 shadow-xl text-white">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-600/10 to-blue-600/10 z-0"></div>
                
                <CardContent className="relative z-10 p-6 md:p-8 space-y-6">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-3 text-white flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                        Equal Profit Sharing
                      </h2>
                      <p className="text-gray-300">
                        At Digital Presence, we believe in the equal distribution of profits. All members who complete 
                        their assigned tasks each week receive an equal share of the company's profits, regardless of role or seniority.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-3 text-white flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                        AI-Driven Task Allocation
                      </h2>
                      <p className="text-gray-300">
                        Our innovative AI system evaluates your skills and assigns tasks that match your expertise. 
                        This ensures that you work on projects that suit your abilities while continually developing your skills.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-3 text-white flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                        Skill Progression & Badges
                      </h2>
                      <p className="text-gray-300">
                        Earn badges that represent your skill level in various domains. Progress from Novice to Master
                        through training modules and rigorous assessments, opening up new opportunities.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {["Novice", "Intermediate", "Advanced", "Expert", "Master"].map((badge, index) => (
                          <Badge key={index} variant="outline" className={`
                            ${index === 0 ? "bg-blue-900/30 text-blue-300 border-blue-700" : ""}
                            ${index === 1 ? "bg-green-900/30 text-green-300 border-green-700" : ""}
                            ${index === 2 ? "bg-yellow-900/30 text-yellow-300 border-yellow-700" : ""}
                            ${index === 3 ? "bg-orange-900/30 text-orange-300 border-orange-700" : ""}
                            ${index === 4 ? "bg-purple-900/30 text-purple-300 border-purple-700" : ""}
                          `}>
                            {index > 0 && <CheckIcon className="w-3 h-3 mr-1" />} {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-3 text-white flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                        The North Star Council
                      </h2>
                      <p className="text-gray-300">
                        The first 30 qualifying members will form our inaugural North Star Council. This governing body will help 
                        shape the future of Digital Presence, with positions reserved for specific roles:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300">
                        <li>15 seats for Full Stack Developers</li>
                        <li>10 seats for UX Designers</li>
                        <li>5 seats for Developers</li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-3 text-white flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                        Flexible Role Changes
                      </h2>
                      <p className="text-gray-300">
                        Your role isn't permanent. As your interests and skills evolve, you're free to change roles
                        at any time. Our platform supports continuous learning and professional growth.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button asChild className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-2">
                      <Link href="/onboarding">
                        Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles" className="mt-6">
              <Card className="bg-black/40 backdrop-blur-md border-blue-900/50 shadow-xl text-white">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-600/10 to-blue-600/10 z-0"></div>
                
                <CardContent className="relative z-10 p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6 text-white">Available Roles</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roles.map((role) => (
                      <Card 
                        key={role.id} 
                        className="bg-black/30 border border-blue-900/30 transition-all duration-300 hover:bg-black/50 hover:border-blue-500/50"
                      >
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-lg text-white flex items-center justify-between">
                            <span>{role.title}</span>
                            {role.isPriorityForCouncil && (
                              <Badge className="bg-blue-900/40 text-blue-300 border-blue-700">
                                Council Priority
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-gray-200">
                            {role.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="mt-2">
                            <p className="text-sm font-medium text-white mb-1">Requirements:</p>
                            <ul className="text-sm text-gray-200 list-disc list-inside">
                              {role.requirements.map((req, index) => (
                                <li key={index}>{req}</li>
                              ))}
                            </ul>
                          </div>
                          {role.isPriorityForCouncil && (
                            <div className="mt-3 pt-3 border-t border-gray-800">
                              <p className="text-xs text-blue-300">
                                <Star className="w-3 h-3 inline mr-1" />
                                Council Quota: {role.councilQuota} positions
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex justify-center mt-8">
                    <Button asChild className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-2">
                      <Link href="/onboarding">
                        Apply for a Role <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>

          <div className="mt-12 bg-black/40 backdrop-blur-md border border-blue-900/50 rounded-lg p-6 text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <StarIcon className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Equal Share</h3>
                <p className="text-gray-200">Every star in our constellation receives an equal share of profits for completed work.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-purple-400"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m7 10 5 5 5-5"></path><path d="M12 15V6"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Flexible Roles</h3>
                <p className="text-gray-200">Change your role anytime as your interests and skills evolve.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-pink-400"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path><path d="M15 9a6 6 0 0 0 6 6"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Remote First</h3>
                <p className="text-gray-200">Work from anywhere in the world as part of our global team.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}