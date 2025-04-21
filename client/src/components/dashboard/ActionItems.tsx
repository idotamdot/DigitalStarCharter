import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { BusinessProfile } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ActionItemsProps {
  businessProfile?: BusinessProfile;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  link: string;
  linkText: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

const ActionItems = ({ businessProfile }: ActionItemsProps) => {
  const { toast } = useToast();
  const [actions, setActions] = useState<ActionItem[]>([]);

  // Mutation for updating business profile
  const profileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/business-profiles/${businessProfile?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-profiles/me"] });
      toast({
        title: "Success!",
        description: "Your progress has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem updating your progress.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (businessProfile) {
      const completedSteps = businessProfile.completedSteps as string[] || [];
      const wizardProgress = businessProfile.wizardProgress || {};
      
      // Action items based on completed steps
      let actionItems: ActionItem[] = [];
      
      // If business info is done but branding is not
      if (completedSteps.includes("business-info") && !completedSteps.includes("branding")) {
        actionItems.push({
          id: "complete-branding",
          title: "Complete your brand development",
          description: "Define your brand identity and visual elements",
          link: "/business-wizard?step=branding",
          linkText: "Continue Setup",
          completed: false,
          priority: "high"
        });
      }
      
      // If no social media plan exists
      if (!wizardProgress.socialMediaPlan) {
        actionItems.push({
          id: "create-social-plan",
          title: "Create a social media strategy",
          description: "Plan your content and social media presence",
          link: "/social-media-plan",
          linkText: "Create Plan",
          completed: false,
          priority: "medium"
        });
      }
      
      // If branding is complete but missing detailed brand questionnaire
      if (completedSteps.includes("branding") && !wizardProgress.brandingQuestionnaire) {
        actionItems.push({
          id: "detailed-branding",
          title: "Complete detailed brand questionnaire",
          description: "Further refine your brand identity",
          link: "/brand-questionnaire",
          linkText: "Start Questionnaire",
          completed: false,
          priority: "medium"
        });
      }
      
      // If they haven't selected a service tier
      if (!wizardProgress.serviceTier) {
        actionItems.push({
          id: "select-service",
          title: "Choose a service tier",
          description: "Select the right level of support for your business",
          link: "/service-selection",
          linkText: "View Plans",
          completed: false,
          priority: "low"
        });
      }
      
      // If all wizard steps are completed
      if (completedSteps.length === 5) {
        actionItems.push({
          id: "explore-resources",
          title: "Explore resource library",
          description: "Access guides and templates for your business",
          link: "/resources",
          linkText: "Browse Resources",
          completed: false,
          priority: "low"
        });
      }
      
      // Check if any action items are marked as completed in the profile
      const completedActions = wizardProgress.completedActions as string[] || [];
      
      // Mark actions as completed if they're in the completedActions array
      actionItems = actionItems.map(action => ({
        ...action,
        completed: completedActions.includes(action.id)
      }));
      
      // Sort by priority and completion status
      actionItems.sort((a, b) => {
        if (a.completed === b.completed) {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.completed ? 1 : -1;
      });
      
      setActions(actionItems);
    }
  }, [businessProfile]);

  const handleToggleAction = (actionId: string, completed: boolean) => {
    if (!businessProfile) return;
    
    // Update local state
    setActions(prev => 
      prev.map(action => 
        action.id === actionId ? { ...action, completed } : action
      )
    );
    
    // Update the business profile
    const completedActions = businessProfile.wizardProgress?.completedActions as string[] || [];
    let updatedActions: string[];
    
    if (completed) {
      updatedActions = [...completedActions, actionId];
    } else {
      updatedActions = completedActions.filter(id => id !== actionId);
    }
    
    const updatedProfile = {
      ...businessProfile,
      wizardProgress: {
        ...businessProfile.wizardProgress,
        completedActions: updatedActions
      }
    };
    
    profileMutation.mutate(updatedProfile);
  };

  if (!businessProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Action Items</CardTitle>
          <CardDescription>Complete your business profile to see recommended actions</CardDescription>
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
        <CardTitle>Recommended Actions</CardTitle>
        <CardDescription>Tasks to help grow your business</CardDescription>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mx-auto text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h3 className="text-base font-medium text-gray-900 mb-1">All caught up!</h3>
            <p className="text-sm text-gray-500">
              You've completed all recommended actions. Check back later for more suggestions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {actions.map((action) => (
              <div key={action.id} className={`p-4 rounded-lg border ${action.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}>
                <div className="flex items-start">
                  <div className="mr-3 pt-1">
                    <Checkbox
                      checked={action.completed}
                      onCheckedChange={(checked) => handleToggleAction(action.id, checked as boolean)}
                      className={action.completed ? 'text-gray-400' : ''}
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-sm font-medium ${action.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {action.title}
                      </h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        action.priority === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : action.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {action.priority}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${action.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                      {action.description}
                    </p>
                    {!action.completed && (
                      <div className="mt-2">
                        <Link href={action.link}>
                          <Button variant="outline" size="sm" className="text-xs h-7">
                            {action.linkText}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            Need more guidance? Explore our resource library for templates, guides, and best practices.
          </p>
          <Link href="/resources">
            <Button className="w-full" variant="outline">
              Browse Resources
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionItems;
