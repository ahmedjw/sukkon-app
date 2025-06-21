"use client"

import { Box, Typography } from '@mui/material'
import React from 'react'
import { FeatureProps } from './Feature.interface'
import { styles } from './Feature.style'

export const Feature: React.FC<FeatureProps> = ({ title, content }) => {
    return (
        <Box sx={styles.Feature} className="wow fadeInUp">
            <Box className="single-feature wow fadeInUp" >
                <i className="lni lni-cloud-upload" ></i>
                <Typography variant='h6'>{title}</Typography>
                <Typography variant='caption'>{content}</Typography>
            </Box>
        </Box>
    )
}
