import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BusinessProfile } from "@shared/schema";

interface WebsiteFormProps {
  businessProfile?: BusinessProfile;
  onComplete: () => void;
}

const WebsiteForm = ({ businessProfile, onComplete }: WebsiteFormProps) => {
  const { toast } = useToast();

  const [form, setForm] = useState({
    websiteType: "informational",
    pagesNeeded: ["home", "about", "services", "contact"],
    domainName: businessProfile?.website || "",
    customDomain: false,
    websiteGoals: "",
    keyFeatures: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (page: string) => {
    setForm((prev) => ({
      ...prev,
      pagesNeeded: prev.pagesNeeded.includes(page)
        ? prev.pagesNeeded.filter(p => p !== page)
        : [...prev.pagesNeeded, page],
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
        description: "Website preferences saved successfully.",
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

    // Store website preferences in wizardProgress
    let completedSteps = businessProfile.completedSteps as string[] || [];
    if (!completedSteps.includes("website")) {
      completedSteps = [...completedSteps, "website"];
    }

    const websitePreferences = {
      ...form
    };

    const updatedProfile = {
      ...businessProfile,
      completedSteps,
      wizardProgress: {
        ...businessProfile.wizardProgress,
        currentStep: "marketing",
        websitePreferences
      },
      // Update the website field if they entered a domain
      website: form.domainName || businessProfile.website,
    };

    profileMutation.mutate(updatedProfile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-base">Website Type</Label>
          <RadioGroup
            value={form.websiteType}
            onValueChange={(value) => setForm({ ...form, websiteType: value })}
            className="mt-2"
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="informational" id="informational" />
              <div>
                <Label htmlFor="informational" className="font-medium">Informational Website</Label>
                <p className="text-sm text-gray-500">Showcase your business information and services</p>
              </div>
            </div>
            <div className="flex items-start space-x-2 mt-2">
              <RadioGroupItem value="ecommerce" id="ecommerce" />
              <div>
                <Label htmlFor="ecommerce" className="font-medium">E-commerce Website</Label>
                <p className="text-sm text-gray-500">Sell products or services online</p>
              </div>
            </div>
            <div className="flex items-start space-x-2 mt-2">
              <RadioGroupItem value="portfolio" id="portfolio" />
              <div>
                <Label htmlFor="portfolio" className="font-medium">Portfolio Website</Label>
                <p className="text-sm text-gray-500">Showcase your work, projects, or case studies</p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="mt-6">
          <Label className="text-base mb-2 block">
            Pages Needed
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {["home", "about", "services", "products", "portfolio", "pricing", "blog", "contact", "testimonials"].map((page) => (
              <div key={page} className="flex items-center space-x-2">
                <Checkbox 
                  id={`page-${page}`} 
                  checked={form.pagesNeeded.includes(page)}
                  onCheckedChange={() => handleCheckboxChange(page)}
                />
                <label
                  htmlFor={`page-${page}`}
                  className="text-sm font-medium leading-none capitalize"
                >
                  {page}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <Label htmlFor="domainName" className="text-base">
            Preferred Domain Name
          </Label>
          <Input
            id="domainName"
            name="domainName"
            value={form.domainName}
            onChange={handleInputChange}
            placeholder="yourbusiness.com"
            className="mt-1"
          />
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox 
              id="customDomain" 
              checked={form.customDomain}
              onCheckedChange={(checked) => 
                setForm({ ...form, customDomain: checked as boolean })
              }
            />
            <label
              htmlFor="customDomain"
              className="text-sm font-medium leading-none"
            >
              I already own this domain
            </label>
          </div>
        </div>

        <div className="mt-6">
          <Label htmlFor="websiteGoals" className="text-base">
            Website Goals
          </Label>
          <Textarea
            id="websiteGoals"
            name="websiteGoals"
            value={form.websiteGoals}
            onChange={handleInputChange}
            placeholder="What do you want to achieve with your website? (e.g., generate leads, sell products, showcase portfolio)"
            className="mt-1"
            rows={3}
          />
        </div>

        <div className="mt-6">
          <Label htmlFor="keyFeatures" className="text-base">
            Key Features Needed
          </Label>
          <Textarea
            id="keyFeatures"
            name="keyFeatures"
            value={form.keyFeatures}
            onChange={handleInputChange}
            placeholder="What special features do you need? (e.g., contact form, booking system, gallery)"
            className="mt-1"
            rows={3}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-blue-500 mr-2" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                clipRule="evenodd" 
              />
            </svg>
            <p className="text-sm text-blue-800">
              Your website will be built based on these preferences. You'll be able to customize it further after the initial setup.
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

export default WebsiteForm;
