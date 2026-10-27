import { useEffect, useMemo, useState } from 'react';

/* material-ui */
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

/* project-import */
import IconButton from 'components/@extended/IconButton';
import { IndeterminateCheckbox } from 'components/third-party/react-table';

import AdminModal from './AdminModal';
import AlertAdminDelete from 'components/AlertModal';
import AdminTable from 'sections/apps/table/CommonTable';

/* assets */
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import { AuthService } from 'services';
import ExpandingDetail from 'pages/admin/ExpandingDetail';
import { LockOutlined } from '@ant-design/icons';
import useDebouncedSearch from 'hooks/useDebouncedSearch';
import ActiveAction from 'components/TableActions/ActiveAction';
import InactiveAction from 'components/TableActions/InactiveAction';
import DeleteAction from 'components/TableActions/DeleteAction';
import { MenuItem, Select } from '@mui/material';

export default function AdminListPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [adminList, setAdminList] = useState([]);
  const [open, setOpen] = useState(false);

  const [adminModal, setAdminModal] = useState(false);
  const [clearSelection, setClearSelection] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [confirmAction, setConfirmAction] = useState('');
  const [confirmAlertIds, setConfirmAlertIds] = useState([]);
  const [isAdminPasswordChange, setIsAdminPasswordChange] = useState(false);
  const [currentPaginationData, setCurrentPaginationData] = useState();
  const [sortingData, setSortingData] = useState([{ id: 'created_at', desc: false }]);
  const [searchData, setSearchData] = useState('');
  const [filters, setFilters] = useState({
    status: 'all'
  });
  const pageLimit = 10;

  const getAdminList = async (sorting, page = 1, pageLimit, search = '', filterObj = {}) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: pageLimit,
        order: sorting.id,
        desc: sorting.desc,
        search
      });

      Object.entries(filterObj).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          queryParams.append(key, value);
        }
      });

      await AuthService.axiosPrivatePost(`/adminsList?${queryParams.toString()}`).then((response) => {
        setIsLoading(false);
        if (response.data.status) {
          const data = response?.data?.data?.data?.map((item, index) => ({
            serial_number: index + 1,
            ...item
          }));
          setAdminList(data);
          setCurrentPaginationData({
            ...response?.data?.data?.pagination,
            currentPage: Math.max(1, response?.data?.data?.pagination?.currentPage || 1)
          });
        } else {
          console.log(response.data.message);
        }
      });
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    /* Only fetch if we don't have data yet */
    if (adminList.length == 0 && isLoading) {
      getAdminList({ id: 'created_at', desc: false }, 1, pageLimit, searchData, filters);
    }
  }, []);

  const handlePaginationChange = async (newPage, newPageSize) => {
    setIsLoading(true);
    try {
      await getAdminList(sortingData[0], newPage, newPageSize, searchData, filters);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortingChange = async (sorting) => {
    if (sorting && sorting.length) {
      await getAdminList(sorting[0], currentPaginationData.page, currentPaginationData.limit, searchData, filters);
      setSortingData(sorting);
    } else {
      await getAdminList({ id: 'created_at', desc: false }, currentPaginationData.page, currentPaginationData.limit, searchData, filters);
      setSortingData([{ id: 'created_at', desc: false }]);
    }
  };

  const { handleSearch } = useDebouncedSearch(
    (search) => getAdminList(sortingData[0], currentPaginationData?.page, currentPaginationData?.limit, search, filters),
    { delay: 200 }
  );

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

  const columns = useMemo(
    () => [
      {
        header: 'ID',
        accessorKey: 'id'
      },
      {
        id: 'created_at',
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
        cell: ({ row, table }) => {
          const { pageIndex, pageSize } = table.getState().pagination;
          return pageIndex * pageSize + row.index + 1;
        },
        id: 'serial'
      },
      {
        header: 'Full name',
        accessorKey: 'name',
        cell: ({ row, getValue }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Stack spacing={0}>
              <Typography variant="title">{getValue()}</Typography>
            </Stack>
          </Stack>
        )
      },
      {
        header: 'Email',
        accessorKey: 'email',
        cell: ({ getValue }) => <Typography variant="title">{getValue()}</Typography>
      },
      {
        header: 'username',
        accessorKey: 'username',
        cell: ({ getValue }) => <Typography variant="title">{getValue()}</Typography>
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: (cell) => {
          switch (cell.getValue()) {
            case 0:
              return <Chip color="error" label="Inactive" size="small" variant="light" />;
            default:
              return <Chip color="success" label="Active" size="small" variant="light" />;
          }
        }
      },
      {
        header: 'Actions',
        meta: {
          className: 'cell-center'
        },
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
                    setSelectedAdmin(row.original);
                    setAdminModal(true);
                  }}
                >
                  <EditOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title="Change Password">
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAdmin(row.original);
                    setIsAdminPasswordChange(true);
                    setAdminModal(true);
                  }}
                >
                  <LockOutlined />
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
    [setAdminModal, setIsAdminPasswordChange, showAlert]
  );

  const endpoints = {
    active: '/activeAdmin',
    inactive: '/inactiveAdmin',
    delete: '/deleteAdmin'
  };

  const confirmActionHandler = async () => {
    setClearSelection(false);
    if (confirmAction === 'Active') {
      await ActiveAction({
        selectedRows: confirmAlertIds,
        idKey: 'admin_id',
        endpoint: endpoints.active,
        updateStatuses: updateStatuses
      });
    } else if (confirmAction === 'Inactive') {
      await InactiveAction({
        selectedRows: confirmAlertIds,
        idKey: 'admin_id',
        endpoint: endpoints.inactive,
        updateStatuses: updateStatuses
      });
    } else if (confirmAction === 'Delete') {
      await DeleteAction({
        selectedRows: confirmAlertIds,
        idKey: 'admin_id',
        endpoint: endpoints.delete,
        fetchList: (newPage) => getAdminList(sortingData[0], newPage, currentPaginationData?.limit, searchData, filters),
        pagination: currentPaginationData
      });
    }
    setConfirmAlertIds([]);
    setClearSelection(true);
    handleClose();
  };

  function updateStatuses(ids, newStatus) {
    const updatedList = adminList.map((item) => {
      if (ids.includes(item.admin_id)) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    if (filters?.status == 'all') {
      setAdminList(updatedList);
    } else {
      const filteredList = updatedList.filter((item) => item.status == filters.status);
      setAdminList(filteredList);
    }
  }

  const ExpandingDetails = (data) => {
    return <ExpandingDetail data={data.original} />;
  };

  const filterCode = (
    <>
      <Select
        value={filters?.status}
        onChange={(event) =>
          setFilters((prev) => {
            const updated = { ...prev, status: event.target.value };
            getAdminList(sortingData[0], currentPaginationData?.page, currentPaginationData?.limit, searchData, updated);
            return updated;
          })
        }
        displayEmpty
        inputProps={{ 'aria-label': 'Status Filter' }}
        disabled={isLoading}
      >
        <MenuItem value="all">All Status</MenuItem>
        <MenuItem value={1}>Active</MenuItem>
        <MenuItem value={0}>Inactive</MenuItem>
      </Select>
    </>
  );

  return (
    <>
      <AdminTable
        {...{
          data: adminList,
          columns,
          modalToggler: () => {
            setAdminModal(true);
            setSelectedAdmin(null);
          },
          addTitle: 'Add Admin',
          isLoading: isLoading,
          setActive: (row) => showAlert('Active', row),
          setInactive: (row) => showAlert('Inactive', row),
          setDelete: (row) => showAlert('Delete', row),
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
      {confirmAction != '' ? (
        <AlertAdminDelete
          open={open}
          type={confirmAction}
          ids={confirmAlertIds}
          handleClose={handleClose}
          onConfirm={confirmActionHandler}
        />
      ) : null}
      <AdminModal
        open={adminModal}
        modalToggler={(val) => {
          setAdminModal(val);
          !val && setIsAdminPasswordChange(false);
        }}
        admin={selectedAdmin}
        onHide={() => setIsAdminPasswordChange(false)}
        isSucess={() => {
          getAdminList(sortingData[0], currentPaginationData.page, currentPaginationData.limit, searchData, filters);
          setAdminModal(false);
          setIsAdminPasswordChange(false);
        }}
        isPassword={isAdminPasswordChange}
      />
    </>
  );
}
