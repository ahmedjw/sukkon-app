"use client";

import { createTheme } from "@mui/material/styles";
import palette from "./palette";
// import typography from "./typography";

const theme = createTheme({
  palette,
  shape: {
    borderRadius: 8,
  },
});

export default theme;
