'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Chip,
  Paper,
  Button,
  Grid,
  Divider,
  Avatar,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface UserDetailsModalProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  onViewPatients?: (user: any) => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  open,
  onClose,
  userId,
  onViewPatients,
}) => {
  const { showToast } = useToast();
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && userId) {
      loadUser();
    } else {
      setUser(null);
      setCopied(false);
    }
  }, [open, userId]);

  const loadUser = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await api.getUserById(userId);
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load user details', 'ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    showToast('User ID copied to clipboard', 'SUCCESS');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) return null;

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return { bg: 'rgba(217, 119, 6, 0.12)', text: '#d97706', border: 'rgba(217, 119, 6, 0.3)' };
      case 'TEAM':
        return { bg: 'rgba(37, 99, 235, 0.12)', text: '#2563eb', border: 'rgba(37, 99, 235, 0.3)' };
      case 'VOLUNTEER':
        return { bg: 'rgba(22, 163, 74, 0.12)', text: '#16a34a', border: 'rgba(22, 163, 74, 0.3)' };
      case 'PATIENT':
        return {
          bg: 'rgba(13, 148, 136, 0.12)',
          text: '#0d9488',
          border: 'rgba(13, 148, 136, 0.3)',
        };
      default:
        return {
          bg: 'rgba(124, 58, 237, 0.12)',
          text: '#7c3aed',
          border: 'rgba(124, 58, 237, 0.3)',
        };
    }
  };

  const roleStyles = getRoleColor(user?.role);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '14px',
          backgroundColor: 'background.paper',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '10px',
              backgroundColor: 'rgba(21, 86, 163, 0.12)',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PersonOutlineOutlinedIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              User Profile
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              System Account & Credential Details
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ borderRadius: '8px', border: 1, borderColor: 'divider' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {isLoading ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Loading user record...
            </Typography>
          </Box>
        ) : !user ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              User information not found.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Header Identity Card */}
            <Paper
              sx={{
                p: 2.5,
                borderRadius: '12px',
                border: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 52,
                    height: 52,
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    backgroundColor: 'primary.main',
                    color: '#ffffff',
                  }}
                >
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    @{user.username}
                  </Typography>
                </Box>
              </Box>

              <Chip
                label={user.role}
                size="medium"
                sx={{
                  fontWeight: 800,
                  fontSize: '0.8125rem',
                  borderRadius: '8px',
                  backgroundColor: roleStyles.bg,
                  color: roleStyles.text,
                  border: 1,
                  borderColor: roleStyles.border,
                  px: 1,
                }}
              />
            </Paper>

            {/* Details Grid */}
            <Grid container spacing={2}>
              {/* User ID */}
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: '10px',
                    border: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <FingerprintOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontWeight: 600 }}
                      >
                        System UUID
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontWeight: 600, wordBreak: 'break-all' }}
                      >
                        {user.id}
                      </Typography>
                    </Box>
                  </Box>
                  <Tooltip title={copied ? 'Copied!' : 'Copy UUID'} arrow>
                    <IconButton size="small" onClick={handleCopyId} sx={{ borderRadius: '6px' }}>
                      {copied ? (
                        <CheckCircleOutlineOutlinedIcon
                          sx={{ fontSize: 18, color: 'success.main' }}
                        />
                      ) : (
                        <ContentCopyOutlinedIcon sx={{ fontSize: 18 }} />
                      )}
                    </IconButton>
                  </Tooltip>
                </Paper>
              </Grid>

              {/* Account Role */}
              <Grid item xs={12} sm={6}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: '10px',
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <BadgeOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Access Role
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {user.role}
                  </Typography>
                </Paper>
              </Grid>

              {/* Account Created Date */}
              <Grid item xs={12} sm={6}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: '10px',
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <CalendarMonthOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Account Created
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user.created ? new Date(user.created).toLocaleString() : '—'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Volunteer Shortcut if Role is Volunteer */}
            {user.role === 'VOLUNTEER' && onViewPatients && (
              <Button
                variant="outlined"
                fullWidth
                startIcon={<VolunteerActivismOutlinedIcon />}
                onClick={() => {
                  onClose();
                  onViewPatients(user);
                }}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1,
                  borderColor: 'rgba(21, 86, 163, 0.3)',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(21, 86, 163, 0.08)',
                  },
                }}
              >
                View Patients Registered by this Volunteer
              </Button>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3, borderTop: 1, borderColor: 'divider' }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
