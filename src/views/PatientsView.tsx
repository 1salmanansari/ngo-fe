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
  Chip,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, ColumnDef } from '../components/common/DataTable';
import { RightSidebarDrawer } from '../components/common/RightSidebarDrawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { usePatientModal } from '../context/PatientModalContext';

export const PatientsView: React.FC = () => {
  const { showToast } = useToast();
  const { openPatientProfile } = usePatientModal();

  const [patients, setPatients] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [tempFilterDept, setTempFilterDept] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [tempFilterGender, setTempFilterGender] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter drawer
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Delete dialog
  const [deletePatient, setDeletePatient] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [page, limit, search, filterDept, filterGender]);

  const fetchDepartments = async () => {
    try {
      const res = await api.getDepartments({ limit: 100 });
      setDepartments(res.data || []);
    } catch {}
  };

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const res = await api.getPatients({
        search: search.trim(),
        department: filterDept,
        gender: filterGender,
        page,
        limit,
      });
      setPatients(res.data || []);
      setTotal(res.pagination?.total || (res.data || []).length);
    } catch (err: any) {
      showToast(err.message || 'Failed to load patients', 'ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletePatient) return;
    setIsDeleting(true);
    try {
      const res = await api.deletePatient(deletePatient.patientId || deletePatient.id);
      if (res.success) {
        showToast(`Patient "${deletePatient.name}" deleted.`, 'SUCCESS');
        setDeletePatient(null);
        fetchPatients();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete patient.', 'ERROR');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      id: 'patientId',
      label: 'PATIENT ID',
      width: 110,
      render: (row) => (
        <Chip
          label={`#${row.patientId}`}
          size="small"
          onClick={() => openPatientProfile(row.patientId)}
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
      ),
    },
    {
      id: 'name',
      label: 'NAME',
      render: (row) => (
        <Box
          onClick={() => openPatientProfile(row.patientId)}
          sx={{
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: 'text.primary',
            '&:hover': {
              color: 'primary.main',
              textDecoration: 'underline',
            },
          }}
        >
          {row.name}
        </Box>
      ),
    },
    {
      id: 'dob',
      label: 'DOB',
      render: (row) => <span>{row.dob ? new Date(row.dob).toLocaleDateString() : '—'}</span>,
    },
    {
      id: 'age',
      label: 'AGE',
      render: (row) => <span>{row.age} yrs</span>,
    },
    {
      id: 'department',
      label: 'DEPARTMENT',
      render: (row) => <span>{row.department}</span>,
    },
    {
      id: 'complaint',
      label: 'COMPLAINT',
      render: (row) => (
        <span
          style={{
            maxWidth: 160,
            display: 'inline-block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={row.complaint}
        >
          {row.complaint}
        </span>
      ),
    },
    {
      id: 'address',
      label: 'ADDRESS',
      render: (row) => (
        <span
          style={{
            maxWidth: 140,
            display: 'inline-block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={row.address || '—'}
        >
          {row.address || '—'}
        </span>
      ),
    },
    {
      id: 'mobile',
      label: 'MOBILE',
      render: (row) => <span>{row.mobile}</span>,
    },
    {
      id: 'gender',
      label: 'GENDER',
      render: (row) => (
        <Chip
          label={row.gender}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.7rem',
            height: 22,
            backgroundColor:
              row.gender === 'MALE' ? 'rgba(21, 86, 163, 0.1)' : 'rgba(236, 72, 153, 0.1)',
            color: row.gender === 'MALE' ? '#1556A3' : '#db2777',
          }}
        />
      ),
    },
    {
      id: 'actions',
      label: 'ACTION',
      align: 'right',
      width: 100,
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="View Patient Profile" arrow>
            <IconButton
              size="small"
              onClick={() => openPatientProfile(row.patientId)}
              sx={{ color: 'primary.main', borderRadius: 1.5 }}
            >
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Patient" arrow>
            <IconButton
              size="small"
              onClick={() => setDeletePatient(row)}
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
        title="Patients"
        count={total}
        countLabel={`Total registered camp patients: ${total}`}
        onRefresh={fetchPatients}
        isRefreshing={isLoading}
      />

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={patients}
        isLoading={isLoading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        searchPlaceholder="Search by name, ID, or mobile number..."
        searchValue={search}
        onSearchChange={setSearch}
        filterActive={filterActive || !!filterDept || !!filterGender}
        onOpenFilter={() => {
          setTempFilterDept(filterDept);
          setTempFilterGender(filterGender);
          setIsFilterOpen(true);
        }}
        onClearFilter={() => {
          setFilterActive(false);
          setFilterDept('');
          setTempFilterDept('');
          setFilterGender('');
          setTempFilterGender('');
          setSearch('');
          setPage(1);
        }}
        isPatientTable={true}
        emptyMessage="No patients registered matching the criteria."
      />

      {/* Reusable Common Right Sidebar: FILTER */}
      <RightSidebarDrawer
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Patients"
        subtitle="Filter by department and gender"
        onSave={() => {
          setFilterDept(tempFilterDept);
          setFilterGender(tempFilterGender);
          setFilterActive(!!tempFilterDept || !!tempFilterGender);
          setPage(1);
          setIsFilterOpen(false);
        }}
        saveLabel="Apply Filters"
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

        <FormControl fullWidth size="small">
          <InputLabel id="filter-gender-label">Filter By Gender</InputLabel>
          <Select
            labelId="filter-gender-label"
            value={tempFilterGender}
            label="Filter By Gender"
            onChange={(e) => setTempFilterGender(e.target.value)}
          >
            <MenuItem value="">
              <em>All Genders</em>
            </MenuItem>
            <MenuItem value="MALE">Male</MenuItem>
            <MenuItem value="FEMALE">Female</MenuItem>
          </Select>
        </FormControl>
      </RightSidebarDrawer>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletePatient}
        title="Delete Patient Record?"
        message={`Are you sure you want to permanently delete patient "${deletePatient?.name}" (ID #${deletePatient?.patientId})? This will delete all linked clinical vitals.`}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletePatient(null)}
        isLoading={isDeleting}
      />
    </Box>
  );
};
