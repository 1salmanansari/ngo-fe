'use client';

import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert, IconButton, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export type ToastType = 'SUCCESS' | 'ERROR' | 'ALERT';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  hideToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('SUCCESS');

  const showToast = (msg: string, toastType: ToastType = 'SUCCESS') => {
    setMessage(msg);
    setType(toastType);
    setOpen(true);
  };

  const hideToast = () => {
    setOpen(false);
  };

  const getAlertProps = () => {
    switch (type) {
      case 'SUCCESS':
        return {
          severity: 'success' as const,
          icon: <CheckCircleOutlineIcon sx={{ color: '#10b981' }} />,
          bg: '#064e3b',
          border: '1px solid #059669',
        };
      case 'ERROR':
        return {
          severity: 'error' as const,
          icon: <ErrorOutlineIcon sx={{ color: '#ef4444' }} />,
          bg: '#450a0a',
          border: '1px solid #b91c1c',
        };
      case 'ALERT':
      default:
        return {
          severity: 'warning' as const,
          icon: <WarningAmberIcon sx={{ color: '#f59e0b' }} />,
          bg: '#451a03',
          border: '1px solid #d97706',
        };
    }
  };

  const alertStyle = getAlertProps();

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={2500}
        onClose={hideToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{ mb: 2, ml: 2, zIndex: 99999 }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            py: 1.25,
            px: 2,
            minWidth: 280,
            maxWidth: 420,
            borderRadius: 2.5,
            backgroundColor: alertStyle.bg,
            border: alertStyle.border,
            color: '#ffffff',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          }}
        >
          {alertStyle.icon}
          <Typography sx={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{message}</Typography>
          <IconButton
            size="small"
            onClick={hideToast}
            sx={{ color: 'rgba(255,255,255,0.7)', p: 0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Snackbar>
    </ToastContext.Provider>
  );
};
