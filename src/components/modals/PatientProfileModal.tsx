'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { api } from '../../services/api';
import { usePatientModal } from '../../context/PatientModalContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const PatientProfileModal: React.FC = () => {
  const { selectedPatientId, isOpen, closePatientProfile } = usePatientModal();
  const [tabIndex, setTabIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [patient, setPatient] = useState<any>(null);

  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [prescriptionsLoaded, setPrescriptionsLoaded] = useState(false);

  const [tests, setTests] = useState<any[]>([]);
  const [testsLoaded, setTestsLoaded] = useState(false);

  const [referrals, setReferrals] = useState<any[]>([]);
  const [referralsLoaded, setReferralsLoaded] = useState(false);

  const [doctorMap, setDoctorMap] = useState<Record<number, string>>({});
  const [pharmacyMap, setPharmacyMap] = useState<Record<string, string>>({});
  const [diagnosisMap, setDiagnosisMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && selectedPatientId) {
      loadPatientData(selectedPatientId);
    } else {
      setPatient(null);
      setPrescriptions([]);
      setPrescriptionsLoaded(false);
      setTests([]);
      setTestsLoaded(false);
      setReferrals([]);
      setReferralsLoaded(false);
      setTabIndex(0);
    }
  }, [isOpen, selectedPatientId]);

  const loadPatientData = async (pid: number) => {
    setIsLoading(true);
    try {
      const patientRes = await api.getPatientById(pid);
      if (patientRes.success) {
        setPatient(patientRes.data);
      }
    } catch (err) {
      console.error('Failed to load patient profile data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = async (_e: React.SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex);
    if (!patient || !selectedPatientId) return;

    // Tab 2: PRESCRIPTION
    if (newIndex === 2 && !prescriptionsLoaded && patient.hasMeds) {
      setIsTabLoading(true);
      try {
        const [prescRes, pharmRes, docRes] = await Promise.all([
          api.getPrescriptions({ patientId: selectedPatientId, limit: 50 }),
          Object.keys(pharmacyMap).length === 0
            ? api.getPharmacy({ limit: 200 }).catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] }),
          Object.keys(doctorMap).length === 0
            ? api.getDoctors({ limit: 100 }).catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] }),
        ]);

        if (pharmRes.data && pharmRes.data.length > 0) {
          const pMap: Record<string, string> = { ...pharmacyMap };
          pharmRes.data.forEach((p: any) => {
            pMap[p.id] = p.name;
          });
          setPharmacyMap(pMap);
        }

        if (docRes.data && docRes.data.length > 0) {
          const dMap: Record<number, string> = { ...doctorMap };
          docRes.data.forEach((d: any) => {
            dMap[d.doctorId] = `Dr. ${d.firstName} ${d.lastName}`;
          });
          setDoctorMap(dMap);
        }

        setPrescriptions(prescRes.data || []);
        setPrescriptionsLoaded(true);
      } catch (err) {
        console.error('Failed to load prescriptions tab:', err);
      } finally {
        setIsTabLoading(false);
      }
    }

    // Tab 3: DIAGNOSIS / TESTS
    if (newIndex === 3 && !testsLoaded && patient.hasTest) {
      setIsTabLoading(true);
      try {
        const [testsRes, diagRes, docRes] = await Promise.all([
          api.getTests({ patientId: selectedPatientId, limit: 50 }),
          Object.keys(diagnosisMap).length === 0
            ? api.getDiagnosis({ limit: 100 }).catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] }),
          Object.keys(doctorMap).length === 0
            ? api.getDoctors({ limit: 100 }).catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] }),
        ]);

        if (diagRes.data && diagRes.data.length > 0) {
          const dgMap: Record<string, string> = { ...diagnosisMap };
          diagRes.data.forEach((dg: any) => {
            dgMap[dg.id] = dg.name;
          });
          setDiagnosisMap(dgMap);
        }

        if (docRes.data && docRes.data.length > 0) {
          const dMap: Record<number, string> = { ...doctorMap };
          docRes.data.forEach((d: any) => {
            dMap[d.doctorId] = `Dr. ${d.firstName} ${d.lastName}`;
          });
          setDoctorMap(dMap);
        }

        setTests(testsRes.data || []);
        setTestsLoaded(true);
      } catch (err) {
        console.error('Failed to load tests tab:', err);
      } finally {
        setIsTabLoading(false);
      }
    }

    // Tab 4: REFERRAL
    if (newIndex === 4 && !referralsLoaded && patient.hasReferral) {
      setIsTabLoading(true);
      try {
        const [refRes, docRes] = await Promise.all([
          api.getReferrals({ patientId: selectedPatientId, limit: 50 }),
          Object.keys(doctorMap).length === 0
            ? api.getDoctors({ limit: 100 }).catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] }),
        ]);

        if (docRes.data && docRes.data.length > 0) {
          const dMap: Record<number, string> = { ...doctorMap };
          docRes.data.forEach((d: any) => {
            dMap[d.doctorId] = `Dr. ${d.firstName} ${d.lastName}`;
          });
          setDoctorMap(dMap);
        }

        setReferrals(refRes.data || []);
        setReferralsLoaded(true);
      } catch (err) {
        console.error('Failed to load referrals tab:', err);
      } finally {
        setIsTabLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={closePatientProfile}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: 'background.paper',
          overflow: 'hidden',
          minHeight: 520,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
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
            <PersonOutlineIcon />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {patient ? patient.name : `Patient #${selectedPatientId}`}
              </Typography>
              {patient?.patientId && (
                <Chip
                  label={`ID: #${patient.patientId}`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    height: 22,
                    fontSize: '0.75rem',
                    backgroundColor: 'primary.main',
                    color: '#ffffff',
                  }}
                />
              )}
              {patient?.ratings !== undefined && patient?.ratings > 0 && (
                <Chip
                  icon={
                    <StarRateRoundedIcon
                      sx={{ fontSize: '1rem !important', color: '#f59e0b !important' }}
                    />
                  }
                  label={`${patient.ratings}/10`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    height: 22,
                    fontSize: '0.75rem',
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    color: '#d97706',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                  }}
                />
              )}
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Universal Pragati Foundation Clinical Medical Record
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={closePatientProfile}
          size="small"
          sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2.5 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'none',
              gap: 1,
            },
          }}
        >
          <Tab
            icon={<PersonOutlineIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="PROFILE"
          />
          <Tab
            icon={<FavoriteBorderIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="VITALS"
          />
          <Tab
            icon={<MedicationOutlinedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="PRESCRIPTION"
          />
          <Tab
            icon={<ScienceOutlinedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="DIAGNOSIS"
          />
          <Tab
            icon={<AssignmentOutlinedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="REFERRAL"
          />
        </Tabs>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 3 }}>
        {isLoading ? (
          <Box
            sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
          >
            <CircularProgress size={36} color="primary" />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Loading patient clinical data...
            </Typography>
          </Box>
        ) : !patient ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Patient record #{selectedPatientId} could not be loaded.
            </Typography>
          </Box>
        ) : (
          <>
            {/* TAB 0: PROFILE */}
            <CustomTabPanel value={tabIndex} index={0}>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: 'primary.main', mb: 2, fontWeight: 700 }}
                    >
                      Personal Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Full Name:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {patient.name}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Patient ID:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          #{patient.patientId}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Mobile Number:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {patient.mobile}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Age / Gender:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {patient.age} yrs • {patient.gender}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Address:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, maxWidth: '60%', textAlign: 'right' }}
                        >
                          {patient.address || 'Not Provided'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: 'secondary.main', mb: 2, fontWeight: 700 }}
                    >
                      Camp Clinical Status
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Department:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {patient.department}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Assigned Doctor:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {patient.doctorId
                            ? doctorMap[patient.doctorId] || `Doctor #${patient.doctorId}`
                            : 'Unassigned'}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Patient Rating:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: patient.ratings ? '#d97706' : 'text.secondary',
                          }}
                        >
                          {patient.ratings ? `${patient.ratings} / 10 ⭐` : 'Not Rated'}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Registered At:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {new Date(patient.created).toLocaleString()}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                        >
                          Chief Complaint:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: (theme) =>
                              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                            fontWeight: 500,
                          }}
                        >
                          {patient.complaint}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CustomTabPanel>

            {/* TAB 1: VITALS */}
            <CustomTabPanel value={tabIndex} index={1}>
              {patient.vitals && Object.keys(patient.vitals).length > 0 && patient.vitals.bp ? (
                <Grid container spacing={2}>
                  {[
                    {
                      label: 'Blood Pressure (BP)',
                      value: patient.vitals.bp,
                      unit: 'mmHg',
                      color: '#1556A3',
                    },
                    {
                      label: 'Pulse Rate',
                      value: patient.vitals.pulse,
                      unit: 'bpm',
                      color: '#dc2626',
                    },
                    {
                      label: 'Body Temperature',
                      value: patient.vitals.tempreture,
                      unit: '°F',
                      color: '#f59e0b',
                    },
                    {
                      label: 'Blood Oxygen (SpO2)',
                      value: patient.vitals.spo2,
                      unit: '%',
                      color: '#059669',
                    },
                    {
                      label: 'Patient Weight',
                      value: patient.vitals.weight,
                      unit: 'kg',
                      color: '#7c3aed',
                    },
                    {
                      label: 'Patient Height',
                      value: patient.vitals.height,
                      unit: 'cm',
                      color: '#0284c7',
                    },
                  ].map((vit, idx) => (
                    <Grid item xs={12} sm={4} key={idx}>
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: 1,
                          borderColor: 'divider',
                          textAlign: 'center',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', fontWeight: 600 }}
                        >
                          {vit.label}
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            my: 1,
                            fontWeight: 800,
                            color: vit.value ? vit.color : 'text.secondary',
                          }}
                        >
                          {vit.value !== undefined && vit.value !== '' ? vit.value : '—'}
                          {vit.value ? (
                            <span style={{ fontSize: '0.8125rem', fontWeight: 500, marginLeft: 4 }}>
                              {vit.unit}
                            </span>
                          ) : null}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
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
                    No vitals recorded
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', maxWidth: 360, textAlign: 'center' }}
                  >
                    This patient has not visited the Vitals counter station yet.
                  </Typography>
                </Box>
              )}
            </CustomTabPanel>

            {/* TAB 2: PRESCRIPTION */}
            <CustomTabPanel value={tabIndex} index={2}>
              {isTabLoading ? (
                <Box
                  sx={{
                    py: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <CircularProgress size={32} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Loading patient prescriptions...
                  </Typography>
                </Box>
              ) : !patient.hasMeds || prescriptions.length === 0 ? (
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
                    No prescriptions recorded
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', maxWidth: 360, textAlign: 'center' }}
                  >
                    No pharmaceutical medications have been prescribed to this patient.
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
                        <TableCell>Medication Name</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell>Prescribing Doctor</TableCell>
                        <TableCell align="right">Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {prescriptions.flatMap((p, pIdx) =>
                        (p.data || []).map((m: any, mIdx: number) => (
                          <TableRow key={`${pIdx}-${mIdx}`} hover>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {pharmacyMap[m.id] || m.id}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${m.qty} units`}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  backgroundColor: 'rgba(25, 136, 71, 0.1)',
                                  color: '#198847',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {p.doctorName ||
                                (p.doctorId
                                  ? doctorMap[p.doctorId] || `Dr. #${p.doctorId}`
                                  : 'Camp Doctor')}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}
                            >
                              {new Date(p.created).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CustomTabPanel>

            {/* TAB 3: DIAGNOSIS */}
            <CustomTabPanel value={tabIndex} index={3}>
              {isTabLoading ? (
                <Box
                  sx={{
                    py: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <CircularProgress size={32} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Loading diagnostic laboratory investigations...
                  </Typography>
                </Box>
              ) : !patient.hasTest || tests.length === 0 ? (
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
                    No diagnostic tests ordered
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', maxWidth: 360, textAlign: 'center' }}
                  >
                    No laboratory tests or diagnostic pathology have been ordered for this patient.
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
                        <TableCell>Diagnostic Test / Investigation</TableCell>
                        <TableCell>Prescribing Doctor</TableCell>
                        <TableCell align="right">Date Ordered</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tests.flatMap((t, tIdx) =>
                        (t.data || []).map((diagId: string, dIdx: number) => (
                          <TableRow key={`${tIdx}-${dIdx}`} hover>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {diagnosisMap[diagId] || diagId}
                            </TableCell>
                            <TableCell>
                              {t.doctorName ||
                                (t.doctorId
                                  ? doctorMap[t.doctorId] || `Dr. #${t.doctorId}`
                                  : 'Camp Doctor')}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}
                            >
                              {new Date(t.created).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CustomTabPanel>

            {/* TAB 4: REFERRAL */}
            <CustomTabPanel value={tabIndex} index={4}>
              {isTabLoading ? (
                <Box
                  sx={{
                    py: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <CircularProgress size={32} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Loading patient hospital referrals...
                  </Typography>
                </Box>
              ) : !patient.hasReferral || referrals.length === 0 ? (
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
                    No referrals recorded
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', maxWidth: 360, textAlign: 'center' }}
                  >
                    No tertiary care hospital referrals or follow-up recommendations exist for this
                    patient.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {referrals.map((ref, idx) => (
                    <Paper
                      key={ref.id || idx}
                      sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 1.5,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, color: 'primary.main' }}
                        >
                          Referral Note #{idx + 1} •{' '}
                          {ref.doctorName ||
                            (ref.doctorId
                              ? doctorMap[ref.doctorId] || `Dr. #${ref.doctorId}`
                              : 'Camp Doctor')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {new Date(ref.created).toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontWeight: 600 }}
                      >
                        Disease / Clinical Recommendation:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1.5 }}>
                        {ref.description}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontWeight: 600 }}
                      >
                        Contact & Follow-up Details:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {ref.details}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </CustomTabPanel>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
