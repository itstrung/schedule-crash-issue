import { Image, StyleSheet, Platform, Button } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";
import { OfflineIndicator } from "@/components/OfflineIndicator";

export default function HomeScreen() {
  const router = useRouter();
  return (
    <ThemedView style={styles.titleContainer}>
      <Button
        title="Go to Schedule"
        onPress={() => {
          router.push("/schedule");
        }}
      />
      <ThemedView
        style={{
          minHeight: 200,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <OfflineIndicator />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flex: 1,
  },
});
