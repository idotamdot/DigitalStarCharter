// Centralized governance definitions and types for Digital Presence

export interface GovernanceRole {
  id: string;
  title: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  level: 'member' | 'area-leader' | 'guiding-star' | 'council-member';
  votingRights: boolean;
  termLength?: string; // For rotating positions
}

export interface GovernanceLevel {
  id: string;
  name: string;
  description: string;
  scope: 'global' | 'continental' | 'area' | 'local';
  decisionMakers: string[];
  votingMechanism: 'unanimous' | 'majority' | 'qualified-majority';
  quorum?: number;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  type: 'information' | 'evaluation' | 'decision' | 'approval';
  requiredFor: string[]; // Role IDs that require this step
  estimatedTime: string;
  order: number;
}

// Governance Roles
export const GOVERNANCE_ROLES: GovernanceRole[] = [
  {
    id: 'member',
    title: 'Constellation Member',
    description: 'Standard member of the Digital Presence constellation',
    responsibilities: [
      'Complete assigned weekly tasks',
      'Participate in area activities',
      'Maintain professional standards',
      'Contribute to constellation goals'
    ],
    requirements: [
      'Completed onboarding process',
      'Character evaluation approved',
      'Technical competency demonstrated'
    ],
    level: 'member',
    votingRights: false
  },
  {
    id: 'area-voter',
    title: 'Area Voter',
    description: 'Rotating voting representative for area decisions',
    responsibilities: [
      'Represent area members in continental votes',
      'Participate in quarterly voting sessions',
      'Communicate decisions back to area members',
      'Evaluate new member applications'
    ],
    requirements: [
      'Active member for at least 6 months',
      'Good standing with no recent violations',
      'Nominated by area leader or peers'
    ],
    level: 'member',
    votingRights: true,
    termLength: '3 months'
  },
  {
    id: 'area-leader',
    title: 'Area Leader',
    description: 'Leader of a specific area within a continental constellation',
    responsibilities: [
      'Manage area member onboarding',
      'Select rotating voters for the area',
      'Coordinate with Guiding Star',
      'Resolve member conflicts',
      'Conduct character evaluations'
    ],
    requirements: [
      'Active member for at least 1 year',
      'Demonstrated leadership capability',
      'Approved by Guiding Star',
      'Completed leadership training'
    ],
    level: 'area-leader',
    votingRights: true
  },
  {
    id: 'guiding-star',
    title: 'Guiding Star',
    description: 'Continental founder and leader',
    responsibilities: [
      'Lead continental constellation',
      'Appoint area leaders',
      'Participate in global governance forums',
      'Ensure continental standards',
      'Final approval for new members'
    ],
    requirements: [
      'Founder of continental constellation',
      'Demonstrated exceptional leadership',
      'Approved by existing Guiding Stars',
      'Completed advanced governance training'
    ],
    level: 'guiding-star',
    votingRights: true
  },
  {
    id: 'council-member',
    title: 'North Star Council Member',
    description: 'Global governance council member',
    responsibilities: [
      'Participate in global platform decisions',
      'Shape platform policies and direction',
      'Represent technical discipline on council',
      'Mentor other council members'
    ],
    requirements: [
      'Among first 30 qualifying members',
      'Technical excellence demonstrated',
      'Community leadership shown',
      'Unanimous approval from existing council'
    ],
    level: 'council-member',
    votingRights: true
  }
];

// Governance Levels
export const GOVERNANCE_LEVELS: GovernanceLevel[] = [
  {
    id: 'global',
    name: 'Global Platform Governance',
    description: 'Platform-wide decisions affecting all constellations',
    scope: 'global',
    decisionMakers: ['North Star Council'],
    votingMechanism: 'unanimous',
    quorum: 15
  },
  {
    id: 'continental',
    name: 'Continental Constellation Governance',
    description: 'Continental-level decisions affecting all areas within a constellation',
    scope: 'continental',
    decisionMakers: ['Guiding Star', 'Area Leaders', 'Rotating Voters'],
    votingMechanism: 'unanimous',
    quorum: 5
  },
  {
    id: 'area',
    name: 'Area Governance',
    description: 'Area-level decisions affecting members within an area',
    scope: 'area',
    decisionMakers: ['Area Leader', 'Rotating Voters'],
    votingMechanism: 'majority',
    quorum: 2
  }
];

// Onboarding Steps
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'application',
    title: 'Submit Application',
    description: 'Complete application form with role, experience, and skills',
    type: 'information',
    requiredFor: ['all'],
    estimatedTime: '15 minutes',
    order: 1
  },
  {
    id: 'governance-overview',
    title: 'Governance Overview',
    description: 'Learn about Digital Presence governance structure and your role',
    type: 'information',
    requiredFor: ['all'],
    estimatedTime: '30 minutes',
    order: 2
  },
  {
    id: 'technical-assessment',
    title: 'Technical Assessment',
    description: 'Complete technical skills evaluation for your chosen role',
    type: 'evaluation',
    requiredFor: ['all'],
    estimatedTime: '2 hours',
    order: 3
  },
  {
    id: 'character-evaluation',
    title: 'Character Evaluation',
    description: 'Interview with area leader and peer evaluation',
    type: 'evaluation',
    requiredFor: ['all'],
    estimatedTime: '1 hour',
    order: 4
  },
  {
    id: 'area-assignment',
    title: 'Area Assignment',
    description: 'Assignment to continental area based on location and capacity',
    type: 'decision',
    requiredFor: ['all'],
    estimatedTime: '5 minutes',
    order: 5
  },
  {
    id: 'member-approval',
    title: 'Member Approval',
    description: 'Final approval by area voters and guiding star',
    type: 'approval',
    requiredFor: ['all'],
    estimatedTime: '1-3 days',
    order: 6
  },
  {
    id: 'orientation',
    title: 'Member Orientation',
    description: 'Introduction to platform, tools, and first task assignment',
    type: 'information',
    requiredFor: ['all'],
    estimatedTime: '2 hours',
    order: 7
  }
];

// Helper functions
export function getRoleById(roleId: string): GovernanceRole | undefined {
  return GOVERNANCE_ROLES.find(role => role.id === roleId);
}

export function getStepsForRole(roleId: string): OnboardingStep[] {
  return ONBOARDING_STEPS.filter(step => 
    step.requiredFor.includes('all') || step.requiredFor.includes(roleId)
  ).sort((a, b) => a.order - b.order);
}

export function getGovernanceLevelByScope(scope: string): GovernanceLevel | undefined {
  return GOVERNANCE_LEVELS.find(level => level.scope === scope);
}

export function canUserVote(userRole: string): boolean {
  const role = getRoleById(userRole);
  return role?.votingRights || false;
}

export function getRequiredApprovers(governanceLevel: string): string[] {
  const level = GOVERNANCE_LEVELS.find(l => l.id === governanceLevel);
  return level?.decisionMakers || [];
}