'use client';

import React from 'react';
import { Box, Typography, Tooltip, IconButton, Chip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface PageHeaderProps {
  title: string;
  count?: number;
  countLabel?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  extraActions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  count,
  countLabel,
  onRefresh,
  isRefreshing = false,
  extraActions,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2.5,
        flexWrap: 'wrap',
        gap: 1.5,
      }}
    >
      {/* Left side: Container Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Right side: Count with Tooltip on hover showing label & refresh icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {extraActions}

        {count !== undefined && (
          <Tooltip title={countLabel || `Total Count: ${count}`} arrow placement="top">
            <Chip
              label={`${count} items`}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: '0.8125rem',
                height: 28,
                px: 0.5,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(21, 86, 163, 0.25)'
                    : 'rgba(21, 86, 163, 0.1)',
                color: 'primary.main',
                border: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(21, 86, 163, 0.4)'
                    : 'rgba(21, 86, 163, 0.2)',
                cursor: 'pointer',
              }}
            />
          </Tooltip>
        )}

        {onRefresh && (
          <Tooltip title="Refresh Data" arrow placement="top">
            <IconButton
              onClick={onRefresh}
              disabled={isRefreshing}
              size="small"
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                p: 0.75,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                },
              }}
            >
              <RefreshIcon
                fontSize="small"
                sx={{
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};
