import { Box, Typography } from '@mui/material'
import React from 'react'
import { FeatureProps } from './Feature.interface'

export const Feature: React.FC<FeatureProps> = ({ title, content }) => {
    return (
        <Box className="col-lg-4 col-md-6 col-12">
            <Box className="single-feature wow fadeInUp" >
                <i className="lni lni-cloud-upload"></i>
                <Typography variant='h3'>{title}</Typography>
                <Typography variant='body1'>{content}</Typography>
            </Box>
        </Box>
    )
}
