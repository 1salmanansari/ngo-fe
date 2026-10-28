'use client';

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { LoginView } from '../views/LoginView';
import { AppLayout } from '../components/layout/AppLayout';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          backgroundColor: 'background.default',
        }}
      >
        <CircularProgress size={42} color="primary" />
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          Initializing Pragati Camp Security Session...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return <AppLayout />;
}
