import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { RiskLevel } from "@/context/ScanContext";

interface RiskBadgeProps {
  risk: RiskLevel;
  size?: "sm" | "md" | "lg";
}

export function RiskBadge({ risk, size = "md" }: RiskBadgeProps) {
  const colors = useColors();

  const config = {
    low: { label: "LOW RISK", bg: colors.lowRiskBg, color: colors.lowRisk },
    medium: { label: "MODERATE", bg: colors.mediumRiskBg, color: colors.mediumRisk },
    high: { label: "HIGH RISK", bg: colors.highRiskBg, color: colors.highRisk },
  }[risk];

  const fontSize = size === "sm" ? 9 : size === "lg" ? 13 : 11;
  const px = size === "sm" ? 8 : size === "lg" ? 14 : 10;
  const py = size === "sm" ? 3 : size === "lg" ? 6 : 4;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, paddingHorizontal: px, paddingVertical: py }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color, fontSize }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 100,
    gap: 5,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
});
