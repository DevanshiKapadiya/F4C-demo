import { useEffect, useState } from 'react';

/* material-ui */
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

/* project-import */
import IconButton from 'components/@extended/IconButton';
import { IndeterminateCheckbox } from 'components/third-party/react-table';
import SessionTypeModal from './SessionTypeModal';
import AlertSessionTypeDelete from 'components/AlertModal';

/* assets */
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import { AuthService } from 'services';
import RowDragDrop from 'sections/apps/table/dragDropTable';
import { openSnackbar } from 'api/snackbar';
import ActiveAction from 'components/TableActions/ActiveAction';
import InactiveAction from 'components/TableActions/InactiveAction';
import DeleteAction from 'components/TableActions/DeleteAction';
import useDebouncedSearch from 'hooks/useDebouncedSearch';
import { MenuItem, Select } from '@mui/material';

export default function SessionTypeListPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTypeList, setSessionTypeList] = useState([]);
  const [open, setOpen] = useState(false);

  const [sessionTypeModal, setSessionTypeModal] = useState(false);
  const [selectedSessionType, setSelectedSessionType] = useState(null);
  const [clearSelection, setClearSelection] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [confirmAlertIds, setConfirmAlertIds] = useState([]);
  const [currentPaginationData, setCurrentPaginationData] = useState();
  const [sortingData, setSortingData] = useState([{ id: 'position', desc: false }]);
  const [searchData, setSearchData] = useState('');
  const [filters, setFilters] = useState({
    status: 'all'
  });
  const pageLimit = 10;

  const getSessionTypeList = async (sorting, page = 1, pageLimit, search = '', filterObj = {}) => {
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

      await AuthService.axiosPrivatePost(`/sessionTypesList?${queryParams.toString()}`).then((response) => {
        setIsLoading(false);
        if (response.data.status) {
          setCurrentPaginationData({
            ...response?.data?.data?.pagination,
            currentPage: Math.max(1, response?.data?.data?.pagination?.currentPage || 1)
          });
          setSessionTypeList(response?.data?.data?.data);
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
    if (sessionTypeList.length == 0 && isLoading) {
      getSessionTypeList({ id: 'position', desc: false }, 1, pageLimit, searchData, filters);
    }
  }, []);

  const handlePaginationChange = async (newPage, newPageSize) => {
    setIsLoading(true);
    try {
      await getSessionTypeList(sortingData[0], newPage, newPageSize, searchData, filters);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortingChange = async (sorting) => {
    if (sorting && sorting.length) {
      await getSessionTypeList(sorting[0], currentPaginationData.page, currentPaginationData.limit, searchData, filters);
      setSortingData(sorting);
    } else {
      await getSessionTypeList(
        { id: 'position', desc: false },
        currentPaginationData.page,
        currentPaginationData.limit,
        searchData,
        filters
      );
      setSortingData([{ id: 'position', desc: false }]);
    }
  };

  const { handleSearch } = useDebouncedSearch(
    (search) => getSessionTypeList(sortingData[0], currentPaginationData?.page, currentPaginationData?.limit, search, filters),
    { delay: 200 }
  );

  const handleClose = () => {
    setOpen(false);
    setConfirmAction('');
    setConfirmAlertIds([]);
  };

  const columns = [
    {
      header: 'ID',
      accessorKey: 'id'
    },
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
      cell: ({ row, table }) => {
        const { pageIndex, pageSize } = table.getState().pagination;
        return pageIndex * pageSize + row.index + 1;
      },
      id: 'serial'
    },
    {
      header: 'Session Type',
      accessorKey: 'session_type',
      cell: ({ row, getValue }) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Stack spacing={0}>
            <Typography variant="title">{getValue()}</Typography>
          </Stack>
        </Stack>
      )
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
        return (
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
            <Tooltip title="Edit">
              <IconButton
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSessionType(row.original);
                  setSessionTypeModal(true);
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
  ];

  const showAlert = (action, ids) => {
    setConfirmAction(action);
    setConfirmAlertIds(ids);
    setOpen(true);
  };

  const endpoints = {
    active: '/activeSessionTypes',
    inactive: '/inactiveSessionTypes',
    delete: '/deleteSessionTypes'
  };

  const confirmActionHandler = async () => {
    setClearSelection(false);
    if (confirmAction === 'Active') {
      await ActiveAction({
        selectedRows: confirmAlertIds,
        idKey: 'session_type_id',
        endpoint: endpoints.active,
        updateStatuses: updateStatuses
      });
    } else if (confirmAction === 'Inactive') {
      await InactiveAction({
        selectedRows: confirmAlertIds,
        idKey: 'session_type_id',
        endpoint: endpoints.inactive,
        updateStatuses: updateStatuses
      });
    } else if (confirmAction === 'Delete') {
      await DeleteAction({
        selectedRows: confirmAlertIds,
        idKey: 'session_type_id',
        endpoint: endpoints.delete,
        fetchList: (newPage) => getSessionTypeList(sortingData[0], newPage, currentPaginationData?.limit, searchData, filters),
        pagination: currentPaginationData
      });
    }
    setConfirmAlertIds([]);
    setClearSelection(true);
    handleClose();
  };

  function updateStatuses(ids, newStatus) {
    const updatedList = sessionTypeList.map((item) => {
      if (ids.includes(item.session_type_id)) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    if (filters?.status == 'all') {
      setSessionTypeList(updatedList);
    } else {
      const filteredList = updatedList.filter((item) => item.status == filters.status);
      setSessionTypeList(filteredList);
    }
  }

  const setSessionTypeListOrder = async (ids) => {
    if (sortingData.length && sortingData[0].id != 'position') {
      console.log('Drag & Drop not allowed while sorting is active');
      console.log(sortingData);
      return;
    }
    const newIds = ids.map((item) => item.session_type_id).join(',');

    try {
      const response = await AuthService.axiosPrivatePost(
        '/updateSessionTypesPosition',
        {
          session_type_ids: newIds,
          page: currentPaginationData.page,
          limit: currentPaginationData.limit
        },
        {
          params: {
            page: currentPaginationData?.currentPage || 1,
            limit: currentPaginationData?.perPage || pageLimit
          }
        }
      );
      if (response.data.status) {
        setSessionTypeList(response?.data?.data?.data);
        setCurrentPaginationData({
          ...response?.data?.data?.pagination,
          currentPage: Math.max(1, response?.data?.data?.pagination?.currentPage || 1)
        });
        openSnackbar({
          open: true,
          message: response.data.message,
          variant: 'alert',
          alert: {
            color: 'success'
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const filterCode = (
    <>
      <Select
        value={filters?.status}
        onChange={(event) =>
          setFilters((prev) => {
            const updated = { ...prev, status: event.target.value };
            getSessionTypeList(sortingData[0], currentPaginationData?.page, currentPaginationData?.limit, searchData, updated);
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
      <RowDragDrop
        {...{
          data: sessionTypeList,
          columns,
          modalToggler: () => {
            setSessionTypeModal(true);
            setSelectedSessionType(null);
          },
          addTitle: 'Add Session Type',
          isLoading: isLoading,
          setOrder: setSessionTypeListOrder,
          setActive: (row) => showAlert('Active', row),
          setInactive: (row) => showAlert('Inactive', row),
          setDelete: (row) => showAlert('Delete', row),
          clearSelection,
          customFilter: { filterCode },
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
        <AlertSessionTypeDelete
          open={open}
          type={confirmAction}
          ids={confirmAlertIds}
          handleClose={handleClose}
          onConfirm={confirmActionHandler}
        />
      ) : null}
      <SessionTypeModal
        open={sessionTypeModal}
        modalToggler={setSessionTypeModal}
        sessionType={selectedSessionType}
        isSucess={() =>
          getSessionTypeList({ id: 'position', desc: false }, currentPaginationData?.currentPage || 1, pageLimit, searchData, filters)
        }
      />
    </>
  );
}
