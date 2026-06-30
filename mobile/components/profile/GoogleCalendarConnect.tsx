import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as AuthSession from "expo-auth-session";
import { Feather } from "@expo/vector-icons";
import Button from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";
import {
  getGoogleAuthRequestConfig,
  googleDiscovery,
  exchangeCodeForTokens,
  disconnectGoogleCalendar,
} from "@/lib/calendar/googleAuth";

interface GoogleCalendarConnectProps {
  connected: boolean;
  onConnectedChange: (connected: boolean) => void;
}

// "Connect Google Calendar" card for the Perfil screen. Only rendered for
// Pro/Elite users by the caller. Tokens never touch Supabase or app
// state — only the boolean connected flag is persisted remotely.
export default function GoogleCalendarConnect({
  connected,
  onConnectedChange,
}: GoogleCalendarConnectProps) {
  const [busy, setBusy] = useState(false);
  const requestConfig = getGoogleAuthRequestConfig();
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    requestConfig,
    googleDiscovery
  );

  useEffect(() => {
    if (response?.type === "success" && response.params.code && request?.codeVerifier) {
      setBusy(true);
      exchangeCodeForTokens(response.params.code, request.codeVerifier, requestConfig.redirectUri)
        .then(() => onConnectedChange(true))
        .catch(() => onConnectedChange(false))
        .finally(() => setBusy(false));
    }
  }, [response]);

  async function handleConnect() {
    if (!requestConfig.clientId) return;
    await promptAsync();
  }

  async function handleDisconnect() {
    setBusy(true);
    await disconnectGoogleCalendar();
    onConnectedChange(false);
    setBusy(false);
  }

  if (!requestConfig.clientId) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Feather name="calendar" size={20} color={colors.accent} />
        <View style={styles.textCol}>
          <Text style={styles.title}>Google Calendar</Text>
          <Text style={styles.subtitle}>
            {connected
              ? "Conectado — usamos tus eventos de hoy para sugerirte looks."
              : "Conecta tu calendario para sugerencias más precisas."}
          </Text>
        </View>
      </View>
      <Button
        label={connected ? "Desconectar" : "Conectar Google Calendar"}
        variant={connected ? "outline" : "primary"}
        onPress={connected ? handleDisconnect : handleConnect}
        loading={busy}
        disabled={!request}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  textCol: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.textSecondary },
});
