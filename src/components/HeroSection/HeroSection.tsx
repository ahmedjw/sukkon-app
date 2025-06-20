import React from "react";
import { Button, Container, Stack, Typography, Box } from "@mui/material";
import {
  heroSectionStyles,
  typographyStyles,
  buttonStyles,
  imageStyles,
  containerStyles,
  textSectionStyles,
  imageSectionStyles,
  buttonIconStyle,
} from "./HeroSection.style";

const HeroSection: React.FC = () => {
  return (
    <Stack id="home" sx={heroSectionStyles}>
      <Container maxWidth="lg">
        <Box sx={containerStyles}>
          {/* Text Section */}
          <Box sx={textSectionStyles}>
            <Stack spacing={3}>
              <Typography
                variant="h3"
                fontWeight={800}
                sx={{
                  ...typographyStyles,
                  fontSize: { xs: "28px", sm: "32px", md: "38px" },
                  lineHeight: { xs: "38px", md: "50px" },
                  textTransform: "capitalize",
                }}
              >
                A powerful app for your mental health.
              </Typography>
              <Typography variant="body1" sx={typographyStyles}>
                From open source to pro services, Sukkon helps you to build,
                deploy, test, and monitor apps.
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button href="#" variant="outlined" sx={buttonStyles}>
                  <i className="fas fa-apple-alt" style={buttonIconStyle} />
                  App Store
                </Button>
                <Button href="#" variant="outlined" sx={buttonStyles}>
                  <i className="lni lni-play-store" style={buttonIconStyle} />
                  Google Play
                </Button>
              </Stack>
            </Stack>
          </Box>

          {/* Image Section */}
          <Box sx={imageSectionStyles}>
            <Box
              component="img"
              src="images/hero/phone.png"
              alt="App"
              sx={imageStyles}
            />
          </Box>
        </Box>
      </Container>
    </Stack>
  );
};

export default HeroSection;
