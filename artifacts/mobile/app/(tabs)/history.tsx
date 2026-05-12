import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
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
import { ScanCard } from "@/components/ScanCard";

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { scanHistory, deleteScan, setPendingResult } = useScan();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleView = (id: string) => {
    const scan = scanHistory.find((s) => s.id === id);
    if (scan) {
      setPendingResult(scan);
      router.push("/scan-result");
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Scan History</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" }]}>
          <Text style={[styles.countText, { color: colors.primary }]}>
            {scanHistory.length} scan{scanHistory.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {scanHistory.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primary + "18" }]}>
            <Feather name="clock" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No scans yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            Take your first skin scan to see your history here
          </Text>
          <TouchableOpacity
            style={[styles.scanNowBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/")}
            activeOpacity={0.85}
          >
            <Feather name="camera" size={15} color="#fff" />
            <Text style={styles.scanNowText}>Scan Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {scanHistory.map((scan) => (
            <ScanCard
              key={scan.id}
              scan={scan}
              onPress={() => handleView(scan.id)}
              onDelete={() => deleteScan(scan.id)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  title: { fontFamily: "Inter_700Bold", fontSize: 30, letterSpacing: -0.5 },
  countBadge: { borderRadius: 100, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1 },
  countText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  emptyState: {
    borderRadius: 20,
    padding: 36,
    alignItems: "center",
    borderWidth: 1,
    gap: 12,
    marginTop: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18 },
  emptySubtitle: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", lineHeight: 20 },
  scanNowBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  scanNowText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#fff" },
});
