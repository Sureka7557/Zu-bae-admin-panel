import { COLORS } from "../constants/COLORS";
import { FONTS } from "../constants/FONTS";

export const clerkAppearance = {
  variables: {
    colorPrimary: COLORS.primary,
    colorText: COLORS.text,
    colorTextSecondary: COLORS.textSecondary,
    colorBackground: COLORS.card,
    colorInputBackground: COLORS.cardWarm,
    colorInputText: COLORS.text,
    colorDanger: COLORS.danger,
    colorSuccess: COLORS.success,
    fontFamily: FONTS.body,
    fontFamilyButtons: FONTS.bodyMedium,
    borderRadius: "0.625rem",
  },
  elements: {
    rootBox: { width: "100%" },
    cardBox: {
      width: "100%",
      maxWidth: "420px",
      border: `1px solid ${COLORS.border}`,
      borderRadius: "1rem",
      boxShadow: "0 12px 28px rgba(32,16,15,0.10), 0 4px 8px rgba(32,16,15,0.06)",
    },
    card: { boxShadow: "none" },
    headerTitle: {
      fontFamily: FONTS.headingSemiBold,
      fontWeight: 600,
      color: COLORS.primary,
    },
    headerSubtitle: { color: COLORS.textMuted },
    formFieldLabel: { color: COLORS.textSecondary, fontWeight: 500 },
    formFieldInput: {
      border: `1px solid ${COLORS.border}`,
      backgroundColor: COLORS.cardWarm,
      boxShadow: "none",
      "&:focus": {
        borderColor: COLORS.gold,
        boxShadow: "0 0 0 3px rgba(200,164,107,0.28)",
      },
    },
    formButtonPrimary: {
      backgroundColor: COLORS.primary,
      color: COLORS.cream,
      textTransform: "none",
      fontWeight: 500,
      boxShadow: "0 1px 3px rgba(32,16,15,0.12)",
      "&:hover, &:focus, &:active": { backgroundColor: COLORS.burgundy },
    },
    socialButtonsBlockButton: {
      border: `1px solid ${COLORS.border}`,
      backgroundColor: COLORS.card,
      "&:hover": { backgroundColor: COLORS.cardWarm },
    },
    dividerLine: { backgroundColor: COLORS.border },
    dividerText: { color: COLORS.textMuted },
    footerActionText: { color: COLORS.textMuted },
    footerActionLink: {
      color: COLORS.primary,
      fontWeight: 500,
      "&:hover": { color: COLORS.burgundy },
    },
    identityPreviewEditButton: { color: COLORS.primary },
  },
} as const;
