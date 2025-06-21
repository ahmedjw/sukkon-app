"use client"

import { Components } from "@mui/material/styles";

const components: Components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        textTransform: "none",
      },
    },
  },
};

export default components;
