'use client';

import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface RightSidebarDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onSave?: () => void;
  saveLabel?: string;
  isSaving?: boolean;
  isSaveDisabled?: boolean;
  hideFooter?: boolean;
  width?: number | string;
}

export const RightSidebarDrawer: React.FC<RightSidebarDrawerProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  onSave,
  saveLabel = 'Save Changes',
  isSaving = false,
  isSaveDisabled = false,
  hideFooter = false,
  width = 440,
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={isSaving ? undefined : onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: width },
          maxWidth: '100vw',
          backgroundColor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.18)',
        },
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton
          onClick={onClose}
          disabled={isSaving}
          size="small"
          sx={{
            borderRadius: 1.5,
            border: 1,
            borderColor: 'divider',
            color: 'text.secondary',
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Drawer Content */}
      <Box
        sx={{
          p: 3,
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        {children}
      </Box>

      {/* Drawer Footer Actions */}
      {!hideFooter && (
        <Box
          sx={{
            p: 2.5,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1.5,
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isSaving}
            sx={{
              borderColor: 'divider',
              color: 'text.secondary',
              px: 2.5,
              '&:hover': {
                borderColor: 'text.primary',
                backgroundColor: 'action.hover',
              },
            }}
          >
            Close
          </Button>
          {onSave && (
            <Button
              variant="contained"
              onClick={onSave}
              disabled={isSaving || isSaveDisabled}
              startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{
                px: 3,
                fontWeight: 600,
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              {isSaving ? 'Saving...' : saveLabel}
            </Button>
          )}
        </Box>
      )}
    </Drawer>
  );
};
