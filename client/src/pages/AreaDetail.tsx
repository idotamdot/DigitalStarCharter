import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Area, User } from "@shared/schema";
import { Loader2, MapPin, Users, ArrowLeft, Star, User as UserIcon, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export default function AreaDetail() {
  const { id } = useParams<{ id: string }>();
  const areaId = parseInt(id);

  const {
    data: area,
    isLoading,
    error
  } = useQuery<Area>({
    queryKey: [`/api/areas/${id}`],
    enabled: !!id && !isNaN(areaId)
  });

  // This would be a separate query to get the area leader
  const {
    data: leader,
    isLoading: isLoadingLeader,
  } = useQuery<User>({
    queryKey: [`/api/users/${area?.leaderId}`],
    enabled: !!area?.leaderId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading area details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">
            Error loading area details. Please try again later.
          </p>
        </div>
        <Button asChild>
          <Link href="/constellations">Back to Constellations</Link>
        </Button>
      </div>
    );
  }

  if (!area) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
          <p className="text-amber-700">
            Area not found. It may have been removed or you have insufficient permissions.
          </p>
        </div>
        <Button asChild>
          <Link href="/constellations">Back to Constellations</Link>
        </Button>
      </div>
    );
  }

  const currentMembers = area.currentMembers || 0;
  const maxMembers = area.maxMembers || 30;
  const isFull = currentMembers >= maxMembers;
  const occupancyPercentage = (currentMembers / maxMembers) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2">
            <Link href={`/constellations/${area.constellationId}`}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Constellation
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{area.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            {area.isActive ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                Pending Activation
              </Badge>
            )}
            <span className="text-gray-500">
              <MapPin className="w-4 h-4 inline mr-1" />
              Constellation ID: {area.constellationId}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About This Area</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{area.description}</p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1 flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Member Capacity
                  </h3>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span>Current Members: {currentMembers}</span>
                    <span>{maxMembers} Maximum</span>
                  </div>
                  <Progress value={occupancyPercentage} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {isFull ? (
                      "This area is at full capacity"
                    ) : (
                      `${maxMembers - currentMembers} spots available`
                    )}
                  </p>
                </div>

                {area.leaderId ? (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      Area Leader
                    </h3>
                    {isLoadingLeader ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading leader information...
                      </div>
                    ) : leader ? (
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>{leader.fullName?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{leader.fullName}</p>
                          <p className="text-sm text-gray-500">{leader.starName || "Star name not set"}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">Leader information not available</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <h3 className="text-sm font-medium mb-1 flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      Area Leader
                    </h3>
                    <p className="text-gray-500">No leader assigned to this area yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Area Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Creation Date</h3>
                  <p>{area.createdAt ? new Date(area.createdAt).toLocaleDateString() : 'Unknown'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Status</h3>
                  <p className="flex items-center">
                    {area.isActive ? (
                      <>
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        Active and operating
                      </>
                    ) : (
                      "Pending activation"
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Member Count</h3>
                  <p className="flex items-center">
                    <UserIcon className="w-4 h-4 mr-1" />
                    {currentMembers} {currentMembers === 1 ? "member" : "members"}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" disabled={!area.isActive}>
                    Request to Join
                  </Button>
                  <Button variant="outline" className="w-full" disabled={!area.isActive}>
                    View Members
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Area Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {area.isActive ? (
            <div className="prose dark:prose-invert max-w-none">
              <p>This area is active and supporting business development in its region.</p>
              
              <h3>Rotating Voters</h3>
              <p>Each area has 3 rotating voters who participate in continental governance decisions. Voter rotation happens quarterly to ensure fair representation.</p>
              
              <h3>Area Achievements</h3>
              <p>This section will show milestones and achievements made by members of this area.</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">This area is not yet activated</p>
              <p className="text-sm">Areas become active once they have an assigned leader and their first members join.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}