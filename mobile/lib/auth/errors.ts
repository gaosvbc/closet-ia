// Maps raw Supabase Auth errors to the friendly, Spanish-free-but-localized*
// messages the GOAL spec requires. Raw Supabase error text is never shown to
// the user and never logged (it can include account-existence details).
//
// (*the rest of the auth UI is in Spanish to match the app; these three
// messages are kept in Spanish too, see authErrorMessage's return values.)

const GENERIC = "Algo salió mal. Inténtalo de nuevo.";
const NETWORK = "No pudimos conectar. Revisa tu internet e inténtalo de nuevo.";
const EMAIL_IN_USE = "Este email ya está registrado. Intenta iniciar sesión.";
const BAD_CREDENTIALS = "Email o contraseña incorrectos.";

export function authErrorMessage(error: unknown): string {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : "";
  const lower = message.toLowerCase();

  if (
    lower.includes("network") ||
    lower.includes("fetch") ||
    lower.includes("timeout")
  ) {
    return NETWORK;
  }
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return EMAIL_IN_USE;
  }
  if (lower.includes("invalid login credentials")) {
    return BAD_CREDENTIALS;
  }
  return GENERIC;
}
