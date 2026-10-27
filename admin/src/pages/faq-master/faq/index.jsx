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
import FaqModal from './FaqModal';
import AlertModal from 'components/AlertModal';
import RowDragDrop from 'sections/apps/table/dragDropTable';

/* assets */
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

import { AuthService } from 'services';
import ExpandingDetail from './ExpandingDetail';
import useDebouncedSearch from 'hooks/useDebouncedSearch';
import { openSnackbar } from 'api/snackbar';
import ActiveAction from 'components/TableActions/ActiveAction';
import InactiveAction from 'components/TableActions/InactiveAction';
import DeleteAction from 'components/TableActions/DeleteAction';

// ==============================|| FAQ MASTER - FAQ LIST ||============================== //

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' }
];

export default function FaqListPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [faqList, setFaqList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [faqModal, setFaqModal] = useState(false);
  const [clearSelection, setClearSelection] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [confirmAction, setConfirmAction] = useState('');
  const [confirmAlertIds, setConfirmAlertIds] = useState([]);
  const [currentPaginationData, setCurrentPaginationData] = useState();
  const [sortingData, setSortingData] = useState([{ id: 'position', desc: false }]);
  const [searchData, setSearchData] = useState('');
  const [filters, setFilters] = useState({ category_id: 'all', status: 'all' });

  const pageLimit = 10;
  const didFetch = useRef(false);

  /* ---- REORDER (Drag & Drop) ---- */
  const handleFaqReorder = async (updatedRows) => {
    if (!Array.isArray(updatedRows)) return;

    if (sortingData[0]?.id !== 'position') {
      openSnackbar({
        open: true,
        message: 'Remove column sorting to move FAQs',
        variant: 'alert',
        alert: { color: 'warning' }
      });
      getFaqList(sortingData[0], currentPaginationData?.currentPage || 1, currentPaginationData?.limit || pageLimit, searchData, filters);
      return;
    }

    const previousRows = [...faqList];

    // Preserve the original position values for the current page
    const originalPositions = previousRows.map((faq) => Number(faq.position));

    const reorderedFaqs = updatedRows.map((faq, index) => ({
      ...faq,
      position: originalPositions[index]
    }));

    setFaqList(reorderedFaqs);

    try {
      const response = await AuthService.axiosPrivatePost('/updateFaqPosition', {
        faq_ids: reorderedFaqs.map((faq) => faq.faq_id).join(',')
      });

      if (response.data?.status) {
        openSnackbar({
          open: true,
          message: response.data?.message || 'FAQ order updated',
          variant: 'alert',
          alert: { color: 'success' }
        });
      } else {
        throw new Error(response.data?.message || 'Failed to update order');
      }
    } catch (error) {
      console.error('Unable to save FAQ order:', error);
      openSnackbar({
        open: true,
        message: error?.message || 'Unable to update order',
        variant: 'alert',
        alert: { color: 'error' }
      });
      setFaqList(previousRows);
    }
  };

  /* ---- CATEGORY OPTIONS ---- */
  const fetchCategories = useCallback(async () => {
    try {
      const response = await AuthService.axiosPrivatePost('/faqCategoryOptions');
      if (response.data?.status) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Category options error:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* ---- DATA FETCH ---- */
  const getFaqList = useCallback(
    async (sorting, page = 1, limit = pageLimit, search = '', filterObj = {}) => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page,
          limit,
          order: sorting?.id || 'position',
          desc: String(sorting?.desc ?? false),
          search: search || ''
        });

        Object.entries(filterObj).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined && value !== 'all') {
            queryParams.append(key, value);
          }
        });

        const response = await AuthService.axiosPrivatePost(`/faqList?${queryParams.toString()}`);

        if (response.data.status) {
          const data = (response.data.data.data || []).map((item, index) => ({
            serial_number: index + 1,
            ...item
          }));
          setFaqList(data);
          setCurrentPaginationData({
            ...response.data.data.pagination,
            currentPage: Math.max(1, response.data.data.pagination?.currentPage || 1)
          });
        } else {
          console.warn('FAQ list fetch failed:', response.data.message);
          setFaqList([]);
        }
      } catch (error) {
        console.error('getFaqList error:', error);
        setFaqList([]);
      } finally {
        setIsLoading(false);
      }
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (!didFetch.current) {
      didFetch.current = true;
      getFaqList({ id: 'position', desc: false }, 1, pageLimit, '', filters);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- PAGINATION / SORTING / SEARCH ---- */
  const handlePaginationChange = useCallback(
    async (newPage, newPageSize) => {
      await getFaqList(sortingData[0], newPage, newPageSize, searchData, filters);
    },
    [getFaqList, sortingData, searchData, filters]
  );

  const handleSortingChange = useCallback(
    async (sorting) => {
      const newSort = sorting && sorting.length ? sorting[0] : { id: 'position', desc: false };
      setSortingData([newSort]);
      await getFaqList(newSort, currentPaginationData?.currentPage, currentPaginationData?.limit, searchData, filters);
    },
    [getFaqList, currentPaginationData, searchData, filters]
  );

  const { handleSearch } = useDebouncedSearch(
    (search) => getFaqList(sortingData[0], currentPaginationData?.currentPage, currentPaginationData?.limit, search, filters),
    { delay: 300 }
  );

  /* ---- STATUS UPDATE (Active / Inactive) ---- */
  function updateStatuses(ids, newStatus) {
    setFaqList((prev) => prev.map((item) => (ids.includes(item.faq_id) ? { ...item, status: newStatus } : item)));
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
        idKey: 'faq_id',
        endpoint: '/activeFaq',
        updateStatuses
      });
    } else if (confirmAction === 'Inactive') {
      await InactiveAction({
        selectedRows: confirmAlertIds,
        idKey: 'faq_id',
        endpoint: '/inactiveFaq',
        updateStatuses
      });
    } else if (confirmAction === 'Delete') {
      await DeleteAction({
        selectedRows: confirmAlertIds,
        idKey: 'faq_id',
        endpoint: '/deleteFaq',
        fetchList: (newPage) => getFaqList(sortingData[0], newPage, currentPaginationData?.limit || pageLimit, searchData, filters),
        pagination: currentPaginationData
      });
      fetchCategories();
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
        header: 'FAQ',
        accessorKey: 'question',
        cell: ({ getValue }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
              {getValue() || '—'}
            </Typography>
          </Stack>
        )
      },
      {
        header: 'Answer',
        accessorKey: 'answer',
        enableSorting: false,
        cell: ({ getValue }) => {
          const answer = getValue() || '';
          return (
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {answer.length > 150 ? `${answer.substring(0, 150)}...` : answer || '—'}
            </Typography>
          );
        }
      },
      {
        header: 'Category',
        accessorKey: 'category_title',
        cell: ({ getValue }) => <Chip label={getValue() || 'Unassigned'} size="small" variant="light" color="primary" />
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
                    setSelectedFaq(row.original);
                    setFaqModal(true);
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

  /* ---- CUSTOM FILTER ---- */
  const handleFilterChange = (key, value) => {
    const updated = {
      ...filters,
      [key]: value
    };
    setFilters(updated);
    getFaqList(sortingData[0], 1, pageLimit, searchData, updated);
  };

  const totalFaqsCount = useMemo(() => {
    return categories.reduce((sum, item) => sum + (Number(item.faq_count) || 0), 0);
  }, [categories]);

  const filterCode = (
    <Stack direction="row" spacing={2} alignItems="center">
      <Select
        value={filters.category_id}
        onChange={(e) => handleFilterChange('category_id', e.target.value)}
        displayEmpty
        size="small"
        sx={{ minWidth: 190 }}
        renderValue={(selected) => {
          if (selected === 'all' || !selected) return `All Categories (${totalFaqsCount})`;
          const match = categories.find((item) => String(item.faq_category_id) === String(selected));
          return match ? `${match.title} (${match.faq_count ?? 0})` : `All Categories (${totalFaqsCount})`;
        }}
      >
        <MenuItem value="all">{`All Categories (${totalFaqsCount})`}</MenuItem>
        {categories.map((item) => (
          <MenuItem key={item.faq_category_id} value={item.faq_category_id}>
            {`${item.title} (${item.faq_count ?? 0})`}
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

  /* ---- RENDER ---- */
  return (
    <>
      <RowDragDrop
        {...{
          data: faqList,
          columns,
          setOrder: handleFaqReorder,
          modalToggler: () => {
            setSelectedFaq(null);
            setFaqModal(true);
          },
          addTitle: 'Add FAQ',
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
      <FaqModal
        open={faqModal}
        modalToggler={(val) => setFaqModal(val)}
        faq={selectedFaq}
        defaultCategoryId={filters.category_id !== 'all' ? filters.category_id : ''}
        onSaved={() => {
          getFaqList(sortingData[0], currentPaginationData?.currentPage, currentPaginationData?.limit, searchData, filters);
          fetchCategories();
        }}
        isSucess={() => {
          getFaqList(sortingData[0], currentPaginationData?.currentPage, currentPaginationData?.limit, searchData, filters);
          fetchCategories();
          setFaqModal(false);
        }}
      />
    </>
  );
}
