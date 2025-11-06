// App.tsx
import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { paperTheme } from "./constants/theme"; // ⬅️ add this
import { useFonts } from "expo-font";

export default function Root() {
  // Load Poppins for headings/wordmark (fallbacks to system if not loaded)
  const [loaded] = useFonts({
    Poppins_400: require("./assets/fonts/Poppins-Regular.ttf"),
    Poppins_600: require("./assets/fonts/Poppins-SemiBold.ttf"),
    Poppins_700: require("./assets/fonts/Poppins-Bold.ttf"),
  });

  // You can render nothing until fonts load, or let it fall back
  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <StatusBar style="light" />
        <Slot />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
