import { Pressable } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import Rive, { Fit, RiveRef } from "rive-react-native";
import { useEffect, useRef, useState } from "react";

const TAB_BAR_RIVE_STATE_MACHINE_NAME = "State Machine 1";
const TAB_BAR_RIVE_STATE_MACHINE_INPUT = "Select?";

const RiveAnimation = ({
  isFocused,
  resourceName,
}: {
  isFocused: boolean;
  resourceName: string;
}) => {
  const riveAnimationRef = useRef<RiveRef>(null);

  useEffect(() => {
    riveAnimationRef.current?.setInputState(
      TAB_BAR_RIVE_STATE_MACHINE_NAME,
      TAB_BAR_RIVE_STATE_MACHINE_INPUT,
      isFocused
    );
  }, [isFocused]);

  return (
    <Rive
      stateMachineName={TAB_BAR_RIVE_STATE_MACHINE_NAME}
      fit={Fit.Fill}
      style={{
        width: 40,
        height: 40,
        pointerEvents: "none", // Rive component can shallow click events
      }}
      ref={riveAnimationRef}
      resourceName={resourceName}
    />
  );
};

const ANIMATION_NAMES = [
  "nav_icon_festival",
  "nav_icon_festiverse",
  "nav_icon_more",
] as const;

export default function TabTwoScreen() {
  const [activeAnimation, setActiveAnimation] = useState<string>(
    ANIMATION_NAMES[0]
  );

  const onAnimationPress = (animationName: string) => {
    setActiveAnimation(animationName);
  };
  return (
    <ThemedView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ThemedView style={{ flexDirection: "row", gap: 40 }}>
        {ANIMATION_NAMES.map((animationName) => (
          <Pressable
            key={animationName}
            onPress={() => onAnimationPress(animationName)}
          >
            <RiveAnimation
              isFocused={activeAnimation === animationName}
              resourceName={animationName}
            />
          </Pressable>
        ))}
      </ThemedView>
    </ThemedView>
  );
}
