'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Tooltip,
  Alert,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../theme/ThemeContext';
import { useToast } from '../context/ToastContext';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { mode, toggleTheme } = useAppTheme();
  const { showToast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(username.trim(), password.trim());
      showToast('Welcome back to Pragati Foundation Admin Portal!', 'SUCCESS');
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        p: 2,
        position: 'relative',
      }}
    >
      {/* Top-Right Theme Toggle */}
      <Box sx={{ position: 'absolute', top: 20, right: 24 }}>
        <Tooltip title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} mode`} arrow>
          <IconButton
            onClick={toggleTheme}
            sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}
          >
            {mode === 'dark' ? <Brightness7Icon sx={{ color: '#f59e0b' }} /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Main Login Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3.5, sm: 4.5 },
          width: '100%',
          maxWidth: 420,
          borderRadius: 3.5,
          border: (theme) =>
            theme.palette.mode === 'dark'
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(0,0,0,0.06)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 12px 40px rgba(0,0,0,0.4)'
              : '0 8px 30px rgba(15, 23, 42, 0.08)',
        }}
      >
        {/* Logo and Brand */}
        <Box sx={{ textAlign: 'center', mb: 3.5 }}>
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: 3,
              backgroundColor: 'primary.main',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              boxShadow: '0 8px 20px rgba(21, 86, 163, 0.3)',
            }}
          >
            <LocalHospitalRoundedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
            Pragati Foundation
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Medical Camp Operations Admin Panel
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, fontSize: '0.8125rem' }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Username"
            placeholder="e.g. admin"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError('');
            }}
            required
            fullWidth
            size="medium"
            autoFocus
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            required
            fullWidth
            size="medium"
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? (
                      <VisibilityOff fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading || !username.trim() || !password.trim()}
            startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{
              mt: 1,
              py: 1.3,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: '0.95rem',
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            {isLoading ? 'Signing In...' : 'Sign In to Admin Panel'}
          </Button>

          {/* Quick Credential Hint */}
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              border: 1,
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Default Camp Credentials:
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Username: <code>admin</code> • Password: <code>admin</code>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
