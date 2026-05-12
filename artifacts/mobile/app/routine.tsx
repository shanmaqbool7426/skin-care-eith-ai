import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useScan } from "@/context/ScanContext";
import { useColors } from "@/hooks/useColors";
import { generateRoutine, type RoutineStep } from "@/utils/routineGenerator";

function StepCard({ step, isLast }: { step: RoutineStep; isLast: boolean }) {
  const colors = useColors();
  return (
    <View style={styles.stepWrapper}>
      <View style={styles.stepLeft}>
        <View style={[styles.stepIconWrap, { backgroundColor: step.color + "22", borderColor: step.color + "40" }]}>
          <Feather name={step.icon as any} size={18} color={step.color} />
        </View>
        {!isLast && <View style={[styles.stepLine, { backgroundColor: colors.border }]} />}
      </View>
      <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.border }, isLast && { marginBottom: 0 }]}>
        <View style={styles.stepHeader}>
          <View style={[styles.stepNum, { backgroundColor: step.color + "22" }]}>
            <Text style={[styles.stepNumText, { color: step.color }]}>Step {step.step}</Text>
          </View>
          <Text style={[styles.stepCategory, { color: colors.mutedForeground }]}>{step.category}</Text>
        </View>
        <Text style={[styles.stepProduct, { color: colors.foreground }]}>{step.product}</Text>
        <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>{step.description}</Text>
        <View style={[styles.whyRow, { borderTopColor: colors.border }]}>
          <Feather name="info" size={12} color={step.color} />
          <Text style={[styles.whyText, { color: step.color }]}>{step.why}</Text>
        </View>
      </View>
    </View>
  );
}

function SectionHeader({
  icon,
  label,
  subtitle,
  gradientColors,
}: {
  icon: string;
  label: string;
  subtitle: string;
  gradientColors: string[];
}) {
  return (
    <LinearGradient
      colors={gradientColors as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.sectionHeader}
    >
      <View style={[styles.sectionIconWrap, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
        <Feather name={icon as any} size={18} color="#fff" />
      </View>
      <View>
        <Text style={styles.sectionLabel}>{label}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    </LinearGradient>
  );
}

export default function RoutineScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { scanHistory } = useScan();

  const routine = useMemo(() => {
    const allConditions = scanHistory.flatMap((s) => s.conditions.map((c) => c.name));
    const unique = [...new Set(allConditions)];
    return generateRoutine(unique);
  }, [scanHistory]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const hasScans = scanHistory.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 40 }]}
      >
        <View style={[styles.topBar]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface }]}>
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { color: colors.foreground }]}>My Routine</Text>
          <View style={{ width: 38 }} />
        </View>

        <LinearGradient
          colors={["#6C5CE720", "#00CEC920"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroCard, { borderColor: colors.border }]}
        >
          <View style={styles.heroTop}>
            <View style={[styles.scoreCircle, { borderColor: colors.primary }]}>
              <Text style={[styles.scoreNum, { color: colors.primary }]}>{routine.score}</Text>
              <Text style={[styles.scorePct, { color: colors.mutedForeground }]}>match</Text>
            </View>
            <View style={styles.heroText}>
              <Text style={[styles.heroTitle, { color: colors.foreground }]}>
                {hasScans ? "Personalized for You" : "Starter Routine"}
              </Text>
              <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
                {hasScans
                  ? `Based on ${scanHistory.length} scan${scanHistory.length > 1 ? "s" : ""} · ${routine.targetConditions.length} condition${routine.targetConditions.length !== 1 ? "s" : ""} targeted`
                  : "Scan your skin to unlock a personalized routine"}
              </Text>
            </View>
          </View>
          {routine.targetConditions.length > 0 && (
            <View style={styles.conditionChips}>
              {routine.targetConditions.map((c) => (
                <View key={c} style={[styles.conditionChip, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "35" }]}>
                  <Text style={[styles.conditionChipText, { color: colors.accent }]}>{c}</Text>
                </View>
              ))}
            </View>
          )}
        </LinearGradient>

        <View style={styles.section}>
          <SectionHeader
            icon="sun"
            label="Morning Routine"
            subtitle={`${routine.morning.length} steps · 5–10 min`}
            gradientColors={["#6C5CE7", "#8B7FF8"]}
          />
          {routine.morning.map((step, i) => (
            <StepCard key={step.id} step={step} isLast={i === routine.morning.length - 1} />
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader
            icon="moon"
            label="Evening Routine"
            subtitle={`${routine.evening.length} steps · 10–15 min`}
            gradientColors={["#2D3561", "#4834D4"]}
          />
          {routine.evening.map((step, i) => (
            <StepCard key={step.id} step={step} isLast={i === routine.evening.length - 1} />
          ))}
        </View>

        {routine.weekly.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              icon="calendar"
              label="Weekly Extras"
              subtitle="Once or twice a week"
              gradientColors={["#00CEC9", "#009688"]}
            />
            {routine.weekly.map((step, i) => (
              <StepCard key={step.id} step={step} isLast={i === routine.weekly.length - 1} />
            ))}
          </View>
        )}

        {!hasScans && (
          <TouchableOpacity
            style={[styles.scanCta, { backgroundColor: colors.primary }]}
            onPress={() => router.replace("/(tabs)/")}
            activeOpacity={0.85}
          >
            <Feather name="camera" size={18} color="#fff" />
            <Text style={styles.scanCtaText}>Scan Your Skin to Personalize</Text>
          </TouchableOpacity>
        )}

        <View style={[styles.disclaimer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="info" size={14} color={colors.mutedForeground} />
          <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
            This routine is AI-generated based on your scan data. Always do a patch test before trying new products and consult a dermatologist for medical concerns.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  screenTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17 },
  heroCard: { borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 28, gap: 14 },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 16 },
  scoreCircle: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  scoreNum: { fontFamily: "Inter_700Bold", fontSize: 22 },
  scorePct: { fontFamily: "Inter_400Regular", fontSize: 10, marginTop: -2 },
  heroText: { flex: 1, gap: 4 },
  heroTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  heroSubtitle: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  conditionChips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  conditionChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
  conditionChipText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, marginBottom: 14 },
  sectionIconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  sectionLabel: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
  sectionSubtitle: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 1 },
  stepWrapper: { flexDirection: "row", gap: 14, marginBottom: 14 },
  stepLeft: { alignItems: "center", width: 42 },
  stepIconWrap: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  stepLine: { flex: 1, width: 2, marginTop: 4, marginBottom: -14, borderRadius: 1 },
  stepCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 14, gap: 6 },
  stepHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  stepNum: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  stepNumText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  stepCategory: { fontFamily: "Inter_500Medium", fontSize: 12 },
  stepProduct: { fontFamily: "Inter_700Bold", fontSize: 15 },
  stepDesc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  whyRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, paddingTop: 8, borderTopWidth: 1, marginTop: 4 },
  whyText: { fontFamily: "Inter_500Medium", fontSize: 12, flex: 1, lineHeight: 16 },
  scanCta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 15, borderRadius: 14, marginBottom: 20 },
  scanCtaText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#fff" },
  disclaimer: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 4, alignItems: "flex-start" },
  disclaimerText: { fontFamily: "Inter_400Regular", fontSize: 12, flex: 1, lineHeight: 17 },
});
