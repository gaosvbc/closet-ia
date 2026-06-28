import { useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

const ITEM_HEIGHT = 48;
const VISIBLE = 5; // odd number so there is a clear centre

// Vertical drum-roll picker. Snaps to ITEM_HEIGHT and reports the centred value.
export default function WheelPicker({
  values,
  value,
  onChange,
  unit,
}: {
  values: number[];
  value: number;
  onChange: (v: number) => void;
  unit: string;
}) {
  const listRef = useRef<FlatList<number>>(null);
  const selectedIndex = Math.max(0, values.indexOf(value));

  function onMomentumEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.min(values.length - 1, Math.max(0, idx));
    const next = values[clamped];
    if (next !== value) onChange(next);
  }

  const pad = (VISIBLE - 1) / 2;

  return (
    <View style={[styles.container, { height: ITEM_HEIGHT * VISIBLE }]}>
      {/* centre selection band */}
      <View
        pointerEvents="none"
        style={[styles.band, { top: ITEM_HEIGHT * pad, height: ITEM_HEIGHT }]}
      />
      <FlatList
        ref={listRef}
        data={values}
        keyExtractor={(v) => String(v)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        initialScrollIndex={selectedIndex}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        onMomentumScrollEnd={onMomentumEnd}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * pad }}
        renderItem={({ item }) => {
          const isSel = item === value;
          return (
            <View style={styles.item}>
              <Text style={isSel ? styles.selText : styles.idleText}>
                {item}
                {isSel ? ` ${unit}` : ""}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: "stretch", overflow: "hidden" },
  band: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  item: { height: ITEM_HEIGHT, alignItems: "center", justifyContent: "center" },
  selText: { fontFamily: fonts.bodySemibold, fontSize: 28, color: colors.textPrimary },
  idleText: { fontFamily: fonts.body, fontSize: 20, color: colors.textSecondary },
});
