import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BusinessProfile } from "@shared/schema";

interface BusinessInfoFormProps {
  existingProfile?: BusinessProfile;
  onComplete: () => void;
}

const BusinessInfoForm = ({ existingProfile, onComplete }: BusinessInfoFormProps) => {
  const { toast } = useToast();

  const [form, setForm] = useState({
    businessName: "",
    industry: "",
    description: "",
    stage: "",
    targetAudience: "",
    location: "",
    website: "",
  });

  // Update form with existing data if available
  useEffect(() => {
    if (existingProfile) {
      setForm({
        businessName: existingProfile.businessName || "",
        industry: existingProfile.industry || "",
        description: existingProfile.description || "",
        stage: existingProfile.stage || "",
        targetAudience: existingProfile.targetAudience || "",
        location: existingProfile.location || "",
        website: existingProfile.website || "",
      });
    }
  }, [existingProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Mutation for creating/updating business profile
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (existingProfile) {
        return apiRequest("PUT", `/api/business-profiles/${existingProfile.id}`, data);
      } else {
        return apiRequest("POST", "/api/business-profiles", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-profiles/me"] });
      toast({
        title: "Success!",
        description: existingProfile
          ? "Business profile updated successfully."
          : "Business profile created successfully.",
      });
      onComplete();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was a problem saving your business profile.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.businessName) {
      toast({
        title: "Validation Error",
        description: "Business name is required.",
        variant: "destructive",
      });
      return;
    }

    // Update or create the business profile
    const payload = {
      ...form,
      wizardProgress: existingProfile?.wizardProgress || { currentStep: "business-info" },
      completedSteps: existingProfile?.completedSteps || [],
    };

    if (!payload.completedSteps.includes("business-info")) {
      payload.completedSteps = [...payload.completedSteps, "business-info"];
    }

    mutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="businessName" className="text-base">
            Business Name *
          </Label>
          <Input
            id="businessName"
            name="businessName"
            value={form.businessName}
            onChange={handleInputChange}
            placeholder="Enter your business name"
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="industry" className="text-base">
            Industry
          </Label>
          <select
            id="industry"
            name="industry"
            value={form.industry}
            onChange={handleInputChange}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select an industry</option>
            <option value="Technology">Technology</option>
            <option value="Retail">Retail</option>
            <option value="Health & Wellness">Health & Wellness</option>
            <option value="Food & Beverage">Food & Beverage</option>
            <option value="Professional Services">Professional Services</option>
            <option value="Creative & Design">Creative & Design</option>
            <option value="Education">Education</option>
            <option value="Financial Services">Financial Services</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <Label htmlFor="description" className="text-base">
            Business Description
          </Label>
          <Textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleInputChange}
            placeholder="Describe what your business does"
            className="mt-1"
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="stage" className="text-base">
            Business Stage
          </Label>
          <select
            id="stage"
            name="stage"
            value={form.stage}
            onChange={handleInputChange}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select your business stage</option>
            <option value="Idea">Idea - Just getting started</option>
            <option value="Early Stage">Early Stage - Working on the first version</option>
            <option value="Established">Established - Already have customers</option>
            <option value="Growing">Growing - Scaling up operations</option>
            <option value="Mature">Mature - Established business</option>
          </select>
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
            placeholder="Describe your ideal customers"
            className="mt-1"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location" className="text-base">
              Business Location
            </Label>
            <Input
              id="location"
              name="location"
              value={form.location}
              onChange={handleInputChange}
              placeholder="City, State, Country"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="website" className="text-base">
              Current Website (if any)
            </Label>
            <Input
              id="website"
              name="website"
              value={form.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
        >
          {mutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Saving...
            </>
          ) : existingProfile ? (
            "Update & Continue"
          ) : (
            "Save & Continue"
          )}
        </Button>
      </div>
    </form>
  );
};

export default BusinessInfoForm;
