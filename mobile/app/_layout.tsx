import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons, AntDesign, Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  CormorantGaramond_500Medium,
  CormorantGaramond_500Medium_Italic,
  CormorantGaramond_600SemiBold,
} from "@expo-google-fonts/cormorant-garamond";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { colors } from "@/constants/colors";
import { AuthProvider } from "@/lib/auth/AuthContext";

// Keep the splash visible until the custom fonts are ready.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Every icon font set used anywhere in the app is loaded alongside the
  // display/body fonts so icons are guaranteed ready before the first screen
  // paints, instead of flashing in (or staying blank on native Android
  // builds) after a late/failed async load.
  const [fontsLoaded, fontError] = useFonts({
    ...Feather.font,
    ...MaterialCommunityIcons.font,
    ...AntDesign.font,
    ...Ionicons.font,
    CormorantGaramond_500Medium,
    CormorantGaramond_500Medium_Italic,
    CormorantGaramond_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="register" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="camera"
            options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }}
          />
          <Stack.Screen
            name="item-review"
            options={{ presentation: "modal", animation: "slide_from_bottom" }}
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
