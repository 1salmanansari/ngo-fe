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
  TablePagination,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { api } from '../../services/api';
import { usePatientModal } from '../../context/PatientModalContext';

interface PharmacyLogsModalProps {
  open: boolean;
  onClose: () => void;
  medicine: any | null;
}

export const PharmacyLogsModal: React.FC<PharmacyLogsModalProps> = ({
  open,
  onClose,
  medicine,
}) => {
  const { openPatientProfile } = usePatientModal();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (open && medicine) {
      loadLogs();
    } else {
      setLogs([]);
      setPage(0);
      setTotal(0);
    }
  }, [open, medicine, page, limit]);

  const loadLogs = async () => {
    if (!medicine) return;
    setIsLoading(true);
    try {
      const medsRes = await api.getPrescriptions({
        pharmacyId: medicine.id,
        page: page + 1,
        limit,
      });
      setLogs(medsRes.data || []);
      setTotal(medsRes.pagination?.total ?? (medsRes.data || []).length);
    } catch (err) {
      console.error('Failed to load pharmacy logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open || !medicine) return null;

  // Flatten items that match this medicine.id
  const flattenedTransactions: any[] = [];
  logs.forEach((prescription) => {
    (prescription.data || []).forEach((item: any) => {
      if (item.id === medicine.id) {
        flattenedTransactions.push({
          patientId: prescription.patientId,
          patientName: prescription.patientName,
          qty: item.qty,
          doctorId: prescription.doctorId,
          doctorName: prescription.doctorName,
          date: prescription.created,
        });
      }
    });
  });

  const totalDispensed = flattenedTransactions.reduce((acc, t) => acc + (t.qty || 0), 0);

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
              borderRadius: 2.5,
              backgroundColor: 'rgba(25, 136, 71, 0.12)',
              color: '#198847',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ReceiptLongOutlinedIcon />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {medicine.name} — Distribution Logs
              </Typography>
              <Chip
                label={`Stock: ${medicine.qty} left`}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  backgroundColor: 'rgba(21, 86, 163, 0.1)',
                  color: 'primary.main',
                }}
              />
              <Chip
                label={`Dispensed: ${totalDispensed} units`}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  backgroundColor: 'rgba(25, 136, 71, 0.1)',
                  color: '#198847',
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Real-time patient transaction ledger
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
              Loading pharmacy dispensing history...
            </Typography>
          </Box>
        ) : flattenedTransactions.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              No dispensing transactions recorded for {medicine.name} yet.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer
              component={Paper}
              sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell align="center">Quantity Dispensed</TableCell>
                    <TableCell>Prescribing Doctor</TableCell>
                    <TableCell align="right">Date & Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {flattenedTransactions.map((tx, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>
                        <Chip
                          label={
                            tx.patientName
                              ? `${tx.patientName} (#${tx.patientId})`
                              : `Patient #${tx.patientId}`
                          }
                          size="small"
                          onClick={() => {
                            onClose();
                            openPatientProfile(tx.patientId);
                          }}
                          sx={{
                            fontWeight: 600,
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
                      <TableCell align="center">
                        <Chip
                          label={`${tx.qty} units`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            backgroundColor: 'rgba(25, 136, 71, 0.12)',
                            color: '#198847',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {tx.doctorName || (tx.doctorId ? `Dr. #${tx.doctorId}` : 'Camp Doctor')}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}
                      >
                        {new Date(tx.date).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={limit}
              onRowsPerPageChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
              sx={{ borderTop: 1, borderColor: 'divider', mt: 1 }}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
