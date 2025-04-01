import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import {
  NetInfoConfiguration,
  useNetInfoInstance,
} from "@react-native-community/netinfo";

type NetworkConnectivityContextType = {
  isOffline: boolean;
  isShowingOfflineIndicator: boolean;
};

const NetworkConnectivityContext =
  createContext<NetworkConnectivityContextType>({
    isOffline: false,
    isShowingOfflineIndicator: false,
  });

type NetworkConnectivityProviderProps = {
  children: React.ReactNode;
};

const REACHABILITY_LONG_TIMEOUT = 60 * 1000; // 60s
const REACHABILITY_SHORT_TIMEOUT = 5 * 1000; // 5s
const REACHABILITY_REQUEST_TIMEOUT = 3.5 * 1000; // 3.5s
// The number of times after reachable failed to check before we consider it offline
const NEXT_FAILED_CHECK_COUNT = 1;

const OFFLINE_TIMEOUT =
  (REACHABILITY_SHORT_TIMEOUT + REACHABILITY_REQUEST_TIMEOUT) *
  NEXT_FAILED_CHECK_COUNT;

const config: NetInfoConfiguration = {
  // Using Goggle HEAD request for now
  // We can create a strapi GET ping endpoint if needed
  reachabilityUrl: "https://clients3.google.com/generate_204",
  reachabilityTest: async (response) => response.status === 204,
  reachabilityLongTimeout: REACHABILITY_LONG_TIMEOUT,
  reachabilityShortTimeout: REACHABILITY_SHORT_TIMEOUT,
  reachabilityRequestTimeout: REACHABILITY_REQUEST_TIMEOUT,
  reachabilityShouldRun: () => true,
  shouldFetchWiFiSSID: false, // met iOS requirements to get SSID
  useNativeReachability: false,
};

export const NetworkConnectivityProvider = ({
  children,
}: NetworkConnectivityProviderProps) => {
  const { netInfo } = useNetInfoInstance(false, config);
  const { isConnected, isInternetReachable } = netInfo;
  const [isShowingOfflineIndicator, setIsShowingOfflineIndicator] =
    useState(false);

  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const isOffline = useMemo(() => {
    // If either value is null, we don't know the status yet, assume online
    if (isConnected === null || isInternetReachable === null) {
      return false;
    }

    if (!isConnected || !isInternetReachable) {
      return true;
    }

    return false;
  }, [isConnected, isInternetReachable]);

  useEffect(() => {
    if (isOffline) {
      timeoutIdRef.current = setTimeout(() => {
        setIsShowingOfflineIndicator(true);
      }, OFFLINE_TIMEOUT);

      return;
    }

    setIsShowingOfflineIndicator(false);
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [isOffline]);

  return (
    <NetworkConnectivityContext.Provider
      value={{ isOffline, isShowingOfflineIndicator }}
    >
      {children}
    </NetworkConnectivityContext.Provider>
  );
};

export const useNetworkConnectivity = () => {
  const context = useContext(NetworkConnectivityContext);
  if (context === undefined) {
    throw new Error(
      "useNetworkConnectivity must be used within a NetworkConnectivityProvider"
    );
  }
  return context;
};
