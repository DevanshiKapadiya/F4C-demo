import { useEffect, useState } from 'react';

/* material-ui */
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

/* project-import */
import IconButton from 'components/@extended/IconButton';
import { IndeterminateCheckbox } from 'components/third-party/react-table';

import ArticleModal from './ArticleModal';
import AlertArticleDelete from 'components/AlertModal';
/* assets */
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import { AuthService } from 'services';
import ArticleTable from 'sections/apps/table/CommonTable';
import { Avatar } from '@mui/material';
import ExpandingDetail from './ExpandingDetail';
import DeleteAction from 'components/TableActions/DeleteAction';
import InactiveAction from 'components/TableActions/InactiveAction';
import ActiveAction from 'components/TableActions/ActiveAction';
import useDebouncedSearch from 'hooks/useDebouncedSearch';
import { MenuItem, Select } from '@mui/material';

export default function Article() {
  const [isLoading, setIsLoading] = useState(true);
  const [articleList, setArticleList] = useState([]);
  const [open, setOpen] = useState(false);

  const [articleModal, setArticleModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [clearSelection, setClearSelection] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [confirmAlertIds, setConfirmAlertIds] = useState([]);
  const [currentPaginationData, setCurrentPaginationData] = useState();
  const [sortingData, setSortingData] = useState([{ id: 'created_at', desc: false }]);
  const [searchData, setSearchData] = useState('');
  const [filters, setFilters] = useState({
    status: 'all'
  });
  const pageLimit = 10;

  const getArticleList = async (sorting, page = 1, pageLimit, search = '', filterObj = {}) => {
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

      await AuthService.axiosPrivatePost(`/articleList?${queryParams.toString()}`).then((response) => {
        setIsLoading(false);
        if (response.data.status) {
          setCurrentPaginationData({
            ...response?.data?.data?.pagination,
            currentPage: Math.max(1, response?.data?.data?.pagination?.currentPage || 1)
          });
          setArticleList(response?.data?.data?.data);
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
    if (articleList.length == 0 && isLoading) {
      getArticleList({ id: 'created_at', desc: false }, 1, pageLimit, searchData, filters);
    }
  }, []);

  const handlePaginationChange = async (newPage, newPageSize) => {
    setIsLoading(true);
    try {
      await getArticleList(sortingData[0], newPage, newPageSize, searchData, filters);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSortingChange = async (sorting) => {
    if (sorting && sorting.length) {
      await getArticleList(sorting[0], currentPaginationData.page, currentPaginationData.limit, searchData, filters);
      setSortingData(sorting);
    } else {
      await getArticleList({ id: 'created_at', desc: false }, currentPaginationData.page, currentPaginationData.limit, searchData, filters);
      setSortingData([{ id: 'created_at', desc: false }]);
    }
  };

  const { handleSearch } = useDebouncedSearch(
    (search) => getArticleList(sortingData[0], currentPaginationData?.page, currentPaginationData?.limit, search, filters),
    { delay: 200 }
  );

  const handleClose = () => {
    setOpen(false);
    setConfirmAction('');
    setConfirmAlertIds([]);
  };

  const ExpandingDetails = (data) => {
    return <ExpandingDetail data={data.original} />;
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
      header: 'Image',
      accessorKey: 'image',
      enableSorting: false,
      cell: ({ row, getValue }) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Stack spacing={0}>
            <Avatar alt="Avatar 1" size="sm" src={row.original.image} style={{ background: 'black' }} />
            {/* <Typography variant="title">{getValue()}</Typography> */}
          </Stack>
        </Stack>
      )
    },
    {
      header: 'Title',
      accessorKey: 'title',
      cell: ({ getValue }) => <Typography variant="title">{getValue()}</Typography>
    },
    {
      header: 'Short Description',
      accessorKey: 'short_description',
      cell: ({ getValue }) => <Typography variant="title">{getValue()}</Typography>
    },
    {
      header: 'Reading Time',
      accessorKey: 'reading_time',
      cell: ({ getValue }) => <Typography variant="title">{getValue()} Minute(s)</Typography>
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
          /* return <Chip color="info" label="Pending" size="small" variant="light" />; */
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
          row.getCanExpand() && row.getIsExpanded() ? 
          <PlusOutlined style={{ transform: 'rotate(45deg)' }} /> : <EyeOutlined />;
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
                  setSelectedArticle(row.original);
                  setArticleModal(true);
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
    active: '/activeArticle',
    inactive: '/inactiveArticle',
    delete: '/deleteArticle'
  };

  const confirmActionHandler = async () => {
    setClearSelection(false);
    if (confirmAction === 'Active') {
      await ActiveAction({
        selectedRows: confirmAlertIds,
        idKey: 'article_id',
        endpoint: endpoints.active,
        updateStatuses: updateStatuses
      });
    } else if (confirmAction === 'Inactive') {
      await InactiveAction({
        selectedRows: confirmAlertIds,
        idKey: 'article_id',
        endpoint: endpoints.inactive,
        updateStatuses: updateStatuses
      });
    } else if (confirmAction === 'Delete') {
      await DeleteAction({
        selectedRows: confirmAlertIds,
        idKey: 'article_id',
        endpoint: endpoints.delete,
        fetchList: (newPage) => getArticleList(sortingData[0], newPage, currentPaginationData?.limit, searchData, filters),
        pagination: currentPaginationData
      });
    }
    setConfirmAlertIds([]);
    setClearSelection(true);
    handleClose();
  };

  function updateStatuses(ids, newStatus) {
    const updatedList = articleList.map((item) => {
      if (ids.includes(item.article_id)) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    if (filters?.status == 'all') {
      setArticleList(updatedList);
    } else {
      const filteredList = updatedList.filter((item) => item.status == filters.status);
      setArticleList(filteredList);
    }
  }

  const filterCode = (
    <>
      <Select
        value={filters?.status}
        onChange={(event) =>
          setFilters((prev) => {
            const updated = { ...prev, status: event.target.value };
            getArticleList(sortingData[0], currentPaginationData?.page, currentPaginationData?.limit, searchData, updated);
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
      <ArticleTable
        {...{
          data: articleList,
          columns,
          modalToggler: () => {
            setArticleModal(true);
            setSelectedArticle(null);
          },
          addTitle: 'Add Article',
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
        <AlertArticleDelete
          open={open}
          type={confirmAction}
          ids={confirmAlertIds}
          handleClose={handleClose}
          onConfirm={confirmActionHandler}
        />
      ) : null}

      <ArticleModal
        open={articleModal}
        modalToggler={setArticleModal}
        article={selectedArticle}
        isSucess={() => getArticleList({ id: 'created_at', desc: false }, 1, pageLimit, searchData, filters)}
      />
    </>
  );
}
