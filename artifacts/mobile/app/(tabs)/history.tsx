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
        <Text style={[styles.title, { color: colors.text }]}>Scan History</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {scanHistory.length} scan{scanHistory.length !== 1 ? "s" : ""} saved
        </Text>
      </View>

      {scanHistory.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
            <Feather name="clock" size={32} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No scans yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            Take your first skin scan to see your history here
          </Text>
          <TouchableOpacity
            style={[styles.scanNowBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/")}
            activeOpacity={0.85}
          >
            <Text style={[styles.scanNowText, { color: colors.primaryForeground }]}>Scan Now</Text>
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
  header: { marginBottom: 24 },
  title: { fontFamily: "Inter_700Bold", fontSize: 30, marginBottom: 4 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 15 },
  emptyState: {
    borderRadius: 20,
    padding: 32,
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
  scanNowBtn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  scanNowText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
