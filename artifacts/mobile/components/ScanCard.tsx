import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { ScanResult } from "@/context/ScanContext";
import { RiskBadge } from "./RiskBadge";

interface ScanCardProps {
  scan: ScanResult;
  onPress: () => void;
  onDelete?: () => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ScanCard({ scan, onPress, onDelete }: ScanCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Image source={{ uri: scan.imageUri }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.area, { color: colors.text }]}>{scan.bodyArea}</Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>{formatDate(scan.date)}</Text>
        </View>
        <RiskBadge risk={scan.overallRisk} size="sm" />
        <Text style={[styles.conditions, { color: colors.mutedForeground }]} numberOfLines={1}>
          {scan.conditions.map((c) => c.name).join(" · ")}
        </Text>
      </View>
      {onDelete && (
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.deleteBtn}>
          <Feather name="trash-2" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 12,
  },
  image: {
    width: 80,
    height: 80,
    backgroundColor: "#F0E8E4",
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  area: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  date: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  conditions: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  deleteBtn: {
    padding: 12,
    alignSelf: "center",
  },
});
