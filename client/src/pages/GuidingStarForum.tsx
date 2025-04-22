import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ForumTopic, ForumReply } from "@shared/schema";
import { Loader2, MessageSquare, Pin, LockIcon, Calendar, User, ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function GuidingStarForum() {
  const {
    data: topics,
    isLoading,
    error
  } = useQuery<ForumTopic[]>({
    queryKey: ['/api/forum/topics'],
  });

  const pinnedTopics = topics?.filter(topic => topic.isPinned) || [];
  const regularTopics = topics?.filter(topic => !topic.isPinned) || [];
  
  // Group topics by category
  const topicsByCategory = topics?.reduce((groups, topic) => {
    const category = topic.category || 'Uncategorized';
    return {
      ...groups,
      [category]: [...(groups[category] || []), topic]
    };
  }, {} as Record<string, ForumTopic[]>) || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading forum topics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">
            Error loading forum topics. This forum is restricted to Guiding Stars only.
          </p>
        </div>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guiding Stars Forum</h1>
          <p className="text-gray-500 mt-1">
            A private forum for collaboration between continental Guiding Stars
          </p>
        </div>
        <div className="space-x-2">
          <Button asChild variant="outline">
            <Link href="/">
              Back to Home
            </Link>
          </Button>
          <Button>
            <MessageSquare className="w-4 h-4 mr-2" />
            New Topic
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Topics</TabsTrigger>
          <TabsTrigger value="pinned">Pinned</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          {pinnedTopics.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-3 flex items-center">
                <Pin className="w-4 h-4 mr-2" />
                Pinned Topics
              </h2>
              <div className="space-y-3">
                {pinnedTopics.map(topic => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h2 className="text-lg font-medium mb-3">Topics</h2>
            {regularTopics.length > 0 ? (
              <div className="space-y-3">
                {regularTopics.map(topic => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-gray-500">No topics have been created yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="pinned" className="mt-0">
          {pinnedTopics.length > 0 ? (
            <div className="space-y-3">
              {pinnedTopics.map(topic => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-gray-500">No pinned topics at the moment.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="categories" className="mt-0">
          {Object.keys(topicsByCategory).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(topicsByCategory).map(([category, categoryTopics]) => (
                <div key={category}>
                  <h2 className="text-lg font-medium mb-3 flex items-center">
                    {category}
                    <Badge className="ml-2 bg-primary/10">{categoryTopics.length}</Badge>
                  </h2>
                  <div className="space-y-3">
                    {categoryTopics.map(topic => (
                      <TopicCard key={topic.id} topic={topic} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-gray-500">No topics with categories yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TopicCard({ topic }: { topic: ForumTopic }) {
  return (
    <Card className={topic.isPinned ? "border-primary/30" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Link href={`/forum/topics/${topic.id}`} className="hover:text-primary transition-colors">
            {topic.title}
          </Link>
          {topic.isPinned && <Pin className="w-4 h-4 text-primary" />}
          {topic.isLocked && <LockIcon className="w-4 h-4 text-gray-500" />}
          {topic.category && (
            <Badge variant="outline" className="ml-auto">
              {topic.category}
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="flex items-center">
            <User className="w-3 h-3 mr-1" />
            Created by ID: {topic.createdBy}
          </span>
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {topic.createdAt ? format(new Date(topic.createdAt), 'MMM d, yyyy') : 'Unknown date'}
          </span>
          <span className="flex items-center">
            <MessageCircle className="w-3 h-3 mr-1" />
            {/* This would ideally come from a count of replies */}
            0 replies
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
          {/* Display a preview of the content */}
          {topic.content.replace(/^#.*\n/, '').trim().substring(0, 150)}
          {topic.content.length > 150 ? '...' : ''}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" size="sm" className="w-full">
          <Link href={`/forum/topics/${topic.id}`}>
            <span>View Topic</span>
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function TopicDetail() {
  const [location] = useLocation();
  const topicId = parseInt(location.split('/').pop() || '0');

  const {
    data: topic,
    isLoading: isLoadingTopic,
    error: topicError
  } = useQuery<ForumTopic>({
    queryKey: [`/api/forum/topics/${topicId}`],
    enabled: !!topicId && !isNaN(topicId)
  });

  const {
    data: replies,
    isLoading: isLoadingReplies,
    error: repliesError
  } = useQuery<ForumReply[]>({
    queryKey: [`/api/forum/topics/${topicId}/replies`],
    enabled: !!topicId && !isNaN(topicId)
  });

  if (isLoadingTopic || isLoadingReplies) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading topic...</span>
      </div>
    );
  }

  if (topicError || repliesError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">
            Error loading topic. This forum is restricted to Guiding Stars only.
          </p>
        </div>
        <Button asChild>
          <Link href="/forum">Back to Forum</Link>
        </Button>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
          <p className="text-amber-700">
            Topic not found. It may have been removed or you have insufficient permissions.
          </p>
        </div>
        <Button asChild>
          <Link href="/forum">Back to Forum</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {topic.title}
            {topic.isPinned && <Pin className="w-5 h-5 text-primary" />}
            {topic.isLocked && <LockIcon className="w-5 h-5 text-gray-500" />}
          </h1>
          <div className="flex items-center gap-x-4 mt-1 text-sm text-gray-500">
            <span className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              Created by ID: {topic.createdBy}
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {topic.createdAt ? format(new Date(topic.createdAt), 'MMM d, yyyy') : 'Unknown date'}
            </span>
            {topic.category && (
              <Badge variant="outline">
                {topic.category}
              </Badge>
            )}
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/forum">
            Back to Forum
          </Link>
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-lg p-6 mb-8 border">
        <div className="prose dark:prose-invert max-w-none">
          {/* This would render markdown with a proper MD renderer */}
          <pre className="whitespace-pre-wrap">{topic.content}</pre>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Replies
          <Badge className="ml-2">{replies?.length || 0}</Badge>
        </h2>

        {replies && replies.length > 0 ? (
          <div className="space-y-4">
            {replies.map((reply) => (
              <Card key={reply.id} className="border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-x-2 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      <span>Created by: {reply.createdBy}</span>
                      <span>•</span>
                      <span>{reply.createdAt ? format(new Date(reply.createdAt), 'MMM d, yyyy') : 'Unknown date'}</span>
                      {reply.isEdited && <span className="text-xs italic">(edited)</span>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">{reply.content}</pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-gray-500">No replies yet. Be the first to reply!</p>
          </div>
        )}
      </div>

      {!topic.isLocked && (
        <div className="bg-white dark:bg-gray-950 rounded-lg p-6 border">
          <h3 className="text-lg font-medium mb-4">Add a Reply</h3>
          <textarea 
            className="w-full p-3 border rounded-md min-h-24 mb-4"
            placeholder="Write your reply here..."
          />
          <Button>Post Reply</Button>
        </div>
      )}
    </div>
  );
}