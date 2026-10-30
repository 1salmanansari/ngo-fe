'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, ColumnDef } from '../components/common/DataTable';
import { RightSidebarDrawer } from '../components/common/RightSidebarDrawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { usePatientModal } from '../context/PatientModalContext';

export const ReferralsView: React.FC = () => {
  const { showToast } = useToast();
  const { openPatientProfile } = usePatientModal();

  const [referrals, setReferrals] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorMap, setDoctorMap] = useState<Record<number, string>>({});
  const [patientMap, setPatientMap] = useState<Record<number, string>>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filterDoctorId, setFilterDoctorId] = useState<string>('');
  const [tempFilterDoctorId, setTempFilterDoctorId] = useState<string>('');
  const [filterPatientId, setFilterPatientId] = useState<string>('');
  const [tempFilterPatientId, setTempFilterPatientId] = useState<string>('');
  const [filterActive, setFilterActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter drawer
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Delete dialog
  const [deleteReferral, setDeleteReferral] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [page, limit, search, filterDoctorId, filterPatientId]);

  const fetchDoctors = async () => {
    try {
      const docRes = await api.getDoctors({ limit: 100 });
      setDoctors(docRes.data || []);
      const dMap: Record<number, string> = {};
      (docRes.data || []).forEach((d: any) => {
        dMap[d.doctorId] = `Dr. ${d.firstName} ${d.lastName}`;
      });
      setDoctorMap(dMap);
    } catch {}
  };

  const fetchReferrals = async () => {
    setIsLoading(true);
    try {
      const res = await api.getReferrals({
        search: search.trim(),
        doctorId: filterDoctorId ? Number(filterDoctorId) : undefined,
        patientId: filterPatientId ? Number(filterPatientId) : undefined,
        page,
        limit,
      });
      const list = res.data || [];
      setReferrals(list);
      setTotal(res.pagination?.total || list.length);
    } catch (err: any) {
      showToast(err.message || 'Failed to load referrals', 'ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteReferral) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteReferral(deleteReferral.id);
      if (res.success) {
        showToast('Hospital referral deleted successfully.', 'SUCCESS');
        setDeleteReferral(null);
        fetchReferrals();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete referral.', 'ERROR');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      id: 'doctorId',
      label: 'DOCTOR',
      render: (row) => (
        <span style={{ fontWeight: 600 }}>
          {row.doctorName || (row.doctorId ? `Dr. #${row.doctorId}` : 'Camp Onsite Doctor')}
        </span>
      ),
    },
    {
      id: 'patientId',
      label: 'PATIENT ID',
      width: 140,
      render: (row) => (
        <Chip
          label={row.patientName ? `${row.patientName} (#${row.patientId})` : `#${row.patientId}`}
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
      id: 'description',
      label: 'DESCRIPTION',
      render: (row) => (
        <span
          style={{
            maxWidth: 240,
            display: 'inline-block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={row.description}
        >
          {row.description}
        </span>
      ),
    },
    {
      id: 'details',
      label: 'DETAILS',
      render: (row) => (
        <span
          style={{
            maxWidth: 240,
            display: 'inline-block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={row.details}
        >
          {row.details}
        </span>
      ),
    },
    {
      id: 'actions',
      label: 'ACTION',
      align: 'right',
      width: 100,
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title="Delete Referral" arrow>
            <IconButton
              size="small"
              onClick={() => setDeleteReferral(row)}
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
        title="Referrals"
        count={total}
        countLabel={`Total specialized hospital referrals: ${total}`}
        onRefresh={fetchReferrals}
        isRefreshing={isLoading}
      />

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={referrals}
        isLoading={isLoading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        searchPlaceholder="Search by patient ID or doctor name..."
        searchValue={search}
        onSearchChange={setSearch}
        filterActive={filterActive || !!filterDoctorId || !!filterPatientId}
        onOpenFilter={() => {
          setTempFilterDoctorId(filterDoctorId);
          setTempFilterPatientId(filterPatientId);
          setIsFilterOpen(true);
        }}
        onClearFilter={() => {
          setFilterActive(false);
          setFilterDoctorId('');
          setTempFilterDoctorId('');
          setFilterPatientId('');
          setTempFilterPatientId('');
          setSearch('');
          setPage(1);
        }}
        emptyMessage="No referral records found matching criteria."
      />

      {/* Reusable Common Right Sidebar: FILTER */}
      <RightSidebarDrawer
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Referrals"
        subtitle="Filter by referring doctor or patient"
        onSave={() => {
          setFilterDoctorId(tempFilterDoctorId);
          setFilterPatientId(tempFilterPatientId);
          setFilterActive(!!tempFilterDoctorId || !!tempFilterPatientId);
          setPage(1);
          setIsFilterOpen(false);
        }}
        saveLabel="Apply Filters"
      >
        <FormControl fullWidth size="small">
          <InputLabel id="filter-doc-label">Filter By Doctor</InputLabel>
          <Select
            labelId="filter-doc-label"
            value={tempFilterDoctorId}
            label="Filter By Doctor"
            onChange={(e) => setTempFilterDoctorId(e.target.value)}
          >
            <MenuItem value="">
              <em>All Doctors</em>
            </MenuItem>
            {doctors.map((doc) => (
              <MenuItem key={doc.id} value={String(doc.doctorId)}>
                Dr. {doc.firstName} {doc.lastName} (#{doc.doctorId})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Filter By Patient ID"
          type="number"
          placeholder="e.g. 101"
          value={tempFilterPatientId}
          onChange={(e) => setTempFilterPatientId(e.target.value)}
          fullWidth
          size="small"
        />
      </RightSidebarDrawer>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteReferral}
        title="Delete Hospital Referral?"
        message={`Are you sure you want to delete referral record for Patient #${deleteReferral?.patientId}?`}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteReferral(null)}
        isLoading={isDeleting}
      />
    </Box>
  );
};
