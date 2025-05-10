import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Container, Stack } from "@mui/material";

const Navbar = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#4caf50", py: 2 }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" component="div">
            Sukkon
          </Typography>
          <Stack direction="row" spacing={4}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Home
            </Typography>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Features
            </Typography>{" "}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Overview
            </Typography>{" "}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Team
            </Typography>{" "}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Contact us
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button color="inherit" sx={{ py: 2, px: 3 }}>
              Login
            </Button>
            <Button color="inherit" sx={{ py: 2, px: 3 }}>
              Get It Now
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
