import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const REMINDER_KEY = "@skinscan_reminder";
const REMINDER_ID_KEY = "@skinscan_reminder_id";

export interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function saveReminderSettings(settings: ReminderSettings): Promise<void> {
  await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(settings));
}

export async function loadReminderSettings(): Promise<ReminderSettings> {
  const stored = await AsyncStorage.getItem(REMINDER_KEY);
  if (stored) return JSON.parse(stored);
  return { enabled: false, hour: 9, minute: 0 };
}

export async function scheduleReminder(hour: number, minute: number): Promise<void> {
  await cancelReminder();
  if (Platform.OS === "web") return;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "SkinScan Reminder",
      body: "Time to check your skin! Tap to run your daily scan.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  await AsyncStorage.setItem(REMINDER_ID_KEY, id);
}

export async function cancelReminder(): Promise<void> {
  const id = await AsyncStorage.getItem(REMINDER_ID_KEY);
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id);
    await AsyncStorage.removeItem(REMINDER_ID_KEY);
  }
}

export function formatTime(hour: number, minute: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const m = minute.toString().padStart(2, "0");
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h}:${m} ${ampm}`;
}
