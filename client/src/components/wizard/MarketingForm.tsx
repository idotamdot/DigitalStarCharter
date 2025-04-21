import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BusinessProfile } from "@shared/schema";

interface MarketingFormProps {
  businessProfile?: BusinessProfile;
  onComplete: () => void;
}

const MarketingForm = ({ businessProfile, onComplete }: MarketingFormProps) => {
  const { toast } = useToast();

  // Fetch social media plan if it exists
  const { data: socialMediaPlan } = useQuery({
    queryKey: ["/api/social-media-plans/me"],
    enabled: !!businessProfile,
    retry: false,
  });

  const [form, setForm] = useState({
    marketingChannels: ["social_media", "email"],
    contentTypes: ["blog_posts", "images"],
    marketingBudget: "low",
    marketingGoals: socialMediaPlan?.goals ? "From social media plan" : "",
    targetAudience: socialMediaPlan?.targetAudience || "",
  });

  const handleCheckboxChange = (field: "marketingChannels" | "contentTypes", value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Mutation for updating business profile to mark step as completed
  const profileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/business-profiles/${businessProfile?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-profiles/me"] });
      toast({
        title: "Success!",
        description: "Marketing preferences saved successfully.",
      });
      onComplete();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem updating your progress.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessProfile) {
      toast({
        title: "Error",
        description: "Please complete the previous steps first.",
        variant: "destructive",
      });
      return;
    }

    // Store marketing preferences in wizardProgress
    let completedSteps = businessProfile.completedSteps as string[] || [];
    if (!completedSteps.includes("marketing")) {
      completedSteps = [...completedSteps, "marketing"];
    }

    const marketingPreferences = {
      ...form
    };

    const updatedProfile = {
      ...businessProfile,
      completedSteps,
      wizardProgress: {
        ...businessProfile.wizardProgress,
        currentStep: "launch",
        marketingPreferences
      },
    };

    profileMutation.mutate(updatedProfile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div>
          <Label className="text-base mb-2 block">
            Marketing Channels
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: "social_media", label: "Social Media" },
              { id: "email", label: "Email Marketing" },
              { id: "content", label: "Content Marketing" },
              { id: "seo", label: "Search Engine Optimization" },
              { id: "paid_ads", label: "Paid Advertising" },
              { id: "influencers", label: "Influencer Marketing" },
            ].map((channel) => (
              <div key={channel.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`channel-${channel.id}`} 
                  checked={form.marketingChannels.includes(channel.id)}
                  onCheckedChange={() => handleCheckboxChange("marketingChannels", channel.id)}
                />
                <label
                  htmlFor={`channel-${channel.id}`}
                  className="text-sm font-medium leading-none"
                >
                  {channel.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base mb-2 block">
            Content Types
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: "blog_posts", label: "Blog Posts" },
              { id: "videos", label: "Videos" },
              { id: "images", label: "Images/Graphics" },
              { id: "podcasts", label: "Podcasts" },
              { id: "guides", label: "Guides/Ebooks" },
              { id: "infographics", label: "Infographics" },
            ].map((content) => (
              <div key={content.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`content-${content.id}`} 
                  checked={form.contentTypes.includes(content.id)}
                  onCheckedChange={() => handleCheckboxChange("contentTypes", content.id)}
                />
                <label
                  htmlFor={`content-${content.id}`}
                  className="text-sm font-medium leading-none"
                >
                  {content.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base">Monthly Marketing Budget</Label>
          <RadioGroup
            value={form.marketingBudget}
            onValueChange={(value) => setForm({ ...form, marketingBudget: value })}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="low-budget" />
              <Label htmlFor="low-budget">Low ($0-$200)</Label>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <RadioGroupItem value="medium" id="medium-budget" />
              <Label htmlFor="medium-budget">Medium ($201-$500)</Label>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <RadioGroupItem value="high" id="high-budget" />
              <Label htmlFor="high-budget">High ($501+)</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="marketingGoals" className="text-base">
            Marketing Goals
          </Label>
          <Textarea
            id="marketingGoals"
            name="marketingGoals"
            value={form.marketingGoals}
            onChange={handleInputChange}
            placeholder="What do you want to achieve with your marketing? (e.g., brand awareness, more sales, more followers)"
            className="mt-1"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="targetAudience" className="text-base">
            Target Audience
          </Label>
          <Textarea
            id="targetAudience"
            name="targetAudience"
            value={form.targetAudience}
            onChange={handleInputChange}
            placeholder="Describe your ideal customers (e.g., age, location, interests)"
            className="mt-1"
            rows={3}
          />
          {socialMediaPlan?.targetAudience && (
            <p className="text-sm text-gray-500 mt-1">
              We've pre-filled this with information from your social media plan. Feel free to edit or expand on it.
            </p>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-green-500 mr-2" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
            <p className="text-sm text-green-800">
              You can create a detailed social media plan in the dedicated tool on your dashboard after completing the wizard.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={profileMutation.isPending}
            className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
          >
            {profileMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              "Save & Continue"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default MarketingForm;
