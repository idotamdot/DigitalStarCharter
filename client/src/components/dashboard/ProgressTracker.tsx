import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { BusinessProfile } from "@shared/schema";

interface ProgressTrackerProps {
  businessProfile?: BusinessProfile;
}

interface StepStatus {
  id: string;
  name: string;
  description: string;
  status: "completed" | "in-progress" | "not-started";
  route: string;
}

const ProgressTracker = ({ businessProfile }: ProgressTrackerProps) => {
  const [steps, setSteps] = useState<StepStatus[]>([
    {
      id: "business-info",
      name: "Define Your Business",
      description: "Set up basic business information",
      status: "not-started",
      route: "/business-wizard"
    },
    {
      id: "branding",
      name: "Develop Your Brand",
      description: "Create your brand identity",
      status: "not-started",
      route: "/business-wizard?step=branding"
    },
    {
      id: "website",
      name: "Website Setup",
      description: "Configure your website preferences",
      status: "not-started",
      route: "/business-wizard?step=website"
    },
    {
      id: "marketing",
      name: "Marketing Strategy",
      description: "Plan your marketing approach",
      status: "not-started",
      route: "/business-wizard?step=marketing"
    },
    {
      id: "launch",
      name: "Launch & Grow",
      description: "Prepare for business launch",
      status: "not-started",
      route: "/business-wizard?step=launch"
    }
  ]);

  // Calculate progress percentage
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (businessProfile) {
      const completedSteps = businessProfile.completedSteps as string[] || [];
      const currentStep = businessProfile.wizardProgress?.currentStep || "";
      
      // Update step statuses
      const updatedSteps = steps.map(step => {
        if (completedSteps.includes(step.id)) {
          return { ...step, status: "completed" as const };
        } else if (step.id === currentStep) {
          return { ...step, status: "in-progress" as const };
        } else {
          return { ...step, status: "not-started" as const };
        }
      });
      
      setSteps(updatedSteps);
      
      // Calculate progress
      const completedCount = completedSteps.length;
      const totalSteps = steps.length;
      const newProgress = Math.round((completedCount / totalSteps) * 100);
      setProgress(newProgress);
    }
  }, [businessProfile]);

  if (!businessProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Development Progress</CardTitle>
          <CardDescription>Complete your business profile to track progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Button 
              onClick={() => window.location.href = "/business-wizard"}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
            >
              Start Business Development
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Business Development Progress</CardTitle>
        <CardDescription>Your journey to building an online presence</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{progress}% Complete</span>
            {progress === 100 && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                Complete
              </span>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="mt-6 space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start">
              <div className="relative flex items-center justify-center mt-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                  step.status === "completed" 
                    ? "bg-green-100 text-green-600" 
                    : step.status === "in-progress"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-400"
                }`}>
                  {step.status === "completed" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`absolute top-8 h-full w-0.5 left-4 -ml-px ${
                    step.status === "completed" ? "bg-green-200" : "bg-gray-200"
                  }`}></div>
                )}
              </div>
              <div className="ml-4 min-w-0 flex-1 pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium">{step.name}</h4>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {step.status !== "completed" && (
                    <Link href={step.route}>
                      <a className="text-xs px-2 py-1 rounded-md bg-primary-50 text-primary-600 font-medium hover:bg-primary-100">
                        {step.status === "in-progress" ? "Continue" : "Start"}
                      </a>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {progress === 100 && (
          <div className="mt-2 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Congratulations on completing your business development plan! Continue to refine your strategy with these tools:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/brand-questionnaire">
                <Button variant="outline" size="sm" className="w-full">Refine Brand</Button>
              </Link>
              <Link href="/social-media-plan">
                <Button variant="outline" size="sm" className="w-full">Social Media</Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressTracker;
