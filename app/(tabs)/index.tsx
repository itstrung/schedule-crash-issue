import { StyleSheet, Button } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";

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
