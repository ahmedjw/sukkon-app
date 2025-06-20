import { SxProps, Theme } from "@mui/material";

export const heroSectionStyles: SxProps<Theme> = {
  backgroundColor: "#4caf50",
  py: { xs: 6, md: 10 },
};

export const typographyStyles: SxProps<Theme> = {
  color: "#fff",
  textShadow: "0px 3px 8px #00000017",
};

export const buttonStyles: SxProps<Theme> = {
  color: "#fff",
  borderColor: "#fff",
  fontWeight: 600,
  px: 3,
  py: 1.5,
  fontSize: "14px",
};

export const imageStyles: SxProps<Theme> = {
  maxWidth: 536,
  width: "100%",
  height: "auto",
};

export const containerStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  alignItems: "center",
  justifyContent: "space-between",
  gap: 4,
};

export const textSectionStyles: SxProps<Theme> = {
  flex: 1,
};

export const imageSectionStyles: SxProps<Theme> = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
};

export const buttonIconStyle: React.CSSProperties = {
  marginRight: 8,
};
