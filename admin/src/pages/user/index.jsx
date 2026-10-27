import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/* material-ui */
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { MenuItem, Select } from '@mui/material';
/* project-import */
import IconButton from 'components/@extended/IconButton';
import { IndeterminateCheckbox } from 'components/third-party/react-table';
import UserModal from './UserModal';
import AlertModal from 'components/AlertModal';
// import UserTable from 'sections/apps/table/CommonTable';
import RowDragDrop from 'sections/apps/table/dragDropTable';

/* assets */
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

import { AuthService } from 'services';
import ExpandingDetail from 'pages/user/ExpandingDetail';
import useDebouncedSearch from 'hooks/useDebouncedSearch';
import { openSnackbar } from 'api/snackbar';
import ActiveAction from 'components/TableActions/ActiveAction';
import InactiveAction from 'components/TableActions/InactiveAction';
import DeleteAction from 'components/TableActions/DeleteAction';

// ==============================|| USER MANAGEMENT – LIST PAGE ||============================== //

const SESSION_TYPE_OPTIONS = [
  { value: 'all', label: 'All Session Types' },
  { value: 'online', label: 'Online' },
  { value: 'in-person', label: 'In-Person' },
  { value: 'either', label: 'Either' }
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' }
];

const sessionChipProps = (val) => {
  switch (val) {
    case 'online':
      return { label: 'Online', color: 'primary' };
    case 'in-person':
      return { label: 'In-Person', color: 'success' };
    case 'either':
      return { label: 'Either', color: 'warning' };
    default:
      return { label: 'Not Set', color: 'default' };
  }
};

