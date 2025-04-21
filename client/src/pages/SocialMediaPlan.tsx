import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define the social media plan interface
interface SocialMediaGoal {
  id: string;
  description: string;
}

interface ContentTheme {
  id: string;
  title: string;
  description: string;
}

const SocialMediaPlan = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("platforms");
  
  // Form state
  const [form, setForm] = useState({
    platforms: [] as string[],
    targetAudience: "",
    contentThemes: [] as ContentTheme[],
    postFrequency: "weekly",
    goals: [] as SocialMediaGoal[],
  });

  // Check if user is logged in
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/users/me"],
    retry: false,
  });

  // Fetch business profile
  const { data: businessProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/business-profiles/me"],
    enabled: !!user,
    retry: false,
  });

  // Fetch social media plan if it exists
  const { data: socialMediaPlan, isLoading: planLoading } = useQuery({
    queryKey: ["/api/social-media-plans/me"],
    enabled: !!businessProfile,
    retry: false,
  });

  // Mutation to submit social media plan
  const submitPlan = useMutation({
    mutationFn: async (data: any) => {
      if (socialMediaPlan) {
        return apiRequest("PUT", `/api/social-media-plans/${socialMediaPlan.id}`, data);
      } else {
        return apiRequest("POST", "/api/social-media-plans", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-media-plans/me"] });
      toast({
        title: "Success!",
        description: "Your social media plan has been saved.",
      });
      navigate("/dashboard");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem saving your social media plan.",
        variant: "destructive",
      });
    },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access the social media planner",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, userLoading, navigate, toast]);

  // Populate form with existing data if available
  useEffect(() => {
    if (socialMediaPlan) {
      setForm({
        platforms: socialMediaPlan.platforms as string[] || [],
        targetAudience: socialMediaPlan.targetAudience || "",
        contentThemes: socialMediaPlan.contentThemes as ContentTheme[] || [],
        postFrequency: socialMediaPlan.postFrequency || "weekly",
        goals: socialMediaPlan.goals as SocialMediaGoal[] || [],
      });
    }
  }, [socialMediaPlan]);

  const handlePlatformChange = (platform: string) => {
    setForm({
      ...form,
      platforms: form.platforms.includes(platform)
        ? form.platforms.filter(p => p !== platform)
        : [...form.platforms, platform],
    });
  };

  const handleAddGoal = () => {
    const newGoal: SocialMediaGoal = {
      id: Date.now().toString(),
      description: "",
    };
    setForm({
      ...form,
      goals: [...form.goals, newGoal],
    });
  };

  const handleUpdateGoal = (id: string, description: string) => {
    setForm({
      ...form,
      goals: form.goals.map(goal => 
        goal.id === id ? { ...goal, description } : goal
      ),
    });
  };

  const handleRemoveGoal = (id: string) => {
    setForm({
      ...form,
      goals: form.goals.filter(goal => goal.id !== id),
    });
  };

  const handleAddTheme = () => {
    const newTheme: ContentTheme = {
      id: Date.now().toString(),
      title: "",
      description: "",
    };
    setForm({
      ...form,
      contentThemes: [...form.contentThemes, newTheme],
    });
  };

  const handleUpdateTheme = (id: string, field: "title" | "description", value: string) => {
    setForm({
      ...form,
      contentThemes: form.contentThemes.map(theme => 
        theme.id === id ? { ...theme, [field]: value } : theme
      ),
    });
  };

  const handleRemoveTheme = (id: string) => {
    setForm({
      ...form,
      contentThemes: form.contentThemes.filter(theme => theme.id !== id),
    });
  };

  const handleSubmit = () => {
    submitPlan.mutate(form);
  };

  if (userLoading || profileLoading || planLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Social Media Plan</h1>
            <p className="text-gray-600 mt-2">
              Create a strategic plan for your social media presence
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-8">
                  <TabsTrigger value="platforms">Platforms</TabsTrigger>
                  <TabsTrigger value="audience">Audience</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="goals">Goals</TabsTrigger>
                </TabsList>
                
                <TabsContent value="platforms">
                  <CardHeader>
                    <CardTitle>Choose Your Platforms</CardTitle>
                    <CardDescription>Select the social media platforms you want to use</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {["Facebook", "Instagram", "Twitter", "LinkedIn", "TikTok", "Pinterest", "YouTube"].map((platform) => (
                        <div key={platform} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`platform-${platform}`} 
                            checked={form.platforms.includes(platform)}
                            onCheckedChange={() => handlePlatformChange(platform)}
                          />
                          <label
                            htmlFor={`platform-${platform}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {platform}
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="postFrequency">Posting Frequency</Label>
                      <select
                        id="postFrequency"
                        value={form.postFrequency}
                        onChange={(e) => setForm({...form, postFrequency: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">2-3 times per week</option>
                        <option value="biweekly">Every two weeks</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={() => setActiveTab("audience")}>Next: Audience</Button>
                    </div>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="audience">
                  <CardHeader>
                    <CardTitle>Target Audience</CardTitle>
                    <CardDescription>Define who you want to reach on social media</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="targetAudience">Describe your target audience</Label>
                      <Textarea
                        id="targetAudience"
                        value={form.targetAudience}
                        onChange={(e) => setForm({...form, targetAudience: e.target.value})}
                        placeholder="Demographics, interests, behaviors, pain points..."
                        rows={6}
                      />
                    </div>
                    
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setActiveTab("platforms")}>Previous</Button>
                      <Button onClick={() => setActiveTab("content")}>Next: Content</Button>
                    </div>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="content">
                  <CardHeader>
                    <CardTitle>Content Themes</CardTitle>
                    <CardDescription>Define content categories for your social media posts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {form.contentThemes.map((theme, index) => (
                      <div key={theme.id} className="p-4 border border-gray-200 rounded-md">
                        <div className="flex justify-between mb-2">
                          <Label htmlFor={`theme-title-${theme.id}`}>Theme {index + 1}</Label>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveTheme(theme.id)}
                            className="h-8 w-8 p-0 text-red-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                              <path d="M18 6L6 18"></path>
                              <path d="M6 6l12 12"></path>
                            </svg>
                          </Button>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Input
                              id={`theme-title-${theme.id}`}
                              value={theme.title}
                              onChange={(e) => handleUpdateTheme(theme.id, "title", e.target.value)}
                              placeholder="Theme Title (e.g., Educational Content)"
                            />
                          </div>
                          <div>
                            <Textarea
                              value={theme.description}
                              onChange={(e) => handleUpdateTheme(theme.id, "description", e.target.value)}
                              placeholder="Describe this content theme..."
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleAddTheme}
                    >
                      + Add Content Theme
                    </Button>
                    
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setActiveTab("audience")}>Previous</Button>
                      <Button onClick={() => setActiveTab("goals")}>Next: Goals</Button>
                    </div>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="goals">
                  <CardHeader>
                    <CardTitle>Social Media Goals</CardTitle>
                    <CardDescription>Define what you want to achieve with your social media presence</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {form.goals.map((goal) => (
                      <div key={goal.id} className="flex items-center space-x-2">
                        <Input
                          value={goal.description}
                          onChange={(e) => handleUpdateGoal(goal.id, e.target.value)}
                          placeholder="Describe your goal..."
                          className="flex-grow"
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveGoal(goal.id)}
                          className="h-8 w-8 p-0 text-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <path d="M18 6L6 18"></path>
                            <path d="M6 6l12 12"></path>
                          </svg>
                        </Button>
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleAddGoal}
                    >
                      + Add Goal
                    </Button>
                    
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setActiveTab("content")}>Previous</Button>
                      <Button 
                        onClick={handleSubmit}
                        disabled={submitPlan.isPending}
                      >
                        {submitPlan.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Saving...
                          </>
                        ) : "Save Plan"}
                      </Button>
                    </div>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SocialMediaPlan;
