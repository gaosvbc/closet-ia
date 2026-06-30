import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ChipGroup from "@/components/onboarding/ChipGroup";
import Card from "@/components/ui/Card";
import { colors } from "@/constants/colors";
import { fonts, eyebrow } from "@/constants/typography";
import { analyzeClothing } from "@/lib/api/analyzeClothing";
import { getUserId } from "@/lib/user";
import { addItem } from "@/lib/wardrobe-store";
import { mapAiCategory, mapCategoryToAi, colorNameToHex } from "@/lib/ai-mapping";
import { isMockMode, supabase } from "@/lib/supabase";
import type { ClothingAnalysis, ClothingCategory } from "@/types";

const CATEGORIES: ClothingCategory[] = ["Prendas", "Zapatos", "Accesorios", "Bolsos"];

// Shown after a camera capture: runs Claude Vision analysis, then presents an
// editable form pre-filled with whatever the user's plan tier returned.
// Saving is always possible, even if analysis failed or never ran.
export default function ItemReviewScreen() {
  const router = useRouter();
  const { uri } = useLocalSearchParams<{ uri: string }>();

  const [analyzing, setAnalyzing] = useState(true);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ClothingAnalysis | null>(null);

  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [category, setCategory] = useState<ClothingCategory>("Prendas");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!uri) {
        setAnalyzing(false);
        return;
      }
      const userId = await getUserId();
      const result = await analyzeClothing(uri, userId);
      if (cancelled) return;

      if (result.ok && result.analysis) {
        setAnalysis(result.analysis);
        setName(result.analysis.type);
        setColor(result.analysis.color);
        setCategory(mapAiCategory(result.analysis.category).category);
      } else {
        setAnalysisError(result.error);
      }
      setAnalyzing(false);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [uri]);

  async function handleSave() {
    setSaving(true);

    if (!isMockMode && supabase) {
      const userId = await getUserId();
      const dbCategory =
        analysis?.category && mapAiCategory(analysis.category).category === category
          ? analysis.category
          : mapCategoryToAi(category);

      await supabase.from("clothing_items").insert({
        user_id: userId,
        image_url: uri ?? null,
        name: name.trim() || "Prenda sin nombre",
        type: analysis?.type ?? null,
        color: color || "grey",
        category: dbCategory,
        material: analysis?.material ?? null,
        pattern: analysis?.pattern ?? null,
        season: analysis?.season ?? null,
        formality: analysis?.formality ?? null,
        ideal_temp_min: analysis?.idealTempRangeCelsius?.min ?? null,
        ideal_temp_max: analysis?.idealTempRangeCelsius?.max ?? null,
        occasions: analysis?.occasions ?? null,
        style_descriptors: analysis?.styleDescriptors ?? null,
        pairing_suggestions: analysis?.pairingSuggestions ?? null,
        favorited: false,
      });
    } else {
      const shape = analysis ? mapAiCategory(analysis.category).shape : "square";
      await addItem({
        id: `${Date.now()}`,
        name: name.trim() || "Prenda sin nombre",
        color: colorNameToHex(color || "grey"),
        shape,
        category,
        favorited: false,
        imageUri: uri,
        type: analysis?.type,
        material: analysis?.material,
        pattern: analysis?.pattern,
        season: analysis?.season,
        formality: analysis?.formality,
        idealTempRangeCelsius: analysis?.idealTempRangeCelsius,
        occasions: analysis?.occasions,
        styleDescriptors: analysis?.styleDescriptors,
        pairingSuggestions: analysis?.pairingSuggestions,
      });
    }

    setSaving(false);
    router.replace("/(tabs)/armario");
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Confirma tu prenda</Text>

        {uri ? (
          <Image source={{ uri }} style={styles.preview} resizeMode="cover" />
        ) : null}

        {analyzing && (
          <View style={styles.statusRow}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.statusText}>Analizando con IA…</Text>
          </View>
        )}

        {!analyzing && analysisError && (
          <Card style={styles.errorCard}>
            <Feather name="alert-circle" size={16} color={colors.accent} />
            <Text style={styles.errorText}>{analysisError}</Text>
          </Card>
        )}

        <View style={styles.field}>
          <Input label="Nombre" value={name} onChangeText={setName} placeholder="Ej. Camisa blanca" />
        </View>

        <View style={styles.field}>
          <Input label="Color" value={color} onChangeText={setColor} placeholder="Ej. Blanco" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Categoría</Text>
          <ChipGroup
            options={CATEGORIES}
            selected={[category]}
            onToggle={(v) => setCategory(v as ClothingCategory)}
          />
        </View>

        {(analysis?.material || analysis?.pattern || analysis?.season || analysis?.formality) && (
          <Card style={styles.detailCard}>
            <Text style={styles.detailEyebrow}>DETALLE (PRO)</Text>
            {analysis?.material && <Text style={styles.detailText}>Material: {analysis.material}</Text>}
            {analysis?.pattern && <Text style={styles.detailText}>Patrón: {analysis.pattern}</Text>}
            {analysis?.season && <Text style={styles.detailText}>Temporada: {analysis.season}</Text>}
            {analysis?.formality && <Text style={styles.detailText}>Formalidad: {analysis.formality}</Text>}
          </Card>
        )}

        {(analysis?.occasions?.length ||
          analysis?.styleDescriptors?.length ||
          analysis?.pairingSuggestions) && (
          <Card style={styles.detailCard}>
            <Text style={styles.detailEyebrow}>ESTILO (ELITE)</Text>
            {analysis?.idealTempRangeCelsius && (
              <Text style={styles.detailText}>
                Ideal entre {analysis.idealTempRangeCelsius.min}° y {analysis.idealTempRangeCelsius.max}°C
              </Text>
            )}
            {!!analysis?.occasions?.length && (
              <Text style={styles.detailText}>Ocasiones: {analysis.occasions.join(", ")}</Text>
            )}
            {!!analysis?.styleDescriptors?.length && (
              <Text style={styles.detailText}>Estilo: {analysis.styleDescriptors.join(", ")}</Text>
            )}
            {analysis?.pairingSuggestions && (
              <Text style={styles.detailText}>Combina con: {analysis.pairingSuggestions}</Text>
            )}
          </Card>
        )}

        <Button label="Guardar prenda" onPress={handleSave} loading={saving} style={styles.save} />
        <Button
          label="Cancelar"
          variant="outline"
          onPress={() => router.back()}
          disabled={saving}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 16 },
  title: { fontFamily: fonts.bodySemibold, fontSize: 22, color: colors.textPrimary },
  preview: { width: "100%", height: 220, borderRadius: 14, backgroundColor: colors.surface },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  statusText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  errorCard: { flexDirection: "row", alignItems: "center", gap: 10 },
  errorText: { flex: 1, fontFamily: fonts.body, fontSize: 13, color: colors.textPrimary },
  field: { gap: 8 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textPrimary },
  detailCard: { gap: 6 },
  detailEyebrow: { ...eyebrow, color: colors.textSecondary },
  detailText: { fontFamily: fonts.body, fontSize: 14, color: colors.textPrimary },
  save: { marginTop: 8 },
});
