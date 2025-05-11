import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Container, Stack } from "@mui/material";
import { Buttons, navBarTitles } from "./consts";
import Link from "next/link";

const NavBar: React.FC = () => {
  return (
    <AppBar
      className="header"
      position="static"
      sx={{ backgroundColor: "#4caf50", py: 2 }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Stack>
            <Typography variant="h5" component="div">
              Sukkon
            </Typography>
          </Stack>
          <Stack sx={{ display: "flex", flexGrow: "1" }}>
            <Stack
              direction="row"
              spacing={4}
              sx={{ margin: "auto", padding: "1rem" }}
            >
              {navBarTitles.map((item) => (
                <Link href={item.title} key={item.key}>
                  <Typography
                    sx={{ flexGrow: 1, fontSize: "14px", fontWeight: "600" }}
                  >
                    {item.title}
                  </Typography>
                </Link>
              ))}
            </Stack>
          </Stack>
          <Stack direction="row" spacing={2}>
            {Buttons.map((item) => (
              <Button
                key={item.key}
                color="inherit"
                sx={{
                  py: 2,
                  px: 3,
                  border: "2px solid #fff",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {item.title}
              </Button>
            ))}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavBar;
