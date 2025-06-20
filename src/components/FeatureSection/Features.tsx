import { Box, Container, Stack, Typography } from '@mui/material'
import React from 'react'
import { Feature } from '../Feature/Feature'

export const Features: React.FC = () => {
    return (
        <Container id="features" className="features section">
            <Box >
                <Stack  >
                    <Box sx={{ textAlign: "center", marginBottom: "50px", marginTop: "50px" }}>
                        <Typography variant='h5' color="text.primary" fontWeight="bold" >Features</Typography>
                        <Typography variant='h4' sx={{ fontWeight: 600, marginTop: "20px" }}>
                            Your Experience Gets Better And Better Over Time.
                        </Typography>
                        <Typography variant='body1' >
                            There are many variations of passages of Lorem Ipsum available,
                            but the majority have suffered alteration in some form.
                        </Typography>
                    </Box>
                </Stack>
                <Box className="row">
                    <Feature title="Therapists" content="find the best Therapiests across your contry" />
                    <Feature title="Sessions" content="Explore diffrent sessions for mental health" />
                    <Feature title="Community" content="expolre our Community and participate with your thoughts" />
                    <Feature title="Podcasts" content="Explore diffrent Podcasts in our platform" />
                    <Feature title="doctors Ads" content="grow with your skills as a doctor and reach a lot of customers" />
                    <Feature title="clinic managment system" content="reach out to a managment system for your clinic actions" />
                </Box>
            </Box>
        </Container >
    )
}
