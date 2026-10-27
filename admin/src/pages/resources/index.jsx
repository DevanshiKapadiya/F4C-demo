import { useEffect, useState } from 'react';

/* material-ui */
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Avatar, MenuItem, Select } from '@mui/material';

/* project-import */
import IconButton from 'components/@extended/IconButton';
import { IndeterminateCheckbox } from 'components/third-party/react-table';

import ResourceModal from './ResourceModal';
import ResourceConfirmDialog from './ResourceConfirmDialog';
import ExpandingDetail from './ExpandingDetail';
import ResourceTable from 'sections/apps/table/dragDropTable';

/* assets */
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import StopOutlined from '@ant-design/icons/StopOutlined';

import { AuthService } from 'services';
import { openSnackbar } from 'api/snackbar';
import useDebouncedSearch from 'hooks/useDebouncedSearch';

export default function Resources() {
  const [isLoading, setIsLoading] = useState(true);
  const [resourceList, setResourceList] = useState([]);
  const [open, setOpen] = useState(false);

  const [resourceModal, setResourceModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
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

  const getResourceList = async (sorting, page = 1, pageLimit, search = '', filterObj = {}) => {
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
        if (value !== '' && value !== null && value !== undefined && value !== 'all') {
          queryParams.append(key, value);
        }
      });

      const response = await AuthService.axiosPrivatePost(`/resourceList?${queryParams.toString()}`);
      setIsLoading(false);
      if (response.data.status) {
        setCurrentPaginationData({
          ...response?.data?.data?.pagination,
          currentPage: Math.max(1, response?.data?.data?.pagination?.currentPage || 1)
        });
        setResourceList(response?.data?.data?.data || []);
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching resources:', error);
    }
  };

  useEffect(() => {
    getResourceList({ id: 'position', desc: false }, 1, pageLimit, searchData, filters);
  }, []);

  const handlePaginationChange = async (newPage, newPageSize) => {
    setIsLoading(true);
    try {
      await getResourceList(sortingData[0], newPage, newPageSize, searchData, filters);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSortingChange = async (sorting) => {
    if (sorting && sorting.length) {
      await getResourceList(
        sorting[0],
        currentPaginationData?.currentPage || 1,
        currentPaginationData?.limit || pageLimit,
        searchData,
        filters
      );
      setSortingData(sorting);
    } else {
      await getResourceList(
        { id: 'position', desc: false },
        currentPaginationData?.currentPage || 1,
        currentPaginationData?.limit || pageLimit,
        searchData,
        filters
      );
      setSortingData([{ id: 'position', desc: false }]);
    }
  };

  const setResourceListOrder = async (rows) => {
    if (sortingData.length && sortingData[0].id !== 'position') {
      console.log('Drag & Drop not allowed while sorting is active');
      return;
    }
    const newIds = rows.map((item) => item.resource_id).join(',');

    try {
      const response = await AuthService.axiosPrivatePost('/updateResourcePosition', { resource_ids: newIds });
      openSnackbar({
        open: true,
        message: response.data.status ? response.data.message : response.data.message || 'Unable to update order',
        variant: 'alert',
        alert: { color: response.data.status ? 'success' : 'error' }
      });
      getResourceList(
        sortingData[0],
        currentPaginationData?.currentPage || 1,
        currentPaginationData?.limit || pageLimit,
        searchData,
        filters
      );
    } catch (error) {
      console.error(error);
      openSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Unable to update order. Please restart the API server.',
        variant: 'alert',
        alert: { color: 'error' }
      });
      getResourceList(
        sortingData[0],
        currentPaginationData?.currentPage || 1,
        currentPaginationData?.limit || pageLimit,
        searchData,
        filters
      );
    }
  };

  const { handleSearch } = useDebouncedSearch(
    (search) => getResourceList(sortingData[0], 1, currentPaginationData?.limit || pageLimit, search, filters),
    { delay: 300 }
  );

  const handleClose = () => {
    setOpen(false);
    setConfirmAction('');
    setConfirmAlertIds([]);
  };

  const showAlert = (action, rows) => {
    setConfirmAction(action);
    setConfirmAlertIds(rows);
    setOpen(true);
  };

  const confirmActionHandler = async (reason = '') => {
    setClearSelection(false);
    try {
      const ids = confirmAlertIds.map((item) => item.original.resource_id);
      const idsString = ids.join(',');

      if (confirmAction === 'Active') {
        const response = await AuthService.axiosPrivatePost('/activeResource', { resource_ids: idsString });
        if (response.data.status) {
          openSnackbar({
            open: true,
            message: response.data.message || 'Resource(s) activated successfully',
            variant: 'alert',
            alert: { color: 'success' }
          });
          updateLocalStatuses(ids, 1);
        }
      } else if (confirmAction === 'Inactive') {
        const response = await AuthService.axiosPrivatePost('/inactiveResource', {
          resource_ids: idsString,
          reason
        });
        if (response.data.status) {
          openSnackbar({
            open: true,
            message: response.data.message || 'Resource(s) deactivated successfully',
            variant: 'alert',
            alert: { color: 'warning' }
          });
          updateLocalStatuses(ids, 0);
        }
      } else if (confirmAction === 'Delete') {
        const response = await AuthService.axiosPrivatePost('/deleteResource', {
          resource_ids: idsString,
          reason
        });
        if (response.data.status) {
          openSnackbar({
            open: true,
            message: response.data.message || 'Resource(s) deleted successfully',
            variant: 'alert',
            alert: { color: 'success' }
          });
          getResourceList(
            sortingData[0],
            currentPaginationData?.currentPage || 1,
            currentPaginationData?.limit || pageLimit,
            searchData,
            filters
          );
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmAlertIds([]);
      setClearSelection(true);
      handleClose();
    }
  };

  function updateLocalStatuses(ids, newStatus) {
    const updatedList = resourceList.map((item) => {
      if (ids.includes(item.resource_id)) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    if (filters?.status === 'all') {
      setResourceList(updatedList);
    } else {
      const filteredList = updatedList.filter((item) => String(item.status) === String(filters.status));
      setResourceList(filteredList);
    }
  }

  const ExpandingDetails = (data) => {
    return <ExpandingDetail data={data.original} />;
  };

  const columns = [
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
      header: 'Image',
      accessorKey: 'image',
      enableSorting: false,
      cell: ({ row }) => {
        const { image, title, alt_text } = row.original;
        const firstLetter = (title || alt_text || 'R').trim().charAt(0).toUpperCase();
        return (
          <Stack direction="row" spacing={1.5} alignItems="center">
            {image ? (
              <Avatar alt={title} src={image} sx={{ width: 44, height: 44, borderRadius: 1 }} />
            ) : (
              <Tooltip title={title || 'Resource'}>
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1,
                    bgcolor: 'primary.lighter',
                    color: 'primary.main',
                    fontSize: '1.1rem',
                    fontWeight: 700
                  }}
                >
                  {firstLetter}
                </Avatar>
              </Tooltip>
            )}
          </Stack>
        );
      }
    },
    {
      header: 'Title',
      accessorKey: 'title',
      enableSorting: true,
      cell: ({ row }) => (
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600
          }}
        >
          {row.original.title}
        </Typography>
      )
    },
    {
      header: 'Short Description',
      accessorKey: 'short_description',
      enableSorting: false,
      cell: ({ getValue }) => (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 260,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {getValue() || '-'}
        </Typography>
      )
    },
    {
      header: 'Reading Time',
      accessorKey: 'reading_time',
      enableSorting: true,
      cell: ({ getValue }) => <Typography variant="body2">{getValue() || 0} Minute(s)</Typography>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      enableSorting: true,
      cell: ({ getValue }) => {
        const statusVal = Number(getValue());
        return (
          <Chip
            color={statusVal === 1 ? 'success' : 'error'}
            label={statusVal === 1 ? 'Active' : 'Inactive'}
            size="small"
            variant="light"
          />
        );
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
                  setSelectedResource(row.original);
                  setResourceModal(true);
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

  const filterCode = (
    <Select
      value={filters?.status ?? 'all'}
      onChange={(event) =>
        setFilters((prev) => {
          const updated = { ...prev, status: event.target.value };
          getResourceList(sortingData[0], 1, currentPaginationData?.limit || pageLimit, searchData, updated);
          return updated;
        })
      }
      size="small"
      sx={{ minWidth: 150 }}
      displayEmpty
      inputProps={{ 'aria-label': 'Status Filter' }}
      disabled={isLoading}
      renderValue={(selected) => {
        if (selected === 'all' || selected === undefined || selected === null) return 'All Status';
        if (String(selected) === '1') return 'Active';
        if (String(selected) === '0') return 'Inactive';
        return 'All Status';
      }}
    >
      <MenuItem value="all">All Status</MenuItem>
      <MenuItem value={1}>Active</MenuItem>
      <MenuItem value={0}>Inactive</MenuItem>
    </Select>
  );

  return (
    <>
      <ResourceTable
        {...{
          data: resourceList,
          columns,
          modalToggler: () => {
            setResourceModal(true);
            setSelectedResource(null);
          },
          addTitle: 'Add Resource',
          isLoading: isLoading,
          setOrder: setResourceListOrder,
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

      {confirmAction !== '' && (
        <ResourceConfirmDialog
          open={open}
          type={confirmAction}
          items={confirmAlertIds}
          handleClose={handleClose}
          onConfirm={confirmActionHandler}
        />
      )}

      <ResourceModal
        open={resourceModal}
        modalToggler={setResourceModal}
        resource={selectedResource}
        isSucess={() => getResourceList(sortingData[0], 1, pageLimit, searchData, filters)}
      />
    </>
  );
}
