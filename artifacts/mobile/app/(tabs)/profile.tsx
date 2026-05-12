import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useScan } from "@/context/ScanContext";
import { useColors } from "@/hooks/useColors";

function StatBox({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { scanHistory } = useScan();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const totalScans = scanHistory.length;
  const lowCount = scanHistory.filter((s) => s.overallRisk === "low").length;
  const medCount = scanHistory.filter((s) => s.overallRisk === "medium").length;
  const highCount = scanHistory.filter((s) => s.overallRisk === "high").length;

  const allConditions = scanHistory.flatMap((s) => s.conditions.map((c) => c.name));
  const conditionFreq: Record<string, number> = {};
  allConditions.forEach((c) => { conditionFreq[c] = (conditionFreq[c] || 0) + 1; });
  const topConditions = Object.entries(conditionFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const avgConfidence = scanHistory.length > 0
    ? Math.round(scanHistory.reduce((sum, s) => sum + s.confidence, 0) / scanHistory.length)
    : 0;

  const routineTips = [
    { time: "Morning", steps: ["Gentle cleanser", "Vitamin C serum", "Moisturizer", "SPF 30+"] },
    { time: "Evening", steps: ["Double cleanse", "Retinol / treatment", "Night moisturizer"] },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={[styles.avatarCircle, { backgroundColor: colors.primary + "20" }]}>
          <Feather name="user" size={36} color={colors.primary} />
        </View>
        <Text style={[styles.name, { color: colors.text }]}>My Skin Profile</Text>
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
          {totalScans > 0 ? `${totalScans} scans tracked` : "Start scanning to build your profile"}
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Scan Overview</Text>
      <View style={styles.statsGrid}>
        <StatBox label="Total Scans" value={totalScans} color={colors.primary} />
        <StatBox label="Low Risk" value={lowCount} color={colors.lowRisk} />
        <StatBox label="Moderate" value={medCount} color={colors.mediumRisk} />
        <StatBox label="High Risk" value={highCount} color={colors.highRisk} />
      </View>

      {totalScans > 0 && (
        <>
          <View style={[styles.confidenceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View>
              <Text style={[styles.confidenceLabel, { color: colors.mutedForeground }]}>Avg. AI Confidence</Text>
              <Text style={[styles.confidenceValue, { color: colors.text }]}>{avgConfidence}%</Text>
            </View>
            <View style={[styles.confidenceBadge, { backgroundColor: colors.primary + "18" }]}>
              <Feather name="award" size={22} color={colors.primary} />
            </View>
          </View>

          {topConditions.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Most Detected Conditions</Text>
              <View style={[styles.conditionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {topConditions.map(([name, count], i) => (
                  <View key={name} style={[styles.conditionRow, i < topConditions.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                    <Text style={[styles.conditionName, { color: colors.text }]}>{name}</Text>
                    <View style={styles.conditionRight}>
                      <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
                        <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${Math.min(100, (count / totalScans) * 100)}%` as any }]} />
                      </View>
                      <Text style={[styles.conditionCount, { color: colors.mutedForeground }]}>{count}x</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </>
      )}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Routine</Text>
      {routineTips.map((routine) => (
        <View key={routine.time} style={[styles.routineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.routineHeader}>
            <Feather name={routine.time === "Morning" ? "sun" : "moon"} size={18} color={colors.primary} />
            <Text style={[styles.routineTime, { color: colors.text }]}>{routine.time} Routine</Text>
          </View>
          {routine.steps.map((step, i) => (
            <View key={i} style={styles.routineStep}>
              <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.stepText, { color: colors.mutedForeground }]}>{step}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { alignItems: "center", marginBottom: 28, gap: 8 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  name: { fontFamily: "Inter_700Bold", fontSize: 24 },
  tagline: { fontFamily: "Inter_400Regular", fontSize: 14 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17, marginBottom: 12, marginTop: 8 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  statBox: { width: "47%", padding: 16, borderRadius: 16, borderWidth: 1, gap: 4 },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 28 },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 13 },
  confidenceCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 18, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  confidenceLabel: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 2 },
  confidenceValue: { fontFamily: "Inter_700Bold", fontSize: 32 },
  confidenceBadge: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  conditionsCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 16 },
  conditionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
  conditionName: { fontFamily: "Inter_500Medium", fontSize: 14, flex: 1 },
  conditionRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressBar: { width: 80, height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  conditionCount: { fontFamily: "Inter_500Medium", fontSize: 13, width: 24, textAlign: "right" },
  routineCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
  routineHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  routineTime: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  routineStep: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  stepDot: { width: 7, height: 7, borderRadius: 4 },
  stepText: { fontFamily: "Inter_400Regular", fontSize: 14 },
});
