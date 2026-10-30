'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Tooltip,
  TablePagination,
  Skeleton,
  Typography,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import AddIcon from '@mui/icons-material/Add';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { usePatientModal } from '../../context/PatientModalContext';
import { useDebounce } from '../../utils/useDebounce';

export interface ColumnDef<T = any> {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T = any> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  total?: number;
  page: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  // Search
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  // Filters
  filterActive?: boolean;
  onOpenFilter?: () => void;
  onClearFilter?: () => void;
  // Sort
  sortOptions?: { label: string; value: string }[];
  currentSort?: string;
  onSortChange?: (val: string) => void;
  // Action CTA (e.g. Add)
  onAddClick?: () => void;
  addLabel?: string;
  // Empty State
  emptyMessage?: string;
  emptyTitle?: string;
  // Is this the patient active tab?
  isPatientTable?: boolean;
}

export const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  total = 0,
  page,
  limit,
  onPageChange,
  onLimitChange,
  searchPlaceholder = 'Search records...',
  searchValue = '',
  onSearchChange,
  filterActive = false,
  onOpenFilter,
  onClearFilter,
  sortOptions,
  currentSort,
  onSortChange,
  onAddClick,
  addLabel = 'Add New',
  emptyMessage = 'No records matching the selected criteria.',
  emptyTitle = 'No Records Found',
  isPatientTable = false,
}: DataTableProps<T>) => {
  const { openPatientProfile } = usePatientModal();

  // Internal debounced search input state (500ms debounce)
  const [internalSearch, setInternalSearch] = useState(searchValue);
  const debouncedSearch = useDebounce(internalSearch, 500);

  useEffect(() => {
    setInternalSearch(searchValue);
  }, [searchValue]);

  useEffect(() => {
    if (onSearchChange && debouncedSearch !== searchValue) {
      onSearchChange(debouncedSearch);
      onPageChange(1); // Reset page to 1 on search
    }
  }, [debouncedSearch]);

  return (
    <Paper
      sx={{
        borderRadius: 2.5,
        overflow: 'hidden',
        border: (theme) =>
          theme.palette.mode === 'dark'
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(0,0,0,0.06)',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 2px 12px rgba(15, 23, 42, 0.05)',
      }}
    >
      {/* Top Action Bar */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          borderBottom: (theme) =>
            theme.palette.mode === 'dark'
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid rgba(0,0,0,0.06)',
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
        }}
      >
        {/* Left: Search Input with 500ms debounce */}
        {onSearchChange !== undefined ? (
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={internalSearch}
            onChange={(e) => setInternalSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { xs: '100%', sm: 280 },
              maxWidth: 380,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '0.875rem',
              },
            }}
          />
        ) : (
          <Box />
        )}

        {/* Right: Controls (Sort, Filter, Clear Filter, Add CTA) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
          {/* Optional Sort Dropdown */}
          {sortOptions && onSortChange && (
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="sort-select-label" sx={{ fontSize: '0.8125rem' }}>
                Sort
              </InputLabel>
              <Select
                labelId="sort-select-label"
                value={currentSort || ''}
                label="Sort"
                onChange={(e) => {
                  onSortChange(e.target.value);
                  onPageChange(1);
                }}
                sx={{ borderRadius: 2, fontSize: '0.8125rem', height: 38 }}
              >
                {sortOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.8125rem' }}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Filter CTA */}
          {onOpenFilter && (
            <Button
              variant="outlined"
              size="small"
              onClick={onOpenFilter}
              startIcon={<FilterListIcon fontSize="small" />}
              sx={{
                borderRadius: 2,
                height: 38,
                px: 2,
                borderColor: filterActive ? 'primary.main' : 'divider',
                color: filterActive ? 'primary.main' : 'text.secondary',
                backgroundColor: filterActive
                  ? (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(21, 86, 163, 0.15)'
                        : 'rgba(21, 86, 163, 0.08)'
                  : 'transparent',
              }}
            >
              Filter
            </Button>
          )}

          {/* Clear Filter CTA (visible only when filter is applied) */}
          {filterActive && onClearFilter && (
            <Tooltip title="Clear Active Filters" arrow>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  onClearFilter();
                  onPageChange(1);
                }}
                startIcon={<FilterAltOffIcon fontSize="small" />}
                color="warning"
                sx={{
                  borderRadius: 2,
                  height: 38,
                  px: 1.5,
                }}
              >
                Clear Filter
              </Button>
            </Tooltip>
          )}

          {/* Add CTA */}
          {onAddClick && (
            <Button
              variant="contained"
              size="small"
              onClick={onAddClick}
              startIcon={<AddIcon fontSize="small" />}
              sx={{
                borderRadius: 2,
                height: 38,
                px: 2.25,
                fontWeight: 600,
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              {addLabel}
            </Button>
          )}
        </Box>
      </Box>

      {/* Table Body */}
      <TableContainer sx={{ minHeight: 340 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || 'left'}
                  sx={{ width: col.width, whiteSpace: 'nowrap' }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              // Skeleton Loader Rows
              Array.from({ length: Math.min(limit, 6) }).map((_, rIdx) => (
                <TableRow key={rIdx}>
                  {columns.map((col, cIdx) => (
                    <TableCell key={cIdx} align={col.align || 'left'}>
                      <Skeleton variant="text" width={cIdx === 0 ? '60%' : '85%'} height={26} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              // Enhanced Empty State with Icon & Formal Layout
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ py: 8, textAlign: 'center' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.04)'
                            : 'rgba(0, 0, 0, 0.04)',
                        color: 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <InboxOutlinedIcon sx={{ fontSize: 32, opacity: 0.6 }} />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {emptyTitle}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', maxWidth: 360, fontSize: '0.85rem' }}
                    >
                      {emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              // Data Rows
              data.map((row, index) => (
                <TableRow key={row.id || row.patientId || index} hover>
                  {columns.map((col) => {
                    if (col.render) {
                      return (
                        <TableCell key={col.id} align={col.align || 'left'}>
                          {col.render(row, index)}
                        </TableCell>
                      );
                    }

                    const val = row[col.id];

                    // Universal Patient Link Handling
                    // If not on Patients tab, clicking Patient Name or Patient ID opens Patient Profile
                    const isPatientIdCol = col.id === 'patientId';
                    const isPatientNameCol = col.id === 'patientName';

                    if (!isPatientTable && (isPatientIdCol || isPatientNameCol)) {
                      const pid = row.patientId;
                      return (
                        <TableCell key={col.id} align={col.align || 'left'}>
                          <Chip
                            label={String(val !== undefined ? val : 'N/A')}
                            size="small"
                            onClick={() => pid && openPatientProfile(pid)}
                            sx={{
                              fontWeight: 600,
                              cursor: 'pointer',
                              backgroundColor: (theme) =>
                                theme.palette.mode === 'dark'
                                  ? 'rgba(21, 86, 163, 0.2)'
                                  : 'rgba(21, 86, 163, 0.08)',
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'primary.main',
                                color: '#ffffff',
                              },
                            }}
                          />
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell key={col.id} align={col.align || 'left'}>
                        {val !== undefined && val !== null ? String(val) : '—'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Bar */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={total}
        rowsPerPage={limit}
        page={Math.max(0, page - 1)}
        onPageChange={(_e, newPage) => onPageChange(newPage + 1)}
        onRowsPerPageChange={(e) => {
          onLimitChange(parseInt(e.target.value, 10));
          onPageChange(1);
        }}
        sx={{
          borderTop: (theme) =>
            theme.palette.mode === 'dark'
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid rgba(0,0,0,0.06)',
        }}
      />
    </Paper>
  );
};
