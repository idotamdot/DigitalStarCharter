# Digital Star Charter — Final Product Architecture

## Product thesis

Digital Star Charter is an AI-assisted venture formation and operating system. It identifies meaningful needs, tests whether a venture can satisfy them sustainably, designs the business and team, applies a Goodness Gate, launches a white-label operating environment, and supports the venture through a managed enterprise lease.

The platform is not primarily a business-plan generator, generic SaaS dashboard, marketplace, social network, or voting system.

The authoritative lifecycle is:

`Need -> Evidence -> Opportunity -> Feasibility -> Charter -> Goodness -> Team -> Lease -> Launch -> Operations -> Outcomes -> Learning`

Every durable feature must support at least one stage of this lifecycle.

## Non-negotiable design principles

1. **Human dignity before extraction.** The system may recommend against building or monetizing an idea.
2. **Evidence before confidence.** Feasibility conclusions must distinguish sourced facts, assumptions, estimates, and AI hypotheses.
3. **Human authority for consequential decisions.** AI may analyze, rank, simulate, recommend, and explain. Humans approve hiring, termination, legal commitments, material capital commitments, and other consequential actions.
4. **No hostage business model.** A venture retains its own brand, customer relationships, records, and exportable data.
5. **Explicit typing.** TypeScript domain types are explicit. No `any` in application code.
6. **No fake operations.** Demo fixtures are visually and technically separated from live operational data.
7. **One authoritative schema.** Legacy compatibility is temporary and removable because there are no production users to preserve.
8. **Goodness is an operating control, not a slogan.** Material changes must pass the Goodness Gate before production execution.

## Persona Council

The Persona Council is a permanent representation layer used during discovery, feasibility, pricing, accessibility, policy, product design, and Goodness review.

A persona is not a fake account. It is a structured perspective containing context, constraints, goals, vulnerabilities, capabilities, and likely impact from a proposed action.

The seed council should include perspectives represented in the existing world-population persona work: caregivers, students, elders, entrepreneurs, workers, underserved global citizens, young people, remote workers, displaced people, underemployed workers, technical innovators, rural/small-town residents, urban commuters, creators, and environmental advocates.

Persona findings are advisory evidence. They do not pretend to replace real-world user research.

## Discovery

Users may begin with:

- a problem they experience;
- a community need;
- a business idea;
- a capability they possess;
- an asset that is underused;
- a target outcome such as creating local employment;
- a request for the AI to identify promising opportunities within stated constraints.

The output is an `Opportunity`, not automatically a business.

## Evidence model

Every feasibility-relevant claim records:

- claim text;
- evidence type;
- source/reference when available;
- observation date;
- confidence;
- whether it is fact, estimate, assumption, testimony, or AI hypothesis;
- who/what supplied it;
- contradictions or unresolved uncertainty.

This allows the system to explain *why* it reached a recommendation.

## Feasibility Engine

The Feasibility Engine evaluates at minimum:

- demand and urgency;
- customer/user ability and willingness to pay;
- existing alternatives;
- differentiation;
- startup cost;
- ongoing operating cost;
- staffing difficulty;
- technology requirements;
- compliance/regulatory burden;
- capital requirements;
- expected utilization;
- gross margin and contribution margin;
- break-even conditions;
- cash runway;
- downside scenarios;
- implementation complexity;
- environmental and community effects;
- Persona Council impacts;
- Goodness constraints.

Allowed recommendations:

- `viable`
- `viable_with_changes`
- `experimental`
- `not_presently_viable`
- `fails_goodness_gate`

The engine must never be forced to produce a build plan for an idea it judges materially infeasible or harmful.

## Charter

A Charter is the approved operating constitution for a venture. It records:

- problem and beneficiaries;
- value proposition;
- product/service definition;
- ownership assumptions;
- governance and approval boundaries;
- revenue model;
- pricing principles;
- cost model;
- launch constraints;
- target outcomes;
- unacceptable harms;
- Goodness commitments;
- human decision authorities;
- AI delegation boundaries;
- exit/portability commitments.

A Charter is versioned. Material amendments require review rather than silently mutating history.

## Goodness Gate

The Goodness Gate evaluates a proposed subject such as a venture, charter amendment, product, pricing change, operational policy, or material automation.

Core criteria:

1. Does it solve a real problem or create legitimate value?
2. Is it truthful about capabilities, limitations, costs, and evidence?
3. Does it respect human dignity and agency?
4. Does it avoid coercive, deceptive, predatory, or dependency-producing design?
5. Are benefits and burdens reasonably distributed?
6. Is pricing understandable and proportionate to value and ability to pay?
7. Can affected people leave without unreasonable lock-in?
8. Does it protect privacy and security proportionately?
9. Does it avoid preventable environmental or community harm?
10. Are important vulnerable-persona impacts addressed?
11. Are consequential decisions assigned to appropriate human authority?
12. Would we be comfortable explaining the decision publicly to the people affected by it?

