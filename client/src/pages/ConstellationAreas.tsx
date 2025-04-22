import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Constellation, Area } from "@shared/schema";
import { Loader2, MapPin, Users, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ConstellationAreas() {
  const { id } = useParams<{ id: string }>();
  const constellationId = parseInt(id);

  const {
    data: constellation,
    isLoading: isLoadingConstellation,
    error: constellationError
  } = useQuery<Constellation>({
    queryKey: [`/api/constellations/${id}`],
    enabled: !!id && !isNaN(constellationId)
  });

  const {
    data: areas,
    isLoading: isLoadingAreas,
    error: areasError
  } = useQuery<Area[]>({
    queryKey: [`/api/constellations/${id}/areas`],
    enabled: !!id && !isNaN(constellationId)
  });

  const activeAreas = areas?.filter(area => area.isActive) || [];
  const inactiveAreas = areas?.filter(area => !area.isActive) || [];

  if (isLoadingConstellation || isLoadingAreas) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading constellation areas...</span>
      </div>
    );
  }

  if (constellationError || areasError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">
            Error loading data. Please try again later.
          </p>
        </div>
        <Button asChild>
          <Link href="/constellations">Back to Constellations</Link>
        </Button>
      </div>
    );
  }

  if (!constellation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
          <p className="text-amber-700">
            Constellation not found. It may have been removed or you have insufficient permissions.
          </p>
        </div>
        <Button asChild>
          <Link href="/constellations">Back to Constellations</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{constellation.name}</h1>
          <p className="text-gray-500 mt-1">
            <span className="inline-flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {constellation.region}
            </span>
            <span className="inline-flex items-center ml-4">
              <Star className="w-4 h-4 mr-1" />
              {constellation.activatedAreas} of {constellation.totalAreas} areas activated
            </span>
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/constellations">
            Back to Constellations
          </Link>
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-lg p-6 mb-8 border">
        <h2 className="text-xl font-semibold mb-2">About this Constellation</h2>
        <p className="mb-4">{constellation.description}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-primary/10">
            {constellation.totalAreas} Total Areas
          </Badge>
          <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
            {constellation.activatedAreas} Activated
          </Badge>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400">
            {constellation.totalAreas - (constellation.activatedAreas || 0)} Pending
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Areas ({areas?.length || 0})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeAreas.length})</TabsTrigger>
          <TabsTrigger value="inactive">Pending ({inactiveAreas.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {areas?.map(area => (
              <AreaCard key={area.id} area={area} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="active" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeAreas.map(area => (
              <AreaCard key={area.id} area={area} />
            ))}
          </div>
          {activeAreas.length === 0 && (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-gray-500">No active areas in this constellation yet.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="inactive" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveAreas.map(area => (
              <AreaCard key={area.id} area={area} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AreaCard({ area }: { area: Area }) {
  return (
    <Card className={area.isActive ? "border-green-300 dark:border-green-800" : "border-amber-200 dark:border-amber-900"}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{area.name}</span>
          {area.isActive ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              Pending
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="truncate">{area.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="w-4 h-4 mr-1" />
          <span>
            {area.currentMembers} / {area.maxMembers} members
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" size="sm" className="w-full">
          <Link href={`/areas/${area.id}`}>
            <span>View Area Details</span>
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}