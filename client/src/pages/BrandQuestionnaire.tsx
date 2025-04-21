import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const BrandQuestionnaire = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  
  // Form state
  const [form, setForm] = useState({
    // Step 1: Brand Personality
    brandValues: [] as string[],
    brandPersonality: "",
    
    // Step 2: Visual Elements
    primaryColor: "#4f46e5", // Default to primary color
    secondaryColor: "#7e22ce", // Default to secondary color
    typography: "",
    
    // Step 3: Voice & Messaging
    tagline: "",
    missionStatement: "",
    toneOfVoice: "",
    
    // Step 4: Visuals
    logoPreference: "",
    visualStyle: "",
    
    // Step 5: Audience & Competition
    targetAudience: "",
    competitors: "",
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

  // Fetch branding info if it exists
  const { data: brandingInfo, isLoading: brandingLoading } = useQuery({
    queryKey: ["/api/branding/me"],
    enabled: !!businessProfile,
    retry: false,
  });

  // Mutation to submit branding info
  const submitBranding = useMutation({
    mutationFn: async (data: any) => {
      if (brandingInfo) {
        return apiRequest("PUT", `/api/branding/${brandingInfo.id}`, data);
      } else {
        return apiRequest("POST", "/api/branding", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branding/me"] });
      toast({
        title: "Success!",
        description: "Your brand information has been saved.",
      });
      navigate("/dashboard");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem saving your branding information.",
        variant: "destructive",
      });
    },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access the brand questionnaire",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, userLoading, navigate, toast]);

  // Populate form with existing data if available
  useEffect(() => {
    if (brandingInfo) {
      setForm({
        ...form,
        primaryColor: brandingInfo.primaryColor || form.primaryColor,
        secondaryColor: brandingInfo.secondaryColor || form.secondaryColor,
        typography: brandingInfo.typography || "",
        brandValues: brandingInfo.brandValues as string[] || [],
        tagline: brandingInfo.tagline || "",
        missionStatement: brandingInfo.missionStatement || "",
        // Other fields don't have direct mappings in the database schema
        // but could be stored in the brandValues JSON field
      });
    }
  }, [brandingInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleCheckboxChange = (value: string) => {
    setForm({
      ...form,
      brandValues: form.brandValues.includes(value)
        ? form.brandValues.filter(v => v !== value)
        : [...form.brandValues, value],
    });
  };

  const handleSubmit = () => {
    // Create payload object using data from form
    const payload = {
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      typography: form.typography,
      brandValues: form.brandValues,
      tagline: form.tagline,
      missionStatement: form.missionStatement,
      // Store other questionnaire data in brandValues JSON
      additionalInfo: {
        brandPersonality: form.brandPersonality,
        toneOfVoice: form.toneOfVoice,
        logoPreference: form.logoPreference,
        visualStyle: form.visualStyle,
        targetAudience: form.targetAudience,
        competitors: form.competitors
      }
    };
    
    submitBranding.mutate(payload);
  };

  if (userLoading || profileLoading || brandingLoading) {
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

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle>Brand Personality</CardTitle>
              <CardDescription>Define your brand's core values and personality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Select up to 5 values that represent your brand</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["Innovative", "Reliable", "Trustworthy", "Friendly", "Professional", "Luxurious", "Affordable", "Creative", "Traditional", "Modern", "Fun", "Serious"].map((value) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`value-${value}`} 
                        checked={form.brandValues.includes(value)}
                        onCheckedChange={() => handleCheckboxChange(value)}
                        disabled={form.brandValues.length >= 5 && !form.brandValues.includes(value)}
                      />
                      <label
                        htmlFor={`value-${value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {value}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brandPersonality">Describe your brand personality in a few sentences</Label>
                <Textarea
                  id="brandPersonality"
                  name="brandPersonality"
                  value={form.brandPersonality}
                  onChange={handleChange}
                  placeholder="Our brand is..."
                  rows={4}
                />
              </div>
            </CardContent>
          </>
        );
      
      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle>Visual Elements</CardTitle>
              <CardDescription>Choose visual elements that represent your brand</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    type="color"
                    id="primaryColor"
                    name="primaryColor"
                    value={form.primaryColor}
                    onChange={handleChange}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={form.primaryColor}
                    onChange={handleChange}
                    name="primaryColor"
                    className="flex-grow"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    type="color"
                    id="secondaryColor"
                    name="secondaryColor"
                    value={form.secondaryColor}
                    onChange={handleChange}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={form.secondaryColor}
                    onChange={handleChange}
                    name="secondaryColor"
                    className="flex-grow"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="typography">Typography Preference</Label>
                <select
                  id="typography"
                  name="typography"
                  value={form.typography}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a typography style</option>
                  <option value="Modern Sans-Serif">Modern Sans-Serif</option>
                  <option value="Classic Serif">Classic Serif</option>
                  <option value="Playful Display">Playful Display</option>
                  <option value="Minimalist">Minimalist</option>
                  <option value="Elegant Script">Elegant Script</option>
                </select>
              </div>
            </CardContent>
          </>
        );
      
      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle>Voice & Messaging</CardTitle>
              <CardDescription>Define how your brand communicates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline or Slogan</Label>
                <Input
                  id="tagline"
                  name="tagline"
                  value={form.tagline}
                  onChange={handleChange}
                  placeholder="E.g., Just Do It"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="missionStatement">Mission Statement</Label>
                <Textarea
                  id="missionStatement"
                  name="missionStatement"
                  value={form.missionStatement}
                  onChange={handleChange}
                  placeholder="Our mission is to..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="toneOfVoice">Tone of Voice</Label>
                <RadioGroup
                  value={form.toneOfVoice}
                  onValueChange={(value) => setForm({...form, toneOfVoice: value})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="formal" id="formal" />
                    <Label htmlFor="formal">Formal & Professional</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="friendly" id="friendly" />
                    <Label htmlFor="friendly">Friendly & Approachable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="casual" id="casual" />
                    <Label htmlFor="casual">Casual & Conversational</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="authoritative" id="authoritative" />
                    <Label htmlFor="authoritative">Authoritative & Expert</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="playful" id="playful" />
                    <Label htmlFor="playful">Playful & Fun</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </>
        );
      
      case 4:
        return (
          <>
            <CardHeader>
              <CardTitle>Visuals</CardTitle>
              <CardDescription>Define your preferences for logo and visual style</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="logoPreference">Logo Preference</Label>
                <RadioGroup
                  value={form.logoPreference}
                  onValueChange={(value) => setForm({...form, logoPreference: value})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wordmark" id="wordmark" />
                    <Label htmlFor="wordmark">Wordmark (text-based logo)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="icon" id="icon" />
                    <Label htmlFor="icon">Icon or Symbol</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="combination" id="combination" />
                    <Label htmlFor="combination">Combination (text + symbol)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="abstract" id="abstract" />
                    <Label htmlFor="abstract">Abstract or Geometric</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="visualStyle">Visual Style</Label>
                <RadioGroup
                  value={form.visualStyle}
                  onValueChange={(value) => setForm({...form, visualStyle: value})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minimalist" id="minimalist" />
                    <Label htmlFor="minimalist">Minimalist & Clean</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bold" id="bold" />
                    <Label htmlFor="bold">Bold & Dynamic</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="elegant" id="elegant" />
                    <Label htmlFor="elegant">Elegant & Sophisticated</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="retro" id="retro" />
                    <Label htmlFor="retro">Retro or Vintage</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="futuristic" id="futuristic" />
                    <Label htmlFor="futuristic">Modern & Futuristic</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </>
        );
      
      case 5:
        return (
          <>
            <CardHeader>
              <CardTitle>Audience & Competition</CardTitle>
              <CardDescription>Define your target audience and competitive landscape</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Describe your target audience</Label>
                <Textarea
                  id="targetAudience"
                  name="targetAudience"
                  value={form.targetAudience}
                  onChange={handleChange}
                  placeholder="Demographics, interests, needs..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="competitors">List your main competitors</Label>
                <Textarea
                  id="competitors"
                  name="competitors"
                  value={form.competitors}
                  onChange={handleChange}
                  placeholder="List businesses similar to yours"
                  rows={3}
                />
              </div>
            </CardContent>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Brand Questionnaire</h1>
            <p className="text-gray-600 mt-2">
              Define your brand identity to create a cohesive online presence
            </p>
          </div>

          <div className="mb-8 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Step {step} of {totalSteps}
            </div>
            <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary-600 h-2.5 rounded-full"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          <Card className="mb-8">
            {renderStepContent()}
            <div className="p-6 pt-0 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                Previous
              </Button>
              
              {step < totalSteps ? (
                <Button onClick={() => setStep(step + 1)}>Next</Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={submitBranding.isPending}
                >
                  {submitBranding.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : "Submit"}
                </Button>
              )}
            </div>
          </Card>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
            >
              Save and Return to Dashboard
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BrandQuestionnaire;