Gate outcomes:

- `pass`
- `pass_with_conditions`
- `revise`
- `block`

A blocked material subject cannot move into production execution.

## Role Architecture and human assembly

AI first designs the work, then the roles.

Each role specifies:

- mission;
- required outcomes;
- capabilities;
- credentials/certifications where legally or operationally necessary;
- working arrangement;
- expected hours;
- compensation range/model;
- location constraints;
- decision authority;
- tasks delegable to AI;
- tasks requiring human judgment;
- escalation responsibilities.

Candidate matching may rank and explain fit, but the platform does not autonomously make final employment decisions.

## AI workforce

AI roles are explicit operational identities, not invisible magic. Each AI role has:

- mission;
- allowed capabilities/tools;
- prohibited actions;
- spending/data boundaries;
- confidence/escalation thresholds;
- required human approver(s);
- audit trail;
- quality metrics.

AI should automate routine work while preserving meaningful human authority.

## White-glove Managed Enterprise Lease

The primary commercial product is a managed, white-label operating environment.

A venture may receive:

- custom brand system;
- domain and branded application/site;
- customer/client portal;
- payments and billing workflows;
- CRM/customer records;
- scheduling/workflows appropriate to the venture;
- communications;
- analytics and finance cockpit;
- SOPs and training;
- AI workforce;
- human escalation workflows;
- security and maintenance;
- ongoing optimization.

The venture experiences this as its own company infrastructure. Digital Star Charter remains the underlying operating platform.

### Portability

On termination, subject to lawful retention requirements and settled obligations, the venture must be able to export its business records, customer records, financial records, documents, brand assets, and other venture-owned data in a reasonable machine-readable format.

## Monetization

### 1. Charter / Launch Fee

One-time charge for research depth, feasibility work, business configuration, brand design, implementation, migration/configuration, training, and launch.

### 2. Managed Enterprise Lease

Recurring charge for platform access, hosting, standard AI capabilities, maintenance, security, backups, and baseline support.

Pricing should scale primarily with real operational load and service level rather than arbitrary feature withholding.

### 3. White-glove Operations

Optional recurring managed service covering deeper operational support such as analytics review, workflow optimization, marketing operations, bookkeeping workflows, AI supervision, and customer-operations support.

### 4. Usage and specialist costs

High-cost model usage, payment processing, regulated professionals, specialized contractors, unusual infrastructure, and other third-party costs are explicit and auditable.

### 5. Capped success pricing

For ventures that cannot responsibly afford a standard launch/lease, Digital Star Charter may offer a temporary revenue-based arrangement only when:

- the percentage is clear;
- the repayment/cap is clear;
- the arrangement terminates automatically at the cap/end condition;
- no perpetual revenue claim exists;
- the model passes Goodness review.

## Product surfaces

### Discover
Capture a need, idea, capability, asset, community condition, or target outcome.

### Design
Evidence collection, opportunity definition, feasibility simulation, alternative business models, and recommended strategy.

### Charter
Final venture model, economics, governance, Goodness review, human approval, and version history.

### Assemble
Role architecture, AI workforce plan, candidate matching, onboarding, and responsibilities.

### Launch
Brand, domain, application configuration, payments, workflows, training, deployment, and launch checklist.

### Operate
Business cockpit for revenue, costs, cash, customers, workforce, delivery, quality, risk, impact, AI activity, and recommendations.

### Observatory
Digital Star Charter operator view across ventures: health, risk, Goodness exceptions, quality failures, lease health, support needs, AI escalations, and outcomes.

## Canonical domain model

The next authoritative schema is organized around:

- `actors`
- `personas`
- `needs`
- `evidence_items`
- `opportunities`
- `feasibility_assessments`
- `feasibility_findings`
- `charters`
- `charter_versions`
- `goodness_reviews`
- `venture_roles`
- `candidate_matches`
- `ai_roles`
- `ventures`
- `venture_brands`
- `enterprise_leases`
- `lease_pricing_components`
- `operational_metrics`
- `venture_events`
- `outcomes`
- `learning_findings`

Legacy feature tables should be removed or migrated only when they support this model.

## Initial implementation sequence

1. Establish explicit domain types and the new schema.
2. Replace legacy authentication identity assumptions with actor/organization membership boundaries.
3. Implement Persona Council seed data and impact-review API.
4. Implement opportunity + evidence + feasibility lifecycle.
5. Integrate Goodness Gate into stage transitions.
6. Implement Charter versioning and human approval.
7. Implement Role Architecture and candidate matching boundaries.
8. Implement venture + brand + managed enterprise lease model.
9. Rebuild the front end around Discover / Design / Charter / Assemble / Launch / Operate.
10. Build Observatory from real operational data only.
11. Delete obsolete schema, routes, and UI after the new lifecycle owns their responsibilities.

This document is the product and architecture north star unless superseded by a later explicit architectural decision.