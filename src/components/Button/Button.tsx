import React from "react";
import Button from "@mui/material/Button";

const AppButton: React.FC<any> = ({ variant = "primary", children, ...props }) => {
  const styles = {
    primary: {
      variant: "contained",
      sx: {
        backgroundColor: "primary.main",
        color: "white",
        "&:hover": {
          backgroundColor: "primary.dark",
        },
      },
    },
    outlined: {
      variant: "outlined",
      sx: {
        color: "primary.main",
        borderColor: "primary.main",
        "&:hover": {
          borderColor: "primary.dark",
          backgroundColor: "primary.light",
        },
      },
    },
    whiteBorder: {
      variant: "outlined",
      sx: {
        color: "white",
        borderColor: "white",
        "&:hover": {
          backgroundColor: "rgba(255,255,255,0.1)",
          borderColor: "white",
        },
      },
    },
  };

  const style = styles[variant] || styles.primary;

  return (
    <Button variant={style.variant} sx={style.sx} {...props}>
      {children}
    </Button>
  );
};

export default AppButton;
