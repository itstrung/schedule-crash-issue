import { useNetworkConnectivity } from "@/components/NetworkConnectivity";
import { ThemedText } from "@/components/ThemedText";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEFAULT_OFFLINE_INDICATOR_PADDING_BOTTOM_OFFSET = 12;

type OfflineIndicatorProps = {
  background?: string;
};

export const OfflineIndicator = ({ background }: OfflineIndicatorProps) => {
  const { bottom: bottomInset } = useSafeAreaInsets();

  const { isShowingOfflineIndicator } = useNetworkConnectivity();

  if (!isShowingOfflineIndicator) {
    return null;
  }

  return (
    <ThemedText
      style={{
        textAlign: "center",
        backgroundColor: background,
        paddingTop: 8,
        paddingBottom:
          bottomInset - DEFAULT_OFFLINE_INDICATOR_PADDING_BOTTOM_OFFSET,
      }}
    >
      Offline
    </ThemedText>
  );
};
