export interface RoutineStep {
  id: string;
  step: number;
  category: string;
  product: string;
  description: string;
  why: string;
  icon: string;
  color: string;
  targetConditions: string[];
}

export interface PersonalizedRoutine {
  morning: RoutineStep[];
  evening: RoutineStep[];
  weekly: RoutineStep[];
  targetConditions: string[];
  score: number;
}

const STEP_LIBRARY: Record<string, Omit<RoutineStep, "step">> = {
  gentle_cleanser: {
    id: "gentle_cleanser",
    category: "Cleanser",
    product: "Gentle Hydrating Cleanser",
    description: "A low-pH, fragrance-free cleanser that removes impurities without stripping the skin.",
    why: "Maintains your skin barrier while cleaning effectively.",
    icon: "droplet",
    color: "#00CEC9",
    targetConditions: ["Redness", "Dryness", "Rash", "general"],
  },
  salicylic_cleanser: {
    id: "salicylic_cleanser",
    category: "Cleanser",
    product: "Salicylic Acid Cleanser (2%)",
    description: "BHA cleanser that unclogs pores and reduces acne-causing bacteria.",
    why: "Targets acne, pimples, and enlarged pores with each wash.",
    icon: "droplet",
    color: "#A29BFE",
    targetConditions: ["Acne", "Pimple", "Enlarged Pores"],
  },
  vitamin_c_serum: {
    id: "vitamin_c_serum",
    category: "Vitamin C Serum",
    product: "Vitamin C Brightening Serum (10-20%)",
    description: "A stable ascorbic acid formula that brightens, protects, and evens skin tone.",
    why: "Fades dark spots and protects against future UV damage.",
    icon: "sun",
    color: "#FDCB6E",
    targetConditions: ["Dark Spots", "Sun Damage"],
  },
  niacinamide_serum: {
    id: "niacinamide_serum",
    category: "Niacinamide Serum",
    product: "Niacinamide Serum (10%) + Zinc",
    description: "Regulates sebum, minimizes pores, and reduces inflammation.",
    why: "Directly targets acne, oiliness, and enlarged pores.",
    icon: "activity",
    color: "#6C5CE7",
    targetConditions: ["Acne", "Pimple", "Enlarged Pores"],
  },
  hyaluronic_acid: {
    id: "hyaluronic_acid",
    category: "Hydrating Serum",
    product: "Hyaluronic Acid Serum (Multi-Weight)",
    description: "Attracts and holds moisture at multiple skin depths for lasting plumpness.",
    why: "Repairs skin barrier and relieves dryness at the source.",
    icon: "wind",
    color: "#00CEC9",
    targetConditions: ["Dryness", "Redness", "general"],
  },
  azelaic_acid: {
    id: "azelaic_acid",
    category: "Treatment Serum",
    product: "Azelaic Acid Serum (10%)",
    description: "Reduces redness, kills acne bacteria, and evens skin tone gently.",
    why: "Ideal for sensitive, redness-prone skin with active breakouts.",
    icon: "shield",
    color: "#FF9F0A",
    targetConditions: ["Redness", "Rash", "Acne"],
  },
  spf_lightweight: {
    id: "spf_lightweight",
    category: "Sunscreen",
    product: "Lightweight SPF 50+ (Mineral or Hybrid)",
    description: "Broad-spectrum sun protection that is non-comedogenic and skin-tone adaptable.",
    why: "Essential daily step — prevents darkening of spots and protects moles.",
    icon: "sun",
    color: "#FDCB6E",
    targetConditions: ["Dark Spots", "Mole", "Sun Damage", "general"],
  },
  moisturizer_lightweight: {
    id: "moisturizer_lightweight",
    category: "Moisturizer",
    product: "Oil-Free Gel Moisturizer",
    description: "Lightweight hydration that doesn't block pores — perfect for acne-prone skin.",
    why: "Keeps skin balanced without triggering breakouts.",
    icon: "droplet",
    color: "#00CEC9",
    targetConditions: ["Acne", "Pimple", "Enlarged Pores"],
  },
  moisturizer_rich: {
    id: "moisturizer_rich",
    category: "Moisturizer",
    product: "Rich Barrier-Repair Moisturizer",
    description: "Contains ceramides, fatty acids, and cholesterol to rebuild the lipid barrier.",
    why: "Directly repairs dryness and soothes redness and rashes.",
    icon: "heart",
    color: "#FF6B9D",
    targetConditions: ["Dryness", "Redness", "Rash"],
  },
  retinol: {
    id: "retinol",
    category: "Retinol Treatment",
    product: "Retinol Serum (0.025–0.1% to start)",
    description: "Speeds cell turnover, fades hyperpigmentation, and smooths skin texture.",
    why: "Long-term solution for dark spots, sun damage, and fine lines.",
    icon: "trending-up",
    color: "#A29BFE",
    targetConditions: ["Dark Spots", "Sun Damage", "general"],
  },
  spot_treatment: {
    id: "spot_treatment",
    category: "Spot Treatment",
    product: "Benzoyl Peroxide Spot Treatment (2.5%)",
    description: "Kills acne bacteria on contact and reduces swelling of active pimples.",
    why: "Fast, targeted action on active breakouts only.",
    icon: "target",
    color: "#FF4757",
    targetConditions: ["Acne", "Pimple"],
  },
  calming_mask: {
    id: "calming_mask",
    category: "Weekly Mask",
    product: "Centella Asiatica Calming Mask",
    description: "Reduces inflammation, soothes redness, and promotes skin healing.",
    why: "Weekly reset for sensitive, red, or irritated skin.",
    icon: "layers",
    color: "#55EFC4",
    targetConditions: ["Redness", "Rash"],
  },
  clay_mask: {
    id: "clay_mask",
    category: "Weekly Mask",
    product: "Kaolin Clay Deep-Pore Mask",
    description: "Absorbs excess oil and physically clears pores with minimal irritation.",
    why: "Weekly decongestion for acne and large pores.",
    icon: "layers",
    color: "#FDCB6E",
    targetConditions: ["Acne", "Pimple", "Enlarged Pores"],
  },
  aha_exfoliant: {
    id: "aha_exfoliant",
    category: "Weekly Exfoliant",
    product: "AHA Glycolic Acid Exfoliant (5-7%)",
    description: "Chemical exfoliant that resurfaces dull skin and breaks down pigment clusters.",
    why: "Accelerates fading of dark spots and sun damage.",
    icon: "zap",
    color: "#A29BFE",
    targetConditions: ["Dark Spots", "Sun Damage"],
  },
  derma_check: {
    id: "derma_check",
    category: "Monthly Check",
    product: "Dermatologist ABCDE Mole Check",
    description: "Professional evaluation of pigmented lesions for asymmetry, border, color, diameter, and evolution.",
    why: "Detected mole requires regular professional monitoring.",
    icon: "user-check",
    color: "#FF9F0A",
    targetConditions: ["Mole"],
  },
};

