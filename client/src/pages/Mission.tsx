import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { StarIcon, Stars, CornerLeftUp } from "lucide-react";

export default function Mission() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-900 to-blue-950">
      {/* Animated stars background */}
      <div className="absolute inset-0 z-0">
        <div className="stars-small"></div>
        <div className="stars-medium"></div>
        <div className="stars-large"></div>
      </div>

      <div className="container relative z-10 py-12 mx-auto px-4 md:px-6">
        <div className="mb-8">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-white hover:text-white/80 hover:bg-white/10"
          >
            <Link href="/">
              <CornerLeftUp className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card className="max-w-3xl mx-auto bg-black/40 backdrop-blur-md border-blue-900/50 shadow-xl text-white overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-600/10 to-blue-600/10 z-0"></div>
          
          <CardContent className="relative z-10 p-8 md:p-12">
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-indigo-400 to-purple-500 px-6 py-2 rounded-full animate-pulse">
                <Stars className="h-5 w-5 text-white" />
                <h2 className="text-xl font-semibold text-white">Digital Presence</h2>
                <Stars className="h-5 w-5 text-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 mb-8">
              Our Celestial Mission
            </h1>

            <div className="space-y-8 leading-relaxed">
              <blockquote className="border-l-4 border-purple-500 pl-6 italic my-8 text-xl text-purple-200">
                Our mission is to create a collective that shares, in equal measure, the fruits of our labors—hoping to one day be joined by all, in love for one another.
              </blockquote>

              <div className="space-y-4 text-lg">
                <p>We are building a unified constellation—not a hierarchy, but a harmonious collective where each star shines in its own right.</p>
                
                <p>Together, not in opposition, we elevate one another. We flourish as individuals empowered by our shared purpose and collective strength.</p>
                
                <p>In the vast cosmos of commerce, we become beacons of light—illuminating a path toward global harmony, guided by love, 
                committed to the freedom and prosperity of all, and dedicated to creating a life of quality and dignity for everyone, everywhere.</p>
              </div>

              <div>
                <p className="text-lg mb-4">We are:</p>
                <ul className="space-y-3 pl-6">
                  {[
                    "Technically savvy professionals",
                    "Designing the digital presence and tools businesses need to thrive",
                    "Serving sole proprietors and partnerships with first-class support",
                    "Cultivating evenly distributed business growth through the empowerment of local communities",
                    "Sharing in collective success with equal dignity"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <StarIcon className="h-5 w-5 text-blue-300 dark:text-purple-300 mr-2 mt-1 flex-shrink-0 animate-pulse" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <blockquote className="border-l-4 border-blue-500 pl-6 italic my-8 text-xl text-blue-200">
                As stars unite to form constellations, so do we join in purpose.<br />
                Together, we illuminate the path forward.<br />
                This is our mission.
              </blockquote>

              <div className="text-center pt-8">
                <div className="inline-flex items-center justify-center">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-indigo-500"></div>
                  <div className="animate-[float_3s_ease-in-out_infinite]">
                    <Stars className="h-8 w-8 mx-4 text-indigo-400" />
                  </div>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-indigo-500"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}