'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, ColumnDef } from '../components/common/DataTable';
import { RightSidebarDrawer } from '../components/common/RightSidebarDrawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { DoctorReferralsModal } from '../components/modals/DoctorReferralsModal';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const DoctorsView: React.FC = () => {
  const { showToast } = useToast();

  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [tempFilterDept, setTempFilterDept] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter drawer
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Add/Edit drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('');
  const [degree, setDegree] = useState('');
  const [hospital, setHospital] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Referrals modal
  const [referralDoctor, setReferralDoctor] = useState<any | null>(null);

  // Delete dialog
  const [deleteDoctor, setDeleteDoctor] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [page, limit, search, filterDept]);

  const fetchDepartments = async () => {
    try {
      const res = await api.getDepartments({ limit: 100 });
      setDepartments(res.data || []);
    } catch {}
  };

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const res = await api.getDoctors({
        search: search.trim(),
        department: filterDept,
        page,
        limit,
      });
      setDoctors(res.data || []);
      setTotal(res.pagination?.total || (res.data || []).length);
    } catch (err: any) {
      showToast(err.message || 'Failed to load doctors', 'ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setDrawerMode('ADD');
    setSelectedDoctor(null);
    setFirstName('');
    setLastName('');
    setDepartment(departments[0]?.name || '');
    setDegree('');
    setHospital('');
    setErrors({});
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (doc: any) => {
    setDrawerMode('EDIT');
    setSelectedDoctor(doc);
    setFirstName(doc.firstName || '');
    setLastName(doc.lastName || '');
    setDepartment(doc.department || '');
    setDegree(doc.degree || '');
    setHospital(doc.hospital || '');
    setErrors({});
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedDoctor(null);
    setFirstName('');
    setLastName('');
    setDepartment('');
    setDegree('');
    setHospital('');
    setErrors({});
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim() || firstName.trim().length < 3 || firstName.trim().length > 50) {
      errs.firstName = 'First name must be between 3 and 50 characters.';
    }
    if (!lastName.trim() || lastName.trim().length < 3 || lastName.trim().length > 50) {
      errs.lastName = 'Last name must be between 3 and 50 characters.';
    }
    if (!department) {
      errs.department = 'Department selection is mandatory.';
    }
    if (!degree.trim() || degree.trim().length < 3 || degree.trim().length > 50) {
      errs.degree = 'Degree qualification must be between 3 and 50 characters.';
    }
    if (hospital.trim() && (hospital.trim().length < 3 || hospital.trim().length > 50)) {
      errs.hospital = 'Hospital must be between 3 and 50 characters if provided.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveDoctor = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        department,
        degree: degree.trim(),
        hospital: hospital.trim(),
      };

      if (drawerMode === 'ADD') {
        const res = await api.createDoctor(payload);
        if (res.success) {
          showToast(`Dr. ${firstName} ${lastName} registered successfully!`, 'SUCCESS');
          handleCloseDrawer();
          setSearch('');
          setFilterDept('');
          setFilterActive(false);
          if (page === 1) {
            fetchDoctors();
          } else {
            setPage(1);
          }
        }
      } else if (drawerMode === 'EDIT' && selectedDoctor) {
        const res = await api.updateDoctor(selectedDoctor.id, payload);
        if (res.success) {
          showToast(`Dr. ${firstName} ${lastName} profile updated!`, 'SUCCESS');
          handleCloseDrawer();
          fetchDoctors();
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save doctor details.', 'ERROR');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDoctor) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteDoctor(deleteDoctor.id);
      if (res.success) {
        showToast(`Dr. ${deleteDoctor.firstName} ${deleteDoctor.lastName} deleted.`, 'SUCCESS');
        setDeleteDoctor(null);
        fetchDoctors();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete doctor.', 'ERROR');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      id: 'name',
      label: 'NAME',
      render: (row) => (
        <Box>
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
            Dr. {row.firstName} {row.lastName}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
            Doctor ID: #{row.doctorId}
          </span>
        </Box>
      ),
    },
    {
      id: 'department',
      label: 'DEPARTMENT',
      render: (row) => <span>{row.department}</span>,
    },
    {
      id: 'degree',
      label: 'DEGREE',
      render: (row) => <span>{row.degree}</span>,
    },
    {
      id: 'hospital',
      label: 'HOSPITAL',
      render: (row) => <span>{row.hospital || 'Camp Onsite'}</span>,
    },
    {
      id: 'actions',
      label: 'ACTION',
      align: 'right',
      width: 140,
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="View Referrals by Dr." arrow>
            <IconButton
              size="small"
              onClick={() => setReferralDoctor(row)}
              sx={{ color: '#d97706', borderRadius: 1.5 }}
            >
              <AssignmentIndOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Doctor Profile" arrow>
            <IconButton
              size="small"
              onClick={() => handleOpenEdit(row)}
              sx={{ color: 'primary.main', borderRadius: 1.5 }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Doctor" arrow>
            <IconButton
              size="small"
              onClick={() => setDeleteDoctor(row)}
              sx={{ color: 'error.main', borderRadius: 1.5 }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* UI Point 4: Container title on left, count tooltip & refresh icon on right */}
      <PageHeader
        title="Doctors"
        count={total}
        countLabel={`Total registered camp doctors: ${total}`}
        onRefresh={fetchDoctors}
        isRefreshing={isLoading}
      />

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={doctors}
        isLoading={isLoading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        searchPlaceholder="Search doctors by name or degree..."
        searchValue={search}
        onSearchChange={setSearch}
        onAddClick={handleOpenAdd}
        addLabel="Add Doctor"
        filterActive={filterActive || !!filterDept}
        onOpenFilter={() => {
          setTempFilterDept(filterDept);
          setIsFilterOpen(true);
        }}
        onClearFilter={() => {
          setFilterActive(false);
          setFilterDept('');
          setTempFilterDept('');
          setSearch('');
          setPage(1);
        }}
        emptyMessage="No doctors registered yet. Click 'Add Doctor' to enroll one."
      />

      {/* Reusable Common Right Sidebar: ADD / EDIT Doctor */}
      <RightSidebarDrawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={drawerMode === 'ADD' ? 'Add Doctor' : 'Edit Doctor'}
        subtitle={
          drawerMode === 'ADD'
            ? 'Enroll a medical specialist for camp consultations'
            : `Updating record of Dr. ${selectedDoctor?.firstName} ${selectedDoctor?.lastName}`
        }
        onSave={handleSaveDoctor}
        saveLabel={drawerMode === 'ADD' ? 'Add Doctor' : 'Update Doctor'}
        isSaving={isSaving}
      >
        <TextField
          label="First Name"
          placeholder="e.g. John"
          value={firstName}
          onChange={(e) => {
            setFirstName(e.target.value);
            if (errors.firstName) setErrors({ ...errors, firstName: '' });
          }}
          required
          fullWidth
          size="small"
          autoFocus
          error={!!errors.firstName}
          helperText={errors.firstName || 'Mandatory: min 3, max 50 characters.'}
        />

        <TextField
          label="Last Name"
          placeholder="e.g. Doe"
          value={lastName}
          onChange={(e) => {
            setLastName(e.target.value);
            if (errors.lastName) setErrors({ ...errors, lastName: '' });
          }}
          required
          fullWidth
          size="small"
          error={!!errors.lastName}
          helperText={errors.lastName || 'Mandatory: min 3, max 50 characters.'}
        />

        <FormControl fullWidth size="small" required error={!!errors.department}>
          <InputLabel id="dept-select-label">Department</InputLabel>
          <Select
            labelId="dept-select-label"
            value={department}
            label="Department"
            onChange={(e) => {
              setDepartment(e.target.value);
              if (errors.department) setErrors({ ...errors, department: '' });
            }}
          >
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.name}>
                {dept.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Degree Qualification"
          placeholder="e.g. MBBS, MD (Cardiology)"
          value={degree}
          onChange={(e) => {
            setDegree(e.target.value);
            if (errors.degree) setErrors({ ...errors, degree: '' });
          }}
          required
          fullWidth
          size="small"
          error={!!errors.degree}
          helperText={errors.degree || 'Mandatory: min 3, max 50 characters.'}
        />

        <TextField
          label="Affiliated Hospital"
          placeholder="e.g. Lilavati Hospital & Research Centre"
          value={hospital}
          onChange={(e) => {
            setHospital(e.target.value);
            if (errors.hospital) setErrors({ ...errors, hospital: '' });
          }}
          fullWidth
          size="small"
          error={!!errors.hospital}
          helperText={errors.hospital || 'Optional: min 3, max 50 characters.'}
        />
      </RightSidebarDrawer>

      {/* Reusable Common Right Sidebar: FILTER */}
      <RightSidebarDrawer
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Doctors"
        subtitle="Filter by medical specialty department"
        onSave={() => {
          setFilterDept(tempFilterDept);
          setFilterActive(!!tempFilterDept);
          setPage(1);
          setIsFilterOpen(false);
        }}
        saveLabel="Apply Filter"
      >
        <FormControl fullWidth size="small">
          <InputLabel id="filter-dept-label">Filter By Department</InputLabel>
          <Select
            labelId="filter-dept-label"
            value={tempFilterDept}
            label="Filter By Department"
            onChange={(e) => setTempFilterDept(e.target.value)}
          >
            <MenuItem value="">
              <em>All Departments</em>
            </MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.name}>
                {dept.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </RightSidebarDrawer>

      {/* Doctor Referrals Modal (UI Requirement) */}
      <DoctorReferralsModal
        open={!!referralDoctor}
        onClose={() => setReferralDoctor(null)}
        doctor={referralDoctor}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteDoctor}
        title="Delete Doctor Record?"
        message={`Are you sure you want to delete Dr. ${deleteDoctor?.firstName} ${deleteDoctor?.lastName}?`}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteDoctor(null)}
        isLoading={isDeleting}
      />
    </Box>
  );
};
