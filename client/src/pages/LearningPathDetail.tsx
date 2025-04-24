import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, BookOpen, Clock, Star, Check, Sparkles, Award, 
  XCircle, AlertTriangle, LucideIcon 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface PathStep {
  id: number;
  title: string;
  description: string | null;
  resourceId: number;
  stepOrder: number;
  isRequired: boolean;
  completedAt?: string | null;
  resourceRating?: number | null;
}

const StepItem = ({ 
  step, 
  pathId, 
  isEnrolled, 
  onStepUpdate 
}: { 
  step: PathStep; 
  pathId: number;
  isEnrolled: boolean;
  onStepUpdate: () => void;
}) => {
  const { toast } = useToast();
  const [isCompleting, setIsCompleting] = useState(false);
  
  const markStepCompleted = async (completed: boolean) => {
    if (!isEnrolled) {
      toast({
        title: "Not enrolled",
        description: "You need to enroll in this learning path first",
        variant: "destructive",
      });
      return;
    }
    
    setIsCompleting(true);
    
    try {
      const response = await fetch(`/api/learning-path-steps/${step.id}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          completed
        })
      });
      
      if (response.ok) {
        onStepUpdate();
        
        toast({
          title: completed ? "Step completed!" : "Step marked as incomplete",
          description: completed 
            ? "Your progress has been updated" 
            : "This step has been marked as not completed",
          variant: "default",
        });
      } else {
        toast({
          title: "Error updating progress",
          description: "Failed to update your progress",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error updating progress",
        description: "An error occurred while updating progress",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };
  
  return (
    <div className={`border rounded-lg p-4 ${step.completedAt ? 'border-green-500/30 bg-green-500/5' : 'border-border'}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Checkbox 
            checked={!!step.completedAt}
            onCheckedChange={(checked) => markStepCompleted(!!checked)}
            disabled={!isEnrolled || isCompleting}
            className={step.completedAt ? "border-green-500 bg-green-500" : ""}
          />
        </div>
        <div className="space-y-1 flex-grow">
          <div className="flex justify-between">
            <h3 className="font-medium text-lg">
              {step.title}
            </h3>
            <Badge variant={step.isRequired ? "outline" : "secondary"}>
              {step.isRequired ? "Required" : "Optional"}
            </Badge>
          </div>
          {step.description && (
            <p className="text-sm text-muted-foreground">{step.description}</p>
          )}
          <div className="mt-3 flex justify-between items-center">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/resources/${step.resourceId}`}>
                <BookOpen className="mr-2 h-4 w-4" />
                View Resource
              </Link>
            </Button>
            {step.completedAt && (
              <span className="text-sm text-green-500 flex items-center">
                <Check className="h-4 w-4 mr-1" />
                Completed {new Date(step.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EnrollmentBadge = ({ tier }: { tier: string }) => {
  const colors = {
    "self-guided": "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
    "growth": "bg-blue-500/20 text-blue-500 border-blue-500/50",
    "premium": "bg-purple-500/20 text-purple-500 border-purple-500/50"
  };
  
  const labels = {
    "self-guided": "Dwarf Star",
    "growth": "Giant Star",
    "premium": "Supernova"
  };
  
  return (
    <Badge className={`border ${colors[tier as keyof typeof colors]}`}>
      {labels[tier as keyof typeof labels]}
    </Badge>
  );
};

const ProgressStats = ({ progress }: { progress: any }) => {
  if (!progress) return null;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Your Progress</CardTitle>
        <CardDescription>Track your journey through this learning path</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Completion</span>
            <span>{progress.overallProgress}%</span>
          </div>
          <Progress value={progress.overallProgress} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Completed Steps</div>
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-500" />
              <span className="text-lg font-semibold">{progress.completedSteps} of {progress.totalSteps}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Remaining</div>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              <span className="text-lg font-semibold">{progress.totalSteps - progress.completedSteps}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EnrollmentButton = ({ 
  pathId, 
  isEnrolled, 
  onEnrollmentChange 
}: { 
  pathId: number; 
  isEnrolled: boolean;
  onEnrollmentChange: () => void;
}) => {
  const { toast } = useToast();
  const [isEnrolling, setIsEnrolling] = useState(false);
  
  const handleEnroll = async () => {
    if (isEnrolled) return;
    
    setIsEnrolling(true);
    
    try {
      const response = await fetch(`/api/learning-paths/${pathId}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        onEnrollmentChange();
        
        toast({
          title: "Successfully enrolled!",
          description: "You have been enrolled in this learning path.",
          variant: "default",
        });
      } else {
        const data = await response.json();
        toast({
          title: "Enrollment failed",
          description: data.message || "Unable to enroll in this learning path",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Enrollment failed",
        description: "An error occurred while enrolling in this learning path",
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };
  
  return (
    <Button 
      onClick={handleEnroll}
      disabled={isEnrolled || isEnrolling}
      className={isEnrolled ? "bg-green-500 hover:bg-green-600" : ""}
    >
      {isEnrolled ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Enrolled
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Enroll Now
        </>
      )}
    </Button>
  );
};

// Celestial themed animations for the learning path detail page
const PathDetailBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/50 to-background z-10" />
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-radial from-primary/5 to-transparent opacity-70" />
      <div className="stars-container absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="star absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
              animation: `twinkle ${Math.random() * 5 + 5}s infinite ${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

const LearningPathDetail = () => {
  const { id } = useParams();
  const pathId = parseInt(id || "0");
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get path details with steps
  const { data: path, isLoading: pathLoading } = useQuery({
    queryKey: [`/api/learning-paths/${pathId}`],
    enabled: !!pathId,
  });
  
  // Check user enrollment status
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/user/enrollments"],
    enabled: !!user,
  });
  
  // Get user progress for this path
  const { 
    data: progress,
    isLoading: progressLoading,
    refetch: refetchProgress
  } = useQuery({
    queryKey: [`/api/learning-paths/${pathId}/progress`],
    enabled: !!user && !!pathId,
  });
  
  const isEnrolled = enrollments?.some((e: any) => e.pathId === pathId) || false;
  const isLoading = pathLoading || enrollmentsLoading || progressLoading;
  
  if (isLoading && !path) {
    return (
      <div className="container py-10">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-16 bg-muted rounded w-3/4"></div>
          <div className="h-64 bg-muted rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  if (!path) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center space-y-4 p-8 border rounded-lg border-dashed">
          <XCircle className="h-16 w-16 text-muted" />
          <h2 className="text-2xl font-medium">Learning Path Not Found</h2>
          <p className="text-center text-muted-foreground max-w-md">
            We couldn't find the learning path you're looking for. It might have been removed or you may have followed an invalid link.
          </p>
          <Button asChild>
            <Link href="/learning-paths">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Learning Paths
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const handleEnrollmentChange = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/user/enrollments"] });
    refetchProgress();
  };
  
  const handleStepUpdate = () => {
    refetchProgress();
  };
  
  return (
    <div className="container py-8 relative">
      <PathDetailBackground />
      
      <div className="mb-6">
        <Link href="/learning-paths" className="inline-flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Learning Paths
        </Link>
      </div>
      
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">{path.title}</h1>
              <p className="text-muted-foreground">{path.description}</p>
            </div>
            <EnrollmentBadge tier={path.requiredTier || "self-guided"} />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{path.estimatedHours} hours</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{path.skillLevel || "Beginner"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{path.category}</span>
            </div>
          </div>
          
          <div className="flex gap-4 flex-wrap">
            {(path.tags || []).map((tag: string, i: number) => (
              <Badge key={i} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex mt-4">
            <EnrollmentButton 
              pathId={pathId} 
              isEnrolled={isEnrolled}
              onEnrollmentChange={handleEnrollmentChange} 
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Learning Path Steps</h2>
              <div className="space-y-4">
                {path.steps && path.steps.length > 0 ? (
                  path.steps
                    .sort((a: PathStep, b: PathStep) => a.stepOrder - b.stepOrder)
                    .map((step: PathStep) => {
                      // Find progress for this step if it exists
                      const stepProgress = progress?.progress?.find((p: any) => p.stepId === step.id);
                      const stepWithProgress = {
                        ...step,
                        completedAt: stepProgress?.completedAt,
                        resourceRating: stepProgress?.resourceRating
                      };
                      
                      return (
                        <StepItem 
                          key={step.id} 
                          step={stepWithProgress} 
                          pathId={pathId}
                          isEnrolled={isEnrolled}
                          onStepUpdate={handleStepUpdate}
                        />
                      );
                    })
                ) : (
                  <div className="p-8 text-center border rounded-lg border-dashed">
                    <p className="text-muted-foreground">No steps found for this learning path.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {user && isEnrolled && (
              <ProgressStats progress={progress} />
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About This Path</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">What You'll Learn</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Professional skills aligned with your star's constellation</li>
                    <li>Technical knowledge applicable to your role</li>
                    <li>How to collaborate more effectively with other stars</li>
                    <li>Methods to increase your contribution value</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Requirements</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Basic understanding of your role within Digital Presence</li>
                    <li>Commitment to complete all required modules</li>
                    <li>
                      {path.requiredTier === "premium" 
                        ? "Supernova tier membership" 
                        : path.requiredTier === "growth"
                          ? "Giant Star tier or higher" 
                          : "Any membership tier"}
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPathDetail;