import { Stack } from "expo-router";
import { useColors } from "@/hooks/useColors";

export default function PuzzleLayout() {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        headerTitleStyle: {
          fontFamily: "Inter_700Bold",
          fontSize: 16,
        },
        headerShadowVisible: false,
        animation: "slide_from_right",
      }}
    />
  );
}