export default function UserListPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userList, setUserList] = useState([]);
  const [countries, setCountries] = useState([]);
  const [open, setOpen] = useState(false);
  const [userModal, setUserModal] = useState(false);
  const [clearSelection, setClearSelection] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState('');
  const [confirmAlertIds, setConfirmAlertIds] = useState([]);
  const [currentPaginationData, setCurrentPaginationData] = useState();
  const [sortingData, setSortingData] = useState([{ id: 'position', desc: false }]);
  const [searchData, setSearchData] = useState('');
  const [filters, setFilters] = useState({ session_type: 'all', status: 'all' });

  const pageLimit = 10;
  const didFetch = useRef(false);

  const handleUserReorder = async (updatedRows) => {
    if (!Array.isArray(updatedRows)) return;

    if (sortingData[0]?.id !== 'position') {
      openSnackbar({
        open: true,
        message: 'Remove column sorting to move users',
        variant: 'alert',
        alert: { color: 'warning' }
      });
      getUserList(sortingData[0], currentPaginationData?.currentPage || 1, currentPaginationData?.limit || pageLimit, searchData, filters);
      return;
    }

    const previousRows = [...userList];

    // Preserve the original position values for the current page.
    const originalPositions = previousRows.map((user) => Number(user.position));

    const reorderedUsers = updatedRows.map((user, index) => ({
      ...user,
      position: originalPositions[index]
    }));

    setUserList(reorderedUsers);

    try {
      const response = await AuthService.axiosPrivatePost('/updateUserPosition', {
        users: reorderedUsers.map((user) => ({
          user_id: user.user_id,
          position: user.position
        }))
      });

      if (response.data?.status) {
        openSnackbar({
          open: true,
          message: response.data?.message || 'User order updated',
          variant: 'alert',
          alert: { color: 'success' }
        });
      } else {
        throw new Error(response.data?.message || 'Failed to update positions');
      }
    } catch (error) {
      console.error('Unable to save user order:', error);
      openSnackbar({
        open: true,
        message: error?.message || 'Unable to update order',
        variant: 'alert',
        alert: { color: 'error' }
      });
      setUserList(previousRows);
    }
  };

  useEffect(() => {
    const fetchCounteries = async () => {
      try {
        const response = await AuthService.axiosPrivatePost('/countryList', {});

        if (response.data?.status) {
          setCountries(response.data.data || []);
        }
      } catch (error) {
        console.error('Country fetch error:', error);
      }
    };
    fetchCounteries();
  }, []);

  /* ---- DATA FETCH ---- */
  const getUserList = useCallback(
    async (sorting, page = 1, limit = pageLimit, search = '', filterObj = {}) => {
      setIsLoading(true);
      try {
        const payload = {
          page,
          limit,
          order: sorting?.id || 'position',
          desc: String(sorting?.desc ?? false),
          search: search || ''
        };

        Object.entries(filterObj).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined && value !== 'all') {
            payload[key] = value;
          }
        });

        const response = await AuthService.axiosPrivatePost('/userList', payload);

        if (response.data.status) {
          const data = (response.data.data.data || []).map((item, index) => ({
            serial_number: index + 1,
            ...item
          }));
          setUserList(data);
          setCurrentPaginationData({
            ...response.data.data.pagination,
            currentPage: Math.max(1, response.data.data.pagination?.currentPage || 1)
          });
        } else {
          console.warn('User list fetch failed:', response.data.message);
          setUserList([]);
        }
      } catch (error) {
        console.error('getUserList error:', error);
        setUserList([]);
      } finally {
        setIsLoading(false);
      }
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (!didFetch.current) {
      didFetch.current = true;
      getUserList({ id: 'position', desc: false }, 1, pageLimit, '', filters);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- PAGINATION / SORTING / SEARCH ---- */
  const handlePaginationChange = useCallback(
    async (newPage, newPageSize) => {
      await getUserList(sortingData[0], newPage, newPageSize, searchData, filters);
    },
    [getUserList, sortingData, searchData, filters]
  );

  const handleSortingChange = useCallback(
    async (sorting) => {
      const newSort = sorting && sorting.length ? sorting[0] : { id: 'position', desc: false };
      setSortingData([newSort]);
      await getUserList(newSort, currentPaginationData?.currentPage, currentPaginationData?.limit, searchData, filters);
    },
    [getUserList, currentPaginationData, searchData, filters]
  );

  const { handleSearch } = useDebouncedSearch(
    (search) => getUserList(sortingData[0], currentPaginationData?.currentPage, currentPaginationData?.limit, search, filters),
    { delay: 300 }
  );

  /* ---- STATUS UPDATE (Active / Inactive) ---- */
  function updateStatuses(ids, newStatus) {
    setUserList((prev) => prev.map((item) => (ids.includes(item.user_id) ? { ...item, status: newStatus } : item)));
  }

  /* ---- ALERT DIALOG ---- */
  const handleClose = () => {
    setOpen(false);
    setConfirmAction('');
    setConfirmAlertIds([]);
  };

  const showAlert = (action, ids) => {
    setConfirmAction(action);
    setConfirmAlertIds(ids);
    setOpen(true);
  };

  /* ---- CONFIRM HANDLER ---- */
  const confirmActionHandler = async () => {
    setClearSelection(false);
    if (confirmAction === 'Active') {
      await ActiveAction({
        selectedRows: confirmAlertIds,
        idKey: 'user_id',
        endpoint: '/activeUser',
        updateStatuses
      });
    } else if (confirmAction === 'Inactive') {
      await InactiveAction({
        selectedRows: confirmAlertIds,
        idKey: 'user_id',
        endpoint: '/inactiveUser',
        updateStatuses
      });
    } else if (confirmAction === 'Delete') {
      await DeleteAction({
        selectedRows: confirmAlertIds,
        idKey: 'user_id',
        endpoint: '/deleteUser',
        fetchList: (newPage) => getUserList(sortingData[0], newPage, currentPaginationData?.limit, searchData, filters),
        pagination: currentPaginationData
      });
    }
    setConfirmAlertIds([]);
    setClearSelection(true);
    handleClose();
  };

  /* ---- EXPANDING ROW ---- */
  const ExpandingDetails = (row) => <ExpandingDetail data={row.original} />;

  /* ---- COLUMNS ---- */
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      {
        header: '#',
        id: 'serial',
        cell: ({ row, table }) => {
          const { pageIndex, pageSize } = table.getState().pagination;
          return pageIndex * pageSize + row.index + 1;
        }
      },
      {
        header: 'User Name',
        accessorKey: 'name',
        cell: ({ getValue }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="subtitle1">{getValue() || '—'}</Typography>
          </Stack>
        )
      },
      {
        header: 'Email',
        accessorKey: 'email',
        cell: ({ getValue }) => <Typography variant="body2">{getValue() || '—'}</Typography>
      },
      {
        header: 'Session Type',
        accessorKey: 'preferred_session_type',
        cell: ({ getValue }) => {
          const chip = sessionChipProps(getValue());
          return <Chip label={chip.label} color={chip.color} size="small" variant="light" />;
        }
      },
      {
        header: 'Registration Date',
        accessorKey: 'created_at',
        cell: ({ getValue }) => {
          const val = getValue();
          if (!val) return <Typography variant="body2">—</Typography>;
          const d = new Date(val);
          return (
            <Typography variant="body2">{d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Typography>
          );
        }
      },
      {
        header: 'Location',
        accessorKey: 'city_town',
        cell: ({ row }) => {
          const city = row.original.city_town;
          const countryId = row.original.country;
          const selectedCountry = countries.find((item) => String(item.id) === String(countryId));
          const countryName = row.original.country_name || selectedCountry?.name || '';

          const location = [city, countryName].filter(Boolean).join(', ');
          return <Typography variant="body2">{location || '—'}</Typography>;
        }
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) =>
          getValue() == 1 ? (
            <Chip color="success" label="Active" size="small" variant="light" />
          ) : (
            <Chip color="error" label="Inactive" size="small" variant="light" />
          )
      },
      {
        header: 'Actions',
        meta: { className: 'cell-center' },
        disableSortBy: true,
        cell: ({ row }) => {
          const collapseIcon =
            row.getCanExpand() && row.getIsExpanded() ? <PlusOutlined style={{ transform: 'rotate(45deg)' }} /> : <EyeOutlined />;

          return (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
              <Tooltip title="View">
                <IconButton color={row.getIsExpanded() ? 'error' : 'secondary'} onClick={row.getToggleExpandedHandler()}>
                  {collapseIcon}
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedUser(row.original);
                    setUserModal(true);
                  }}
                >
                  <EditOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    showAlert('Delete', [row]);
                  }}
                >
                  <DeleteOutlined />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      }
    ],
    [countries] // eslint-disable-line react-hooks/exhaustive-deps
  );

  /* ---- CUSTOM FILTER (session type dropdown) ---- */
  const handleFilterChange = (key, value) => {
    const updated = {
      ...filters,
      [key]: value
    };

    setFilters(updated);

    getUserList(sortingData[0], 1, pageLimit, searchData, updated);
  };

  const filterCode = (
    <Stack direction="row" spacing={2} alignItems="center">
      <Select value={filters.session_type} onChange={(e) => handleFilterChange('session_type', e.target.value)} displayEmpty size="small">
        {SESSION_TYPE_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
      <Select
        value={filters.status ?? 'all'}
        onChange={(e) => handleFilterChange('status', e.target.value)}
        size="small"
        sx={{ minWidth: 150 }}
        displayEmpty
        renderValue={(selected) => {
          if (selected === 'all' || !selected) return 'All Status';
          if (selected === '1') return 'Active';
          if (selected === '0') return 'Inactive';
          return 'All Status';
        }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );

  /* ---- RENDER ---- */
  return (
    <>
      <RowDragDrop
        {...{
          data: userList,
          columns,
          setOrder: handleUserReorder,
          modalToggler: () => {
            setSelectedUser(null);
            setUserModal(true);
          },
          addTitle: 'Add User',
          isLoading,
          setActive: (rows) => showAlert('Active', rows),
          setInactive: (rows) => showAlert('Inactive', rows),
          setDelete: (rows) => showAlert('Delete', rows),
          clearSelection,
          customFilter: { filterCode },
          ExpandRow: ExpandingDetails,
          pagination: currentPaginationData,
          onPaginationChange: handlePaginationChange,
          handleSortingChange: handleSortingChange,
          handleSearchData: (search) => {
            handleSearch(search);
            setSearchData(search);
          }
        }}
      />

      {/* Confirmation dialog */}
      {confirmAction !== '' && (
        <AlertModal open={open} type={confirmAction} ids={confirmAlertIds} handleClose={handleClose} onConfirm={confirmActionHandler} />
      )}

      {/* Add / Edit modal */}
      <UserModal
        open={userModal}
        modalToggler={(val) => setUserModal(val)}
        user={selectedUser}
        isSucess={() => {
          getUserList(sortingData[0], currentPaginationData?.currentPage, currentPaginationData?.limit, searchData, filters);
          setUserModal(false);
        }}
      />
    </>
  );
}
