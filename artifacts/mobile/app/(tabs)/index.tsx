import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { generateScanResult, useScan } from "@/context/ScanContext";
import { useColors } from "@/hooks/useColors";

const CONDITIONS_PREVIEW = [
  { label: "Acne", color: "#FF6B9D" },
  { label: "Mole", color: "#A29BFE" },
  { label: "Rash", color: "#FF9F0A" },
  { label: "Dark Spots", color: "#FDCB6E" },
  { label: "Redness", color: "#FF4757" },
  { label: "Dryness", color: "#00CEC9" },
];

export default function ScannerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setPendingResult, scanHistory } = useScan();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  React.useEffect(() => {
    if (isAnalyzing) {
      const spin = Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
      );
      spin.start();
      return () => spin.stop();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isAnalyzing]);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const handleScan = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      await openGallery();
      return;
    }
    await openCamera();
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      await analyzeImage(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      await analyzeImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async (uri: string) => {
    setIsAnalyzing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((r) => setTimeout(r, 2800));
    const result = generateScanResult(uri);
    setPendingResult(result);
    setIsAnalyzing(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push("/scan-result");
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={[styles.headerBadge, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" }]}>
          <View style={[styles.headerBadgeDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.headerBadgeText, { color: colors.primary }]}>AI-Powered Analysis</Text>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Skin Scanner</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Capture or upload a photo to detect skin conditions instantly
        </Text>
      </View>

      <View style={styles.scannerSection}>
        <Animated.View style={[styles.outerRing, { borderColor: colors.primary + "25", transform: [{ scale: pulseAnim }] }]}>
          <View style={[styles.middleRing, { borderColor: colors.primary + "45" }]}>
            <TouchableOpacity
              onPress={handleScan}
              disabled={isAnalyzing}
              activeOpacity={0.88}
              style={styles.gradientWrap}
            >
              <LinearGradient
                colors={["#8B7FF8", "#6C5CE7", "#4834D4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.scanButton}
              >
                {isAnalyzing ? (
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Feather name="loader" size={40} color="#fff" />
                  </Animated.View>
                ) : (
                  <Feather name="camera" size={40} color="#fff" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {isAnalyzing ? (
          <View style={styles.statusBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.statusTitle, { color: colors.foreground }]}>Analyzing your skin...</Text>
            <Text style={[styles.statusSub, { color: colors.mutedForeground }]}>AI model is processing the image</Text>
          </View>
        ) : (
          <View style={styles.statusBox}>
            <Text style={[styles.statusTitle, { color: colors.foreground }]}>Tap to scan</Text>
            <Text style={[styles.statusSub, { color: colors.mutedForeground }]}>Point camera at affected skin area</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.galleryBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={openGallery}
        activeOpacity={0.8}
        disabled={isAnalyzing}
      >
        <Feather name="image" size={18} color={colors.accent} />
        <Text style={[styles.galleryText, { color: colors.accent }]}>Upload from Gallery</Text>
      </TouchableOpacity>

      {/* Routine Banner */}
      <TouchableOpacity onPress={() => router.push("/routine")} activeOpacity={0.85} style={styles.routineBannerWrap}>
        <LinearGradient
          colors={["#4834D4", "#6C5CE7", "#00CEC980"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.routineBanner}
        >
          <View style={[styles.routineIconWrap, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <Feather name="list" size={20} color="#fff" />
          </View>
          <View style={styles.routineBannerText}>
            <Text style={styles.routineBannerTitle}>
              {scanHistory.length > 0 ? "View Your Personalized Routine" : "Build Your Skin Routine"}
            </Text>
            <Text style={styles.routineBannerSub}>
              {scanHistory.length > 0
                ? `Tailored to your ${scanHistory.length} scan${scanHistory.length > 1 ? "s" : ""}`
                : "AI-generated morning & evening steps"}
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
        </LinearGradient>
      </TouchableOpacity>

      <View style={[styles.detectsSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.detectsHeader}>
          <Feather name="zap" size={15} color={colors.primary} />
          <Text style={[styles.detectsTitle, { color: colors.foreground }]}>Detects conditions including</Text>
        </View>
        <View style={styles.conditionGrid}>
          {CONDITIONS_PREVIEW.map((c) => (
            <View key={c.label} style={[styles.conditionChip, { backgroundColor: c.color + "18", borderColor: c.color + "30" }]}>
              <View style={[styles.conditionDot, { backgroundColor: c.color }]} />
              <Text style={[styles.conditionLabel, { color: c.color }]}>{c.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: "Accuracy", value: "95%", icon: "award" as const, color: colors.primary },
          { label: "Conditions", value: "20+", icon: "list" as const, color: colors.secondary },
          { label: "Speed", value: "Fast", icon: "zap" as const, color: colors.accent },
        ].map((stat) => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIconWrap, { backgroundColor: stat.color + "18" }]}>
              <Feather name={stat.icon} size={16} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { marginBottom: 28 },
  headerBadge: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, marginBottom: 14 },
  headerBadgeDot: { width: 6, height: 6, borderRadius: 3 },
  headerBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 12, letterSpacing: 0.3 },
  title: { fontFamily: "Inter_700Bold", fontSize: 34, marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22 },
  scannerSection: { alignItems: "center", marginBottom: 24 },
  outerRing: { width: 230, height: 230, borderRadius: 115, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  middleRing: { width: 196, height: 196, borderRadius: 98, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  gradientWrap: { width: 158, height: 158, borderRadius: 79, overflow: "hidden" },
  scanButton: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  statusBox: { alignItems: "center", marginTop: 20, gap: 4 },
  statusTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17 },
  statusSub: { fontFamily: "Inter_400Regular", fontSize: 13 },
  galleryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  galleryText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  routineBannerWrap: { marginBottom: 16, borderRadius: 16, overflow: "hidden" },
  routineBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  routineIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  routineBannerText: { flex: 1, gap: 2 },
  routineBannerTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#fff" },
  routineBannerSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.7)" },
  detectsSection: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 16 },
  detectsHeader: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 14 },
  detectsTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  conditionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  conditionChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, borderWidth: 1 },
  conditionDot: { width: 6, height: 6, borderRadius: 3 },
  conditionLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, gap: 8 },
  statIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 17 },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 12 },
});
