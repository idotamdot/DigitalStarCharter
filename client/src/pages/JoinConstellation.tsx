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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { CheckIcon, Sparkles, Star, StarIcon, Stars } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define roles data structure
const roles = [
  {
    id: "full-stack-developer",
    title: "Full Stack Developer",
    description: "Build and maintain complete web applications from front-end to back-end",
    requirements: ["JavaScript/TypeScript", "React", "Node.js", "Database knowledge"],
    badges: ["Novice", "Intermediate", "Advanced", "Expert", "Master"],
    isPriorityForCouncil: true,
    councilQuota: 15,
  },
  {
    id: "ux-designer",
    title: "UX Designer",
    description: "Create intuitive and beautiful user experiences for web and mobile applications",
    requirements: ["UI design", "User research", "Wireframing", "Prototyping"],
    badges: ["Novice", "Intermediate", "Advanced", "Expert", "Master"],
    isPriorityForCouncil: true,
    councilQuota: 10,
  },
  {
    id: "backend-developer",
    title: "Backend Developer",
    description: "Design, build, and maintain server-side applications and databases",
    requirements: ["API development", "Database management", "Security", "Performance optimization"],
    badges: ["Novice", "Intermediate", "Advanced", "Expert", "Master"],
    isPriorityForCouncil: false,
  },
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    description: "Create responsive and interactive user interfaces for web applications",
    requirements: ["HTML/CSS", "JavaScript", "React", "Responsive design"],
    badges: ["Novice", "Intermediate", "Advanced", "Expert", "Master"],
    isPriorityForCouncil: false,
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    description: "Manage deployment infrastructure and automate development workflows",
    requirements: ["CI/CD", "Cloud platforms", "Docker/Kubernetes", "Infrastructure as code"],
    badges: ["Novice", "Intermediate", "Advanced", "Expert", "Master"],
    isPriorityForCouncil: false,
  },
  {
    id: "project-manager",
    title: "Project Manager",
    description: "Coordinate teams and ensure projects are completed efficiently",
    requirements: ["Agile methodologies", "Team coordination", "Timeline management", "Stakeholder communication"],
    badges: ["Novice", "Intermediate", "Advanced", "Expert", "Master"],
    isPriorityForCouncil: false,
  },
  {
    id: "content-writer",
    title: "Content Writer",
    description: "Create compelling content for websites, blogs, and marketing materials",
    requirements: ["Copywriting", "SEO knowledge", "Content strategy", "Research skills"],
    badges: ["Novice", "Intermediate", "Advanced", "Expert", "Master"],
    isPriorityForCouncil: false,
  },
  {
    id: "qa-tester",
    title: "QA Tester",
    description: "Test applications to ensure they meet quality standards",
    requirements: ["Manual testing", "Automated testing", "Bug reporting", "User acceptance testing"],
    badges: ["Novice", "Intermediate", "Advanced", "Expert", "Master"],
    isPriorityForCouncil: false,
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    description: "Analyze data and build models to extract insights",
    requirements: ["Python", "Machine learning", "Data visualization", "Statistical analysis"],
    badges: ["Novice", "Intermediate", "Advanced", "Expert", "Master"],
    isPriorityForCouncil: false,
  },
  {
    id: "security-specialist",
    title: "Security Specialist",
    description: "Ensure applications and infrastructure are secure from threats",
    requirements: ["Penetration testing", "Security audits", "Authentication systems", "Compliance"],
    badges: ["Novice", "Intermediate", "Advanced", "Expert", "Master"],
    isPriorityForCouncil: false,
  },
  {
    id: "developer",
    title: "Developer",
    description: "General programming and development tasks",
    requirements: ["Programming fundamentals", "Problem solving", "Version control", "Testing"],
    badges: ["Novice", "Intermediate", "Advanced", "Expert", "Master"],
    isPriorityForCouncil: true,
    councilQuota: 5,
  },
  {
    id: "other",
    title: "Other Role",
    description: "Specify your role if it's not listed above",
    requirements: ["Relevant experience", "Portfolio or work samples"],
    badges: ["Novice", "Intermediate", "Advanced", "Expert", "Master"],
    isPriorityForCouncil: false,
  },
];

// Form schema for registration
const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  primaryRole: z.string().min(1, "Please select a primary role"),
  secondaryRoles: z.array(z.string()).optional(),
  yearsExperience: z.string().min(1, "Please select your experience level"),
  skills: z.string().min(10, "Please provide more details about your skills"),
  portfolioUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  additionalInfo: z.string().optional(),
});

export default function JoinConstellation() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedRole, setSelectedRole] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      primaryRole: "",
      secondaryRoles: [],
      yearsExperience: "",
      skills: "",
      portfolioUrl: "",
      additionalInfo: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Here we would normally submit to an API
    alert("Application submitted! We'll be in touch soon.");
  }

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
            <TabsList className="grid grid-cols-3 max-w-md mx-auto bg-black/20">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="apply">Apply</TabsTrigger>
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
                    <Button 
                      onClick={() => setSelectedTab("apply")}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-2"
                    >
                      Apply Now
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
                        className={`bg-black/30 border border-blue-900/30 cursor-pointer transition-all duration-300 hover:bg-black/50 hover:border-blue-500/50 ${selectedRole === role.id ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setSelectedRole(role.id)}
                      >
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-lg flex items-center justify-between">
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
                            <p className="text-sm font-medium mb-1">Requirements:</p>
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
                    <Button 
                      onClick={() => setSelectedTab("apply")}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-2"
                    >
                      Apply for a Role
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="apply" className="mt-6">
              <Card className="bg-black/40 backdrop-blur-md border-blue-900/50 shadow-xl text-white">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-600/10 to-blue-600/10 z-0"></div>
                
                <CardContent className="relative z-10 p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6 text-white">Application Form</h2>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Jane Doe" {...field} className="bg-gray-900/60 border-gray-700" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="you@example.com" type="email" {...field} className="bg-gray-900/60 border-gray-700" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="primaryRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-900/60 border-gray-700">
                                  <SelectValue placeholder="Select your primary role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-gray-900 border-gray-700">
                                {roles.map((role) => (
                                  <SelectItem key={role.id} value={role.id}>
                                    {role.title} {role.isPriorityForCouncil && "★"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-gray-200">
                              Roles marked with ★ are priority roles for the North Star Council.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="yearsExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-900/60 border-gray-700">
                                  <SelectValue placeholder="Select your experience level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-gray-900 border-gray-700">
                                <SelectItem value="0-1">Less than 1 year</SelectItem>
                                <SelectItem value="1-3">1-3 years</SelectItem>
                                <SelectItem value="3-5">3-5 years</SelectItem>
                                <SelectItem value="5-10">5-10 years</SelectItem>
                                <SelectItem value="10+">10+ years</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skills & Experience</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your skills, tools you're familiar with, and relevant work experience..." 
                                className="bg-gray-900/60 border-gray-700 min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="portfolioUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Portfolio URL (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://your-portfolio.com" 
                                type="url" 
                                {...field} 
                                className="bg-gray-900/60 border-gray-700" 
                              />
                            </FormControl>
                            <FormDescription className="text-gray-200">
                              GitHub, personal website, or any online portfolio
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="additionalInfo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Information (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any other details you'd like to share..." 
                                className="bg-gray-900/60 border-gray-700"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="pt-4">
                        <Button 
                          type="submit"
                          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                        >
                          Submit Application
                        </Button>
                      </div>
                    </form>
                  </Form>
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