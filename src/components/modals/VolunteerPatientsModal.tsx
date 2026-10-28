'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
  Paper,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { api } from '../../services/api';
import { usePatientModal } from '../../context/PatientModalContext';

interface VolunteerPatientsModalProps {
  open: boolean;
  onClose: () => void;
  volunteer: any | null;
}

export const VolunteerPatientsModal: React.FC<VolunteerPatientsModalProps> = ({
  open,
  onClose,
  volunteer,
}) => {
  const { openPatientProfile } = usePatientModal();
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && volunteer) {
      loadPatients();
    } else {
      setPatients([]);
    }
  }, [open, volunteer]);

  const loadPatients = async () => {
    if (!volunteer) return;
    setIsLoading(true);
    try {
      // Query patients where author matches volunteer id or username
      const res = await api.getPatients({
        author: volunteer.username || volunteer.id,
        limit: 100,
      });
      setPatients(res.data || []);
    } catch (err) {
      console.error('Failed to load volunteer patients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open || !volunteer) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: 'background.paper',
          overflow: 'hidden',
          minHeight: 460,
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
              width: 44,
              height: 44,
              borderRadius: 2,
              backgroundColor: 'rgba(21, 86, 163, 0.12)',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <VolunteerActivismOutlinedIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {volunteer.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Volunteer username: @{volunteer.username} • Total Patients:{' '}
              {volunteer.patientCount || patients.length}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {isLoading ? (
          <Box
            sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
          >
            <CircularProgress size={32} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Loading registered patients...
            </Typography>
          </Box>
        ) : patients.length === 0 ? (
          <Box
            sx={{
              py: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'rgba(0, 0, 0, 0.03)',
                color: 'text.secondary',
              }}
            >
              <InboxOutlinedIcon sx={{ fontSize: 32, opacity: 0.7 }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
              No patients handled yet
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', maxWidth: 360, textAlign: 'center' }}
            >
              This volunteer has not registered any patients at the camp yet.
            </Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Patient ID</TableCell>
                  <TableCell>Patient Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell align="right">Registered On</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patients.map((p, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>
                      <Chip
                        label={`#${p.patientId}`}
                        size="small"
                        onClick={() => {
                          onClose();
                          openPatientProfile(p.patientId);
                        }}
                        sx={{
                          fontWeight: 700,
                          cursor: 'pointer',
                          backgroundColor: 'rgba(21, 86, 163, 0.1)',
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.main',
                            color: '#ffffff',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                    <TableCell>{p.department}</TableCell>
                    <TableCell>{p.mobile}</TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}
                    >
                      {new Date(p.created).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
};
