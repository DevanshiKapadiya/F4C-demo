import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

// material-ui
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  useReactTable
} from '@tanstack/react-table';
// third-party
import IconButton from '@mui/material/IconButton';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CSVExport, DebouncedInput, RowSelection, TablePagination, HeaderSort } from 'components/third-party/react-table';
// project-imports
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box, Stack } from '@mui/system';
import { Divider } from '@mui/material';
import Button from '@mui/material/Button';
import { rankItem } from '@tanstack/match-sorter-utils';
// assets
// assets
import DragOutlined from '@ant-design/icons/DragOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import { Skeleton } from '@mui/material';
import EmptyReactTable from 'pages/tables/react-table/empty';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import SimpleBarScroll from 'components/third-party/SimpleBar';

// ==============================|| REACT TABLE ||============================== //

export const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta(itemRank);
  return itemRank.passed;
};

// Custom debounce function
function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// This local sortable row uses the same ID as SortableContext.
// It does not depend on the shared FAQ/other-table DraggableRow implementation.
function UserSortableRow({ row }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `row-${row.id}`
  });

  return (
    <TableRow
      ref={setNodeRef}
      sx={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.65 : 1,
        position: 'relative',
        zIndex: isDragging ? 2 : 'auto',
        backgroundColor: 'background.paper'
      }}
    >
      <TableCell sx={{ width: 58 }}>
        <IconButton
          {...attributes}
          {...listeners}
          size="small"
          sx={{
            cursor: 'grab',
            color: '#8C8C8C',
            '&:active': {
              cursor: 'grabbing'
            }
          }}
        >
          <DragOutlined style={{ fontSize: 18 }} />
        </IconButton>
      </TableCell>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} {...cell.column.columnDef.meta}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

