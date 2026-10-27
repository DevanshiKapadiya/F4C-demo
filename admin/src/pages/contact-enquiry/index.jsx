import { useEffect, useMemo, useRef, useState } from 'react';

/* material-ui */
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';

/* project-import */
import IconButton from 'components/@extended/IconButton';
import ContactEnquiryTable from 'sections/apps/table/dragDropTable';
import { openSnackbar } from 'api/snackbar';

/* assets */
import AlertContactEnquiryDelete from 'components/AlertModal';
import DeleteAction from 'components/TableActions/DeleteAction';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import { AuthService } from 'services';
import ExpandingDetail from 'pages/contact-enquiry/ExpandingDetail';
import { ENQUIRY_TYPES } from 'pages/contact-enquiry/enquiryTypes';
import useDebouncedSearch from 'hooks/useDebouncedSearch';

const defaultFilters = { enquiry_type: 'all', date_from: '', date_to: '' };

export default function ContactEnquiryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [contactEnquiryList, setContactEnquiryList] = useState([]);
  const [currentPaginationData, setCurrentPaginationData] = useState();
  const [sortingData, setSortingData] = useState([{ id: 'position', desc: false }]);
  const [searchData, setSearchData] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRows, setDeleteRows] = useState([]);
  const pageLimit = 10;

  /* Filters stay enabled while loading, so only the newest request is allowed to update the screen */
  const latestRequest = useRef(0);

  const getContactEnquiryList = async (sorting, page = 1, limit = pageLimit, search = '', filterObj = {}) => {
    const requestId = ++latestRequest.current;
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        order: sorting.id,
        desc: sorting.desc,
        search
      });

      Object.entries(filterObj).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined && value !== 'all') {
          queryParams.append(key, value);
        }
      });

      const response = await AuthService.axiosPrivatePost(`/contactEnquiryList?${queryParams.toString()}`);
      if (requestId !== latestRequest.current) return;
      setIsLoading(false);
      if (response.data.status) {
        setContactEnquiryList(response?.data?.data?.data || []);
        setCurrentPaginationData({
          ...response?.data?.data?.pagination,
          currentPage: Math.max(1, response?.data?.data?.pagination?.currentPage || 1)
        });
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      if (requestId === latestRequest.current) setIsLoading(false);
      console.error('Error fetching enquiries:', error);
    }
  };

  useEffect(() => {
    getContactEnquiryList(sortingData[0], 1, pageLimit, searchData, filters);
  }, []);

  const handlePaginationChange = (newPage, newPageSize) => getContactEnquiryList(sortingData[0], newPage, newPageSize, searchData, filters);

  const handleSortingChange = async (sorting) => {
    /* No column sort = back to the manual (drag & drop) order */
    const next = sorting && sorting.length ? sorting : [{ id: 'position', desc: false }];
    await getContactEnquiryList(
      next[0],
      currentPaginationData?.currentPage || 1,
      currentPaginationData?.limit || pageLimit,
      searchData,
      filters
    );
    setSortingData(next);
  };

  const setContactEnquiryListOrder = async (rows) => {
    if (sortingData.length && sortingData[0].id !== 'position') {
      openSnackbar({
        open: true,
        message: 'Remove column sorting to reorder enquiries',
        variant: 'alert',
        alert: { color: 'warning' }
      });
      getContactEnquiryList(
        sortingData[0],
        currentPaginationData?.currentPage || 1,
        currentPaginationData?.limit || pageLimit,
        searchData,
        filters
      );
      return;
    }

    try {
      const response = await AuthService.axiosPrivatePost('/updateContactEnquiryPosition', {
        contact_enquiry_ids: rows.map((item) => item.contact_enquiry_id).join(',')
      });
      openSnackbar({
        open: true,
        message: response.data.status ? response.data.message : response.data.message || 'Unable to update order',
        variant: 'alert',
        alert: { color: response.data.status ? 'success' : 'error' }
      });
    } catch (error) {
      openSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Unable to update order',
        variant: 'alert',
        alert: { color: 'error' }
      });
    }
    getContactEnquiryList(
      sortingData[0],
      currentPaginationData?.currentPage || 1,
      currentPaginationData?.limit || pageLimit,
      searchData,
      filters
    );
  };

  const { handleSearch } = useDebouncedSearch(
    (search) => getContactEnquiryList(sortingData[0], 1, currentPaginationData?.limit || pageLimit, search, filters),
    { delay: 300 }
  );

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setDeleteRows([]);
  };

  const confirmDelete = async () => {
    await DeleteAction({
      selectedRows: deleteRows,
      idKey: 'contact_enquiry_id',
      endpoint: '/deleteContactEnquiry',
      fetchList: (newPage) =>
        getContactEnquiryList(sortingData[0], newPage, currentPaginationData?.limit || pageLimit, searchData, filters),
      pagination: currentPaginationData
    });
    handleDeleteClose();
  };

  const updateFilter = (changes) => {
    const updated = { ...filters, ...changes };
    setFilters(updated);
    getContactEnquiryList(sortingData[0], 1, currentPaginationData?.limit || pageLimit, searchData, updated);
  };

  const columns = useMemo(
    () => [
      {
        header: '#',
        cell: ({ row, table }) => {
          const { pageIndex, pageSize } = table.getState().pagination;
          return pageIndex * pageSize + row.index + 1;
        },
        id: 'serial'
      },
      {
        header: 'Sender Name',
        accessorKey: 'name',
        cell: ({ getValue }) => <Typography variant="title">{getValue()}</Typography>
      },
      {
        header: 'Email',
        accessorKey: 'email',
        cell: ({ getValue }) => <Typography variant="title">{getValue()}</Typography>
      },
      {
        header: 'Type',
        accessorKey: 'enquiry_type',
        cell: ({ getValue }) => <Typography variant="title">{getValue()}</Typography>
      },
      {
        header: 'Submitted',
        accessorKey: 'created_at',
        cell: ({ getValue }) => (
          <Typography variant="title">{getValue() ? format(new Date(getValue()), 'dd/MM/yyyy hh:mm a') : '—'}</Typography>
        )
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
              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteRows([row]);
                    setDeleteOpen(true);
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
    []
  );

  const ExpandingDetails = (row) => <ExpandingDetail data={row.original} />;

  const filterCode = (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 1 }}>
      <Select
        value={filters.enquiry_type}
        onChange={(event) => updateFilter({ enquiry_type: event.target.value })}
        displayEmpty
        inputProps={{ 'aria-label': 'Type Filter' }}
      >
        <MenuItem value="all">All Types</MenuItem>
        {ENQUIRY_TYPES.map((type) => (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        ))}
      </Select>
      <TextField
        type="date"
        label="From"
        InputLabelProps={{ shrink: true }}
        value={filters.date_from}
        inputProps={{ max: filters.date_to || undefined }}
        onChange={(event) => updateFilter({ date_from: event.target.value })}
      />
      <TextField
        type="date"
        label="To"
        InputLabelProps={{ shrink: true }}
        value={filters.date_to}
        inputProps={{ min: filters.date_from || undefined }}
        onChange={(event) => updateFilter({ date_to: event.target.value })}
      />
    </Stack>
  );

  return (
    <>
      <ContactEnquiryTable
        {...{
          data: contactEnquiryList,
          columns,
          addTitle: '',
          isLoading: isLoading,
          customFilter: { filterCode },
          ExpandRow: ExpandingDetails,
          setOrder: setContactEnquiryListOrder,
          pagination: currentPaginationData,
          onPaginationChange: handlePaginationChange,
          handleSortingChange: handleSortingChange,
          handleSearchData: (search) => {
            handleSearch(search);
            setSearchData(search);
          }
        }}
      />
      <AlertContactEnquiryDelete
        open={deleteOpen}
        type="Delete"
        handleClose={handleDeleteClose}
        onConfirm={confirmDelete}
        ids={deleteRows}
      />
    </>
  );
}
