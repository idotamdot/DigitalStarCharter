import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BusinessProfile } from "@shared/schema";

interface BrandingFormProps {
  businessProfile?: BusinessProfile;
  onComplete: () => void;
}

const BrandingForm = ({ businessProfile, onComplete }: BrandingFormProps) => {
  const { toast } = useToast();

  const [form, setForm] = useState({
    primaryColor: "#4f46e5", // Default to primary indigo
    secondaryColor: "#7e22ce", // Default to secondary purple
    typography: "",
    brandValues: [] as string[],
    tagline: "",
    missionStatement: "",
  });

  // Fetch branding info if it exists
  const { data: brandingInfo, isLoading } = useQuery({
    queryKey: ["/api/branding/me"],
    enabled: !!businessProfile,
    retry: false,
  });

  // Update form with existing data if available
  useEffect(() => {
    if (brandingInfo) {
      setForm({
        primaryColor: brandingInfo.primaryColor || form.primaryColor,
        secondaryColor: brandingInfo.secondaryColor || form.secondaryColor,
        typography: brandingInfo.typography || "",
        brandValues: brandingInfo.brandValues as string[] || [],
        tagline: brandingInfo.tagline || "",
        missionStatement: brandingInfo.missionStatement || "",
      });
    }
  }, [brandingInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      brandValues: prev.brandValues.includes(value)
        ? prev.brandValues.filter(v => v !== value)
        : [...prev.brandValues, value],
    }));
  };

  // Mutation for creating/updating branding info
  const brandingMutation = useMutation({
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
        description: "Branding information saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem saving your branding information.",
        variant: "destructive",
      });
    },
  });

  // Mutation for updating business profile to mark step as completed
  const profileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/business-profiles/${businessProfile?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-profiles/me"] });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessProfile) {
      toast({
        title: "Error",
        description: "Please complete the business information step first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // First save the branding info
      await brandingMutation.mutateAsync({
        ...form,
        businessId: businessProfile.id,
      });

      // Then update the business profile to mark this step as completed
      let completedSteps = businessProfile.completedSteps as string[] || [];
      if (!completedSteps.includes("branding")) {
        completedSteps = [...completedSteps, "branding"];
      }

      await profileMutation.mutateAsync({
        ...businessProfile,
        completedSteps,
        wizardProgress: {
          ...businessProfile.wizardProgress,
          currentStep: "website",
        },
      });
    } catch (error) {
      // Error already handled in mutation callbacks
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="tagline" className="text-base">
            Tagline or Slogan
          </Label>
          <Input
            id="tagline"
            name="tagline"
            value={form.tagline}
            onChange={handleInputChange}
            placeholder="A short, memorable phrase that captures your brand"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="missionStatement" className="text-base">
            Mission Statement
          </Label>
          <Textarea
            id="missionStatement"
            name="missionStatement"
            value={form.missionStatement}
            onChange={handleInputChange}
            placeholder="What is your business's purpose and vision?"
            className="mt-1"
            rows={3}
          />
        </div>

        <div>
          <Label className="text-base mb-2 block">
            Brand Values (Select up to 5)
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium">Visual Identity</h3>
          
          <div>
            <Label htmlFor="primaryColor" className="text-base">
              Primary Color
            </Label>
            <div className="flex space-x-2 mt-1">
              <Input
                type="color"
                id="primaryColor"
                name="primaryColor"
                value={form.primaryColor}
                onChange={handleInputChange}
                className="w-12 h-10 p-1"
              />
              <Input
                type="text"
                value={form.primaryColor}
                onChange={handleInputChange}
                name="primaryColor"
                className="flex-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="secondaryColor" className="text-base">
              Secondary Color
            </Label>
            <div className="flex space-x-2 mt-1">
              <Input
                type="color"
                id="secondaryColor"
                name="secondaryColor"
                value={form.secondaryColor}
                onChange={handleInputChange}
                className="w-12 h-10 p-1"
              />
              <Input
                type="text"
                value={form.secondaryColor}
                onChange={handleInputChange}
                name="secondaryColor"
                className="flex-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="typography" className="text-base">
              Typography Style
            </Label>
            <select
              id="typography"
              name="typography"
              value={form.typography}
              onChange={handleInputChange}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select typography style</option>
              <option value="Modern Sans-Serif">Modern Sans-Serif</option>
              <option value="Classic Serif">Classic Serif</option>
              <option value="Playful Display">Playful Display</option>
              <option value="Minimalist">Minimalist</option>
              <option value="Elegant Script">Elegant Script</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
          <div className="flex">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-amber-500 mr-2" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                clipRule="evenodd" 
              />
            </svg>
            <p className="text-sm text-amber-800">
              Your branding preferences will be used to create your visual identity. You'll be able to refine these choices later.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={brandingMutation.isPending || profileMutation.isPending}
            className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
          >
            {brandingMutation.isPending || profileMutation.isPending ? (
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

export default BrandingForm;
