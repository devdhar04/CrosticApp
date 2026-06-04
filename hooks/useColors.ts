import { useColorScheme } from "react-native";

import colors from "@/constants/colors";
import { useGame } from "@/context/GameContext";

/**
 * Returns the design tokens for the current color scheme.
 *
 * The returned object contains all color tokens for the active palette
 * plus scheme-independent values like `radius`.
 *
 * Respects the user's dark mode setting from GameContext:
 * - null: Use system default
 * - true: Force dark mode
 * - false: Force light mode
 */
export function useColors() {
  const systemScheme = useColorScheme();
  const { settings } = useGame();

  // Determine the effective scheme based on user setting
  const effectiveScheme =
    settings.darkMode === null
      ? systemScheme  // Use system default
      : settings.darkMode
        ? "dark"      // User forced dark mode
        : "light";    // User forced light mode

  const palette =
    effectiveScheme === "dark" && "dark" in colors
      ? (colors as Record<string, typeof colors.light>).dark
      : colors.light;
  return { ...palette, radius: colors.radius };
}
