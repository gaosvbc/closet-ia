import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/onboarding/ProgressBar";
import Chips from "@/components/onboarding/Chips";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

const BODY_TYPES = ["Esbelto", "Atlético", "Normal", "Curvy", "Plus"];
const FIT = ["Holgado", "Regular", "Ajustado"];
const GENDER = ["Femenino", "Masculino", "Neutral", "Mix"];

export default function BodyProfile() {
  const router = useRouter();
  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [bodyType, setBodyType] = useState("Atlético");
  const [fit, setFit] = useState("Regular");
  const [gender, setGender] = useState("Femenino");

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.progressWrap}>
        <ProgressBar step={3} total={5} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Cuéntanos sobre ti</Text>
        <Text style={styles.subtitle}>
          Para que los looks realmente te queden
        </Text>

        {/* Height */}
        <View style={styles.field}>
          <Text style={styles.label}>Altura</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholder="168"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
            <UnitToggle
              options={["cm", "ft"]}
              value={heightUnit}
              onChange={setHeightUnit}
            />
          </View>
        </View>

        {/* Weight */}
        <View style={styles.field}>
          <Text style={styles.label}>Peso</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="58"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
            <UnitToggle
              options={["kg", "lb"]}
              value={weightUnit}
              onChange={setWeightUnit}
            />
          </View>
        </View>

        {/* Body type */}
        <View style={styles.field}>
          <Text style={styles.label}>Tipo de cuerpo</Text>
          <Chips options={BODY_TYPES} value={bodyType} onChange={setBodyType} scroll />
        </View>

        {/* Fit */}
        <View style={styles.field}>
          <Text style={styles.label}>Preferencia de ajuste</Text>
          <Chips options={FIT} value={fit} onChange={setFit} />
        </View>

        {/* Gender expression */}
        <View style={styles.field}>
          <Text style={styles.label}>Expresión de estilo</Text>
          <Chips options={GENDER} value={gender} onChange={setGender} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Continuar"
          onPress={() => router.push("/onboarding/register")}
        />
      </View>
    </SafeAreaView>
  );
}

function UnitToggle({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.toggle}>
      {options.map((opt) => {
        const selected = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.toggleBtn, selected && styles.toggleBtnActive]}
          >
            <Text
              style={[
                styles.toggleText,
                { color: selected ? colors.white : colors.textSecondary },
              ]}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  progressWrap: { paddingHorizontal: 24, paddingTop: 8 },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, gap: 22 },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.textPrimary },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: -14,
  },
  field: { gap: 10 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textPrimary },
  inputRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
  },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 50 },
  toggleBtnActive: { backgroundColor: colors.accent },
  toggleText: { fontFamily: fonts.bodyMedium, fontSize: 13 },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
