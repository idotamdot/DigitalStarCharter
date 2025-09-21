import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Clock,
  Users,
  FileText,
  MessageSquare,
  Star,
  Crown,
  Vote,
  MapPin,
  ArrowRight,
  Info,
  AlertTriangle,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ONBOARDING_STEPS,
  GOVERNANCE_ROLES,
  getStepsForRole,
  getRoleById,
} from "@shared/governance";

// Form schema for the enhanced application
const applicationSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  primaryRole: z.string().min(1, "Please select a primary role"),
  yearsExperience: z.string().min(1, "Please select your experience level"),
  skills: z.string().min(10, "Please describe your skills and experience (minimum 10 characters)"),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  additionalInfo: z.string().optional(),
  region: z.string().min(1, "Please select your region"),
  governanceUnderstanding: z.boolean().refine(val => val === true, {
    message: "You must acknowledge understanding of the governance structure"
  }),
  characterEvaluationConsent: z.boolean().refine(val => val === true, {
    message: "You must consent to the character evaluation process"
  }),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const REGIONS = [
  "North America",
  "South America", 
  "Europe",
  "Africa",
  "Asia",
  "Oceania",
  "Antarctica"
];

const EXPERIENCE_LEVELS = [
  "< 1 year",
  "1-2 years",
  "3-5 years",
  "6-10 years",
  "> 10 years"
];

interface OnboardingWorkflowProps {
  onComplete?: () => void;
}

export default function OnboardingWorkflow({ onComplete }: OnboardingWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      primaryRole: "",
      yearsExperience: "",
      skills: "",
      portfolioUrl: "",
      additionalInfo: "",
      region: "",
      governanceUnderstanding: false,
      characterEvaluationConsent: false,
    },
  });

  const submitApplication = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      return apiRequest("/api/onboarding/apply", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully. You'll receive an email with next steps.",
      });
      setCurrentStep(ONBOARDING_STEPS.length);
      onComplete?.();
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed",
        description: error.message || "There was an error submitting your application.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ApplicationFormData) => {
    submitApplication.mutate(data);
  };

  const roleSteps = selectedRole ? getStepsForRole(selectedRole) : ONBOARDING_STEPS;
  const currentStepData = roleSteps[currentStep];
  const selectedRoleData = getRoleById(selectedRole);
  const progressPercentage = ((currentStep + 1) / roleSteps.length) * 100;

  const renderStepContent = () => {
    if (currentStep >= roleSteps.length) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in joining Digital Presence. Your application
              is now being reviewed by our governance team.
            </p>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">What happens next?</h3>
                <ul className="text-sm space-y-1 text-left">
                  <li>• You'll receive an email confirmation within 24 hours</li>
                  <li>• Technical assessment will be scheduled within 3-5 days</li>
                  <li>• Character evaluation with area leader and peers</li>
                  <li>• Final decision communicated within 1-2 weeks</li>
                </ul>
              </div>
              <Button onClick={() => window.location.href = "/"}>
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    switch (currentStepData?.id) {
      case "application":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Application Form
              </CardTitle>
              <CardDescription>
                Complete your application to join the Digital Presence constellation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
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
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryRole"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Role *</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedRole(value);
                          }}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your primary role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {GOVERNANCE_ROLES.filter(role => role.id !== "member").map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  <div className="flex items-center">
                                    {role.level === "council-member" && <Crown className="w-3 h-3 mr-1" />}
                                    {role.votingRights && <Vote className="w-3 h-3 mr-1" />}
                                    {role.title}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Region *</FormLabel>
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your region" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {REGIONS.map((region) => (
                                <SelectItem key={region} value={region}>
                                  <div className="flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {region}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="yearsExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience *</FormLabel>
                        <Select onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your experience level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EXPERIENCE_LEVELS.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
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
                        <FormLabel>Skills & Experience *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your relevant skills, experience, and what you can contribute to Digital Presence..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Please provide a detailed description of your skills and experience
                        </FormDescription>
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
                          <Input placeholder="https://your-portfolio.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          GitHub profile, personal website, or any online portfolio
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
                            placeholder="Any additional information you'd like to share..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold">Acknowledgments</h3>
                    
                    <FormField
                      control={form.control}
                      name="governanceUnderstanding"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I understand the Digital Presence governance structure *
                            </FormLabel>
                            <FormDescription>
                              I have read and understand the governance roles, voting mechanisms,
                              and democratic decision-making processes
                            </FormDescription>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="characterEvaluationConsent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I consent to the character evaluation process *
                            </FormLabel>
                            <FormDescription>
                              I understand that joining requires a character evaluation by area
                              leaders and peer members to ensure culture fit
                            </FormDescription>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                    >
                      Back
                    </Button>
                    <Button type="submit" disabled={submitApplication.isPending}>
                      {submitApplication.isPending ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        );

      case "governance-overview":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="w-5 h-5 mr-2" />
                Governance Overview
              </CardTitle>
              <CardDescription>
                Understanding Digital Presence governance structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-2">Democratic Governance</h3>
                    <p className="text-sm text-gray-600">
                      Digital Presence operates on democratic principles with transparent
                      decision-making at every level. Your voice matters in shaping our future.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-semibold">Global Level</h4>
                      <p className="text-xs text-gray-600">
                        North Star Council of 30 founding members
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-semibold">Continental</h4>
                      <p className="text-xs text-gray-600">
                        Guiding Stars lead 7 continental constellations
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold">Area Level</h4>
                      <p className="text-xs text-gray-600">
                        30 areas per continent, 30 members per area
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedRoleData && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Your Role: {selectedRoleData.title}</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Level:</span>
                      <Badge variant="outline" className="ml-2">
                        {selectedRoleData.level.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Voting Rights:</span>
                      <Badge variant={selectedRoleData.votingRights ? "default" : "secondary"} className="ml-2">
                        {selectedRoleData.votingRights ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Key Responsibilities:</span>
                      <ul className="mt-2 space-y-1">
                        {selectedRoleData.responsibilities.slice(0, 3).map((resp, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2"></span>
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                >
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(currentStep + 1)}>
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                {currentStepData?.title}
              </CardTitle>
              <CardDescription>
                {currentStepData?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold mb-2">Coming Soon</h3>
                <p className="text-gray-600 mb-4">
                  This step will be available after you submit your application.
                </p>
                <p className="text-sm text-gray-500">
                  Estimated time: {currentStepData?.estimatedTime}
                </p>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={currentStep >= 1} // Only allow navigation for informational steps
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Join Digital Presence</h1>
          <p className="text-gray-600">
            Become a star in our constellation of technical professionals
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-gray-500">
              Step {Math.min(currentStep + 1, roleSteps.length)} of {roleSteps.length}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Steps Timeline */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {roleSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
                  index <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle className="w-3 h-3" />
                ) : index === currentStep ? (
                  <Clock className="w-3 h-3" />
                ) : (
                  <span className="w-3 h-3 border border-current rounded-full" />
                )}
                <span>{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {renderStepContent()}
        </div>

        {/* Footer Info */}
        {currentStep < roleSteps.length && (
          <div className="max-w-4xl mx-auto mt-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Important Note</p>
                    <p className="text-gray-600">
                      Your application will be reviewed by current constellation members.
                      The character evaluation ensures culture fit and maintains our
                      collaborative standards. All decisions are made transparently
                      through our democratic governance process.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}