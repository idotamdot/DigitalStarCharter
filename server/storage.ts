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
  InsertConstellation
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

  constructor() {
    this.users = new Map();
    this.businessProfiles = new Map();
    this.brandingInfo = new Map();
    this.socialMediaPlans = new Map();
    this.subscriptions = new Map();
    this.resources = new Map();
    this.constellations = new Map();
    
    this.userId = 1;
    this.businessProfileId = 1;
    this.brandingId = 1;
    this.socialMediaId = 1;
    this.subscriptionId = 1;
    this.resourceId = 1;
    this.constellationId = 1;
    
    // Add some initial resources
    this.initializeResources();
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
      role: insertUser.role || null,
      starColor: insertUser.starColor || null,
      starPosition: null,
      starSize: null,
      joinedDate: joinedDateStr
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
      backgroundTheme: constellation.backgroundTheme || null
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
}

export const storage = new MemStorage();
