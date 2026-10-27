/* import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  TableSortLabel,
  TextField,
  TablePagination,
  CircularProgress,
  Checkbox,
  Typography,
  Box,
  Chip,
  Stack,
  Tooltip,
  IconButton
} from '@mui/material';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { AuthService } from 'services';
import { openSnackbar } from 'api/snackbar';
import AlertContactEnquiryDelete from 'components/AlertModal';
import { FixedSizeList } from 'react-window';
import debounce from 'lodash/debounce';
import axios from 'axios';
import { height } from '@mui/system';

const columns = [
  { id: 'checkbox', label: '' },
  { id: 'serial_number', label: '#' },
  { id: 'name', label: 'Full Name' },
  { id: 'username', label: 'Username' },
  { id: 'email', label: 'Email' },
  { id: 'mobile', label: 'Phone' },
  { id: 'status', label: 'Status' },
  { id: 'actions', label: 'Actions' }
];

export default function ContactEnquiryPage() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(500);
  const [totalRows, setTotalRows] = useState(0);
  const [orderBy, setOrderBy] = useState('student_id');
  const [order, setOrder] = useState('asc');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [open, setOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [confirmContactEnquiryIds, setConfirmContactEnquiryIds] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const source = axios.CancelToken.source();
    try {
      const response = await AuthService.axiosPrivatePost(
        `crmList?page=${page + 1}&limit=${rowsPerPage}&order=${orderBy}&desc=${order === 'asc' ? 'false' : 'true'}&search=${searchText}`,
        { cancelToken: source.token }
      );
      if (response.data.status) {
        setData(
          response.data.data.data.map((item, index) => ({
            ...item,
            id: item.student_id,
            serial_number: page * rowsPerPage + index + 1,
            name: `${item.fname || ''} ${item.family_name || ''}`.trim()
          }))
        );
        setTotalRows(response.data.data.pagination?.totalRecords || 0);
      }
    } catch (error) {
      if (!axios.isCancel(error)) console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
    return () => source.cancel('Operation canceled by the user.');
  }, [page, rowsPerPage, orderBy, order, searchText]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearchText(value);
        setPage(0);
      }, 300),
    []
  );

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  const handleSort = useCallback(
    (property) => {
      setOrder((prevOrder) => (orderBy === property && prevOrder === 'asc' ? 'desc' : 'asc'));
      setOrderBy(property);
    },
    [orderBy]
  );

  const handleSelectAll = (event) => {
    setSelected(event.target.checked ? data.map((row) => row.id) : []);
  };

  const handleSelectRow = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <>
      <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            debouncedSearch(e.target.value);
          }}
          sx={{ mb: 2, width: '300px' }}
        />
        <TableContainer sx={{ maxHeight: '500px', overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Checkbox
                    checked={selected.length === data.length}
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                {columns.slice(1).map((column) => (
                  <TableCell key={column.id}>
                    {column.id !== 'actions' ? (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : 'asc'}
                        onClick={() => handleSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          </Table>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <FixedSizeList height={400} itemSize={50} itemCount={data.length}>
              {({ index, style }) => {
                const row = data[index];
                return (
                  <TableRow hover style={{ ...style, width: '100%', display: 'flex' }}>
                    <TableCell>
                      <Checkbox checked={selected.includes(row.id)} onChange={() => handleSelectRow(row.id)} />
                    </TableCell>
                    {columns.slice(1).map((column) => (
                      <TableCell key={column.id}>
                        {column.id === 'status' ? (
                          <Chip
                            label={row.status === 'Active' ? 'Active' : 'Inactive'}
                            color={row.status === 'Active' ? 'success' : 'error'}
                            size="small"
                          />
                        ) : column.id === 'actions' ? (
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="View">
                              <IconButton size="small" onClick={() => {}}>
                                <EyeOutlined />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={() => showAlert('Delete', row)}>
                                <DeleteOutlined />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        ) : (
                          row[column.id]
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              }}
            </FixedSizeList>
          )}
        </TableContainer>
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[50, 100, 200, 500]}
        />
      </Paper>
      <AlertContactEnquiryDelete
        open={open}
        type={confirmAction}
        handleClose={() => setOpen(false)}
        onConfirm={() => {}}
        ids={confirmContactEnquiryIds}
      />
    </>
  );
}
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Checkbox,
  TablePagination,
  TableSortLabel,
  LinearProgress,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import { CloseOutlined, ReloadOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { VariableSizeList as List } from 'react-window';
import { AuthService } from 'services';

const calculateTableWidth = (cols) => cols.reduce((sum, col) => sum + col.width, 58);

const getStyles = (columns) => ({
  tableContainer: {
    maxHeight: 500,
    overflow: 'hidden', // Only the wrapper should handle scrolling
    position: 'relative' // Needed for proper scrolling containment
  },
  tableWrapper: {
    display: 'block',
    width: '100%',
    maxHeight: 500,
    overflowY: 'hidden',
    overflowX: 'auto',
    '&::-webkit-scrollbar': {
      height: '6px',
      width: '6px'
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#888',
      borderRadius: '4px'
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: '#f1f1f1'
    }
  },
  table: {
    tableLayout: 'fixed',
    width: '100%',
    minWidth: `${calculateTableWidth(columns)}px`
  },
  cell: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    px: 2,
    borderBottom: '1px solid rgba(224, 224, 224, 1)',
    minWidth: 0,
    width: '100%'
  },
  listContainer: {
    overflowX: 'hidden !important',
    overflowY: 'auto !important'
  }
});

const VirtualizedTable = () => {
  // State management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(250);
  const [totalRows, setTotalRows] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [sortConfig, setSortConfig] = useState({
    field: 'family_name',
    direction: 'asc'
  });
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString); // Convert to Date object
    const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with leading zero if needed
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-indexed) and pad
    const year = date.getFullYear(); // Get year

    return `${day}/${month}/${year}`; // Return formatted date
  };

  // Columns configuration
  const columns = useMemo(
    () => [
      {
        id: 'serial',
        label: '#',
        width: 60,
        sortable: false,
        numeric: true,
        render: (row, index, page, rowsPerPage) => page * rowsPerPage + index + 1
      },
      {
        id: 'datetime',
        label: 'Date Added',
        width: 120,
        sortable: true,
        render: (row) => formatDate(row.datetime)
      },
      {
        id: 'full_name',
        label: 'Full Name',
        width: 250,
        sortable: true,
        sortField: 'family_name', // Actual field to sort by
        render: (row) => `${row.family_name}, ${row.fname}`
      },
      {
        id: 'phone',
        label: 'Phone',
        width: 150,
        sortable: true,
        numeric: false,
        render: (row) => row.mobile || '-'
      },
      {
        id: 'crn',
        label: 'CRN',
        width: 150,
        sortable: true
      },
      {
        id: 'receiving_dsa',
        label: 'Receiving DSA B3/B4 Support',
        width: 250,
        sortable: true,
        render: (row) => (row.receiving_dsa == 1 ? <b style={{ color: 'green' }}>Yes</b> : <b style={{ color: 'red' }}>No</b>)
      },
      {
        id: 'institution_name',
        label: 'Institution Name',
        width: 250,
        sortable: true
      },
      {
        id: 'year_started',
        label: 'Date Started',
        width: 120,
        sortable: true,
        render: (row) => row.year_started || '-'
      },
      {
        id: 'city',
        label: 'Town/City',
        width: 200,
        sortable: true
      },
      {
        id: 'status',
        label: 'Status',
        width: 100,
        sortable: true,
        render: (row) =>
          row.status == 1 ? (
            <b style={{ color: 'green' }}>Active</b>
          ) : row.status == 2 ? (
            <b style={{ color: 'orange' }}>Pending</b>
          ) : (
            <b style={{ color: 'red' }}>Inactive</b>
          )
      }
    ],
    []
  );

  const styles = useMemo(() => getStyles(columns), [columns]);

  // Debounced search
  const debouncedFetchData = useCallback(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, rowsPerPage, sortConfig, searchText]);

  useEffect(() => {
    debouncedFetchData();
  }, [debouncedFetchData]);

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      const response = await AuthService.axiosPrivatePost(
        `studentsList?page=${page}&pageSize=${rowsPerPage}${
          sortConfig.field ? `&sortField=${sortConfig.field}&sortOrder=${sortConfig.direction}` : ''
        }${searchText ? `&search=${searchText}` : ''}`
      );
      setData(response.data.data.rows);
      setTotalRows(response.data.data.rowCount);
      setSelected([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, sortConfig, searchText]);

  // Handle sorting
  const handleSort = useCallback((field) => {
    setLoading(true);
    setSortConfig((prev) => {
      if (prev.field === field) {
        return {
          field,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return {
        field,
        direction: 'asc'
      };
    });
    setPage(0);
  }, []);

  // Handle row selection
  const handleSelect = useCallback(
    (event, id) => {
      const selectedIndex = selected.indexOf(id);
      let newSelected = [];

      if (selectedIndex === -1) {
        newSelected = [...selected, id];
      } else {
        newSelected = selected.filter((item) => item !== id);
      }

      setSelected(newSelected);
      setSelectAll(newSelected.length === data.length);
    },
    [selected, data.length]
  );

  // Handle select all
  const handleSelectAll = useCallback(
    (event) => {
      if (event.target.checked) {
        const newSelecteds = data.map((row) => row.student_id);
        setSelected(newSelecteds);
        setSelectAll(true);
      } else {
        setSelected([]);
        setSelectAll(false);
      }
    },
    [data]
  );

  // Handle search
  const handleSearch = useCallback((event) => {
    setLoading(true);
    setSearchText(event.target.value);
    setPage(0); // Reset to first page when searching
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchText('');
    setPage(0);
  }, []);

  // Generic cell renderer
  const renderCellContent = (row, column, index = 0, page = 0, rowsPerPage = 0) => {
    if (column.render) {
      return column.render(row, index, page, rowsPerPage);
    }
    return row[column.id] || '-';
  };

  // Row component using column loop
  const Row = useCallback(
    ({ index, style }) => {
      if (loading) {
        return (
          <TableRow hover style={style} sx={{ display: 'flex', width: '100%' }}>
            <TableCell colSpan={columns.length + 1} sx={{ textAlign: 'center', py: 2 }}>
              Loading data...
            </TableCell>
          </TableRow>
        );
      }

      const row = data[index];
      const isSelected = selected.includes(row.student_id);

      return (
        <TableRow hover style={style} sx={{ display: 'flex', width: '100%' }}>
          {/* Checkbox column */}
          <TableCell
            padding="checkbox"
            sx={{
              flex: '0 0 58px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Checkbox color="primary" checked={isSelected} onChange={(event) => handleSelect(event, row.student_id)} />
          </TableCell>

          {/* Dynamic columns */}
          {columns.map((column) => (
            <TableCell
              key={`${row.student_id}-${column.id}`}
              sx={{
                ...styles.cell,
                flex: `0 0 ${column.width}px`,
                width: `${column.width}px`,
                maxWidth: `${column.width}px`,
                justifyContent: column.numeric ? 'flex-end' : 'flex-start'
              }}
            >
              {renderCellContent(row, column, index, page, rowsPerPage)}
            </TableCell>
          ))}
        </TableRow>
      );
    },
    [data, selected, columns, handleSelect, page, rowsPerPage, loading, styles]
  );

  // Header component using column loop
  const renderHeader = () => (
    <TableHead>
      <TableRow sx={{ display: 'flex', width: '100%' }}>
        {/* Checkbox header */}
        <TableCell
          padding="checkbox"
          sx={{
            flex: '0 0 58px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5'
          }}
        >
          <Checkbox
            color="primary"
            indeterminate={selected.length > 0 && selected.length < data.length}
            checked={selectAll && data.length > 0}
            onChange={handleSelectAll}
          />
        </TableCell>

        {/* Dynamic column headers */}
        {columns.map((column) => (
          <TableCell
            key={column.id}
            sx={{
              ...styles.cell,
              flex: `0 0 ${column.width}px`,
              width: `${column.width}px`,
              maxWidth: `${column.width}px`,
              fontWeight: 'bold',
              backgroundColor: '#f5f5f5',
              justifyContent: column.numeric ? 'flex-end' : 'flex-start'
            }}
            sortDirection={sortConfig.field === (column.sortField || column.id) ? sortConfig.direction : false}
          >
            {column.sortable ? (
              <TableSortLabel
                active={sortConfig.field === (column.sortField || column.id)}
                direction={sortConfig.field === (column.sortField || column.id) ? sortConfig.direction : 'asc'}
                onClick={() => handleSort(column.sortField || column.id)}
                IconComponent={() => {
                  if (sortConfig.field === (column.sortField || column.id)) {
                    return sortConfig.direction === 'asc' ? (
                      <ArrowUpOutlined style={{ fontSize: '0.9rem', marginLeft: 4 }} />
                    ) : (
                      <ArrowDownOutlined style={{ fontSize: '0.9rem', marginLeft: 4 }} />
                    );
                  }
                  return <span style={{ width: 16 }} />; // Empty space for alignment
                }}
                sx={{ width: '100%' }}
              >
                {column.label}
              </TableSortLabel>
            ) : (
              column.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search..."
          value={searchText}
          onChange={handleSearch}
          InputProps={{
            endAdornment: searchText ? (
              <IconButton size="small" onClick={clearSearch} edge="end">
                <CloseOutlined style={{ fontSize: 14 }} />
              </IconButton>
            ) : null
          }}
          sx={{ width: 300, mr: 2 }}
        />
        <Tooltip title="Refresh">
          <IconButton onClick={fetchData} disabled={loading}>
            <ReloadOutlined />
          </IconButton>
        </Tooltip>
        <Box sx={{ flexGrow: 1 }} />
        {selected.length > 0 && <Box sx={{ color: 'text.secondary', px: 2 }}>{selected.length} selected</Box>}
      </Box>

      {loading && <LinearProgress />}

      <TableContainer sx={styles.tableContainer}>
        <Box component="div" sx={styles.tableWrapper}>
          <Table stickyHeader aria-label="sticky table" size="small" sx={styles.table}>
            {renderHeader()}
            <TableBody sx={{ display: 'block', overflow: 'hidden' }}>
              {loading && data.length === 0 ? (
                <TableRow sx={{ display: 'flex', width: '100%' }}>
                  <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 3 }}>
                    Loading data...
                  </TableCell>
                </TableRow>
              ) : data.length > 0 ? (
                <List height={500} itemCount={loading ? 1 : data.length} itemSize={() => 50} width="100%" style={styles.listContainer}>
                  {Row}
                </List>
              ) : (
                <TableRow sx={{ display: 'flex', width: '100%' }}>
                  <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 3 }}>
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[250, 500, 1000]}
        component="div"
        count={totalRows}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => {
          setLoading(true);
          setPage(newPage);
        }}
        onRowsPerPageChange={(event) => {
          setLoading(true);
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      />
    </Paper>
  );
};

export default VirtualizedTable;
