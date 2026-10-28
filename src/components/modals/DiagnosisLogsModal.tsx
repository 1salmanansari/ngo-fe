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
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import { api } from '../../services/api';
import { usePatientModal } from '../../context/PatientModalContext';

interface DiagnosisLogsModalProps {
  open: boolean;
  onClose: () => void;
  diagnosis: any | null;
}

export const DiagnosisLogsModal: React.FC<DiagnosisLogsModalProps> = ({
  open,
  onClose,
  diagnosis,
}) => {
  const { openPatientProfile } = usePatientModal();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (open && diagnosis) {
      loadLogs();
    } else {
      setLogs([]);
      setPage(0);
      setTotal(0);
    }
  }, [open, diagnosis, page, limit]);

  const loadLogs = async () => {
    if (!diagnosis) return;
    setIsLoading(true);
    try {
      const testsRes = await api.getTests({
        diagnosisId: diagnosis.id,
        page: page + 1,
        limit,
      });
      setLogs(testsRes.data || []);
      setTotal(testsRes.pagination?.total ?? (testsRes.data || []).length);
    } catch (err) {
      console.error('Failed to load diagnosis logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open || !diagnosis) return null;

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
              backgroundColor: 'rgba(21, 86, 163, 0.12)',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ScienceOutlinedIcon />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {diagnosis.name} — Order Logs
              </Typography>
              <Chip
                label={`Total: ${logs.length} orders`}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  backgroundColor: 'rgba(21, 86, 163, 0.1)',
                  color: 'primary.main',
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Laboratory diagnostic investigation audit trail
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
              Loading test investigation orders...
            </Typography>
          </Box>
        ) : logs.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              No patients have been ordered for {diagnosis.name} yet.
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
                    <TableCell>Prescribing Doctor</TableCell>
                    <TableCell align="right">Date & Time Ordered</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((item, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>
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
                            backgroundColor: 'rgba(21, 86, 163, 0.1)',
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'primary.main',
                              color: '#ffffff',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {item.doctorName ||
                          (item.doctorId ? `Dr. #${item.doctorId}` : 'Camp Doctor')}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}
                      >
                        {new Date(item.created).toLocaleString()}
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
