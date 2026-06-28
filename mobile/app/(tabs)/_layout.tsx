import { Tabs, useRouter } from "expo-router";
import { Pressable, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

export default function TabsLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
        },
        tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Hoy",
          tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="armario"
        options={{
          title: "Armario",
          tabBarIcon: ({ color }) => <Feather name="grid" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "",
          tabBarButton: () => <CameraFab onPress={() => router.push("/camera")} />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push("/camera");
          },
        }}
      />
      <Tabs.Screen
        name="looks"
        options={{
          title: "Looks",
          tabBarIcon: ({ color }) => <Feather name="columns" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <Feather name="user" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

function CameraFab({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.fabWrap}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Escanear prenda"
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
      >
        <Feather name="camera" size={24} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fabWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginTop: -16,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
});
