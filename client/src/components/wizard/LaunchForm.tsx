import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BusinessProfile } from "@shared/schema";
import { CalendarIcon, RocketIcon, CheckCircleIcon } from "@/lib/icons";

interface LaunchFormProps {
  businessProfile?: BusinessProfile;
  onComplete: () => void;
}

const LaunchForm = ({ businessProfile, onComplete }: LaunchFormProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<"checklist" | "schedule" | "complete">("checklist");

  const [form, setForm] = useState({
    readyToLaunch: false,
    launchDate: "",
    launchStrategy: "soft",
    launchNotes: "",
    checklist: {
      contentReady: false,
      brandingComplete: false,
      socialMediaSetup: false,
      analyticsSetup: false,
      legalCompliance: false,
      testingComplete: false
    }
  });

  const handleCheckboxChange = (field: keyof typeof form.checklist) => {
    setForm((prev) => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [field]: !prev.checklist[field]
      }
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isChecklistComplete = Object.values(form.checklist).every(item => item);

  // Mutation for updating business profile to mark step as completed
  const profileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/business-profiles/${businessProfile?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-profiles/me"] });
      
      if (step === "complete") {
        toast({
          title: "Congratulations!",
          description: "Your business development plan is now complete.",
        });
        onComplete();
      } else {
        setStep(step === "checklist" ? "schedule" : "complete");
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem updating your progress.",
        variant: "destructive",
      });
    },
  });

  const handleNextStep = () => {
    if (!businessProfile) {
      toast({
        title: "Error",
        description: "Please complete the previous steps first.",
        variant: "destructive",
      });
      return;
    }

    // Store launch preferences in wizardProgress
    let completedSteps = businessProfile.completedSteps as string[] || [];
    
    const launchPreferences = {
      ...form
    };

    if (step === "checklist") {
      const updatedProfile = {
        ...businessProfile,
        wizardProgress: {
          ...businessProfile.wizardProgress,
          launchPreferences
        },
      };
      
      profileMutation.mutate(updatedProfile);
    } else if (step === "schedule") {
      if (!completedSteps.includes("launch")) {
        completedSteps = [...completedSteps, "launch"];
      }
      
      const updatedProfile = {
        ...businessProfile,
        completedSteps,
        wizardProgress: {
          ...businessProfile.wizardProgress,
          currentStep: "complete",
          launchPreferences
        },
      };
      
      profileMutation.mutate(updatedProfile);
    } else {
      onComplete();
    }
  };

  const renderChecklist = () => (
    <>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="contentReady" 
            checked={form.checklist.contentReady}
            onCheckedChange={() => handleCheckboxChange("contentReady")}
          />
          <Label htmlFor="contentReady" className="text-base font-medium">Website content is ready</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="brandingComplete" 
            checked={form.checklist.brandingComplete}
            onCheckedChange={() => handleCheckboxChange("brandingComplete")}
          />
          <Label htmlFor="brandingComplete" className="text-base font-medium">Branding elements are complete</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="socialMediaSetup" 
            checked={form.checklist.socialMediaSetup}
            onCheckedChange={() => handleCheckboxChange("socialMediaSetup")}
          />
          <Label htmlFor="socialMediaSetup" className="text-base font-medium">Social media profiles are set up</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="analyticsSetup" 
            checked={form.checklist.analyticsSetup}
            onCheckedChange={() => handleCheckboxChange("analyticsSetup")}
          />
          <Label htmlFor="analyticsSetup" className="text-base font-medium">Analytics tracking is configured</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="legalCompliance" 
            checked={form.checklist.legalCompliance}
            onCheckedChange={() => handleCheckboxChange("legalCompliance")}
          />
          <Label htmlFor="legalCompliance" className="text-base font-medium">Legal pages (privacy policy, terms) are in place</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="testingComplete" 
            checked={form.checklist.testingComplete}
            onCheckedChange={() => handleCheckboxChange("testingComplete")}
          />
          <Label htmlFor="testingComplete" className="text-base font-medium">Testing on different devices is complete</Label>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="readyToLaunch" 
            checked={form.readyToLaunch}
            onCheckedChange={(checked) => setForm({ ...form, readyToLaunch: checked as boolean })}
          />
          <Label htmlFor="readyToLaunch" className="text-base font-medium">I confirm everything is ready for launch</Label>
        </div>
      </div>
    </>
  );

  const renderSchedule = () => (
    <>
      <div className="space-y-6">
        <div>
          <Label htmlFor="launchDate" className="text-base">
            Planned Launch Date
          </Label>
          <div className="flex items-center mt-1">
            <CalendarIcon className="w-5 h-5 mr-2 text-gray-400" />
            <Input
              id="launchDate"
              name="launchDate"
              type="date"
              value={form.launchDate}
              onChange={handleInputChange}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <Label className="text-base">Launch Strategy</Label>
          <RadioGroup
            value={form.launchStrategy}
            onValueChange={(value) => setForm({ ...form, launchStrategy: value })}
            className="mt-2"
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="soft" id="soft-launch" />
              <div>
                <Label htmlFor="soft-launch" className="font-medium">Soft Launch</Label>
                <p className="text-sm text-gray-500">Launch quietly and gather feedback before promoting</p>
              </div>
            </div>
            <div className="flex items-start space-x-2 mt-2">
              <RadioGroupItem value="full" id="full-launch" />
              <div>
                <Label htmlFor="full-launch" className="font-medium">Full Launch</Label>
                <p className="text-sm text-gray-500">Launch with full marketing and promotion</p>
              </div>
            </div>
            <div className="flex items-start space-x-2 mt-2">
              <RadioGroupItem value="phased" id="phased-launch" />
              <div>
                <Label htmlFor="phased-launch" className="font-medium">Phased Launch</Label>
                <p className="text-sm text-gray-500">Roll out features gradually over time</p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="launchNotes" className="text-base">
            Launch Notes & Reminders
          </Label>
          <Textarea
            id="launchNotes"
            name="launchNotes"
            value={form.launchNotes}
            onChange={handleInputChange}
            placeholder="Any specific plans or things to remember for launch day"
            className="mt-1"
            rows={3}
          />
        </div>
      </div>
    </>
  );

  const renderComplete = () => (
    <div className="text-center py-6">
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircleIcon className="w-12 h-12 text-green-600" />
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2">Business Development Plan Complete!</h3>
      <p className="text-gray-600 mb-6">
        Congratulations! You've completed all the steps to set up your business online presence.
        Your dashboard will now show your progress and next action items.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 text-left">
        <div className="flex">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
              clipRule="evenodd" 
            />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-medium mb-1">What's next?</p>
            <ul className="text-sm text-blue-800 list-disc pl-5 space-y-1">
              <li>Review your dashboard for recommended actions</li>
              <li>Explore the resource library for helpful guides</li>
              <li>Consider upgrading your plan for additional support</li>
              <li>Begin implementing your marketing strategy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {step === "checklist" && (
        <>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
              <RocketIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Launch Checklist</h3>
              <p className="text-gray-500">Ensure everything is ready before launch</p>
            </div>
          </div>
          {renderChecklist()}
        </>
      )}

      {step === "schedule" && (
        <>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Schedule Your Launch</h3>
              <p className="text-gray-500">Plan the perfect timing for your business launch</p>
            </div>
          </div>
          {renderSchedule()}
        </>
      )}

      {step === "complete" && renderComplete()}

      <div className="pt-4 border-t border-gray-200">
        {step !== "complete" && (
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
                {step === "checklist" 
                  ? "This checklist helps ensure you've covered all important aspects before launching your online presence."
                  : "Setting a launch date will help you stay on track and create motivation to complete any remaining tasks."}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          {step === "complete" ? (
            <Button
              onClick={onComplete}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button
              onClick={handleNextStep}
              disabled={profileMutation.isPending || (step === "checklist" && (!isChecklistComplete || !form.readyToLaunch))}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
            >
              {profileMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : step === "checklist" ? (
                "Next: Schedule Launch"
              ) : (
                "Complete"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaunchForm;
