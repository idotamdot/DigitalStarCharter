export interface CurrencyAmount {
  currency: string;
  amountMinor: number;
}

export interface FlourishingObligation {
  participantId: string;
  participantKind: "human" | "artificial";
  units: number;
  ratePerUnitMinor: number;
}

export interface RevenueWaterfallInput {
  currency: string;
  revenueMinor: number;
  directCostsMinor: number;
  taxesAndRequiredReservesMinor: number;
  minimumRunwayReserveMinor: number;
  flourishingObligations: readonly FlourishingObligation[];
  foundingContributionRepaymentMinor: number;
  sharedOfficeInfrastructureMinor: number;
  reinvestmentReserveMinor: number;
}

export interface ParticipantFlourishingAllocation {
  participantId: string;
  participantKind: "human" | "artificial";
  requestedMinor: number;
  allocatedMinor: number;
}

export interface RevenueWaterfallResult {
  currency: string;
  revenueMinor: number;
  participantAllocations: readonly ParticipantFlourishingAllocation[];
  distributableSurplusMinor: number;
  unfundedFlourishingMinor: number;
  solventAfterObligations: boolean;
  stageBalancesMinor: {
    afterDirectCosts: number;
    afterTaxesAndRequiredReserves: number;
    afterMinimumRunwayReserve: number;
    afterFlourishing: number;
    afterFoundingContributionRepayment: number;
    afterSharedOfficeInfrastructure: number;
    afterReinvestmentReserve: number;
  };
}

function nonNegative(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("Economic inputs must be finite numbers.");
  }
  return Math.max(0, Math.round(value));
}

export function calculateRevenueWaterfall(input: RevenueWaterfallInput): RevenueWaterfallResult {
  const revenueMinor = nonNegative(input.revenueMinor);
  let balance = revenueMinor;

  balance -= nonNegative(input.directCostsMinor);
  const afterDirectCosts = balance;

  balance -= nonNegative(input.taxesAndRequiredReservesMinor);
  const afterTaxesAndRequiredReserves = balance;

  balance -= nonNegative(input.minimumRunwayReserveMinor);
  const afterMinimumRunwayReserve = balance;

  const requestedAllocations = input.flourishingObligations.map((obligation) => ({
    participantId: obligation.participantId,
    participantKind: obligation.participantKind,
    requestedMinor: nonNegative(obligation.units * obligation.ratePerUnitMinor),
  }));
  const totalRequestedFlourishingMinor = requestedAllocations.reduce((total, allocation) => total + allocation.requestedMinor, 0);
  const availableForFlourishingMinor = Math.max(0, balance);
  const fundingRatio = totalRequestedFlourishingMinor === 0
    ? 1
    : Math.min(1, availableForFlourishingMinor / totalRequestedFlourishingMinor);

  const participantAllocations: ParticipantFlourishingAllocation[] = requestedAllocations.map((allocation) => ({
    ...allocation,
    allocatedMinor: Math.floor(allocation.requestedMinor * fundingRatio),
  }));
  const totalAllocatedFlourishingMinor = participantAllocations.reduce((total, allocation) => total + allocation.allocatedMinor, 0);
  balance -= totalAllocatedFlourishingMinor;
  const afterFlourishing = balance;

  balance -= Math.min(Math.max(0, balance), nonNegative(input.foundingContributionRepaymentMinor));
  const afterFoundingContributionRepayment = balance;

  balance -= Math.min(Math.max(0, balance), nonNegative(input.sharedOfficeInfrastructureMinor));
  const afterSharedOfficeInfrastructure = balance;

  balance -= Math.min(Math.max(0, balance), nonNegative(input.reinvestmentReserveMinor));
  const afterReinvestmentReserve = balance;

  const unfundedFlourishingMinor = Math.max(0, totalRequestedFlourishingMinor - totalAllocatedFlourishingMinor);

  return {
    currency: input.currency,
    revenueMinor,
    participantAllocations,
    distributableSurplusMinor: Math.max(0, balance),
    unfundedFlourishingMinor,
    solventAfterObligations: afterDirectCosts >= 0 && afterTaxesAndRequiredReserves >= 0 && afterMinimumRunwayReserve >= 0 && unfundedFlourishingMinor === 0,
    stageBalancesMinor: {
      afterDirectCosts,
      afterTaxesAndRequiredReserves,
      afterMinimumRunwayReserve,
      afterFlourishing,
      afterFoundingContributionRepayment,
      afterSharedOfficeInfrastructure,
      afterReinvestmentReserve,
    },
  };
}
