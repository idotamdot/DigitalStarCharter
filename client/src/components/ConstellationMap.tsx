import React, { useEffect, useState } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Constellation, User } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, MessageSquare } from "lucide-react";

// Helper function to get background gradient based on theme
function getConstellationBackground(theme: string | null): string {
  const themes: Record<string, string> = {
    "aurora-borealis": "linear-gradient(to bottom, #000428, #004e92)",
    "amazon-night": "linear-gradient(to bottom, #0f2027, #203a43, #2c5364)",
    "northern-lights": "linear-gradient(to bottom, #134e5e, #71b280)",
    "savanna-sunset": "linear-gradient(to bottom, #c31432, #240b36)",
    "himalayan-peaks": "linear-gradient(to bottom, #1e3c72, #2a5298)",
    "great-barrier": "linear-gradient(to bottom, #2980b9, #2c3e50)",
    "polar-ice": "linear-gradient(to bottom, #7f7fd5, #86a8e7, #91eae4)",
    "desert-night": "linear-gradient(to bottom, #232526, #414345)"
  };
  
  return themes[theme || ""] || "linear-gradient(to bottom, #000000, #434343)";
}

// Component to render stars within a constellation
interface ConstellationStarsProps {
  region: string;
}

function ConstellationStars({ region }: ConstellationStarsProps) {
  const [stars, setStars] = useState<JSX.Element[]>([]);
  
  // Query to fetch users in this region
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users/region', region],
    enabled: !!region,
    retry: 1,
  });
  
  useEffect(() => {
    if (users && users.length > 0) {
      // Generate random positions for stars
      const starElements = users.map((user, index) => {
        // Random position within the container
        const top = Math.random() * 90; // %
        const left = Math.random() * 90; // %
        const size = user.starSize || Math.random() * 0.8 + 0.5; // 0.5-1.3rem
        const color = user.starColor || "#ffffff";
        const delay = Math.random() * 4; // s
        
        return (
          <div
            key={user.id || index}
            className="absolute animate-pulse rounded-full"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: `${size}rem`,
              height: `${size}rem`,
              backgroundColor: color,
              boxShadow: `0 0 10px 2px ${color}`,
              animationDuration: `${3 + delay}s`
            }}
            title={user.starName || user.fullName || `Star ${index + 1}`}
          />
        );
      });
      
      setStars(starElements);
    } else {
      // Create placeholder stars if no users yet
      const placeholderStars = Array.from({ length: 30 }).map((_, index) => {
        const top = Math.random() * 90;
        const left = Math.random() * 90;
        const size = Math.random() * 0.8 + 0.5;
        const colors = ["#FFD700", "#F8F8FF", "#FFFAFA", "#87CEEB", "#E6E6FA"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <div
            key={`placeholder-${index}`}
            className="absolute animate-pulse rounded-full"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: `${size}rem`,
              height: `${size}rem`,
              backgroundColor: color,
              boxShadow: `0 0 10px 2px ${color}`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
            title={`Developer ${index + 1}`}
          />
        );
      });
      
      setStars(placeholderStars);
    }
  }, [users, region]);
  
  return (
    <div className="relative w-full h-full">
      {stars}
      <div className="absolute bottom-2 right-2 text-xs text-gray-400">
        {stars.length} stars
      </div>
    </div>
  );
}

export function ConstellationMap() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  // Query to fetch all constellations
  const { data: constellations, isLoading, isError, refetch } = useQuery<Constellation[]>({
    queryKey: ['/api/constellations'],
    retry: 1,
    staleTime: 30000
  });

  // Use useEffect for logging to avoid TypeScript errors with onSuccess/onError
  useEffect(() => {
    if (constellations) {
      console.log("Fetched constellations:", constellations);
    }
  }, [constellations]);

  // Query to fetch a specific region's constellation when selected
  const { data: regionConstellation, isLoading: isRegionLoading } = useQuery<Constellation>({
    queryKey: ['/api/constellations/region', selectedRegion],
    enabled: !!selectedRegion, // Only run query when a region is selected
    retry: 1,
  });

  // Function to create a test constellation
  const createTexasConstellation = async () => {
    try {
      const response = await fetch('/api/constellations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // In a real app, we would use actual auth tokens
          'user-id': '1' // This is a temporary way to pass the auth in our prototype
        },
        body: JSON.stringify({
          region: "Texas",
          name: "Lone Star Constellation",
          description: "The constellation for all members from Texas",
          backgroundTheme: "desert-night"
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Created constellation:", data);
        refetch(); // Refetch the constellations list
      } else {
        console.error("Failed to create constellation:", await response.text());
      }
    } catch (error) {
      console.error("Error creating constellation:", error);
    }
  };

  // Function to select a region and load its constellation
  const selectRegion = (region: string) => {
    setSelectedRegion(region);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Constellation Map</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Test Tools</h3>
        <Button onClick={createTexasConstellation} className="mr-2">
          Create Texas Constellation
        </Button>
        <Button onClick={() => refetch()} variant="outline">
          Refresh Data
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Available Constellations</h3>
          {isLoading ? (
            <p>Loading constellations...</p>
          ) : isError ? (
            <p className="text-red-500">Error loading constellations</p>
          ) : constellations?.length ? (
            <div className="grid grid-cols-1 gap-4">
              {constellations.map((constellation) => (
                <Card key={constellation.id} className="cursor-pointer hover:bg-gray-50" onClick={() => selectRegion(constellation.region)}>
                  <CardHeader className="pb-2">
                    <CardTitle>{constellation.name}</CardTitle>
                    <CardDescription>Region: {constellation.region}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm">{constellation.description}</p>
                  </CardContent>
                  <CardFooter>
                    <p className="text-xs text-gray-500">Created: {constellation.createdAt ? new Date(constellation.createdAt).toLocaleDateString() : 'Unknown'}</p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p>No constellations found. Create one to get started!</p>
          )}
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-4">Selected Constellation</h3>
          {selectedRegion ? (
            isRegionLoading ? (
              <p>Loading region data...</p>
            ) : regionConstellation ? (
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle>{regionConstellation.name}</CardTitle>
                  <CardDescription>Region: {regionConstellation.region}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{regionConstellation.description}</p>
                  <div className="mt-4">
                    <h4 className="text-md font-medium">Theme: {regionConstellation.backgroundTheme || "Default"}</h4>
                    <div className="mt-2 h-64 bg-slate-900 rounded-lg relative overflow-hidden">
                      {/* Background theme visualization */}
                      <div 
                        className="absolute inset-0 opacity-30" 
                        style={{ 
                          backgroundImage: getConstellationBackground(regionConstellation.backgroundTheme),
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }} 
                      />
                      
                      {/* Stars visualization */}
                      <div className="relative h-full w-full">
                        <ConstellationStars region={regionConstellation.region} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <Button asChild className="w-full flex justify-between items-center">
                      <Link href={`/constellations/${regionConstellation.id}`}>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          View Areas ({regionConstellation.totalAreas || 0})
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    
                    <Button asChild variant="outline" className="w-full flex justify-between items-center">
                      <Link href="/forum">
                        <span className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Guiding Star Forum
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <p>Region constellation not found</p>
            )
          ) : (
            <p>Select a constellation from the list to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConstellationMap;