import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
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
  { label: "Mole", color: "#9B6B4A" },
  { label: "Rash", color: "#FF8C69" },
  { label: "Dark Spots", color: "#8B7355" },
  { label: "Redness", color: "#E8735A" },
  { label: "Dryness", color: "#C4956A" },
];

export default function ScannerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setPendingResult } = useScan();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

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
        <Text style={[styles.greeting, { color: colors.mutedForeground }]}>AI-Powered</Text>
        <Text style={[styles.title, { color: colors.text }]}>Skin Scanner</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Take or upload a photo to analyze your skin condition instantly
        </Text>
      </View>

      <View style={styles.scannerSection}>
        <Animated.View style={[styles.outerRing, { borderColor: colors.primary + "30", transform: [{ scale: pulseAnim }] }]}>
          <View style={[styles.innerRing, { borderColor: colors.primary + "60" }]}>
            <TouchableOpacity
              style={[styles.scanButton, { backgroundColor: colors.primary }]}
              onPress={handleScan}
              disabled={isAnalyzing}
              activeOpacity={0.85}
            >
              {isAnalyzing ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <Feather name="camera" size={42} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {isAnalyzing ? (
          <View style={styles.analyzingBox}>
            <Text style={[styles.analyzingTitle, { color: colors.text }]}>Analyzing your skin...</Text>
            <Text style={[styles.analyzingSubtitle, { color: colors.mutedForeground }]}>
              AI is scanning for conditions
            </Text>
          </View>
        ) : (
          <View style={styles.ctaBox}>
            <Text style={[styles.ctaTitle, { color: colors.text }]}>Tap to scan</Text>
            <Text style={[styles.ctaSubtitle, { color: colors.mutedForeground }]}>
              Point at affected skin area
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.galleryBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={openGallery}
        activeOpacity={0.8}
        disabled={isAnalyzing}
      >
        <Feather name="image" size={18} color={colors.primary} />
        <Text style={[styles.galleryText, { color: colors.primary }]}>Upload from Gallery</Text>
      </TouchableOpacity>

      <View style={[styles.detectsSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.detectsTitle, { color: colors.text }]}>Detects conditions like</Text>
        <View style={styles.conditionGrid}>
          {CONDITIONS_PREVIEW.map((c) => (
            <View key={c.label} style={[styles.conditionChip, { backgroundColor: c.color + "18" }]}>
              <View style={[styles.conditionDot, { backgroundColor: c.color }]} />
              <Text style={[styles.conditionLabel, { color: c.color }]}>{c.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: "Accuracy", value: "95%", icon: "award" },
          { label: "Conditions", value: "20+", icon: "list" },
          { label: "Results", value: "Fast", icon: "zap" },
        ].map((stat) => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name={stat.icon as any} size={18} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
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
  header: { marginBottom: 32 },
  greeting: { fontFamily: "Inter_500Medium", fontSize: 14, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 },
  title: { fontFamily: "Inter_700Bold", fontSize: 30, marginBottom: 8 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22 },
  scannerSection: { alignItems: "center", marginBottom: 24 },
  outerRing: { width: 220, height: 220, borderRadius: 110, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  innerRing: { width: 186, height: 186, borderRadius: 93, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  scanButton: { width: 150, height: 150, borderRadius: 75, alignItems: "center", justifyContent: "center" },
  analyzingBox: { alignItems: "center", marginTop: 20, gap: 4 },
  analyzingTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17 },
  analyzingSubtitle: { fontFamily: "Inter_400Regular", fontSize: 14 },
  ctaBox: { alignItems: "center", marginTop: 20, gap: 4 },
  ctaTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17 },
  ctaSubtitle: { fontFamily: "Inter_400Regular", fontSize: 14 },
  galleryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 14, borderRadius: 14, borderWidth: 1, marginBottom: 24 },
  galleryText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  detectsSection: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 20 },
  detectsTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, marginBottom: 12 },
  conditionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  conditionChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  conditionDot: { width: 6, height: 6, borderRadius: 3 },
  conditionLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, gap: 6 },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 18 },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 12 },
});
