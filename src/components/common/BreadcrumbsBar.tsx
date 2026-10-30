'use client';

import React from 'react';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbsBarProps {
  items: BreadcrumbItem[];
  onHomeClick?: () => void;
}

export const BreadcrumbsBar: React.FC<BreadcrumbsBarProps> = ({ items, onHomeClick }) => {
  return (
    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
      <Breadcrumbs
        separator={
          <NavigateNextIcon fontSize="small" sx={{ color: 'text.secondary', opacity: 0.6 }} />
        }
        aria-label="breadcrumb"
        sx={{
          fontSize: '0.8125rem',
          '& .MuiBreadcrumbs-ol': {
            alignItems: 'center',
          },
        }}
      >
        <Box
          onClick={onHomeClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: onHomeClick ? 'pointer' : 'default',
            color: 'text.secondary',
            textDecoration: 'none',
            fontWeight: 500,
            '&:hover': onHomeClick
              ? {
                  color: 'primary.main',
                }
              : {},
          }}
        >
          <HomeOutlinedIcon sx={{ fontSize: '1.1rem' }} />
          <span>Home</span>
        </Box>

        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.active;
          return isLast ? (
            <Typography
              key={index}
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'text.primary',
              }}
            >
              {item.label}
            </Typography>
          ) : (
            <Link
              key={index}
              underline="hover"
              onClick={item.onClick}
              sx={{
                fontSize: '0.8125rem',
                color: 'text.secondary',
                cursor: item.onClick ? 'pointer' : 'default',
                fontWeight: 500,
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};
