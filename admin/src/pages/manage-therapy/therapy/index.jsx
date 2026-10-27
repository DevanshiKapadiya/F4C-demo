import { useEffect, useMemo, useState } from 'react';

/* material-ui */
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

/* project-import */
import IconButton from 'components/@extended/IconButton';
import { IndeterminateCheckbox } from 'components/third-party/react-table';
import TherapyModal from './TherapyModal';
import AlertTherapyDelete from 'components/AlertModal';

/* assets */
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import { AuthService } from 'services';
import RowDragDrop from 'sections/apps/table/dragDropTable';
import { openSnackbar } from 'api/snackbar';
import { MenuItem, Select } from '@mui/material';
import ActiveAction from 'components/TableActions/ActiveAction';
import InactiveAction from 'components/TableActions/InactiveAction';
import DeleteAction from 'components/TableActions/DeleteAction';
import useDebouncedSearch from 'hooks/useDebouncedSearch';

export default function Therapy() {
  const [isLoading, setIsLoading] = useState(true);
  const [therapyList, setTherapyList] = useState([]);
  const [filteredTherapyList, setFilteredTherapyList] = useState([]);
  const [open, setOpen] = useState(false);
  const [therapyCategoryList, setTherapyCategoryList] = useState([]);

  const [therapyModal, setTherapyModal] = useState(false);
  const [selectedTherapy, setSelectedTherapy] = useState(null);
  const [clearSelection, setClearSelection] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [confirmAlertIds, setConfirmAlertIds] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPaginationData, setCurrentPaginationData] = useState();
  const [sortingData, setSortingData] = useState([{ id: 'position', desc: false }]);
  const [searchData, setSearchData] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    therapy_category_id: ''
  });
  const pageLimit = 10;

  const getTherapyList = async (sorting, page = 1, pageLimit, search = '', filterObj = {}) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: pageLimit,
        order: sorting.id,
        desc: sorting.desc,
        search
      });

      /* Append dynamic filters to query params */
      Object.entries(filterObj).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          queryParams.append(key, value);
        }
      });
      await AuthService.axiosPrivatePost(`/therapyList?${queryParams.toString()}`).then((response) => {
        setIsLoading(false);
        if (response.data.status) {
          setCurrentPaginationData({
            ...response?.data?.data?.pagination,
            currentPage: Math.max(1, response?.data?.data?.pagination?.currentPage || 1)
          });
          setTherapyList(response?.data?.data?.data);
          setFilteredTherapyList(response?.data?.data?.data);
          setCategoryFilter('');
        } else {
          console.log(response.data.message);
        }
      });
    } catch (error) {
      setIsLoading(false);
    }
  };

  const getTherapyCategory = async () => {
    setIsLoading(true);
    try {
      const response = await AuthService.axiosPrivatePost('/therapyCategoryListForTherapy');
      setIsLoading(false);
      if (response.data.status) {
        setTherapyCategoryList(response?.data?.data);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      setIsLoading(false);
      console.log('An error occurred while fetching therapy categories.');
    }
  };

  useEffect(() => {
    getTherapyCategory();
    if (therapyList.length == 0 && isLoading) {
      getTherapyList({ id: 'position', desc: false }, 1, pageLimit, searchData, filters);
    }
  }, []);

  const handlePaginationChange = async (newPage, newPageSize) => {
    setIsLoading(true);
    try {
      await getTherapyList(sortingData[0], newPage, newPageSize, searchData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortingChange = async (sorting) => {
    if (sorting && sorting.length) {
      await getTherapyList(sorting[0], currentPaginationData.page, currentPaginationData.limit);
      setSortingData(sorting);
    } else {
      await getTherapyList({ id: 'position', desc: false }, currentPaginationData.page, currentPaginationData.limit);
      setSortingData([{ id: 'position', desc: false }]);
    }
  };

  const { handleSearch } = useDebouncedSearch(
    (search) => getTherapyList(sortingData[0], currentPaginationData?.page, currentPaginationData?.limit, search, filters),
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
      id: 'therapy_id',
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
      header: 'Therapy Category',
      accessorKey: 'therapy_category',
      cell: ({ row, getValue }) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Stack spacing={0}>
            <Typography variant="title">{getValue()}</Typography>
          </Stack>
        </Stack>
      )
    },
    {
      header: 'Therapy',
      accessorKey: 'therapy',
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
                  setSelectedTherapy(row.original);
                  setTherapyModal(true);
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
    active: '/activeTherapy',
    inactive: '/inactiveTherapy',
    delete: '/deleteTherapy'
  };

  const confirmActionHandler = async () => {
    setClearSelection(false);
    if (confirmAction === 'Active') {
      await ActiveAction({
        selectedRows: confirmAlertIds,
        idKey: 'therapy_id',
        endpoint: endpoints.active,
        updateStatuses: updateStatuses
      });
    } else if (confirmAction === 'Inactive') {
      await InactiveAction({
        selectedRows: confirmAlertIds,
        idKey: 'therapy_id',
        endpoint: endpoints.inactive,
        updateStatuses: updateStatuses
      });
    } else if (confirmAction === 'Delete') {
      await DeleteAction({
        selectedRows: confirmAlertIds,
        idKey: 'therapy_id',
        endpoint: endpoints.delete,
        fetchList: (newPage) => getTherapyList(sortingData[0], newPage, currentPaginationData?.limit, searchData, filters),
        pagination: currentPaginationData
      });
    }
    setConfirmAlertIds([]);
    setClearSelection(true);
    handleClose();
  };

  function updateStatuses(ids, newStatus) {
    const updatedList = therapyList.map((item) => {
      if (ids.includes(item.therapy_id)) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    if (filters?.status == 'all') {
      setTherapyList(updatedList);
      setFilteredTherapyList(updatedList);
    } else {
      const filteredList = updatedList.filter((item) => item.status == filters.status);
      setTherapyList(filteredList);
      setFilteredTherapyList(filteredList);
    }
    setCategoryFilter('');
  }

  const setTherapyListOrder = async (ids) => {
    if (sortingData.length && sortingData[0].id != 'position') {
      console.log('Drag & Drop not allowed while sorting is active');
      console.log(sortingData);
      return;
    }
    const newIds = ids.map((item) => item.therapy_id).join(',');

    try {
      const response = await AuthService.axiosPrivatePost(
        '/updateTherapyPosition',
        {
          therapy_ids: newIds,
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
        setCurrentPaginationData({
          ...response?.data?.data?.pagination,
          currentPage: Math.max(1, response?.data?.data?.pagination?.currentPage || 1)
        });
        setTherapyList(response?.data?.data?.data);
        setFilteredTherapyList(response?.data?.data?.data);
        setCategoryFilter('');
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
            getTherapyList(sortingData[0], currentPaginationData?.page, currentPaginationData?.limit, searchData, updated);
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
      <Select
        value={filters?.therapy_category_id}
        onChange={(event) =>
          setFilters((prev) => {
            const updated = { ...prev, therapy_category_id: event.target.value };
            getTherapyList(sortingData[0], currentPaginationData?.page, currentPaginationData?.limit, searchData, updated);
            return updated;
          })
        }
        displayEmpty
        inputProps={{ 'aria-label': 'Status Filter' }}
      >
        <MenuItem value="">All Therapy Category</MenuItem>
        {therapyCategoryList.map((item, index) => (
          <MenuItem value={item.therapy_category_id} key={index}>
            {item.therapy_category}
          </MenuItem>
        ))}
      </Select>
    </>
  );

  return (
    <>
      <RowDragDrop
        {...{
          data: categoryFilter == '' ? therapyList : filteredTherapyList,
          columns,
          modalToggler: () => {
            setTherapyModal(true);
            setSelectedTherapy(null);
          },
          addTitle: 'Add Therapy',
          isLoading: isLoading,
          setOrder: setTherapyListOrder,
          setActive: (row) => showAlert('Active', row),
          setInactive: (row) => showAlert('Inactive', row),
          setDelete: (row) => showAlert('Delete', row),
          clearSelection,
          customFilter: { filterCode, categoryFilter, setCategoryFilter },
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
        <AlertTherapyDelete
          open={open}
          type={confirmAction}
          ids={confirmAlertIds}
          handleClose={handleClose}
          onConfirm={confirmActionHandler}
        />
      ) : null}

      <TherapyModal
        open={therapyModal}
        modalToggler={setTherapyModal}
        therapy={selectedTherapy}
        isSucess={() =>
          getTherapyList({ id: 'position', desc: false }, currentPaginationData?.currentPage || 1, pageLimit, searchData, filters)
        }
      />
    </>
  );
}
