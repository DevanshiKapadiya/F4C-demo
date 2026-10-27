import { useEffect, useState } from 'react';

// material-ui
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// project-import
import IconButton from 'components/@extended/IconButton';
import { IndeterminateCheckbox } from 'components/third-party/react-table';

import FaqModal from './FaqModal';
import AlertFaqDelete from 'components/AlertModal';
// assets
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import { AuthService } from 'services';
import RowDragDrop from 'sections/apps/table/dragDropTable';
import { openSnackbar } from 'api/snackbar';
import ExpandingDetail from './ExpandingDetail';
import useDebouncedSearch from 'hooks/useDebouncedSearch';
import ActiveAction from 'components/TableActions/ActiveAction';
import InactiveAction from 'components/TableActions/InactiveAction';
import DeleteAction from 'components/TableActions/DeleteAction';

export default function BenefitsOfEngagingInCounselling() {
  const [isLoading, setIsLoading] = useState(true);
  const [faqList, setFaqList] = useState([]);
  const [open, setOpen] = useState(false);

  const [faqModal, setFaqModal] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [clearSelection, setClearSelection] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [confirmAlertIds, setConfirmAlertIds] = useState([]);
  const [currentPaginationData, setCurrentPaginationData] = useState();
  const [sortingData, setSortingData] = useState([{ id: 'position', desc: false }]);
  const [searchData, setSearchData] = useState('');

  const pageLimit = 10;

  const getFaqList = async (sorting, page = 1, pageLimit, search = '') => {
    setIsLoading(true);
    try {
      await AuthService.axiosPrivatePost(
        `/benefitsOfEngagingInCounsellingList?page=${page}&limit=${pageLimit}&order=${sorting.id}&desc=${sorting.desc}&search=${search}`
      ).then((response) => {
        setIsLoading(false);
        if (response.data.status) {
          setCurrentPaginationData({
            ...response?.data?.data?.pagination,
            currentPage: Math.max(1, response?.data?.data?.pagination?.currentPage || 1)
          });
          setFaqList(response?.data?.data?.data);
        } else {
          console.log(response.data.message);
        }
      });
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we don't have data yet
    if (faqList.length == 0 && isLoading) {
      getFaqList({ id: 'position', desc: false }, 1, pageLimit, searchData);
    }
  }, []);
  const handlePaginationChange = async (newPage, newPageSize) => {
    setIsLoading(true);
    try {
      await getFaqList(sortingData[0], newPage, newPageSize, searchData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSortingChange = async (sorting) => {
    if (sorting && sorting.length) {
      await getFaqList(sorting[0], currentPaginationData.page, currentPaginationData.limit);
      setSortingData(sorting);
    } else {
      await getFaqList({ id: 'position', desc: false }, currentPaginationData.page, paginationData.limit);
      setSortingData([{ id: 'position', desc: false }]);
    }
  };
  const { handleSearch } = useDebouncedSearch(
    (search) => getFaqList(sortingData[0], currentPaginationData?.page, currentPaginationData?.limit, search),
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
      header: 'Title',
      accessorKey: 'title',
      cell: ({ row, getValue }) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Stack spacing={0}>
            <Typography variant="title">{getValue()}</Typography>
          </Stack>
        </Stack>
      )
    },
    {
      header: 'Description',
      accessorKey: 'description',
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
          // return <Chip color="info" label="Pending" size="small" variant="light" />;
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
  ];

  const setFaqListOrder = async (ids) => {
    if (sortingData.length && sortingData[0].id != 'position') {
      console.log('Drag & Drop not allowed while sorting is active');
      console.log(sortingData);
      return;
    }
    const newIds = ids.map((item) => item.benefits_of_engaging_in_counselling_id).join(',');
    try {
      const response = await AuthService.axiosPrivatePost(
        '/updateBenefitsOfEngagingInCounsellingPosition',
        {
          benefits_of_engaging_in_counselling_ids: newIds,
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
        setFaqList(response?.data?.data?.data);
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
  const showAlert = (action, ids) => {
    setConfirmAction(action);
    setConfirmAlertIds(ids);
    setOpen(true);
  };

  const endpoints = {
    active: '/activeBenefitsOfEngagingInCounselling',
    inactive: '/inactiveBenefitsOfEngagingInCounselling',
    delete: '/deleteBenefitsOfEngagingInCounselling'
  };

  const confirmActionHandler = async () => {
    setClearSelection(false);
    if (confirmAction === 'Active') {
      await ActiveAction({
        selectedRows: confirmAlertIds,
        idKey: 'benefits_of_engaging_in_counselling_id',
        endpoint: endpoints.active,
        updateStatuses: updateStatuses
      });
    } else if (confirmAction === 'Inactive') {
      await InactiveAction({
        selectedRows: confirmAlertIds,
        idKey: 'benefits_of_engaging_in_counselling_id',
        endpoint: endpoints.inactive,
        updateStatuses: updateStatuses
      });
    } else if (confirmAction === 'Delete') {
      await DeleteAction({
        selectedRows: confirmAlertIds,
        idKey: 'benefits_of_engaging_in_counselling_id',
        endpoint: endpoints.delete,
        fetchList: (newPage) => getFaqList(sortingData[0], newPage, currentPaginationData?.limit, searchData),
        pagination: currentPaginationData
      });
    }
    setConfirmAlertIds([]);
    setClearSelection(true);
    handleClose();
  };
  function updateStatuses(ids, newStatus) {
    const updatedList = faqList.map((item) => {
      if (ids.includes(item.benefits_of_engaging_in_counselling_id)) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    if (filters?.status == 'all') {
      setFaqList(updatedList);
    } else {
      const filteredList = updatedList.filter((item) => item.status == filters.status);
      setFaqList(filteredList);
    }
  }
  const ExpandingDetails = (data) => {
    return <ExpandingDetail data={data.original} />;
  };
  return (
    <>
      <RowDragDrop
        {...{
          data: faqList,
          columns,
          modalToggler: () => {
            setFaqModal(true);
            setSelectedFaq(null);
          },
          addTitle: 'Add New',
          isLoading: isLoading,
          setOrder: setFaqListOrder,
          setActive: (row) => showAlert('Active', row),
          setInactive: (row) => showAlert('Inactive', row),
          setDelete: (row) => showAlert('Delete', row),
          clearSelection,
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
        <AlertFaqDelete open={open} type={confirmAction} ids={confirmAlertIds} handleClose={handleClose} onConfirm={confirmActionHandler} />
      ) : null}

      <FaqModal
        open={faqModal}
        modalToggler={setFaqModal}
        faq={selectedFaq}
        isSucess={() => getFaqList({ id: 'position', desc: false }, currentPaginationData?.currentPage || 1, pageLimit, searchData)}
      />
    </>
  );
}
