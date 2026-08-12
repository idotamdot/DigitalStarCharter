import type {
  RepresentationDimension,
  RepresentationPerspective,
} from "./venture-domain";

export const universalRepresentationPrinciples = [
  "Every person affected by a decision is within the scope of representation, even when no named persona already describes them.",
  "Named personas are examples and testing lenses, never exhaustive categories of humanity.",
  "Representation must consider intersections between material life conditions rather than evaluating dimensions only in isolation.",
  "A decision may not pass representation review while a materially affected population remains unrepresented.",
  "When lived experience is material to a consequential decision, AI simulation does not substitute for consultation with people who hold that lived experience.",
  "People are represented as whole persons with capabilities, goals, agency, relationships, and constraints; no person is reduced to a disability, income level, nationality, diagnosis, or demographic label.",
  "Accessibility is a baseline design requirement rather than a special accommodation added after exclusion occurs.",
  "Economic feasibility may not depend on excluding people because serving them is less profitable or more operationally difficult.",
  "Automation impact reviews must explicitly represent workers whose tasks, occupations, income, or bargaining power may be displaced.",
  "Future generations, local communities, and environmental impacts receive representation when present decisions create durable externalities.",
] as const;

export const representationInnovationPrinciples = [
  "Representation findings must feed opportunity discovery, not only risk review.",
  "Pain points shared across multiple perspectives should be treated as candidates for common infrastructure or shared services.",
  "Pain points unique to an underserved perspective should be examined for neglected-market and public-benefit opportunities rather than dismissed as edge cases.",
  "Intersectional pain points may reveal needs invisible when demographic or accessibility dimensions are evaluated separately.",
  "AI may generate solution hypotheses, but people with relevant lived experience must be able to challenge assumptions and reshape the proposed solution.",
  "A strategy is stronger when it improves access for constrained users without degrading dignity, quality, autonomy, or affordability for others.",
  "The system should prefer solutions that remove structural barriers over solutions that merely teach excluded people to navigate those barriers.",
  "Innovation should seek ways for people affected by automation to participate in the new value created by the resulting product, service, or enterprise.",
] as const;

export interface PainPointSignal {
  id: string;
  perspectiveIds: readonly string[];
  dimensions: readonly RepresentationDimension[];
  description: string;
  severity: "low" | "moderate" | "high" | "critical";
  frequencyEstimate: "unknown" | "rare" | "occasional" | "common" | "widespread";
  evidenceIds: readonly string[];
  currentWorkarounds: readonly string[];
  structuralCauses: readonly string[];
}

export interface InnovationOpportunitySignal {
  id: string;
  painPointSignalIds: readonly string[];
  title: string;
  opportunityHypothesis: string;
  affectedPerspectiveIds: readonly string[];
  beneficiaryDescription: string;
  possiblePayerDescription: string | null;
  humanCapabilitiesNeeded: readonly string[];
  aiCapabilitiesUseful: readonly string[];
  accessibilityRequirements: readonly string[];
  likelyConstraints: readonly string[];
  requiresLivedExperienceCoDesign: boolean;
  requiresFeasibilityResearch: true;
}

