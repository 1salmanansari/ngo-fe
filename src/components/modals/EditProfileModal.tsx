'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const EditProfileModal: React.FC = () => {
  const { user, isProfileModalOpen, closeProfileModal, updateCurrentUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && isProfileModalOpen) {
      setName(user.name || '');
      setPassword('');
      setError('');
    }
  }, [user, isProfileModalOpen]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (name.trim().length < 3) {
      setError('Name must be at least 3 characters.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (!user) return;
      const payload: any = { name: name.trim() };
      if (password.trim()) {
        payload.password = password.trim();
      }

      const res = await api.updateUser(user.id, payload);
      if (res.success) {
        updateCurrentUser({ name: name.trim() });
        showToast('Profile updated successfully!', 'SUCCESS');
        closeProfileModal();
      } else {
        setError(res.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isProfileModalOpen) return null;

  return (
    <Dialog
      open={isProfileModalOpen}
      onClose={isSaving ? undefined : closeProfileModal}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: 'background.paper',
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
              width: 40,
              height: 40,
              borderRadius: 2,
              backgroundColor: 'rgba(21, 86, 163, 0.1)',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PersonOutlineIcon />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Edit Profile
          </Typography>
        </Box>
        <IconButton
          onClick={closeProfileModal}
          size="small"
          sx={{ borderRadius: 1.5, border: 1, borderColor: 'divider' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          label="Username"
          value={user?.username || ''}
          disabled
          fullWidth
          size="small"
          helperText="Username cannot be changed."
          sx={{ mt: 1 }}
        />

        <TextField
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          size="small"
          placeholder="e.g. Salman Ansari"
          error={!!error && !name.trim()}
        />

        <TextField
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          size="small"
          placeholder="Leave blank to keep unchanged"
        />

        {error && (
          <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: 1, borderColor: 'divider', gap: 1 }}>
        <Button
          onClick={closeProfileModal}
          disabled={isSaving}
          variant="outlined"
          sx={{ borderColor: 'divider', color: 'text.secondary' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          variant="contained"
          startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            fontWeight: 600,
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          {isSaving ? 'Saving...' : 'Save Profile'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
