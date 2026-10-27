import { useEffect, useMemo, useRef, useState } from 'react';

/* material-ui */
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

/* project-import */
import IconButton from 'components/@extended/IconButton';
import { IndeterminateCheckbox } from 'components/third-party/react-table';
import RowDragDrop from 'sections/apps/table/dragDropTable';
import AlertModal from 'components/AlertModal';
import ActiveAction from 'components/TableActions/ActiveAction';
import InactiveAction from 'components/TableActions/InactiveAction';
import useDebouncedSearch from 'hooks/useDebouncedSearch';
import { openSnackbar } from 'api/snackbar';
import { AuthService } from 'services';
import FormModal from 'pages/faq-master/FormModal';
import FormFaqCategory from './FormFaqCategory';
import ExpandingDetail from './ExpandingDetail';

/* assets */
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

const DEFAULT_SORT = [{ id: 'position', desc: false }];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' }
];

// ==============================|| FAQ MASTER - FAQ CATEGORY LIST ||============================== //

export default function FaqCategoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [categoryList, setCategoryList] = useState([]);
  const [currentPaginationData, setCurrentPaginationData] = useState();
  const [sortingData, setSortingData] = useState(DEFAULT_SORT);
  const [searchData, setSearchData] = useState('');
  const [filters, setFilters] = useState({ status: 'all' });
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [confirmRows, setConfirmRows] = useState([]);
  const [clearSelection, setClearSelection] = useState(false);
  const pageLimit = 10;

  /* Only the newest request may update the screen */
  const latestRequest = useRef(0);

  const getCategoryList = async (sorting, page = 1, limit = pageLimit, search = '', filterObj = {}) => {
    const requestId = ++latestRequest.current;
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({ page, limit, order: sorting.id, desc: sorting.desc, search });
      Object.entries(filterObj).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined && value !== 'all') queryParams.append(key, value);
      });

      const response = await AuthService.axiosPrivatePost(`/faqCategoryList?${queryParams.toString()}`);
      if (requestId !== latestRequest.current) return;
      setIsLoading(false);
      if (response.data.status) {
        setCategoryList(response.data.data.data || []);
        setCurrentPaginationData({
          ...response.data.data.pagination,
          currentPage: Math.max(1, response.data.data.pagination?.currentPage || 1)
        });
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      if (requestId === latestRequest.current) setIsLoading(false);
      console.error('Error fetching FAQ categories:', error);
    }
  };

  const currentPage = () => currentPaginationData?.currentPage || 1;
  const currentLimit = () => currentPaginationData?.limit || pageLimit;
  const refresh = (page = currentPage()) => getCategoryList(sortingData[0], page, currentLimit(), searchData, filters);

  useEffect(() => {
    getCategoryList(sortingData[0], 1, pageLimit, searchData, filters);
  }, []);

  const handlePaginationChange = (newPage, newPageSize) => getCategoryList(sortingData[0], newPage, newPageSize, searchData, filters);

  const handleSortingChange = async (sorting) => {
    /* No column sort = back to the manual (drag & drop) order */
    const next = sorting && sorting.length ? sorting : DEFAULT_SORT;
    setSortingData(next);
    await getCategoryList(next[0], currentPage(), currentLimit(), searchData, filters);
  };

  const { handleSearch } = useDebouncedSearch((search) => getCategoryList(sortingData[0], 1, currentLimit(), search, filters), {
    delay: 300
  });

  const setCategoryOrder = async (rows) => {
    if (sortingData[0]?.id !== 'position') {
      openSnackbar({
        open: true,
        message: 'Remove column sorting to move categories',
        variant: 'alert',
        alert: { color: 'warning' }
      });
      refresh();
      return;
    }
    try {
      const response = await AuthService.axiosPrivatePost('/updateFaqCategoryPosition', {
        faq_category_ids: rows.map((item) => item.faq_category_id).join(',')
      });
      openSnackbar({
        open: true,
        message: response.data.status ? 'Category order updated' : response.data.message || 'Unable to update order',
        variant: 'alert',
        alert: { color: response.data.status ? 'success' : 'error' }
      });
    } catch (error) {
      openSnackbar({ open: true, message: 'Unable to update order', variant: 'alert', alert: { color: 'error' } });
    }
    refresh();
  };

  const showAlert = (action, rows) => {
    setConfirmAction(action);
    setConfirmRows(rows);
    setAlertOpen(true);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
    setConfirmAction('');
    setConfirmRows([]);
  };

  function updateStatuses(ids, newStatus) {
    const updated = categoryList.map((item) => (ids.includes(item.faq_category_id) ? { ...item, status: newStatus } : item));
    setCategoryList(filters.status === 'all' ? updated : updated.filter((item) => String(item.status) === String(filters.status)));
  }

  const deleteCategories = async () => {
    const ids = confirmRows.map((row) => row.original.faq_category_id);
    try {
      const response = await AuthService.axiosPrivatePost('/deleteFaqCategory', { faq_category_ids: ids.join(', ') });
      openSnackbar({
        open: true,
        message: response.data.status ? 'FAQ category deleted' : response.data.message,
        variant: 'alert',
        alert: { color: response.data.status ? 'success' : 'error' }
      });
      if (response.data.status) {
        const remaining = (currentPaginationData?.totalRecords || 0) - ids.length;
        const lastPage = Math.max(1, Math.ceil(remaining / currentLimit()));
        await refresh(Math.min(currentPage(), lastPage));
      }
    } catch (error) {
      openSnackbar({ open: true, message: 'Unable to delete FAQ category', variant: 'alert', alert: { color: 'error' } });
    }
  };

  const confirmActionHandler = async () => {
    setClearSelection(false);
    if (confirmAction === 'Active') {
      await ActiveAction({ selectedRows: confirmRows, idKey: 'faq_category_id', endpoint: '/activeFaqCategory', updateStatuses });
    } else if (confirmAction === 'Inactive') {
      await InactiveAction({ selectedRows: confirmRows, idKey: 'faq_category_id', endpoint: '/inactiveFaqCategory', updateStatuses });
    } else if (confirmAction === 'Delete') {
      await deleteCategories();
    }
    setClearSelection(true);
    handleAlertClose();
  };

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
        header: 'Title',
        accessorKey: 'title',
        cell: ({ getValue }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="subtitle1">{getValue() || '—'}</Typography>
          </Stack>
        )
      },
      {
        header: 'FAQs',
        accessorKey: 'faq_count',
        cell: ({ getValue }) => <Chip label={`${getValue() ?? 0} FAQ(s)`} size="small" variant="light" color="primary" />
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) =>
          Number(getValue()) === 1 ? (
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
                    setSelectedCategory(row.original);
                    setFormOpen(true);
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
    []
  );

  const handleFilterChange = (key, value) => {
    const updated = {
      ...filters,
      [key]: value
    };
    setFilters(updated);
    getCategoryList(sortingData[0], 1, currentLimit(), searchData, updated);
  };

  const filterCode = (
    <Stack direction="row" spacing={2} alignItems="center">
      <Select
        value={filters.status ?? 'all'}
        onChange={(e) => handleFilterChange('status', e.target.value)}
        size="small"
        sx={{ minWidth: 150 }}
        displayEmpty
        renderValue={(selected) => {
          if (selected === 'all' || !selected) return 'All Status';
          if (selected === '1' || selected === 1) return 'Active';
          if (selected === '0' || selected === 0) return 'Inactive';
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

  return (
    <>
      <RowDragDrop
        {...{
          data: categoryList,
          columns,
          modalToggler: () => {
            setSelectedCategory(null);
            setFormOpen(true);
          },
          addTitle: 'Add Category',
          isLoading,
          setOrder: setCategoryOrder,
          setActive: (rows) => showAlert('Active', rows),
          setInactive: (rows) => showAlert('Inactive', rows),
          setDelete: (rows) => showAlert('Delete', rows),
          clearSelection,
          customFilter: { filterCode },
          ExpandRow: (row) => <ExpandingDetail data={row.original} />,
          pagination: currentPaginationData,
          onPaginationChange: handlePaginationChange,
          handleSortingChange,
          handleSearchData: (search) => {
            handleSearch(search);
            setSearchData(search);
          }
        }}
      />

      {confirmAction !== '' && (
        <AlertModal
          open={alertOpen}
          type={confirmAction}
          handleClose={handleAlertClose}
          onConfirm={confirmActionHandler}
          ids={confirmRows}
        />
      )}

      <FormModal open={formOpen} onClose={() => setFormOpen(false)} label="faq-category">
        <FormFaqCategory
          category={selectedCategory}
          closeModal={() => setFormOpen(false)}
          isSucess={() => {
            setFormOpen(false);
            refresh();
          }}
        />
      </FormModal>
    </>
  );
}
