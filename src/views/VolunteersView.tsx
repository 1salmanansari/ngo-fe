'use client';

import React, { useEffect, useState } from 'react';
import { Box, Tooltip, Chip, IconButton } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, ColumnDef } from '../components/common/DataTable';
import { VolunteerPatientsModal } from '../components/modals/VolunteerPatientsModal';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const VolunteersView: React.FC = () => {
  const { showToast } = useToast();

  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(false);

  // Selected volunteer for viewing registered patients
  const [viewVolunteer, setViewVolunteer] = useState<any | null>(null);

  useEffect(() => {
    fetchVolunteers();
  }, [page, limit, search, sortOrder]);

  const fetchVolunteers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getVolunteers({
        search: search.trim(),
        order: sortOrder,
        page,
        limit,
      });
      setVolunteers(res.data || []);
      setTotal(res.pagination?.total || (res.data || []).length);
    } catch (err: any) {
      showToast(err.message || 'Failed to load volunteers', 'ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const sortOptions = [
    { label: 'Name (A to Z)', value: 'asc' },
    { label: 'Name (Z to A)', value: 'desc' },
  ];

  const columns: ColumnDef<any>[] = [
    {
      id: 'name',
      label: 'NAME',
      render: (row) => (
        <Box>
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{row.name}</span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
            @{row.username}
            {row.mobile && row.mobile !== '—' ? ` • Mobile: ${row.mobile}` : ''}
          </span>
        </Box>
      ),
    },
    {
      id: 'patientCount',
      label: 'COUNT',
      render: (row) => (
        <Chip
          label={`${row.patientCount || 0} Patients`}
          size="small"
          sx={{
            fontWeight: 700,
            backgroundColor:
              (row.patientCount || 0) > 0 ? 'rgba(21, 86, 163, 0.12)' : 'rgba(148, 163, 184, 0.15)',
            color: (row.patientCount || 0) > 0 ? 'primary.main' : 'text.secondary',
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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title={`View Patients registered by ${row.name}`} arrow placement="top">
            <IconButton
              size="small"
              onClick={() => setViewVolunteer(row)}
              sx={{
                borderRadius: '8px',
                border: 1,
                borderColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.15)'
                    : 'rgba(21, 86, 163, 0.3)',
                color: 'primary.main',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(21, 86, 163, 0.08)'
                    : 'rgba(21, 86, 163, 0.04)',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(21, 86, 163, 0.18)'
                      : 'rgba(21, 86, 163, 0.12)',
                },
              }}
            >
              <VisibilityOutlinedIcon fontSize="small" />
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
        title="Volunteers"
        count={total}
        countLabel={`Total active camp registration volunteers: ${total}`}
        onRefresh={fetchVolunteers}
        isRefreshing={isLoading}
      />

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={volunteers}
        isLoading={isLoading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        searchPlaceholder="Search volunteers by name or username..."
        searchValue={search}
        onSearchChange={setSearch}
        sortOptions={sortOptions}
        currentSort={sortOrder}
        onSortChange={(val) => setSortOrder(val as 'asc' | 'desc')}
        emptyMessage="No volunteers registered yet."
      />

      {/* Modal to view patients handled by selected volunteer */}
      <VolunteerPatientsModal
        open={!!viewVolunteer}
        onClose={() => setViewVolunteer(null)}
        volunteer={viewVolunteer}
      />
    </Box>
  );
};
