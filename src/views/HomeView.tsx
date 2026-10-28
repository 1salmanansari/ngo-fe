'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Paper,
  CircularProgress,
} from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import LinearProgress from '@mui/material/LinearProgress';
import Avatar from '@mui/material/Avatar';
import { PageHeader } from '../components/common/PageHeader';
import { DonutChartComponent, FunnelChartComponent } from '../components/common/VisualCharts';
import { api } from '../services/api';

export const HomeView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardAnalytics();
  }, []);

  const fetchDashboardAnalytics = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.getAnalytics();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const summary = data?.summary || {
    totalPatients: 0,
    totalMedsDistributed: 0,
    totalDiagnosis: 0,
    diagnosedPatientsCount: 0,
    patientsBenefitedMeds: 0,
    totalReferrals: 0,
    totalDoctors: 0,
    avgRating: 0,
    totalRatingsGiven: 0,
  };

  const kpis = [
    {
      title: 'Total Patients',
      value: summary.totalPatients,
      subtitle: 'Registered camp attendees',
      icon: <PeopleAltOutlinedIcon />,
      color: '#1556A3',
      bg: 'rgba(21, 86, 163, 0.1)',
    },
    {
      title: 'Meds Distributed',
      value: summary.totalMedsDistributed,
      subtitle: 'Total units dispensed',
      icon: <MedicationOutlinedIcon />,
      color: '#198847',
      bg: 'rgba(25, 136, 71, 0.1)',
    },
    {
      title: 'Benefited with Meds',
      value: summary.patientsBenefitedMeds,
      subtitle: 'Patients provided free meds',
      icon: <FactCheckOutlinedIcon />,
      color: '#059669',
      bg: 'rgba(5, 150, 105, 0.1)',
    },
    {
      title: 'Total Diagnostic Tests',
      value: summary.totalDiagnosis,
      subtitle: 'Catalogued investigations',
      icon: <ScienceOutlinedIcon />,
      color: '#7c3aed',
      bg: 'rgba(124, 58, 237, 0.1)',
    },
    {
      title: 'Diagnosed Patients',
      value: summary.diagnosedPatientsCount,
      subtitle: 'Lab investigations ordered',
      icon: <FactCheckOutlinedIcon />,
      color: '#d97706',
      bg: 'rgba(217, 119, 6, 0.1)',
    },
    {
      title: 'Hospital Referrals',
      value: summary.totalReferrals,
      subtitle: 'Specialized follow-up cases',
      icon: <AssignmentOutlinedIcon />,
      color: '#dc2626',
      bg: 'rgba(220, 38, 38, 0.1)',
    },
    {
      title: 'Active Doctors',
      value: summary.totalDoctors,
      subtitle: 'Medical practitioners',
      icon: <LocalHospitalOutlinedIcon />,
      color: '#0d9488',
      bg: 'rgba(13, 148, 136, 0.1)',
    },
    {
      title: 'Patient Rating',
      value: summary.avgRating > 0 ? `${summary.avgRating} / 10` : 'No rating',
      subtitle: `${summary.totalRatingsGiven} reviews collected`,
      icon: <StarRateRoundedIcon />,
      color: '#eab308',
      bg: 'rgba(234, 179, 8, 0.12)',
    },
  ];

  const topDoctorsList = data?.topPerformers?.doctors || data?.topPerformers?.topDoctors || [];
  const topVolunteersList =
    data?.topPerformers?.volunteers || data?.topPerformers?.topVolunteers || [];

  return (
    <Box>
      {/* Page Header without item count badge */}
      <PageHeader
        title="Operations Command Dashboard"
        onRefresh={fetchDashboardAnalytics}
        isRefreshing={isRefreshing}
      />

      {isLoading ? (
        <Box
          sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
        >
          <CircularProgress size={40} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Compiling real-time Pragati Foundation camp analytics...
          </Typography>
        </Box>
      ) : (
        <>
          {/* KPI Analytics Cards Grid */}
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {kpis.map((kpi, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: 0.5,
                    borderRadius: '14px',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  <CardContent sx={{ pb: 1.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: '12px',
                          backgroundColor: kpi.bg,
                          color: kpi.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {kpi.icon}
                      </Box>
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, mb: 0.25, letterSpacing: '-0.02em' }}
                    >
                      {kpi.value}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: 'text.primary', fontWeight: 600, mb: 0.5 }}
                    >
                      {kpi.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {kpi.subtitle}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Top Performers Section: Moved above charts as requested */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Top 5 Doctors */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: '14px',
                  height: '100%',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    mb: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      backgroundColor: 'rgba(21, 86, 163, 0.1)',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <EmojiEventsOutlinedIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Top 5 Doctors
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Highest patient consultation volumes
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {topDoctorsList.length === 0 ? (
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}
                    >
                      No doctor consultation activity recorded yet.
                    </Typography>
                  ) : (
                    topDoctorsList.map((doc: any, idx: number) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 1.5,
                          borderRadius: '10px',
                          backgroundColor: (theme) =>
                            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: 1,
                          borderColor: 'divider',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: '0.8125rem',
                              fontWeight: 700,
                              backgroundColor:
                                idx === 0 ? '#d97706' : idx === 1 ? '#64748b' : 'primary.main',
                              color: '#ffffff',
                            }}
                          >
                            #{idx + 1}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {doc.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {doc.department || 'Consultant'}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={`${doc.patientCount || 0} Patients`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            borderRadius: '8px',
                            backgroundColor: 'rgba(21, 86, 163, 0.1)',
                            color: 'primary.main',
                          }}
                        />
                      </Box>
                    ))
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Top 5 Volunteers */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: '14px',
                  height: '100%',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    mb: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      backgroundColor: 'rgba(25, 136, 71, 0.1)',
                      color: '#198847',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <VolunteerActivismOutlinedIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Top 5 Volunteers
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Highest patient registration intakes
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {topVolunteersList.length === 0 ? (
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}
                    >
                      No volunteer registration activity recorded yet.
                    </Typography>
                  ) : (
                    topVolunteersList.map((vol: any, idx: number) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 1.5,
                          borderRadius: '10px',
                          backgroundColor: (theme) =>
                            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: 1,
                          borderColor: 'divider',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: '0.8125rem',
                              fontWeight: 700,
                              backgroundColor:
                                idx === 0 ? '#198847' : idx === 1 ? '#059669' : '#0284c7',
                              color: '#ffffff',
                            }}
                          >
                            #{idx + 1}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {vol.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              @{vol.username}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={`${vol.patientCount || 0} Patients`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            borderRadius: '8px',
                            backgroundColor: 'rgba(25, 136, 71, 0.1)',
                            color: '#198847',
                          }}
                        />
                      </Box>
                    ))
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Operational Analytics & Distribution Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Department Footprint Distribution */}
            <Grid item xs={12} lg={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: '14px',
                  height: '100%',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Department Footprint Distribution
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Patient registrations across clinical specialty departments
                    </Typography>
                  </Box>
                  <Chip
                    label={`${(data?.departmentWisePatients || []).length} Departments`}
                    size="small"
                    sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px' }}
                  />
                </Box>

                <Box
                  sx={{
                    maxHeight: 280,
                    overflowY: 'auto',
                    pr: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                  }}
                >
                  {(data?.departmentWisePatients || []).map((dept: any, idx: number) => {
                    const maxVal = Math.max(
                      ...(data?.departmentWisePatients || []).map((d: any) => d.count),
                      1
                    );
                    const pct = Math.round((dept.count / maxVal) * 100);
                    return (
                      <Box key={idx}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, fontSize: '0.8125rem' }}
                          >
                            {dept.departmentName}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.8125rem' }}
                          >
                            {dept.count} patients
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 7,
                            borderRadius: '4px',
                            backgroundColor: (theme) =>
                              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: '4px',
                              backgroundColor:
                                idx === 0 ? '#1556A3' : idx === 1 ? '#0d9488' : '#3b82f6',
                            },
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            </Grid>

            {/* Camp Funnel Process Chart */}
            <Grid item xs={12} lg={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: '14px',
                  height: '100%',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Patient Careflow Funnel
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Conversion from intake counter to treatment dispatch
                  </Typography>
                </Box>
                <FunnelChartComponent stages={data?.flowFunnel || []} />
              </Paper>
            </Grid>

            {/* Gender Distribution Demographics */}
            <Grid item xs={12} md={6} lg={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: '14px',
                  height: '100%',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Gender Demographics
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Male vs Female patient proportion
                  </Typography>
                </Box>
                <DonutChartComponent
                  data={(data?.genderDistribution || []).map((g: any) => ({
                    label: g.gender,
                    value: g.count,
                    color: g.gender === 'MALE' ? '#1556A3' : '#ec4899',
                  }))}
                  centerLabel="Patients"
                  size={190}
                />
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};
