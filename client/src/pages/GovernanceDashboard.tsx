import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Crown,
  Vote,
  MapPin,
  Star,
  Calendar,
  FileText,
  Settings,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  InfoIcon,
} from "lucide-react";
import { User } from "@shared/schema";
import {
  GOVERNANCE_ROLES,
  GOVERNANCE_LEVELS,
  getRoleById,
  canUserVote,
} from "@shared/governance";

interface GovernanceDashboardProps {
  user?: User;
}

export default function GovernanceDashboard({ user }: GovernanceDashboardProps) {
  const { data: areas = [] } = useQuery({
    queryKey: ["/api/areas"],
    enabled: !!user,
  });

  const { data: forumTopics = [] } = useQuery({
    queryKey: ["/api/forum/topics"],
    enabled: !!user?.isGuidingStar,
  });

  const { data: activeVotes = [] } = useQuery({
    queryKey: ["/api/votes/active"],
    enabled: !!user && canUserVote(user.role || "member"),
  });

  const userRole = getRoleById(user?.role || "member");
  const userLevel = user?.isGuidingStar
    ? "guiding-star"
    : user?.isAreaLeader
    ? "area-leader"
    : user?.isVoter
    ? "area-voter"
    : "member";

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Governance Dashboard</h1>
          <p className="text-gray-600 mb-6">
            Please log in to access the governance dashboard.
          </p>
          <Button asChild>
            <Link href="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Governance Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Welcome, {user.fullName} - {userRole?.title}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={user.isGuidingStar ? "default" : "secondary"}>
                {user.isGuidingStar && <Crown className="w-3 h-3 mr-1" />}
                {userRole?.title}
              </Badge>
              {canUserVote(user.role || "member") && (
                <Badge variant="outline">
                  <Vote className="w-3 h-3 mr-1" />
                  Voting Rights
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Region</p>
                    <p className="font-semibold">{user.region || "Unassigned"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Area</p>
                    <p className="font-semibold">{user.subRegion || "Unassigned"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Star Rating</p>
                    <p className="font-semibold">{user.starSize || "New"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Joined</p>
                    <p className="font-semibold">
                      {new Date(user.joinedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
            {canUserVote(user.role || "member") && (
              <TabsTrigger value="voting">Voting</TabsTrigger>
            )}
            {user.isGuidingStar && (
              <TabsTrigger value="forum">Forum</TabsTrigger>
            )}
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Your Role & Responsibilities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Your Role & Responsibilities
                  </CardTitle>
                  <CardDescription>
                    Current governance role and associated duties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Current Role</h4>
                      <p className="text-gray-600">{userRole?.description}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Key Responsibilities</h4>
                      <ul className="space-y-1">
                        {userRole?.responsibilities.map((responsibility, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">
                              {responsibility}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {userRole?.termLength && (
                      <div>
                        <h4 className="font-semibold mb-2">Term Information</h4>
                        <p className="text-sm text-gray-600">
                          Term Length: {userRole.termLength}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Governance Participation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Governance Participation
                  </CardTitle>
                  <CardDescription>
                    Your involvement in governance activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {canUserVote(user.role || "member") && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Active Votes</span>
                          <span className="text-sm text-gray-600">
                            {activeVotes.length} pending
                          </span>
                        </div>
                        <Progress value={activeVotes.length > 0 ? 75 : 100} />
                        {activeVotes.length > 0 && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href="#voting">Review Votes</Link>
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {user.isAreaLeader && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Area Management</span>
                          <span className="text-sm text-gray-600">
                            {areas.length} areas
                          </span>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href="/areas">Manage Areas</Link>
                        </Button>
                      </div>
                    )}

                    {user.isGuidingStar && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Forum Topics</span>
                          <span className="text-sm text-gray-600">
                            {forumTopics.length} topics
                          </span>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href="/forum">Visit Forum</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Recent Governance Activity
                </CardTitle>
                <CardDescription>
                  Latest updates and activities in your governance scope
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <InfoIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Welcome to Governance</p>
                      <p className="text-xs text-gray-600">
                        Explore the different tabs to learn about your role and responsibilities
                      </p>
                    </div>
                  </div>
                  {activeVotes.length > 0 && (
                    <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Pending Votes</p>
                        <p className="text-xs text-gray-600">
                          You have {activeVotes.length} vote(s) requiring your attention
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Governance Roles</CardTitle>
                <CardDescription>
                  Understand the different roles within Digital Presence governance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {GOVERNANCE_ROLES.map((role) => (
                    <Card
                      key={role.id}
                      className={`${
                        role.id === (user.role || "member")
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                          {role.title}
                          {role.id === (user.role || "member") && (
                            <Badge variant="default">Your Role</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{role.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-semibold text-sm mb-1">
                              Requirements:
                            </h5>
                            <ul className="text-xs space-y-1">
                              {role.requirements.map((req, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2"></span>
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span
                              className={`px-2 py-1 rounded ${
                                role.votingRights
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {role.votingRights ? "Has Voting Rights" : "No Voting Rights"}
                            </span>
                            {role.termLength && (
                              <span className="text-gray-500">
                                Term: {role.termLength}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Structure Tab */}
          <TabsContent value="structure" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Governance Structure</CardTitle>
                <CardDescription>
                  Understanding Digital Presence governance levels and decision-making
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {GOVERNANCE_LEVELS.map((level, index) => (
                    <div key={level.id} className="relative">
                      {index > 0 && (
                        <div className="absolute -top-3 left-6 w-0.5 h-6 bg-gray-300"></div>
                      )}
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{level.name}</h3>
                          <p className="text-gray-600 mb-3">{level.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Scope:</span>
                              <span className="ml-2 capitalize">{level.scope}</span>
                            </div>
                            <div>
                              <span className="font-medium">Voting:</span>
                              <span className="ml-2 capitalize">
                                {level.votingMechanism.replace("-", " ")}
                              </span>
                            </div>
                            {level.quorum && (
                              <div>
                                <span className="font-medium">Quorum:</span>
                                <span className="ml-2">{level.quorum} members</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-2">
                            <span className="font-medium text-sm">Decision Makers:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {level.decisionMakers.map((maker, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {maker}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voting Tab */}
          {canUserVote(user.role || "member") && (
            <TabsContent value="voting" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Vote className="w-5 h-5 mr-2" />
                    Active Votes
                  </CardTitle>
                  <CardDescription>
                    Participate in governance decisions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeVotes.length === 0 ? (
                    <div className="text-center py-8">
                      <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No active votes at this time</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeVotes.map((vote: any) => (
                        <Card key={vote.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">{vote.title}</h4>
                              <Badge variant="outline">{vote.status}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {vote.description}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                Expires: {new Date(vote.expiresAt).toLocaleDateString()}
                              </span>
                              <Button size="sm">Cast Vote</Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Forum Tab */}
          {user.isGuidingStar && (
            <TabsContent value="forum" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Guiding Star Forum
                    </span>
                    <Button asChild>
                      <Link href="/forum">Visit Full Forum</Link>
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Collaborate with other Guiding Stars on governance matters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {forumTopics.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No forum topics available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {forumTopics.slice(0, 5).map((topic: any) => (
                        <div
                          key={topic.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <h5 className="font-medium">{topic.title}</h5>
                            <p className="text-xs text-gray-500">
                              {topic.category} • {new Date(topic.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/forum/${topic.id}`}>View</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Guidelines Tab */}
          <TabsContent value="guidelines" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Governance Guidelines
                </CardTitle>
                <CardDescription>
                  Essential guidelines for effective governance participation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <h3>Core Principles</h3>
                  <ul>
                    <li>
                      <strong>Transparency:</strong> All governance decisions are made
                      openly with full member visibility
                    </li>
                    <li>
                      <strong>Consensus:</strong> We strive for unanimous agreement on
                      major platform decisions
                    </li>
                    <li>
                      <strong>Merit-Based Leadership:</strong> Leadership positions are
                      earned through demonstrated competence and character
                    </li>
                    <li>
                      <strong>Equal Representation:</strong> Every member has a voice
                      through the area voting system
                    </li>
                  </ul>

                  <h3>Voting Guidelines</h3>
                  <ul>
                    <li>Votes should be cast thoughtfully after reviewing all information</li>
                    <li>Abstentions should include a reason for transparency</li>
                    <li>Unanimous decisions require discussion until consensus is reached</li>
                    <li>Voting deadlines are enforced to maintain platform momentum</li>
                  </ul>

                  <h3>Character Evaluation</h3>
                  <ul>
                    <li>Technical competence in chosen role</li>
                    <li>Collaborative attitude and communication skills</li>
                    <li>Reliability in completing commitments</li>
                    <li>Alignment with Digital Presence values</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}