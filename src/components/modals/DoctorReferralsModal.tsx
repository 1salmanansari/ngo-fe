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
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import { api } from '../../services/api';
import { usePatientModal } from '../../context/PatientModalContext';

interface DoctorReferralsModalProps {
  open: boolean;
  onClose: () => void;
  doctor: any | null;
}

export const DoctorReferralsModal: React.FC<DoctorReferralsModalProps> = ({
  open,
  onClose,
  doctor,
}) => {
  const { openPatientProfile } = usePatientModal();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && doctor) {
      loadReferrals();
    } else {
      setReferrals([]);
    }
  }, [open, doctor]);

  const loadReferrals = async () => {
    if (!doctor) return;
    setIsLoading(true);
    try {
      const res = await api.getReferrals({ doctorId: doctor.doctorId, limit: 100 });
      setReferrals(res.data || []);
    } catch (err) {
      console.error('Error fetching doctor referrals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open || !doctor) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '14px',
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
              borderRadius: 2.5,
              backgroundColor: 'rgba(21, 86, 163, 0.12)',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AssignmentIndOutlinedIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Dr. {doctor.firstName} {doctor.lastName} — Referrals
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {doctor.department} • {doctor.degree} • {doctor.hospital || 'Camp Doctor'}
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
              Loading referrals for Dr. {doctor.firstName}...
            </Typography>
          </Box>
        ) : referrals.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              No patient referrals issued by Dr. {doctor.firstName} {doctor.lastName} yet.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {referrals.map((item, idx) => (
              <Paper
                key={item.id || idx}
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  border: 1,
                  borderColor: 'divider',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1.5,
                    flexWrap: 'wrap',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Patient:
                    </Typography>
                    <Chip
                      label={
                        item.patientName
                          ? `${item.patientName} (#${item.patientId})`
                          : `Patient #${item.patientId}`
                      }
                      size="small"
                      onClick={() => {
                        onClose();
                        openPatientProfile(item.patientId);
                      }}
                      sx={{
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: 'primary.main',
                        color: '#ffffff',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {new Date(item.created).toLocaleString()}
                  </Typography>
                </Box>

                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Disease / Clinical Referral Reason:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1.5 }}>
                  {item.description}
                </Typography>

                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Contact & Follow-up Details:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {item.details}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