function ReactTable({
  defaultColumns,
  defaultData,
  modalToggler,
  addTitle,
  isLoading,
  setOrder,
  ExpandRow,
  setActive,
  setInactive,
  setDelete,
  clearSelection,
  customFilter,
  pagination: externalPagination,
  onPaginationChange,
  handleSortingChange,
  handleSearchData
}) {
  const theme = useTheme();
  const downSM = useMediaQuery(theme.breakpoints.down('sm'));
  const [sorting, setSorting] = useState([{ id: 'position', desc: false }]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState({});
  const [data, setData] = useState([...defaultData]);
  const [columns] = useState(() => [...defaultColumns]);
  const [internalPagination, setInternalPagination] = useState({
    pageIndex: Math.max(0, (externalPagination?.currentPage || 1) - 1),
    pageSize: externalPagination?.limit || 10
  });
  const [isUserInitiatedPagination, setIsUserInitiatedPagination] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

  // Debounce onPaginationChange
  const debouncedOnPaginationChange = useMemo(
    () => debounce((page, pageSize) => onPaginationChange(page, pageSize), 300),
    [onPaginationChange]
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Sync external pagination with internal state
  useEffect(() => {
    if (externalPagination) {
      setInternalPagination({
        pageIndex: externalPagination.currentPage - 1,
        pageSize: externalPagination.limit
      });
    }
    if (externalPagination?.totalRecords < internalPagination.pageSize && internalPagination.pageIndex != 0) {
      setInternalPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [externalPagination]);

  // Trigger page change when internal pagination changes
  useEffect(() => {
    if (externalPagination && isInitialized && isUserInitiatedPagination) {
      setIsPaginationLoading(true); // Set loading state for pagination
      debouncedOnPaginationChange(internalPagination.pageIndex + 1, internalPagination.pageSize);
      setIsUserInitiatedPagination(false);
    }
  }, [internalPagination.pageIndex, internalPagination.pageSize, externalPagination, isInitialized, debouncedOnPaginationChange]);

  useEffect(() => {
    if (defaultData.length > 0) {
      setIsPaginationLoading(false);
    }
  }, [defaultData]);

  useEffect(() => {
    setData([...defaultData]);
  }, [defaultData]);

  const table = useReactTable({
    data: data,
    columns,
    state: {
      sorting,
      rowSelection,
      globalFilter,
      columnVisibility,
      pagination: internalPagination
    },
    getRowId: (row) => String(row.user_id ?? row.resource_id ?? row.contact_enquiry_id ?? row.faq_id ?? row.faq_category_id ?? row.id),
    enableRowSelection: true,
    manualSorting: true,
    sortDescFirst: false,
    onSortingChange: (updater) => {
      /* Resolve against the current sorting so repeated clicks toggle asc -> desc -> back to position order */
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(next);
      handleSortingChange(next);
    },
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: fuzzyFilter,
    onColumnVisibilityChange: setColumnVisibility,
    debugTable: false,
    onPaginationChange: setInternalPagination,
    manualPagination: true,
    pageCount: externalPagination?.totalPages || 1
  });

  const prevPageSize = useRef(internalPagination.pageSize);

  useEffect(() => {
    setRowSelection({});
    table.resetRowSelection();
  }, [clearSelection]);

  let headers = [];
  columns.map(
    (columns) =>
      // @ts-ignore
      columns.accessorKey &&
      headers.push({
        label: typeof columns.header === 'string' ? columns.header : '#',
        // @ts-ignore
        key: columns.accessorKey
      })
  );

  // Handle page size changes
  useEffect(() => {
    if (internalPagination.pageSize < prevPageSize.current) {
      setRowSelection({});
      table.resetRowSelection();
    }
    prevPageSize.current = internalPagination.pageSize;
  }, [internalPagination.pageSize]);

  // Handle page navigation
  useEffect(() => {
    setRowSelection({});
    table.resetRowSelection();
  }, [internalPagination.pageIndex]);

  // Handle sorting changes
  useEffect(() => {
    setRowSelection({});
    table.resetRowSelection();
  }, [sorting]);

  useEffect(() => setColumnVisibility({ id: false, status: true, contact: false, country: false }), []);

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const activeIndex = data.findIndex(
      (item) => `row-${item.user_id ?? item.resource_id ?? item.contact_enquiry_id ?? item.faq_id ?? item.faq_category_id ?? item.id}` === String(active.id)
    );
    const overIndex = data.findIndex(
      (item) => `row-${item.user_id ?? item.resource_id ?? item.contact_enquiry_id ?? item.faq_id ?? item.faq_category_id ?? item.id}` === String(over.id)
    );
    if (activeIndex < 0 || overIndex < 0) return;

    const updatedRows = arrayMove(data, activeIndex, overIndex);
    setData(updatedRows);
    if (typeof setOrder === 'function') setOrder(updatedRows);
  };

  const TableRowsLoader = ({ rowsNum, colsNum }) => {
    return (
      <>
        {[...Array(rowsNum)].map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({ length: colsNum }).map((_, colIndex) => (
              <TableCell key={colIndex} component="th" scope="row">
                <Skeleton key={colIndex} animation="wave" variant="text" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  };

  return (
    <MainCard
      title={
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => {
            if (value === '') {
              handleSearchData('');
            } else {
              handleSearchData(value);
            }
          }}
          placeholder={`Search ${externalPagination?.totalRecords} records...`}
        />
      }
      content={false}
      secondary={
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ padding: 2, ...(downSM && { '& .MuiOutlinedInput-root, & .MuiFormControl-root': { width: '100%' } }) }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Stack direction="row" spacing={2} alignItems="center">
              {setActive && (
                <Button
                  variant="contained"
                  color="success"
                  disabled={!Object.keys(rowSelection).length || isLoading}
                  onClick={() => {
                    const selectedAdminIds = Object.keys(rowSelection)
                      .map((rowId) => {
                        const row = table.getRowModel().rows.find((r) => r.id === rowId);
                        return row;
                      })
                      .filter((id) => id !== null);
                    setActive(selectedAdminIds);
                  }}
                >
                  Active
                </Button>
              )}
              {setInactive && (
                <Button
                  variant="contained"
                  color="warning"
                  disabled={!Object.keys(rowSelection).length || isLoading}
                  onClick={() => {
                    const selectedAdminIds = Object.keys(rowSelection)
                      .map((rowId) => {
                        const row = table.getRowModel().rows.find((r) => r.id === rowId);
                        return row;
                      })
                      .filter((id) => id !== null);
                    setInactive(selectedAdminIds);
                  }}
                >
                  Inactive
                </Button>
              )}
              {setDelete && (
                <Button
                  variant="contained"
                  color="error"
                  disabled={!Object.keys(rowSelection).length || isLoading}
                  onClick={() => {
                    const selectedAdminIds = Object.keys(rowSelection)
                      .map((rowId) => {
                        const row = table.getRowModel().rows.find((r) => r.id === rowId);
                        return row;
                      })
                      .filter((id) => id !== null);
                    setDelete(selectedAdminIds);
                  }}
                >
                  Delete
                </Button>
              )}
              {addTitle && addTitle.trim() !== '' && (
                <Button
                  variant="contained"
                  style={{ whiteSpace: 'nowrap', width: '100%' }}
                  startIcon={<PlusOutlined />}
                  onClick={modalToggler}
                  disabled={isLoading}
                >
                  {addTitle}
                </Button>
              )}
              {customFilter && customFilter.filterCode}
              {data.length ? (
                <CSVExport
                  {...{
                    data:
                      table.getSelectedRowModel().flatRows.map((row) => row.original).length === 0
                        ? data
                        : table.getSelectedRowModel().flatRows.map((row) => row.original),
                    headers,
                    filename: 'data-list.csv'
                  }}
                />
              ) : null}
            </Stack>
          </Stack>
        </Stack>
      }
    >
      <ScrollX>
        <RowSelection selected={Object.keys(rowSelection).length} />
        <DndContext collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
          <TableContainer>
            {data.length == 0 && !isLoading ? (
              <EmptyReactTable columns={columns} />
            ) : (
              <SimpleBarScroll sx={{ maxHeight: 'calc(100vh - 300px)' }}>
                <Table>
                  <TableHead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} sx={{ '& > th:first-of-type': { width: '58px' } }}>
                        <TableCell />
                        {headerGroup.headers.map((header) => (
                          <TableCell key={header.id} {...header.column.columnDef.meta} onClick={header.column.getToggleSortingHandler()}>
                            {header.isPlaceholder ? null : (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                                {header.column.getCanSort() && <HeaderSort column={header.column} />}
                              </Stack>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableHead>
                  <TableBody>
                    <SortableContext
                      items={data.map((item) => `row-${item.user_id ?? item.resource_id ?? item.contact_enquiry_id ?? item.faq_id ?? item.faq_category_id ?? item.id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {(isLoading && data.length === 0) || isPaginationLoading ? (
                        <TableRowsLoader rowsNum={10} colsNum={columns.length + 1} />
                      ) : (
                        table.getRowModel().rows.map((row) => (
                          <Fragment key={row.id}>
                            <UserSortableRow row={row} />
                            {row.getIsExpanded() && ExpandRow && (
                              <TableRow>
                                <TableCell colSpan={row.getVisibleCells().length + 1}>{ExpandRow(row)}</TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        ))
                      )}
                    </SortableContext>
                  </TableBody>
                </Table>
              </SimpleBarScroll>
            )}
          </TableContainer>
          <Divider />
          <Box sx={{ p: 2 }}>
            <TablePagination
              {...{
                getPageCount: () => externalPagination?.totalPages || 1,
                setPageIndex: (index) => {
                  if (!isLoading && !isPaginationLoading) {
                    setIsUserInitiatedPagination(true);
                    // Ensure page index is within valid range
                    const safeIndex = Math.max(0, Math.min(index, (externalPagination?.totalPages || 1) - 1));
                    setInternalPagination((prev) => ({ ...prev, pageIndex: safeIndex }));
                  }
                },
                setPageSize: (size) => {
                  if (!isLoading && !isPaginationLoading) {
                    setIsUserInitiatedPagination(true);
                    setInternalPagination((prev) => ({ ...prev, pageSize: size, pageIndex: 0 }));
                  }
                },
                getState: () => ({
                  ...table.getState(),
                  // Override pagination with external values
                  pagination: {
                    pageIndex: externalPagination?.currentPage ? externalPagination.currentPage - 1 : 0,
                    pageSize: externalPagination?.limit || 10
                  }
                }),
                disabled: isLoading || isPaginationLoading,
                totalRecords: externalPagination?.totalRecords || 0
              }}
            />
          </Box>
        </DndContext>
      </ScrollX>
    </MainCard>
  );
}

// ==============================|| ROW - DRAG & DROP ||============================== //

export default function RowDragDrop({
  data,
  columns,
  modalToggler,
  addTitle,
  isLoading,
  setOrder,
  ExpandRow,
  setActive,
  setInactive,
  setDelete,
  clearSelection,
  customFilter,
  pagination: externalPagination,
  onPaginationChange,
  handleSortingChange,
  handleSearchData
}) {
  return (
    <ReactTable
      {...{
        defaultColumns: columns,
        defaultData: data,
        modalToggler,
        addTitle,
        isLoading,
        setOrder,
        ExpandRow,
        setActive,
        setInactive,
        setDelete,
        clearSelection,
        customFilter,
        pagination: externalPagination,
        onPaginationChange,
        handleSortingChange,
        handleSearchData
      }}
    />
  );
}
