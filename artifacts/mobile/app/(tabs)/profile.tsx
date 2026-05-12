import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useScan } from "@/context/ScanContext";
import { useColors } from "@/hooks/useColors";
import {
  ReminderSettings,
  cancelReminder,
  formatTime,
  loadReminderSettings,
  requestPermissions,
  saveReminderSettings,
  scheduleReminder,
} from "@/utils/notifications";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

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

  const [reminder, setReminder] = useState<ReminderSettings>({ enabled: false, hour: 9, minute: 0 });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const totalScans = scanHistory.length;
  const lowCount = scanHistory.filter((s) => s.overallRisk === "low").length;
  const medCount = scanHistory.filter((s) => s.overallRisk === "medium").length;
  const highCount = scanHistory.filter((s) => s.overallRisk === "high").length;

  const allConditions = scanHistory.flatMap((s) => s.conditions.map((c) => c.name));
  const conditionFreq: Record<string, number> = {};
  allConditions.forEach((c) => { conditionFreq[c] = (conditionFreq[c] || 0) + 1; });
  const topConditions = Object.entries(conditionFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const avgConfidence = scanHistory.length > 0
    ? Math.round(scanHistory.reduce((sum, s) => sum + s.confidence, 0) / scanHistory.length)
    : 0;

  useEffect(() => {
    loadReminderSettings().then(setReminder);
  }, []);

  const handleToggle = async (value: boolean) => {
    if (Platform.OS === "web") {
      Alert.alert("Not Available", "Notifications are not supported in the web preview. Use Expo Go on your device.");
      return;
    }
    if (value) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert("Permission Denied", "Please enable notifications in your device settings.");
        return;
      }
      const updated = { ...reminder, enabled: true };
      setReminder(updated);
      await scheduleReminder(updated.hour, updated.minute);
      await saveReminderSettings(updated);
    } else {
      const updated = { ...reminder, enabled: false };
      setReminder(updated);
      await cancelReminder();
      await saveReminderSettings(updated);
    }
  };

  const handleTimeChange = async (hour: number, minute: number) => {
    const updated = { ...reminder, hour, minute };
    setReminder(updated);
    if (updated.enabled) {
      setSaving(true);
      await scheduleReminder(hour, minute);
      await saveReminderSettings(updated);
      setSaving(false);
    } else {
      await saveReminderSettings(updated);
    }
    setShowTimePicker(false);
  };

  const routineTips = [
    { time: "Morning", icon: "sun" as const, steps: ["Gentle cleanser", "Vitamin C serum", "Moisturizer", "SPF 30+"] },
    { time: "Evening", icon: "moon" as const, steps: ["Double cleanse", "Retinol / treatment", "Night moisturizer"] },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>My Profile</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            {totalScans > 0 ? `${totalScans} scans tracked` : "Start scanning to build your profile"}
          </Text>
        </View>
        <View style={[styles.avatarCircle, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "40", borderWidth: 1 }]}>
          <Feather name="user" size={26} color={colors.primary} />
        </View>
      </View>

      {/* Routine CTA */}
      <TouchableOpacity onPress={() => router.push("/routine")} activeOpacity={0.85} style={styles.routineBannerWrap}>
        <LinearGradient
          colors={["#4834D4", "#6C5CE7", "#00CEC980"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.routineBanner}
        >
          <View style={[styles.routineIconWrap, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <Feather name="list" size={18} color="#fff" />
          </View>
          <View style={styles.routineBannerText}>
            <Text style={styles.routineBannerTitle}>
              {totalScans > 0 ? "View Personalized Routine" : "Build Your Skin Routine"}
            </Text>
            <Text style={styles.routineBannerSub}>
              {totalScans > 0 ? "Tailored to your scan results" : "AI morning & evening steps"}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.7)" />
        </LinearGradient>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Scan Overview</Text>
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
              <Text style={[styles.confidenceValue, { color: colors.foreground }]}>{avgConfidence}%</Text>
            </View>
            <View style={[styles.confidenceBadge, { backgroundColor: colors.primary + "20" }]}>
              <Feather name="award" size={22} color={colors.primary} />
            </View>
          </View>

          {topConditions.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Most Detected</Text>
              <View style={[styles.conditionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {topConditions.map(([name, count], i) => (
                  <View key={name} style={[styles.conditionRow, i < topConditions.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                    <Text style={[styles.conditionName, { color: colors.foreground }]}>{name}</Text>
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

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Daily Routine Guide</Text>
      {routineTips.map((routine) => (
        <View key={routine.time} style={[styles.routineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.routineHeader}>
            <View style={[styles.routineIconInner, { backgroundColor: colors.primary + "20" }]}>
              <Feather name={routine.icon} size={16} color={colors.primary} />
            </View>
            <Text style={[styles.routineTime, { color: colors.foreground }]}>{routine.time} Routine</Text>
          </View>
          {routine.steps.map((step, i) => (
            <View key={i} style={styles.routineStep}>
              <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.stepText, { color: colors.mutedForeground }]}>{step}</Text>
            </View>
          ))}
        </View>
      ))}

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Reminders</Text>
      <View style={[styles.reminderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.reminderRow}>
          <View style={styles.reminderLeft}>
            <View style={[styles.reminderIcon, { backgroundColor: colors.secondary + "20" }]}>
              <Feather name="bell" size={18} color={colors.secondary} />
            </View>
            <View>
              <Text style={[styles.reminderLabel, { color: colors.foreground }]}>Daily Skin Check</Text>
              <Text style={[styles.reminderSubtitle, { color: colors.mutedForeground }]}>
                {reminder.enabled ? `Every day at ${formatTime(reminder.hour, reminder.minute)}` : "Not scheduled"}
              </Text>
            </View>
          </View>
          <Switch
            value={reminder.enabled}
            onValueChange={handleToggle}
            trackColor={{ false: colors.border, true: colors.primary + "80" }}
            thumbColor={reminder.enabled ? colors.primary : colors.mutedForeground}
          />
        </View>

        {reminder.enabled && (
          <TouchableOpacity
            onPress={() => setShowTimePicker(!showTimePicker)}
            style={[styles.timePickerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.8}
          >
            <Feather name="clock" size={16} color={colors.primary} />
            <Text style={[styles.timePickerText, { color: colors.foreground }]}>
              {formatTime(reminder.hour, reminder.minute)}
            </Text>
            <Feather name={showTimePicker ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}

        {showTimePicker && reminder.enabled && (
          <View style={styles.timeGrid}>
            <Text style={[styles.timeGridLabel, { color: colors.mutedForeground }]}>Select reminder time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeOptions}>
              {HOURS.map((h) =>
                MINUTES.map((m) => (
                  <TouchableOpacity
                    key={`${h}:${m}`}
                    onPress={() => handleTimeChange(h, m)}
                    style={[
                      styles.timeOption,
                      {
                        backgroundColor: reminder.hour === h && reminder.minute === m ? colors.primary : colors.surface,
                        borderColor: reminder.hour === h && reminder.minute === m ? colors.primary : colors.border,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.timeOptionText, { color: reminder.hour === h && reminder.minute === m ? "#fff" : colors.foreground }]}>
                      {formatTime(h, m)}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            {saving && <Text style={[styles.savingText, { color: colors.mutedForeground }]}>Saving...</Text>}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  avatarCircle: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "Inter_700Bold", fontSize: 30, letterSpacing: -0.5, marginBottom: 2 },
  tagline: { fontFamily: "Inter_400Regular", fontSize: 14 },
  routineBannerWrap: { marginBottom: 24, borderRadius: 16, overflow: "hidden" },
  routineBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  routineIconWrap: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  routineBannerText: { flex: 1, gap: 2 },
  routineBannerTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#fff" },
  routineBannerSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.7)" },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17, marginBottom: 12, marginTop: 4 },
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
  routineIconInner: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  routineTime: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  routineStep: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  stepDot: { width: 7, height: 7, borderRadius: 4 },
  stepText: { fontFamily: "Inter_400Regular", fontSize: 14 },
  reminderCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  reminderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reminderLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  reminderIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  reminderLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  reminderSubtitle: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  timePickerBtn: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  timePickerText: { fontFamily: "Inter_600SemiBold", fontSize: 15, flex: 1 },
  timeGrid: { gap: 10 },
  timeGridLabel: { fontFamily: "Inter_400Regular", fontSize: 13 },
  timeOptions: { gap: 8, paddingBottom: 4 },
  timeOption: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  timeOptionText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  savingText: { fontFamily: "Inter_400Regular", fontSize: 12 },
});