const MORNING_PRIORITY: string[] = [
  "gentle_cleanser",
  "salicylic_cleanser",
  "vitamin_c_serum",
  "niacinamide_serum",
  "azelaic_acid",
  "hyaluronic_acid",
  "moisturizer_lightweight",
  "moisturizer_rich",
  "spf_lightweight",
];

const EVENING_PRIORITY: string[] = [
  "gentle_cleanser",
  "salicylic_cleanser",
  "spot_treatment",
  "azelaic_acid",
  "retinol",
  "hyaluronic_acid",
  "niacinamide_serum",
  "moisturizer_rich",
  "moisturizer_lightweight",
];

const WEEKLY_PRIORITY: string[] = [
  "clay_mask",
  "calming_mask",
  "aha_exfoliant",
  "derma_check",
];

function stepScore(step: Omit<RoutineStep, "step">, conditions: string[]): number {
  if (conditions.length === 0) return step.targetConditions.includes("general") ? 1 : 0;
  const matches = step.targetConditions.filter((c) =>
    conditions.includes(c) || c === "general"
  ).length;
  return matches;
}

export function generateRoutine(conditionNames: string[]): PersonalizedRoutine {
  const isBlank = conditionNames.length === 0;

  const pickSteps = (priority: string[], maxSteps: number): RoutineStep[] => {
    const scored = priority
      .map((id) => STEP_LIBRARY[id])
      .filter(Boolean)
      .map((step) => ({ step, score: stepScore(step, conditionNames) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);

    const seen = new Set<string>();
    const picks: RoutineStep[] = [];

    for (const { step } of scored) {
      if (picks.length >= maxSteps) break;
      if (seen.has(step.category)) continue;
      seen.add(step.category);
      picks.push({ ...step, step: picks.length + 1 });
    }

    if (picks.length === 0) {
      const defaults = ["gentle_cleanser", "hyaluronic_acid", "moisturizer_rich", "spf_lightweight"];
      const defSteps = defaults
        .filter((id) => priority.includes(id))
        .map((id) => STEP_LIBRARY[id])
        .filter(Boolean)
        .slice(0, maxSteps)
        .map((step, i) => ({ ...step, step: i + 1 }));
      return defSteps;
    }

    return picks;
  };

  const morning = pickSteps(MORNING_PRIORITY, 5);
  const evening = pickSteps(EVENING_PRIORITY, 5);
  const weekly = pickSteps(WEEKLY_PRIORITY, 3);

  const score = isBlank ? 70 : Math.min(98, 75 + conditionNames.length * 6);

  return { morning, evening, weekly, targetConditions: conditionNames, score };
}
