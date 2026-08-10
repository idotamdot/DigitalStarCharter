import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, FileText, Library, Search, ShieldCheck, Sparkles, Video, Wrench } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ResourceApi, ResourceContentType } from "@shared/resource-schema";

function ContentIcon({ type }: { type: ResourceContentType }) {
  switch (type) {
    case "video":
      return <Video className="h-5 w-5" />;
    case "tool":
      return <Wrench className="h-5 w-5" />;
    case "course":
    case "guide":
      return <BookOpen className="h-5 w-5" />;
    case "template":
    case "reference":
      return <Library className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
}

function AccessBadge({ level }: { level: ResourceApi["accessLevel"] }) {
  if (level === "open") return <Badge variant="outline">Open</Badge>;
  if (level === "steward") {
    return (
      <Badge variant="outline" className="border-amber-500/50 text-amber-300">
        <ShieldCheck className="mr-1 h-3 w-3" /> Steward
      </Badge>
    );
  }
  return <Badge variant="outline" className="border-blue-500/50 text-blue-300">Member</Badge>;
}

export default function ResourceLibrary() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const resourcesQuery = useQuery<ResourceApi[]>({ queryKey: ["/api/resources"] });

  const resources = resourcesQuery.data ?? [];
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(resources.map((resource) => resource.category))).sort()],
    [resources],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return resources.filter((resource) => {
      if (category !== "all" && resource.category !== category) return false;
      if (!normalizedQuery) return true;
      return [resource.title, resource.description, resource.category]
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [resources, category, query]);

  return (
    <div className="min-h-screen bg-[#070b18] text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <section className="mb-10 max-w-3xl">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300">
            <Library className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Knowledge Commons</h1>
          <p className="mt-3 text-lg text-slate-300">
            Shared operational knowledge, guides, tools and learning resources for the DigitalStarCharter network.
          </p>
        </section>

        <section className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search knowledge..."
              className="border-slate-700 bg-slate-950/60 pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <Button
                key={item}
                size="sm"
                variant={category === item ? "default" : "outline"}
                onClick={() => setCategory(item)}
                className="capitalize"
              >
                {item}
              </Button>
            ))}
          </div>
        </section>

        {resourcesQuery.isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Card key={index} className="h-52 animate-pulse border-slate-800 bg-slate-900/40" />
            ))}
          </div>
        ) : resourcesQuery.error ? (
          <Card className="border-red-900/50 bg-red-950/20">
            <CardHeader>
              <CardTitle>Knowledge could not be loaded</CardTitle>
              <CardDescription>{resourcesQuery.error.message}</CardDescription>
            </CardHeader>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/40">
            <CardContent className="flex flex-col items-center py-14 text-center">
              <Sparkles className="mb-4 h-8 w-8 text-slate-500" />
              <p className="font-medium">No resources match this view yet.</p>
              <p className="mt-1 text-sm text-slate-400">The commons will grow as stewards add verified material.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((resource) => (
              <Link key={resource.id} href={`/resources/${resource.id}`}>
                <Card className="h-full cursor-pointer border-slate-800 bg-slate-900/55 transition hover:border-blue-500/50 hover:bg-slate-900/80">
                  <CardHeader>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300">
                        <ContentIcon type={resource.contentType} />
                      </div>
                      <AccessBadge level={resource.accessLevel} />
                    </div>
                    <CardTitle>{resource.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-sm text-slate-400">
                    <span className="capitalize">{resource.category}</span>
                    <span className="capitalize">{resource.contentType}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
