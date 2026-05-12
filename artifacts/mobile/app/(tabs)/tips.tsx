import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { TipCard } from "@/components/TipCard";

const CATEGORIES = ["All", "Hydration", "Sun Care", "Cleansing", "Nutrition", "Lifestyle"];

const TIPS = [
  { category: "Hydration", title: "Moisturize Daily", description: "Apply a non-comedogenic moisturizer morning and night to maintain your skin barrier.", icon: "droplet", color: "#00CEC9" },
  { category: "Hydration", title: "Drink More Water", description: "Aim for 8 glasses of water daily. Hydration from within keeps your skin plump and radiant.", icon: "coffee", color: "#00CEC9" },
  { category: "Hydration", title: "Use a Hyaluronic Serum", description: "Hyaluronic acid attracts moisture and holds it in the skin, reducing fine lines.", icon: "activity", color: "#00CEC9" },
  { category: "Sun Care", title: "Daily SPF is Essential", description: "Apply SPF 30+ every morning, even on cloudy days. UV rays cause premature aging.", icon: "sun", color: "#FDCB6E" },
  { category: "Sun Care", title: "Reapply Sunscreen", description: "Reapply sunscreen every 2 hours when outdoors or after swimming or sweating.", icon: "refresh-cw", color: "#FDCB6E" },
  { category: "Cleansing", title: "Double Cleanse at Night", description: "Use an oil cleanser to remove makeup and SPF, followed by a water-based cleanser.", icon: "wind", color: "#A29BFE" },
  { category: "Cleansing", title: "Don't Over-Cleanse", description: "Washing your face more than twice daily strips natural oils and disrupts the skin barrier.", icon: "shield", color: "#A29BFE" },
  { category: "Cleansing", title: "Clean Your Pillowcases", description: "Change pillowcases weekly to prevent bacteria and oil buildup that causes breakouts.", icon: "moon", color: "#A29BFE" },
  { category: "Nutrition", title: "Eat Antioxidant-Rich Foods", description: "Berries, leafy greens, and nuts protect your skin from free radical damage.", icon: "heart", color: "#6C5CE7" },
  { category: "Nutrition", title: "Omega-3 Fatty Acids", description: "Salmon, walnuts, and flaxseed reduce inflammation and keep skin soft and moisturized.", icon: "zap", color: "#6C5CE7" },
  { category: "Lifestyle", title: "Prioritize Sleep", description: "7-9 hours of sleep allows your skin to repair and regenerate overnight.", icon: "moon", color: "#FF6B9D" },
  { category: "Lifestyle", title: "Manage Stress", description: "Chronic stress elevates cortisol, which can trigger acne and other skin conditions.", icon: "smile", color: "#FF6B9D" },
  { category: "Lifestyle", title: "Exercise Regularly", description: "Exercise boosts circulation and delivers oxygen and nutrients to skin cells.", icon: "trending-up", color: "#FF6B9D" },
];

export default function TipsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState("All");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const filtered = activeCategory === "All" ? TIPS : TIPS.filter((t) => t.category === activeCategory);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Skin Care Tips</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Expert advice for healthier, glowing skin
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        style={styles.categoryScroll}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[
              styles.categoryChip,
              {
                backgroundColor: activeCategory === cat ? colors.primary : colors.card,
                borderColor: activeCategory === cat ? colors.primary : colors.border,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.categoryText,
                { color: activeCategory === cat ? "#fff" : colors.mutedForeground },
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.tipsList}>
        {filtered.map((tip, i) => (
          <TipCard
            key={i}
            title={tip.title}
            description={tip.description}
            icon={tip.icon}
            accentColor={tip.color}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { marginBottom: 20 },
  title: { fontFamily: "Inter_700Bold", fontSize: 30, marginBottom: 4, letterSpacing: -0.5 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 15 },
  categoryScroll: { marginBottom: 20, marginHorizontal: -20 },
  categories: { paddingHorizontal: 20, gap: 8 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
  },
  categoryText: { fontFamily: "Inter_500Medium", fontSize: 14 },
  tipsList: {},
});
