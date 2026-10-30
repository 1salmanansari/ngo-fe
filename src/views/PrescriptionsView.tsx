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

export const PrescriptionsView: React.FC = () => {
  const { showToast } = useToast();
  const { openPatientProfile } = usePatientModal();

  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [pharmacyMap, setPharmacyMap] = useState<Record<string, string>>({});
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
  const [deletePrescription, setDeletePrescription] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchPrescriptions();
  }, [page, limit, search, filterDoctorId, filterPatientId]);

  const fetchMetadata = async () => {
    try {
      const [docRes, pharmRes] = await Promise.all([
        api.getDoctors({ limit: 100 }),
        api.getPharmacy({ limit: 200 }),
      ]);
      setDoctors(docRes.data || []);
      const dMap: Record<number, string> = {};
      (docRes.data || []).forEach((d: any) => {
        dMap[d.doctorId] = `Dr. ${d.firstName} ${d.lastName}`;
      });
      setDoctorMap(dMap);

      const pMap: Record<string, string> = {};
      (pharmRes.data || []).forEach((p: any) => {
        pMap[p.id] = p.name;
      });
      setPharmacyMap(pMap);
    } catch {}
  };

  const fetchPrescriptions = async () => {
    setIsLoading(true);
    try {
      const res = await api.getPrescriptions({
        search: search.trim(),
        doctorId: filterDoctorId ? Number(filterDoctorId) : undefined,
        patientId: filterPatientId ? Number(filterPatientId) : undefined,
        page,
        limit,
      });
      const list = res.data || [];
      setPrescriptions(list);
      setTotal(res.pagination?.total || list.length);
    } catch (err: any) {
      showToast(err.message || 'Failed to load prescriptions', 'ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletePrescription) return;
    setIsDeleting(true);
    try {
      const res = await api.deletePrescription(deletePrescription.id);
      if (res.success) {
        showToast('Prescription record deleted successfully.', 'SUCCESS');
        setDeletePrescription(null);
        fetchPrescriptions();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete prescription.', 'ERROR');
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
      id: 'data',
      label: 'Medication',
      render: (row) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {(row.data || []).map((m: any, idx: number) => (
            <Chip
              key={idx}
              label={`${pharmacyMap[m.id] || m.id}: ${m.qty} qty`}
              size="small"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: 'rgba(25, 136, 71, 0.1)',
                color: '#198847',
              }}
            />
          ))}
        </Box>
      ),
    },
    {
      id: 'actions',
      label: 'ACTION',
      align: 'right',
      width: 100,
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title="Delete Prescription" arrow>
            <IconButton
              size="small"
              onClick={() => setDeletePrescription(row)}
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
        title="Prescriptions"
        count={total}
        countLabel={`Total active prescription records: ${total}`}
        onRefresh={fetchPrescriptions}
        isRefreshing={isLoading}
      />

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={prescriptions}
        isLoading={isLoading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        searchPlaceholder="Search by patient ID or doctor ID..."
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
        emptyMessage="No prescription records found matching criteria."
      />

      {/* Reusable Common Right Sidebar: FILTER */}
      <RightSidebarDrawer
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Prescriptions"
        subtitle="Filter by prescribing doctor or patient"
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
        open={!!deletePrescription}
        title="Delete Prescription Record?"
        message={`Are you sure you want to delete prescription record for Patient #${deletePrescription?.patientId}?`}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletePrescription(null)}
        isLoading={isDeleting}
      />
    </Box>
  );
};
