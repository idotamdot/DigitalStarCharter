import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Library, ShieldCheck } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResourceApi } from "@shared/resource-schema";

interface ResourceDetailProps {
  params: { id: string };
}

export default function ResourceDetail({ params }: ResourceDetailProps) {
  const resourceId = Number(params.id);
  const resourceQuery = useQuery<ResourceApi>({
    queryKey: [`/api/resources/${resourceId}`],
    enabled: Number.isInteger(resourceId) && resourceId > 0,
  });

  const resource = resourceQuery.data;

  return (
    <div className="min-h-screen bg-[#070b18] text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <Link href="/resources" className="mb-8 inline-flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200">
          <ArrowLeft className="h-4 w-4" /> Back to Knowledge Commons
        </Link>

        {resourceQuery.isLoading ? (
          <Card className="h-80 animate-pulse border-slate-800 bg-slate-900/40" />
        ) : resourceQuery.error || !resource ? (
          <Card className="border-red-900/50 bg-red-950/20">
            <CardHeader>
              <CardTitle>Resource unavailable</CardTitle>
              <CardDescription>
                {resourceQuery.error?.message ?? "This resource does not exist or your current membership cannot access it."}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <section className="mb-8">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="capitalize">{resource.category}</Badge>
                <Badge variant="outline" className="capitalize">{resource.contentType}</Badge>
                <Badge variant="outline" className={resource.accessLevel === "steward" ? "border-amber-500/50 text-amber-300" : "border-blue-500/50 text-blue-300"}>
                  {resource.accessLevel === "steward" && <ShieldCheck className="mr-1 h-3 w-3" />}
                  <span className="capitalize">{resource.accessLevel}</span>
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tight">{resource.title}</h1>
              <p className="mt-4 max-w-3xl text-lg text-slate-300">{resource.description}</p>
            </section>

            <Card className="border-slate-800 bg-slate-900/55">
              <CardContent className="p-8">
                {resource.contentType === "video" ? (
                  <div className="aspect-video overflow-hidden rounded-xl border border-slate-800 bg-black">
                    <iframe
                      className="h-full w-full"
                      src={resource.url}
                      title={resource.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-12 text-center">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-300">
                      <Library className="h-7 w-7" />
                    </div>
                    <h2 className="text-xl font-semibold">Open this knowledge resource</h2>
                    <p className="mt-2 max-w-xl text-slate-400">
                      DigitalStarCharter keeps the access rules and provenance here while the resource itself may live in another format or system.
                    </p>
                    <Button asChild className="mt-6">
                      <a href={resource.url} target="_blank" rel="noreferrer">
                        Open Resource <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
