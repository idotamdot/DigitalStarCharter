import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Star, Filter, Search, Clock, Sparkles } from "lucide-react";

// Celestial themed animations for the learning paths
const StarryBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/50 to-background z-10" />
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

const LearningPathCard = ({ path }: { path: any }) => {
  const { toast } = useToast();
  
  const handleEnroll = async (e: React.MouseEvent, pathId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch(`/api/learning-paths/${pathId}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
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
    }
  };
  
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:border-primary/50 h-full flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-b from-background/5 via-background/20 to-background opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
      <CardHeader className="relative">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1 group-hover:text-primary transition-colors">
              {path.title}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {path.description}
            </CardDescription>
          </div>
          <EnrollmentBadge tier={path.requiredTier} />
        </div>
      </CardHeader>
      <CardContent className="relative flex-grow">
        <div className="flex flex-wrap gap-2 mb-3">
          {(path.tags || []).map((tag: string, i: number) => (
            <Badge key={i} variant="outline" className="bg-background/50">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Star className="h-4 w-4" />
          <span className="text-sm">{path.skillLevel || "Beginner"}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm">{path.estimatedHours} hours</span>
        </div>
      </CardContent>
      <CardFooter className="relative border-t pt-4 bg-card">
        <div className="w-full flex justify-between items-center">
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent hover:text-primary"
            asChild
          >
            <Link href={`/learning-paths/${path.id}`}>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>View Details</span>
              </span>
            </Link>
          </Button>
          <Button
            variant="outline"
            className="px-3 hover:border-primary hover:text-primary"
            onClick={(e) => handleEnroll(e, path.id)}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Enroll
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const UserEnrollmentsSection = () => {
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["/api/user/enrollments"],
    enabled: true,
  });
  
  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-pulse flex space-x-4">
          <div className="h-12 w-12 rounded-full bg-muted"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center space-y-4 border rounded-lg border-dashed">
        <Sparkles className="h-12 w-12 text-muted" />
        <h3 className="text-xl font-medium">No Pathways Started</h3>
        <p className="text-center text-muted-foreground max-w-xs">
          You haven't enrolled in any learning paths yet. Discover learning paths below to begin your journey!
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Learning Journey</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {enrollments.map((enrollment: any) => (
          <Card key={enrollment.id} className="relative overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{enrollment.path?.title || "Learning Path"}</CardTitle>
                <EnrollmentBadge tier={enrollment.path?.requiredTier || "self-guided"} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{enrollment.progressPercent}%</span>
                  </div>
                  <Progress value={enrollment.progressPercent} className="h-2" />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                  <span>
                    {enrollment.completedAt 
                      ? `Completed: ${new Date(enrollment.completedAt).toLocaleDateString()}` 
                      : "In Progress"}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <Link href={`/learning-paths/${enrollment.pathId}`}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  {enrollment.completedAt ? "Review Path" : "Continue Learning"}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

const LearningPathsGrid = ({ paths, isLoading }: { paths: any[]; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/3"></div>
            </CardContent>
            <CardFooter>
              <div className="h-10 bg-muted rounded w-full"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!paths || paths.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center space-y-4 border rounded-lg border-dashed">
        <BookOpen className="h-12 w-12 text-muted" />
        <h3 className="text-xl font-medium">No learning paths found</h3>
        <p className="text-center text-muted-foreground max-w-xs">
          There are no learning paths available with your current filters. Try adjusting your search.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {paths.map((path) => (
        <LearningPathCard key={path.id} path={path} />
      ))}
    </div>
  );
};

const LearningPaths = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  
  const { data: paths, isLoading } = useQuery({
    queryKey: ["/api/learning-paths"],
    enabled: true,
  });
  
  // Filter paths based on search, category, and level
  const filteredPaths = paths ? paths.filter((path: any) => {
    const matchesSearch = searchTerm === "" || 
      path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      path.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || path.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || path.skillLevel === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  }) : [];
  
  // Extract unique categories for filter
  const categories = paths 
    ? Array.from(new Set(paths.map((path: any) => path.category)))
    : [];
  
  // Skill levels for filter
  const skillLevels = ["beginner", "intermediate", "advanced"];
  
  return (
    <div className="container py-8 space-y-10 relative">
      <StarryBackground />
      
      <div className="relative space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Learning Pathways</h1>
            <p className="text-muted-foreground mt-1">
              Celestial journeys to guide your professional growth
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <TabsList className="mb-4 md:mb-0">
              <TabsTrigger value="all">All Pathways</TabsTrigger>
              <TabsTrigger value="my-paths">My Learning</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search pathways..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <span>Category</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: string) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center">
                    <Star className="mr-2 h-4 w-4" />
                    <span>Skill Level</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {skillLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="all" className="mt-0 space-y-8">
            <LearningPathsGrid paths={filteredPaths} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="my-paths" className="mt-0">
            <UserEnrollmentsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LearningPaths;