import {
  User,
  InsertUser,
  BusinessProfile,
  InsertBusinessProfile,
  BrandingInfo,
  InsertBrandingInfo,
  SocialMediaPlan,
  InsertSocialMediaPlan,
  Subscription,
  InsertSubscription,
  Resource,
  InsertResource,
  Constellation,
  InsertConstellation,
  Area,
  InsertArea,
  Vote,
  InsertVote,
  ForumTopic,
  InsertForumTopic,
  ForumReply,
  InsertForumReply,
  ServiceProviderAvailability,
  InsertServiceProviderAvailability,
  ServiceOffering,
  InsertServiceOffering,
  Appointment,
  InsertAppointment,
  LearningPath,
  InsertLearningPath,
  LearningPathStep,
  InsertLearningPathStep,
  UserLearningEnrollment,
  InsertUserLearningEnrollment,
  UserLearningProgress,
  InsertUserLearningProgress
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  getUsersByRegion(region: string): Promise<User[]>;

  // Business profile operations
  getBusinessProfile(id: number): Promise<BusinessProfile | undefined>;
  getBusinessProfileByUserId(userId: number): Promise<BusinessProfile | undefined>;
  createBusinessProfile(profile: InsertBusinessProfile): Promise<BusinessProfile>;
  updateBusinessProfile(id: number, profile: Partial<BusinessProfile>): Promise<BusinessProfile>;

  // Branding operations
  getBrandingInfo(id: number): Promise<BrandingInfo | undefined>;
  getBrandingInfoByBusinessId(businessId: number): Promise<BrandingInfo | undefined>;
  createBrandingInfo(branding: InsertBrandingInfo): Promise<BrandingInfo>;
  updateBrandingInfo(id: number, branding: Partial<BrandingInfo>): Promise<BrandingInfo>;

  // Social media operations
  getSocialMediaPlan(id: number): Promise<SocialMediaPlan | undefined>;
  getSocialMediaPlanByBusinessId(businessId: number): Promise<SocialMediaPlan | undefined>;
  createSocialMediaPlan(plan: InsertSocialMediaPlan): Promise<SocialMediaPlan>;
  updateSocialMediaPlan(id: number, plan: Partial<SocialMediaPlan>): Promise<SocialMediaPlan>;

  // Subscription operations
  getSubscription(id: number): Promise<Subscription | undefined>;
  getSubscriptionByBusinessId(businessId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<Subscription>): Promise<Subscription>;

  // Resource operations
  getResource(id: number): Promise<Resource | undefined>;
  getAllResources(tier?: string): Promise<Resource[]>;
  getResourcesByCategory(category: string, tier?: string): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  
  // Constellation operations
  getConstellation(id: number): Promise<Constellation | undefined>;
  getConstellationByRegion(region: string): Promise<Constellation | undefined>;
  getAllConstellations(): Promise<Constellation[]>;
  createConstellation(constellation: InsertConstellation): Promise<Constellation>;
  updateConstellation(id: number, constellation: Partial<Constellation>): Promise<Constellation>;
  
  // Area operations
  getArea(id: number): Promise<Area | undefined>;
  getAreasByConstellation(constellationId: number): Promise<Area[]>;
  createArea(area: InsertArea): Promise<Area>;
  updateArea(id: number, area: Partial<Area>): Promise<Area>;
  
  // Forum operations
  getForumTopic(id: number): Promise<ForumTopic | undefined>;
  getAllForumTopics(): Promise<ForumTopic[]>;
  createForumTopic(topic: InsertForumTopic): Promise<ForumTopic>;
  getForumRepliesByTopic(topicId: number): Promise<ForumReply[]>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;

  // Appointment Scheduling operations
  // Service Provider Availability
  getProviderAvailability(userId: number): Promise<ServiceProviderAvailability[]>;
  createProviderAvailability(availability: InsertServiceProviderAvailability): Promise<ServiceProviderAvailability>;
  updateProviderAvailability(id: number, availability: Partial<ServiceProviderAvailability>): Promise<ServiceProviderAvailability>;
  deleteProviderAvailability(id: number): Promise<void>;

  // Service Offerings
  getServiceOffering(id: number): Promise<ServiceOffering | undefined>;
  getServiceOfferingsByProvider(providerId: number): Promise<ServiceOffering[]>;
  getServiceOfferingsByCategory(category: string): Promise<ServiceOffering[]>;
  getServiceOfferingsByTier(tier: string): Promise<ServiceOffering[]>;
  createServiceOffering(offering: InsertServiceOffering): Promise<ServiceOffering>;
  updateServiceOffering(id: number, offering: Partial<ServiceOffering>): Promise<ServiceOffering>;
  deleteServiceOffering(id: number): Promise<void>;

  // Appointments
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByClient(clientId: number): Promise<Appointment[]>;
  getAppointmentsByProvider(providerId: number): Promise<Appointment[]>;
  getAppointmentsByService(serviceId: number): Promise<Appointment[]>;
  getUpcomingAppointments(userId: number, isProvider: boolean): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment>;
  cancelAppointment(id: number): Promise<Appointment>;
  
  // Learning Path operations
  getLearningPath(id: number): Promise<LearningPath | undefined>;
  getAllLearningPaths(category?: string): Promise<LearningPath[]>;
  createLearningPath(path: InsertLearningPath): Promise<LearningPath>;
  updateLearningPath(id: number, path: Partial<LearningPath>): Promise<LearningPath>;
  
  // Learning Path Steps operations
  getLearningPathStep(id: number): Promise<LearningPathStep | undefined>;
  getLearningPathSteps(pathId: number): Promise<LearningPathStep[]>;
  createLearningPathStep(step: InsertLearningPathStep): Promise<LearningPathStep>;
  updateLearningPathStep(id: number, step: Partial<LearningPathStep>): Promise<LearningPathStep>;
  deleteLearningPathStep(id: number): Promise<void>;
  
  // User Learning Enrollment operations
  getUserLearningEnrollments(userId: number): Promise<UserLearningEnrollment[]>;
  getUserLearningEnrollment(id: number): Promise<UserLearningEnrollment | undefined>;
  getUserEnrollmentByPathId(userId: number, pathId: number): Promise<UserLearningEnrollment | undefined>;
  createUserLearningEnrollment(enrollment: InsertUserLearningEnrollment): Promise<UserLearningEnrollment>;
  updateUserLearningEnrollment(id: number, enrollment: Partial<UserLearningEnrollment>): Promise<UserLearningEnrollment>;
  
  // User Learning Progress operations
  getUserLearningProgress(userId: number, pathId: number): Promise<UserLearningProgress[]>;
  getUserProgressForStep(userId: number, stepId: number): Promise<UserLearningProgress | undefined>;
  createUserLearningProgress(progress: InsertUserLearningProgress): Promise<UserLearningProgress>;
  updateUserLearningProgress(id: number, progress: Partial<UserLearningProgress>): Promise<UserLearningProgress>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private businessProfiles: Map<number, BusinessProfile>;
  private brandingInfo: Map<number, BrandingInfo>;
  private socialMediaPlans: Map<number, SocialMediaPlan>;
  private subscriptions: Map<number, Subscription>;
  private resources: Map<number, Resource>;
  private constellations: Map<number, Constellation>;
  
  private userId: number;
  private businessProfileId: number;
  private brandingId: number;
  private socialMediaId: number;
  private subscriptionId: number;
  private resourceId: number;
  private constellationId: number;

  // Add maps for new tables
  private areas: Map<number, Area>;
  private votes: Map<number, Vote>;
  private forumTopics: Map<number, ForumTopic>;
  private forumReplies: Map<number, ForumReply>;
  private serviceProviderAvailability: Map<number, ServiceProviderAvailability>;
  private serviceOfferings: Map<number, ServiceOffering>;
  private appointments: Map<number, Appointment>;
  
  private areaId: number;
  private voteId: number;
  private forumTopicId: number;
  private forumReplyId: number;
  private availabilityId: number;
  private serviceOfferingId: number;
  private appointmentId: number;
  
  // Learning paths related IDs
  private learningPathId: number;
  private learningPathStepId: number;
  private userLearningEnrollmentId: number;
  private userLearningProgressId: number;
  
  // Learning paths related maps
  private learningPaths: Map<number, LearningPath>;
  private learningPathSteps: Map<number, LearningPathStep>;
  private userLearningEnrollments: Map<number, UserLearningEnrollment>;
  private userLearningProgress: Map<number, UserLearningProgress>;
  
  constructor() {
    this.users = new Map();
    this.businessProfiles = new Map();
    this.brandingInfo = new Map();
    this.socialMediaPlans = new Map();
    this.subscriptions = new Map();
    this.resources = new Map();
    this.constellations = new Map();
    this.areas = new Map();
    this.votes = new Map();
    this.forumTopics = new Map();
    this.forumReplies = new Map();
    this.serviceProviderAvailability = new Map();
    this.serviceOfferings = new Map();
    this.appointments = new Map();
    
    this.userId = 1;
    this.businessProfileId = 1;
    this.brandingId = 1;
    this.socialMediaId = 1;
    this.subscriptionId = 1;
    this.resourceId = 1;
    this.constellationId = 1;
    this.areaId = 1;
    this.voteId = 1;
    this.forumTopicId = 1;
    this.forumReplyId = 1;
    this.availabilityId = 1;
    this.serviceOfferingId = 1;
    this.appointmentId = 1;
    
    // Add some initial resources
    this.initializeResources();
    
    // Add initial constellation data
    this.initializeConstellations();
    
    // Add 30 developers to each continent constellation
    this.initializeGlobalDevelopers();
    
    // Create the 30 areas for each constellation
    this.initializeAreas();
    
    // Create the forum for guiding stars
    this.initializeGuidingStarForum();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const joinedDateStr = new Date().toISOString().split('T')[0]; // Convert to YYYY-MM-DD string
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now,
      businessType: insertUser.businessType || null,
      starName: insertUser.starName || null,
      region: insertUser.region || null,
      subRegion: insertUser.subRegion || null,
      role: insertUser.role || null,
      starColor: insertUser.starColor || null,
      starPosition: null,
      starSize: null,
      joinedDate: joinedDateStr,
      isGuidingStar: insertUser.isGuidingStar || false,
      isAreaLeader: insertUser.isAreaLeader || false,
      isVoter: insertUser.isVoter || false,
      voterUntil: null,
      invitedBy: insertUser.invitedBy || null,
      approvedBy: null,
      characterEvaluation: insertUser.characterEvaluation || null,
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const existing = await this.getUser(id);
    if (!existing) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updated = { ...existing, ...userData };
    this.users.set(id, updated);
    return updated;
  }
  
  async getUsersByRegion(region: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.region === region
    );
  }

  // Business profile operations
  async getBusinessProfile(id: number): Promise<BusinessProfile | undefined> {
    return this.businessProfiles.get(id);
  }
  
  async getBusinessProfileByUserId(userId: number): Promise<BusinessProfile | undefined> {
    return Array.from(this.businessProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }
  
  async createBusinessProfile(profile: InsertBusinessProfile): Promise<BusinessProfile> {
    const id = this.businessProfileId++;
    const businessProfile: BusinessProfile = { 
      ...profile, 
      id,
      industry: profile.industry || null,
      description: profile.description || null,
      stage: profile.stage || null,
      targetAudience: profile.targetAudience || null,
      location: profile.location || null,
      website: profile.website || null,
      wizardProgress: profile.wizardProgress || null,
      completedSteps: profile.completedSteps || null
    };
    this.businessProfiles.set(id, businessProfile);
    return businessProfile;
  }
  
  async updateBusinessProfile(id: number, profile: Partial<BusinessProfile>): Promise<BusinessProfile> {
    const existing = await this.getBusinessProfile(id);
    if (!existing) {
      throw new Error(`Business profile with id ${id} not found`);
    }
    
    const updated = { ...existing, ...profile };
    this.businessProfiles.set(id, updated);
    return updated;
  }

  // Branding operations
  async getBrandingInfo(id: number): Promise<BrandingInfo | undefined> {
    return this.brandingInfo.get(id);
  }
  
  async getBrandingInfoByBusinessId(businessId: number): Promise<BrandingInfo | undefined> {
    return Array.from(this.brandingInfo.values()).find(
      (branding) => branding.businessId === businessId
    );
  }
  
  async createBrandingInfo(branding: InsertBrandingInfo): Promise<BrandingInfo> {
    const id = this.brandingId++;
    const brandingInfo: BrandingInfo = { 
      ...branding, 
      id,
      logoUrl: branding.logoUrl || null,
      primaryColor: branding.primaryColor || null,
      secondaryColor: branding.secondaryColor || null,
      typography: branding.typography || null,
      brandValues: branding.brandValues || null,
      tagline: branding.tagline || null,
      missionStatement: branding.missionStatement || null
    };
    this.brandingInfo.set(id, brandingInfo);
    return brandingInfo;
  }
  
  async updateBrandingInfo(id: number, branding: Partial<BrandingInfo>): Promise<BrandingInfo> {
    const existing = await this.getBrandingInfo(id);
    if (!existing) {
      throw new Error(`Branding info with id ${id} not found`);
    }
    
    const updated = { ...existing, ...branding };
    this.brandingInfo.set(id, updated);
    return updated;
  }

  // Social media operations
  async getSocialMediaPlan(id: number): Promise<SocialMediaPlan | undefined> {
    return this.socialMediaPlans.get(id);
  }
  
  async getSocialMediaPlanByBusinessId(businessId: number): Promise<SocialMediaPlan | undefined> {
    return Array.from(this.socialMediaPlans.values()).find(
      (plan) => plan.businessId === businessId
    );
  }
  
  async createSocialMediaPlan(plan: InsertSocialMediaPlan): Promise<SocialMediaPlan> {
    const id = this.socialMediaId++;
    const socialMediaPlan: SocialMediaPlan = { 
      ...plan, 
      id,
      targetAudience: plan.targetAudience || null,
      platforms: plan.platforms || null,
      contentThemes: plan.contentThemes || null,
      postFrequency: plan.postFrequency || null,
      goals: plan.goals || null
    };
    this.socialMediaPlans.set(id, socialMediaPlan);
    return socialMediaPlan;
  }
  
  async updateSocialMediaPlan(id: number, plan: Partial<SocialMediaPlan>): Promise<SocialMediaPlan> {
    const existing = await this.getSocialMediaPlan(id);
    if (!existing) {
      throw new Error(`Social media plan with id ${id} not found`);
    }
    
    const updated = { ...existing, ...plan };
    this.socialMediaPlans.set(id, updated);
    return updated;
  }

  // Subscription operations
  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }
  
  async getSubscriptionByBusinessId(businessId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(
      (subscription) => subscription.businessId === businessId
    );
  }
  
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionId++;
    const newSubscription: Subscription = { 
      ...subscription, 
      id,
      endDate: subscription.endDate || null,
      isActive: subscription.isActive !== undefined ? subscription.isActive : true,
      paymentInfo: subscription.paymentInfo || null
    };
    this.subscriptions.set(id, newSubscription);
    return newSubscription;
  }
  
  async updateSubscription(id: number, subscription: Partial<Subscription>): Promise<Subscription> {
    const existing = await this.getSubscription(id);
    if (!existing) {
      throw new Error(`Subscription with id ${id} not found`);
    }
    
    const updated = { ...existing, ...subscription };
    this.subscriptions.set(id, updated);
    return updated;
  }

  // Resource operations
  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }
  
  async getAllResources(tier?: string): Promise<Resource[]> {
    const resources = Array.from(this.resources.values());
    
    if (!tier) {
      return resources.filter(r => r.isPublic);
    }
    
    return resources.filter(r => {
      if (r.isPublic) return true;
      if (!r.requiredTier) return true;
      
      if (tier === 'premium') return true;
      if (tier === 'growth' && r.requiredTier !== 'premium') return true;
      if (tier === 'self-guided' && r.requiredTier === 'self-guided') return true;
      
      return false;
    });
  }
  
  async getResourcesByCategory(category: string, tier?: string): Promise<Resource[]> {
    const allResources = await this.getAllResources(tier);
    return allResources.filter(r => r.category === category);
  }
  
  async createResource(resource: InsertResource): Promise<Resource> {
    const id = this.resourceId++;
    const newResource: Resource = { 
      ...resource, 
      id,
      thumbnail: resource.thumbnail || null,
      isPublic: resource.isPublic !== undefined ? resource.isPublic : true,
      requiredTier: resource.requiredTier || null
    };
    this.resources.set(id, newResource);
    return newResource;
  }
  
  private initializeResources() {
    const resources: InsertResource[] = [
      {
        title: "Business Plan Template",
        description: "A comprehensive template to create your business plan",
        category: "business",
        contentType: "template",
        url: "/resources/business-plan-template",
        thumbnail: "",
        isPublic: true,
        requiredTier: "self-guided"
      },
      {
        title: "Guide to Social Media Marketing",
        description: "Learn how to effectively market your business on social media",
        category: "marketing",
        contentType: "article",
        url: "/resources/social-media-marketing-guide",
        thumbnail: "",
        isPublic: true,
        requiredTier: "self-guided"
      },
      {
        title: "Branding for Small Businesses",
        description: "How to create a compelling brand for your small business",
        category: "branding",
        contentType: "video",
        url: "/resources/small-business-branding",
        thumbnail: "",
        isPublic: true,
        requiredTier: "self-guided"
      },
      {
        title: "Financial Forecast Template",
        description: "Project your business finances with this easy-to-use template",
        category: "business",
        contentType: "template",
        url: "/resources/financial-forecast-template",
        thumbnail: "",
        isPublic: false,
        requiredTier: "growth"
      },
      {
        title: "Content Calendar Template",
        description: "Plan your content marketing strategy with this calendar template",
        category: "marketing",
        contentType: "template",
        url: "/resources/content-calendar-template",
        thumbnail: "",
        isPublic: false,
        requiredTier: "growth"
      },
      {
        title: "Advanced Market Analysis Guide",
        description: "Detailed guide to analyzing your market and competition",
        category: "business",
        contentType: "article",
        url: "/resources/advanced-market-analysis",
        thumbnail: "",
        isPublic: false,
        requiredTier: "premium"
      }
    ];
    
    resources.forEach(resource => {
      const id = this.resourceId++;
      this.resources.set(id, { 
        ...resource, 
        id,
        thumbnail: resource.thumbnail || null,
        isPublic: resource.isPublic !== undefined ? resource.isPublic : true,
        requiredTier: resource.requiredTier || null
      });
    });
  }
  
  // Constellation operations
  async getConstellation(id: number): Promise<Constellation | undefined> {
    return this.constellations.get(id);
  }
  
  async getConstellationByRegion(region: string): Promise<Constellation | undefined> {
    return Array.from(this.constellations.values()).find(
      (constellation) => constellation.region === region
    );
  }
  
  async getAllConstellations(): Promise<Constellation[]> {
    return Array.from(this.constellations.values());
  }
  
  async createConstellation(constellation: InsertConstellation): Promise<Constellation> {
    const id = this.constellationId++;
    const now = new Date();
    const newConstellation: Constellation = { 
      ...constellation, 
      id,
      createdAt: now,
      description: constellation.description || null,
      centerPoint: constellation.centerPoint || null,
      connections: constellation.connections || null,
      backgroundTheme: constellation.backgroundTheme || null,
      totalAreas: constellation.totalAreas || 30,
      activatedAreas: 0
    };
    this.constellations.set(id, newConstellation);
    
    return newConstellation;
  }
  
  async updateConstellation(id: number, constellationData: Partial<Constellation>): Promise<Constellation> {
    const existing = await this.getConstellation(id);
    if (!existing) {
      throw new Error(`Constellation with id ${id} not found`);
    }
    
    const updated = { ...existing, ...constellationData };
    this.constellations.set(id, updated);
    return updated;
  }
  
  private initializeConstellations() {
    // Add seed constellation data for different regions, now organized by continent
    const constellations: InsertConstellation[] = [
      // North America
      {
        region: "North America",
        name: "North American Constellation",
        description: "The founding continent led by Jessica Elizabeth McGlothern, representing all members from North America with a focus on innovation and entrepreneurship.",
        backgroundTheme: "aurora-borealis",
        founderUserId: 1, // Assuming Jessica is user ID 1
        centerPoint: null,
        connections: null
      },
      
      // South America
      {
        region: "South America",
        name: "South American Constellation",
        description: "Representing all members from South America, known for creative solutions and vibrant development approaches.",
        backgroundTheme: "amazon-night",
        founderUserId: 2,
        centerPoint: null,
        connections: null
      },
      
      // Europe
      {
        region: "Europe",
        name: "European Constellation",
        description: "Representing all members from Europe, with emphasis on sustainable development and digital transformation.",
        backgroundTheme: "northern-lights",
        founderUserId: 3,
        centerPoint: null,
        connections: null
      },
      
      // Africa
      {
        region: "Africa",
        name: "African Constellation",
        description: "Representing all members from Africa, pioneering mobile and accessible solutions for emerging markets.",
        backgroundTheme: "savanna-sunset",
        founderUserId: 4,
        centerPoint: null,
        connections: null
      },
      
      // Asia
      {
        region: "Asia",
        name: "Asian Constellation",
        description: "Representing all members from Asia, leading in technological advancement and scalable solutions.",
        backgroundTheme: "himalayan-peaks",
        founderUserId: 5,
        centerPoint: null,
        connections: null
      },
      
      // Australia/Oceania
      {
        region: "Oceania",
        name: "Oceania Constellation",
        description: "Representing all members from Australia and Oceania, known for innovative solutions in remote work and digital nomadism.",
        backgroundTheme: "great-barrier",
        founderUserId: 6,
        centerPoint: null,
        connections: null
      },
      
      // Antarctica (Special Research Constellation)
      {
        region: "Antarctica",
        name: "Antarctic Constellation",
        description: "A special research-focused constellation for members working on climate tech, sustainability, and environmental solutions.",
        backgroundTheme: "polar-ice",
        founderUserId: 7,
        centerPoint: null,
        connections: null
      }
    ];
    
    constellations.forEach(constellation => {
      const id = this.constellationId++;
      const createdAt = new Date();
      this.constellations.set(id, {
        ...constellation,
        id,
        createdAt,
        description: constellation.description || null,
        backgroundTheme: constellation.backgroundTheme || null,
        centerPoint: constellation.centerPoint || null,
        connections: constellation.connections || null,
        totalAreas: 30,
        activatedAreas: 0
      });
    });
  }
  
  private initializeGlobalDevelopers() {
    // Define the continents
    const continents = [
      "North America", 
      "South America", 
      "Europe", 
      "Africa", 
      "Asia", 
      "Oceania", 
      "Antarctica"
    ];
    
    // Define star colors for variety
    const starColors = [
      "#FFD700", // Gold
      "#87CEEB", // Sky Blue
      "#FF6347", // Tomato
      "#20B2AA", // Light Sea Green
      "#9370DB", // Medium Purple
      "#F08080", // Light Coral
      "#3CB371", // Medium Sea Green
      "#00CED1", // Dark Turquoise
      "#FF69B4", // Hot Pink
      "#1E90FF"  // Dodger Blue
    ];
    
    // For each continent, create 30 developers
    continents.forEach(continent => {
      for (let i = 1; i <= 30; i++) {
        // Generate unique usernames and emails based on continent and number
        const abbreviation = continent.split(' ')[0].substring(0, 3).toLowerCase();
        const username = `dev_${abbreviation}_${i}`;
        const email = `${username}@digitalpresence.com`;
        
        // Get user ID before creating
        const userId = this.userId;
        
        // Determine if this is the first user (Guiding Star) for this continent
        const isGuidingStar = i === 1;
        
        // Create the user
        const user: InsertUser = {
          username,
          password: "password123", // Simple default password
          email,
          fullName: `Developer ${i} (${continent})`,
          role: isGuidingStar ? "Guiding Star" : "Full Stack Developer",
          businessType: "Individual",
          region: continent,
          starName: isGuidingStar ? `${continent} Guiding Star` : `${continent} Dev ${i}`,
          starColor: isGuidingStar ? "#FFD700" : starColors[Math.floor(Math.random() * starColors.length)],
          isGuidingStar,
          isAreaLeader: false,
          isVoter: false,
          characterEvaluation: isGuidingStar ? "Founding member and Guiding Star of the continent." : null
        };
        
        // Add the user
        this.createUser(user);
        
        // Create a business profile for each developer
        const businessProfile: InsertBusinessProfile = {
          userId,
          businessName: isGuidingStar ? `${continent} Leadership Council` : `${user.fullName}'s Digital Services`,
          industry: "Software Development",
          stage: "Established",
          description: isGuidingStar ? 
            `Guiding Star of ${continent}, responsible for leading the continental constellation and its 30 areas.` : 
            `Full stack development services specializing in web and mobile applications.`,
          location: continent,
          website: `https://${username}.dev`
        };
        
        this.createBusinessProfile(businessProfile);
      }
    });
    
    // Make Jessica Elizabeth McGlothern the North America Guiding Star
    const jessicaUser = Array.from(this.users.values()).find(
      user => user.username === "dev_nor_1"
    );
    
    if (jessicaUser) {
      this.updateUser(jessicaUser.id, {
        fullName: "Jessica Elizabeth McGlothern",
        username: "thelonestar",
        email: "jessica@digitalpresence.com",
        role: "Guiding Star & Founder",
        starName: "The Lone Star",
        region: "North America",
        starColor: "#FFD700", // Gold
        isGuidingStar: true,
        characterEvaluation: "Founding member of Digital Presence and Guiding Star of North America. The original Lone Star."
      });
    }
  }
  
  // Area operations
  async getArea(id: number): Promise<Area | undefined> {
    return this.areas.get(id);
  }
  
  async getAreasByConstellation(constellationId: number): Promise<Area[]> {
    return Array.from(this.areas.values()).filter(
      area => area.constellationId === constellationId
    );
  }
  
  async createArea(area: InsertArea): Promise<Area> {
    const id = this.areaId++;
    const now = new Date();
    const newArea: Area = {
      ...area,
      id,
      createdAt: now,
      description: area.description || null,
      isActive: area.isActive === true,
      leaderId: area.leaderId || null,
      maxMembers: area.maxMembers || 30,
      currentMembers: 0
    };
    
    this.areas.set(id, newArea);
    
    // Update the constellation's activatedAreas count if this area is active
    if (newArea.isActive && newArea.leaderId) {
      const constellation = await this.getConstellation(newArea.constellationId);
      if (constellation) {
        this.updateConstellation(constellation.id, {
          activatedAreas: (constellation.activatedAreas || 0) + 1
        });
      }
    }
    
    return newArea;
  }
  
  async updateArea(id: number, areaData: Partial<Area>): Promise<Area> {
    const existing = await this.getArea(id);
    if (!existing) {
      throw new Error(`Area with id ${id} not found`);
    }
    
    // Check if we're activating the area
    const activating = !existing.isActive && areaData.isActive;
    
    const updated = { ...existing, ...areaData };
    this.areas.set(id, updated);
    
    // If we're activating the area, update the constellation
    if (activating) {
      const constellation = await this.getConstellation(existing.constellationId);
      if (constellation) {
        this.updateConstellation(constellation.id, {
          activatedAreas: (constellation.activatedAreas || 0) + 1
        });
      }
    }
    
    return updated;
  }
  
  // Forum operations
  async getForumTopic(id: number): Promise<ForumTopic | undefined> {
    return this.forumTopics.get(id);
  }
  
  async getAllForumTopics(): Promise<ForumTopic[]> {
    return Array.from(this.forumTopics.values())
      .sort((a, b) => {
        // Sort pinned topics first, then by last activity
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        // Handle potential null dates safely
        const dateA = a.lastActivityAt ? new Date(a.lastActivityAt) : new Date(0);
        const dateB = b.lastActivityAt ? new Date(b.lastActivityAt) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
  }
  
  async createForumTopic(topic: InsertForumTopic): Promise<ForumTopic> {
    const id = this.forumTopicId++;
    const now = new Date();
    const newTopic: ForumTopic = {
      ...topic,
      id,
      createdAt: now,
      isPinned: topic.isPinned || false,
      isLocked: topic.isLocked || false,
      lastActivityAt: now
    };
    
    this.forumTopics.set(id, newTopic);
    return newTopic;
  }
  
  async getForumRepliesByTopic(topicId: number): Promise<ForumReply[]> {
    return Array.from(this.forumReplies.values())
      .filter(reply => reply.topicId === topicId)
      .sort((a, b) => {
        // Handle potential null dates safely
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateA.getTime() - dateB.getTime();
      });
  }
  
  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    const id = this.forumReplyId++;
    const now = new Date();
    const newReply: ForumReply = {
      ...reply,
      id,
      createdAt: now,
      isEdited: false
    };
    
    this.forumReplies.set(id, newReply);
    
    // Update the last activity timestamp on the topic
    const topic = await this.getForumTopic(reply.topicId);
    if (topic) {
      this.forumTopics.set(topic.id, {
        ...topic,
        lastActivityAt: now
      });
    }
    
    return newReply;
  }
  
  // Appointment Scheduling operations
  // Service Provider Availability
  async getProviderAvailability(userId: number): Promise<ServiceProviderAvailability[]> {
    return Array.from(this.serviceProviderAvailability.values()).filter(
      (availability) => availability.userId === userId
    );
  }
  
  async createProviderAvailability(availability: InsertServiceProviderAvailability): Promise<ServiceProviderAvailability> {
    const id = this.availabilityId++;
    
    const newAvailability: ServiceProviderAvailability = {
      ...availability,
      id,
      isAvailable: availability.isAvailable !== undefined ? availability.isAvailable : true
    };
    
    this.serviceProviderAvailability.set(id, newAvailability);
    return newAvailability;
  }
  
  async updateProviderAvailability(id: number, availability: Partial<ServiceProviderAvailability>): Promise<ServiceProviderAvailability> {
    const existing = this.serviceProviderAvailability.get(id);
    if (!existing) {
      throw new Error(`Availability with id ${id} not found`);
    }
    
    const updated = { ...existing, ...availability };
    this.serviceProviderAvailability.set(id, updated);
    return updated;
  }
  
  async deleteProviderAvailability(id: number): Promise<void> {
    if (!this.serviceProviderAvailability.has(id)) {
      throw new Error(`Availability with id ${id} not found`);
    }
    
    this.serviceProviderAvailability.delete(id);
  }
  
  // Service Offerings
  async getServiceOffering(id: number): Promise<ServiceOffering | undefined> {
    return this.serviceOfferings.get(id);
  }
  
  async getServiceOfferingsByProvider(providerId: number): Promise<ServiceOffering[]> {
    return Array.from(this.serviceOfferings.values()).filter(
      (offering) => offering.providerId === providerId && offering.isActive
    );
  }
  
  async getServiceOfferingsByCategory(category: string): Promise<ServiceOffering[]> {
    return Array.from(this.serviceOfferings.values()).filter(
      (offering) => offering.category === category && offering.isActive
    );
  }
  
  async getServiceOfferingsByTier(tier: string): Promise<ServiceOffering[]> {
    return Array.from(this.serviceOfferings.values()).filter(
      (offering) => {
        if (!offering.isActive) return false;
        if (!offering.requiredTier) return true;
        
        if (tier === 'premium') return true;
        if (tier === 'growth' && offering.requiredTier !== 'premium') return true;
        if (tier === 'self-guided' && offering.requiredTier === 'self-guided') return true;
        
        return false;
      }
    );
  }
  
  async createServiceOffering(offering: InsertServiceOffering): Promise<ServiceOffering> {
    const id = this.serviceOfferingId++;
    const now = new Date();
    
    const newOffering: ServiceOffering = {
      ...offering,
      id,
      price: offering.price || null,
      currency: offering.currency || 'USD',
      requiredTier: offering.requiredTier || null,
      maxBookingsPerDay: offering.maxBookingsPerDay || 5,
      isActive: offering.isActive !== undefined ? offering.isActive : true,
      createdAt: now
    };
    
    this.serviceOfferings.set(id, newOffering);
    return newOffering;
  }
  
  async updateServiceOffering(id: number, offering: Partial<ServiceOffering>): Promise<ServiceOffering> {
    const existing = this.serviceOfferings.get(id);
    if (!existing) {
      throw new Error(`Service offering with id ${id} not found`);
    }
    
    const updated = { ...existing, ...offering };
    this.serviceOfferings.set(id, updated);
    return updated;
  }
  
  async deleteServiceOffering(id: number): Promise<void> {
    if (!this.serviceOfferings.has(id)) {
      throw new Error(`Service offering with id ${id} not found`);
    }
    
    this.serviceOfferings.delete(id);
  }
  
  // Appointments
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
  
  async getAppointmentsByClient(clientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.clientId === clientId
    );
  }
  
  async getAppointmentsByProvider(providerId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.providerId === providerId
    );
  }
  
  async getAppointmentsByService(serviceId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.serviceId === serviceId
    );
  }
  
  async getUpcomingAppointments(userId: number, isProvider: boolean): Promise<Appointment[]> {
    const now = new Date();
    return Array.from(this.appointments.values()).filter(
      (appointment) => {
        const isUserInvolved = isProvider ? 
          appointment.providerId === userId : 
          appointment.clientId === userId;
        
        const isUpcoming = new Date(appointment.startTime) > now;
        const isActive = appointment.status === 'scheduled' || appointment.status === 'confirmed';
        
        return isUserInvolved && isUpcoming && isActive;
      }
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }
  
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentId++;
    const now = new Date();
    
    const newAppointment: Appointment = {
      ...appointment,
      id,
      notes: appointment.notes || null,
      meetingLink: appointment.meetingLink || null,
      createdAt: now,
      updatedAt: now,
      reminderSent: false,
      feedbackProvided: false
    };
    
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }
  
  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment> {
    const existing = this.appointments.get(id);
    if (!existing) {
      throw new Error(`Appointment with id ${id} not found`);
    }
    
    const updated = { 
      ...existing, 
      ...appointment,
      updatedAt: new Date()
    };
    
    this.appointments.set(id, updated);
    return updated;
  }
  
  async cancelAppointment(id: number): Promise<Appointment> {
    const existing = this.appointments.get(id);
    if (!existing) {
      throw new Error(`Appointment with id ${id} not found`);
    }
    
    const updated = { 
      ...existing, 
      status: 'cancelled',
      updatedAt: new Date()
    };
    
    this.appointments.set(id, updated);
    return updated;
  }
  
  // Initialize 30 areas for each constellation
  private initializeAreas() {
    const constellations = Array.from(this.constellations.values());
    
    constellations.forEach(constellation => {
      // Create 30 areas for this constellation
      for (let i = 1; i <= 30; i++) {
        const areaName = `${constellation.region} - Area ${i}`;
        const areaDescription = `Area ${i} of the ${constellation.region} constellation. This area can include up to 30 members.`;
        
        this.createArea({
          name: areaName,
          constellationId: constellation.id,
          description: areaDescription,
          leaderId: null, // No leader assigned initially
          isActive: false, // Areas start inactive
          maxMembers: 30 // Default to 30 members max
        });
      }
    });
  }
  
  // Initialize the forum for Guiding Stars
  private initializeGuidingStarForum() {
    const welcomeTopic = this.createForumTopic({
      title: "Welcome to the Guiding Stars Forum",
      createdBy: 1, // Jessica (assuming she's ID 1)
      content: `
# Welcome to the Guiding Stars Forum

This is a private forum for the seven Guiding Stars of our continental constellations to discuss our vision, structure, and future plans.

As Guiding Stars, we each have the responsibility to:
1. Divide our continent into 30 areas
2. Select area leaders who will steward their respective areas
3. Collaborate on global initiatives and character evaluations for new Guiding Stars
4. Be the light the darkness lost the battle to

Please introduce yourself and share your vision for your continental constellation.

Best regards,
Jessica Elizabeth McGlothern
The Lone Star, North America
      `,
      category: "Announcements",
      isPinned: true,
      isLocked: false
    });
    
    const structureTopic = this.createForumTopic({
      title: "Continental Structure and Governance",
      createdBy: 1, // Jessica (assuming she's ID 1)
      content: `
# Continental Structure and Governance

This topic is for discussing how we should structure our continental governance.

Each of us has 30 areas to manage within our continent, and we need to establish:

1. How area leaders are selected (currently by the Guiding Star)
2. How the 3 rotating voters for each area are chosen
3. The process for onboarding the 30 founders per area
4. Standardized character evaluation criteria
5. Voting procedures for unanimous decisions

Please share your thoughts and best practices from your continental experience.
      `,
      category: "Structure",
      isPinned: true,
      isLocked: false
    });
    
    const futureTopic = this.createForumTopic({
      title: "Vision for the Future of Digital Presence",
      createdBy: 1, // Jessica (assuming she's ID 1)
      content: `
# Vision for the Future of Digital Presence

As the founding Guiding Stars, we have a responsibility to shape the future of Digital Presence.

Let's discuss:
1. How we can ensure transparency in our operations
2. Ideas for blockchain-based governance and voting
3. Plans for scaling beyond our initial structure
4. Maintaining our mission of being "the light that darkness lost the battle to"

What are your visions for our platform's future?
      `,
      category: "Ideas",
      isPinned: false,
      isLocked: false
    });
  }
}

export const storage = new MemStorage();
