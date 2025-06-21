"use client"

import { Box, Container, Stack, Typography } from '@mui/material'
import React from 'react'
import { Feature } from '../Feature/Feature'
import { styles } from './Features.style'

export const Features: React.FC = () => {
    return (
        <Container id="features" className="features section">
            <Box >
                <Stack  >
                    <Box sx={styles.FeatureTitleBox}>
                        <Typography variant='h5' color="primary" fontWeight="bold" >Features</Typography>
                        <Typography variant='h4' sx={styles.FeatureTitle}>
                            Your Experience Gets Better And Better Over Time.
                        </Typography>
                        <Typography variant='body1' >
                            There are many variations of passages of Lorem Ipsum available,
                            but the majority have suffered alteration in some form.
                        </Typography>
                    </Box>
                </Stack>
                <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 1, sm: 2 }} sx={styles.FeaturesBox} className="wow fadeInUp"
                >
                    <Feature title="Therapists" content="find the best Therapiests across your contry" />
                    <Feature title="Sessions" content="Explore diffrent sessions for mental health" />
                    <Feature title="Community" content="expolre our Community and participate with your thoughts" />
                </Stack>
                <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 1, sm: 2 }} sx={styles.FeaturesBox}>
                    <Feature title="Podcasts" content="Explore diffrent Podcasts in our platform" />
                    <Feature title="doctors Ads" content="grow with your skills as a doctor and reach a lot of customers" />
                    <Feature title="clinic managment system" content="reach out to a managment system for your clinic actions" />
                </Stack>
            </Box>
        </Container >
    )
}
