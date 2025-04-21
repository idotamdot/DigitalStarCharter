import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Constellation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function ConstellationMap() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  // Query to fetch all constellations
  const { data: constellations, isLoading, isError, refetch } = useQuery<Constellation[]>({
    queryKey: ['/api/constellations'],
    retry: 1,
    onSuccess: (data) => {
      console.log("Fetched constellations:", data);
    },
    onError: (error) => {
      console.error("Error fetching constellations:", error);
    }
  });

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
                    {/* Placeholder for actual star visualization - would be a canvas or SVG in a real implementation */}
                    <div className="mt-2 h-48 bg-slate-800 rounded-lg flex items-center justify-center text-white">
                      <p>Constellation Visualization Placeholder</p>
                    </div>
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