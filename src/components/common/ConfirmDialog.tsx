'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
  confirmLabel?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onClose,
  isLoading = false,
  confirmLabel = 'Delete',
}) => {
  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
          maxWidth: 420,
          backgroundColor: 'background.paper',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WarningAmberRoundedIcon />
        </Box>
        <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{title}</span>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={isLoading}
          variant="outlined"
          sx={{ borderColor: 'divider', color: 'text.secondary' }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          variant="contained"
          color="error"
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ px: 2.5, fontWeight: 600 }}
        >
          {isLoading ? 'Deleting...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
