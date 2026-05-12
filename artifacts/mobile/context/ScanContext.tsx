import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type RiskLevel = "low" | "medium" | "high";

export interface SkinCondition {
  name: string;
  risk: RiskLevel;
  severity: string;
  description: string;
  icon: string;
}

export interface ScanResult {
  id: string;
  date: string;
  imageUri: string;
  conditions: SkinCondition[];
  overallRisk: RiskLevel;
  recommendations: string[];
  confidence: number;
  bodyArea: string;
}

interface ScanContextType {
  scanHistory: ScanResult[];
  pendingResult: ScanResult | null;
  setPendingResult: (result: ScanResult | null) => void;
  addScan: (result: ScanResult) => Promise<void>;
  deleteScan: (id: string) => Promise<void>;
  isLoading: boolean;
}

const ScanContext = createContext<ScanContextType | null>(null);

const STORAGE_KEY = "@skinscan_history";

const conditionLibrary: SkinCondition[] = [
  { name: "Acne", risk: "low", severity: "Mild", description: "Mild inflammation in hair follicles. Common and manageable with gentle care.", icon: "circle" },
  { name: "Acne", risk: "medium", severity: "Moderate", description: "Multiple inflamed lesions detected. Consider a targeted treatment routine.", icon: "circle" },
  { name: "Dark Spots", risk: "low", severity: "Mild", description: "Post-inflammatory hyperpigmentation. Daily SPF use can prevent worsening.", icon: "square" },
  { name: "Redness", risk: "low", severity: "Mild", description: "Mild erythema detected. May indicate sensitivity or early rosacea.", icon: "circle" },
  { name: "Enlarged Pores", risk: "low", severity: "Visible", description: "Common, especially in the T-zone. Regular exfoliation helps minimize appearance.", icon: "circle" },
  { name: "Mole", risk: "medium", severity: "Monitor", description: "Pigmented lesion detected. Monitor for ABCDE changes monthly.", icon: "circle" },
  { name: "Dryness", risk: "low", severity: "Mild", description: "Skin barrier disruption signs. Increase moisturizing and hydration.", icon: "circle" },
  { name: "Pimple", risk: "low", severity: "Minor", description: "Single or small cluster of pimples. Spot treatment recommended.", icon: "circle" },
  { name: "Rash", risk: "medium", severity: "Moderate", description: "Skin irritation pattern detected. Avoid potential allergens and harsh products.", icon: "circle" },
  { name: "Sun Damage", risk: "medium", severity: "Moderate", description: "UV damage markers present. Apply SPF 30+ daily and seek shade.", icon: "circle" },
];

function generateScanResult(imageUri: string): ScanResult {
  const count = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...conditionLibrary].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  const risks = selected.map((c) => c.risk);
  const overallRisk: RiskLevel = risks.includes("high")
    ? "high"
    : risks.includes("medium")
    ? "medium"
    : "low";

  const allRecommendations = [
    "Apply SPF 30+ sunscreen every morning",
    "Use a gentle, fragrance-free cleanser twice daily",
    "Keep skin hydrated with a non-comedogenic moisturizer",
    "Avoid touching your face to prevent bacteria transfer",
    "Stay hydrated — drink at least 8 glasses of water daily",
    "Get 7-9 hours of sleep to support skin repair",
    "Eat antioxidant-rich foods like berries and leafy greens",
    "Change pillowcases weekly to reduce bacteria buildup",
    "Use a humidifier in dry environments",
    "Consult a dermatologist for persistent concerns",
  ];
  const shuffledRecs = [...allRecommendations].sort(() => Math.random() - 0.5);
  const recommendations = shuffledRecs.slice(0, 4);

  const areas = ["Face", "Forehead", "Cheek", "Chin", "Neck", "Arm", "Hand"];
  const bodyArea = areas[Math.floor(Math.random() * areas.length)];

  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString(),
    imageUri,
    conditions: selected,
    overallRisk,
    recommendations,
    confidence: Math.floor(Math.random() * 8) + 90,
    bodyArea,
  };
}

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [pendingResult, setPendingResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setScanHistory(JSON.parse(stored));
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const addScan = useCallback(async (result: ScanResult) => {
    const updated = [result, ...scanHistory];
    setScanHistory(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }, [scanHistory]);

  const deleteScan = useCallback(async (id: string) => {
    const updated = scanHistory.filter((s) => s.id !== id);
    setScanHistory(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }, [scanHistory]);

  return (
    <ScanContext.Provider value={{ scanHistory, pendingResult, setPendingResult, addScan, deleteScan, isLoading }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error("useScan must be used within ScanProvider");
  return ctx;
}

export { generateScanResult };
