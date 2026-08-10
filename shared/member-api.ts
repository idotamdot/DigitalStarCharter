import type { MemberConstraints, MemberPreferences, MemberSkills, MemberStatus } from "./identity-schema";

export interface MemberApi {
  id: number;
  authSubject: string;
  email: string;
  displayName: string;
  status: MemberStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MemberProfileApi {
  memberId: number;
  skills: MemberSkills;
  preferences: MemberPreferences;
  constraints: MemberConstraints;
  learningGoals: string[];
  availabilityNotes: string | null;
  roleFitNotes: string | null;
  updatedAt: string;
}