export const baselineRepresentationPerspectives: readonly RepresentationPerspective[] = [
  {
    id: "vision-access",
    label: "Blind and low-vision perspective",
    dimensions: ["vision", "digital_access_and_device_constraints"],
    context: ["People who are blind, have low vision, or cannot reliably use visual interfaces"],
    needs: ["Equivalent access to information", "Independent task completion", "Accessible employment and ownership systems"],
    risks: ["Screen-reader exclusion", "Visual-only controls", "Inaccessible documents, charts, authentication, or payments"],
    accommodations: ["Semantic structure", "Keyboard operation", "Text alternatives", "Nonvisual equivalents for charts and status"],
    mustBeConsultedWhen: ["A product, workplace, document, payment flow, or communication system depends materially on vision"],
  },
  {
    id: "hearing-access",
    label: "Deaf and hard-of-hearing perspective",
    dimensions: ["hearing", "language_and_communication"],
    context: ["People who are Deaf, deafened, or hard of hearing"],
    needs: ["Equivalent communication access", "Accessible meetings and training", "Non-audio safety communication"],
    risks: ["Voice-only service", "Uncaptioned media", "Audio-only alerts", "Communication prejudice"],
    accommodations: ["Captions", "Transcripts", "Text-first channels", "Visual or haptic alert equivalents"],
    mustBeConsultedWhen: ["Voice, audio, meetings, training, alerts, or customer support are material to participation"],
  },
  {
    id: "mobility-access",
    label: "Mobility disability perspective",
    dimensions: ["physical_disability", "transportation_and_mobility_access"],
    context: ["People with permanent, episodic, or temporary mobility limitations"],
    needs: ["Accessible participation", "Flexible work arrangements", "Accessible physical environments when attendance is necessary"],
    risks: ["Physical exclusion", "Precision-input barriers", "Unnecessary onsite requirements", "Accessible transportation costs"],
    accommodations: ["Assistive-input support", "Remote participation", "Accessible venues", "Avoid unnecessary timed or precision interactions"],
    mustBeConsultedWhen: ["Physical presence, transportation, equipment, workspace, or motor interaction is required"],
  },
  {
    id: "neurocognitive-access",
    label: "Neurodivergent and cognitive-access perspective",
    dimensions: ["neurodivergence", "cognitive_and_learning_disability", "mental_health"],
    context: ["People whose cognition, attention, learning, sensory processing, communication, or executive function differs from dominant expectations"],
    needs: ["Clear expectations", "Multiple ways to learn and communicate", "Predictable workflows", "Evaluation based on capability and outcomes"],
    risks: ["Hidden expectations", "Sensory overload", "Social-performance bias", "Dense or confusing consequential information"],
    accommodations: ["Plain language", "Stepwise workflows", "Asynchronous options", "Reduced sensory load", "Saved progress"],
    mustBeConsultedWhen: ["Hiring, training, assessment, workflow design, communication, or consequential consent is involved"],
  },
  {
    id: "severe-resource-constraint",
    label: "Severe poverty and infrastructure-constraint perspective",
    dimensions: [
      "income_wealth_and_economic_security",
      "country_and_regional_development_context",
      "infrastructure_reliability",
      "digital_access_and_device_constraints",
      "banking_credit_and_financial_access",
    ],
    context: ["People living with very low or irregular income and unreliable access to electricity, connectivity, devices, transportation, banking, or formal services"],
    needs: ["Low-cost access", "Low-bandwidth operation", "Resumable workflows", "Local economic ownership", "Alternatives to assumptions of conventional banking and broadband"],
    risks: ["Exclusion by subscription cost", "Data expense", "Broadband assumptions", "Bank-account requirements", "Imported-technology dependency"],
    accommodations: ["Low-bandwidth mobile design", "Offline or resumable workflows where feasible", "Transparent local-currency costs", "Minimal data consumption", "Alternative payment rails where lawful and safe"],
    mustBeConsultedWhen: ["A product or business is intended for global use or claims broad economic accessibility"],
  },
  {
    id: "literacy-and-language",
    label: "Limited-literacy and non-dominant-language perspective",
    dimensions: ["education_and_literacy", "language_and_communication"],
    context: ["People with limited formal literacy, people working outside their primary language, and people who communicate differently from institutional norms"],
    needs: ["Understandable choices", "Meaningful consent", "Language access", "Freedom from literacy-based or accent-based competence assumptions"],
    risks: ["Confusing contracts", "Machine-translation errors", "Academic gatekeeping", "Dependence on intermediaries for routine tasks"],
    accommodations: ["Plain language", "Multilingual support", "Audio or visual explanation", "Human review of consequential uncertain translations"],
    mustBeConsultedWhen: ["Contracts, pricing, safety, employment, financial decisions, onboarding, or public services are involved"],
  },
  {
    id: "automation-displaced-worker",
    label: "Worker displaced or threatened by automation",
    dimensions: ["employment_and_automation_exposure", "income_wealth_and_economic_security", "profession_trade_and_lived_expertise"],
    context: ["Workers whose tasks, occupations, wages, hours, or bargaining power are being reduced by automation"],
    needs: ["Pathways into the value created by automation", "Recognition of transferable expertise", "Human-AI peer work", "Income continuity and dignity"],
    risks: ["Job loss", "Deskilling", "Wage compression", "Loss of professional identity", "Automation gains accruing only to owners of capital"],
    accommodations: ["Capability-based role redesign", "Human authority over consequential judgments", "Transparent AI delegation", "Preferential pathways into new human-AI roles"],
    mustBeConsultedWhen: ["Automation changes staffing, workflow, compensation, job design, or bargaining power"],
  },
] as const;
