import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
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
import { RiskBadge } from "@/components/RiskBadge";

export default function ScanResultScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { pendingResult, addScan, setPendingResult } = useScan();

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSave = async () => {
    if (!pendingResult) return;
    await addScan(pendingResult);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Saved", "Your scan has been saved to history.", [
      { text: "OK", onPress: () => { setPendingResult(null); router.replace("/(tabs)/history"); } },
    ]);
  };

  const handleClose = () => {
    setPendingResult(null);
    router.back();
  };

  if (!pendingResult) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>No scan result available.</Text>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.primary }]}>
          <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const riskColors = {
    low: colors.lowRisk,
    medium: colors.mediumRisk,
    high: colors.highRisk,
  };

  const riskLabels = {
    low: "Low Risk",
    medium: "Moderate Risk",
    high: "High Risk",
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 120 }]}
      >
        <View style={[styles.topBar, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 }]}>
          <TouchableOpacity onPress={handleClose} style={[styles.closeBtn, { backgroundColor: colors.surface }]}>
            <Feather name="x" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { color: colors.text }]}>Scan Result</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={[styles.imageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Image source={{ uri: pendingResult.imageUri }} style={styles.skinImage} resizeMode="cover" />
          <View style={styles.imageOverlay}>
            <View style={[styles.confidencePill, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
              <Feather name="cpu" size={12} color="#fff" />
              <Text style={styles.confidenceText}>{pendingResult.confidence}% confidence</Text>
            </View>
          </View>
        </View>

        <View style={[styles.riskSection, { backgroundColor: riskColors[pendingResult.overallRisk] + "15", borderColor: riskColors[pendingResult.overallRisk] + "40" }]}>
          <View>
            <Text style={[styles.riskSubLabel, { color: colors.mutedForeground }]}>Overall Assessment</Text>
            <Text style={[styles.riskLabel, { color: riskColors[pendingResult.overallRisk] }]}>
              {riskLabels[pendingResult.overallRisk]}
            </Text>
            <Text style={[styles.riskArea, { color: colors.mutedForeground }]}>Area: {pendingResult.bodyArea}</Text>
          </View>
          <View style={[styles.riskIcon, { backgroundColor: riskColors[pendingResult.overallRisk] + "25" }]}>
            <Feather
              name={pendingResult.overallRisk === "high" ? "alert-triangle" : pendingResult.overallRisk === "medium" ? "alert-circle" : "check-circle"}
              size={28}
              color={riskColors[pendingResult.overallRisk]}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Detected Conditions</Text>
        <View style={[styles.conditionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {pendingResult.conditions.map((cond, i) => (
            <View
              key={i}
              style={[
                styles.conditionRow,
                i < pendingResult.conditions.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={styles.conditionLeft}>
                <Text style={[styles.conditionName, { color: colors.text }]}>{cond.name}</Text>
                <Text style={[styles.conditionDesc, { color: colors.mutedForeground }]}>{cond.description}</Text>
              </View>
              <View style={styles.conditionRight}>
                <RiskBadge risk={cond.risk} size="sm" />
                <Text style={[styles.severity, { color: colors.mutedForeground }]}>{cond.severity}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommendations</Text>
        <View style={[styles.recsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {pendingResult.recommendations.map((rec, i) => (
            <View key={i} style={styles.recRow}>
              <View style={[styles.recDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.recText, { color: colors.text }]}>{rec}</Text>
            </View>
          ))}
        </View>

        {pendingResult.overallRisk === "high" && (
          <View style={[styles.warningBox, { backgroundColor: colors.highRiskBg, borderColor: colors.highRisk + "40" }]}>
            <Feather name="alert-triangle" size={18} color={colors.highRisk} />
            <Text style={[styles.warningText, { color: colors.highRisk }]}>
              High risk indicators detected. We recommend consulting a dermatologist soon.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Feather name="save" size={18} color="#fff" />
          <Text style={styles.saveBtnText}>Save to History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.discardBtn, { borderColor: colors.border }]}
          onPress={handleClose}
          activeOpacity={0.8}
        >
          <Text style={[styles.discardText, { color: colors.mutedForeground }]}>Discard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 16 },
  closeBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  screenTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17 },
  imageCard: { borderRadius: 20, overflow: "hidden", borderWidth: 1, marginBottom: 16, height: 220 },
  skinImage: { width: "100%", height: "100%" },
  imageOverlay: { position: "absolute", bottom: 12, left: 12 },
  confidencePill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  confidenceText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "#fff" },
  riskSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 20 },
  riskSubLabel: { fontFamily: "Inter_400Regular", fontSize: 12, marginBottom: 2 },
  riskLabel: { fontFamily: "Inter_700Bold", fontSize: 22 },
  riskArea: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  riskIcon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17, marginBottom: 10 },
  conditionsCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 20 },
  conditionRow: { flexDirection: "row", padding: 14, gap: 12 },
  conditionLeft: { flex: 1, gap: 4 },
  conditionName: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  conditionDesc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  conditionRight: { alignItems: "flex-end", gap: 4, justifyContent: "center" },
  severity: { fontFamily: "Inter_400Regular", fontSize: 12 },
  recsCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12, marginBottom: 16 },
  recRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  recDot: { width: 7, height: 7, borderRadius: 4, marginTop: 6 },
  recText: { fontFamily: "Inter_400Regular", fontSize: 14, flex: 1, lineHeight: 20 },
  warningBox: { flexDirection: "row", gap: 12, borderRadius: 14, padding: 14, borderWidth: 1, alignItems: "flex-start" },
  warningText: { fontFamily: "Inter_500Medium", fontSize: 13, flex: 1, lineHeight: 19 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, gap: 8 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 15, borderRadius: 14 },
  saveBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#fff" },
  discardBtn: { alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  discardText: { fontFamily: "Inter_500Medium", fontSize: 15 },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 16, textAlign: "center", marginBottom: 20 },
  backBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, alignSelf: "center" },
});
