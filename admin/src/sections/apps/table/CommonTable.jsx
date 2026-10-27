import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';

// third-party
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';

// project-import
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';

import { CSVExport, DebouncedInput, HeaderSort, RowSelection, TablePagination } from 'components/third-party/react-table';

// assets
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import { Skeleton } from '@mui/material';
import EmptyReactTable from 'pages/tables/react-table/empty';
import SimpleBarScroll from 'components/third-party/SimpleBar';

export const fuzzyFilter = (row, columnId, value, addMeta) => {
  // rank the item
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

// ==============================|| REACT TABLE - LIST ||============================== //

export default function CustomerTable({
  data,
  columns,
  modalToggler,
  addTitle,
  isLoading,
  setActive,
  setInactive,
  setDelete,
  clearSelection,
  customFilter,
  ExpandRow,
  pagination: externalPagination,
  onPaginationChange,
  handleSortingChange,
  handleSearchData,
  getRowId,
  singleExpand = false,
  defaultSorting = [{ id: 'created_at', desc: false }]
}) {
  const theme = useTheme();
  const downSM = useMediaQuery(theme.breakpoints.down('sm'));
  const [sorting, setSorting] = useState(defaultSorting);
  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState({});
  const [globalFilter, setGlobalFilter] = useState();
  const [statusFilter] = useState(2);
  const [columnVisibility, setColumnVisibility] = useState({});

  const [internalPagination, setInternalPagination] = useState({
    pageIndex: 0,
    pageSize: 10
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

  useEffect(() => {
    // Clear pagination loading whether data arrived empty or not
    setIsPaginationLoading(false);
  }, [data]);

  const filteredData = useMemo(() => {
    if (statusFilter == 2) return data;
    return data.filter((customer) => customer.status === statusFilter);
  }, [statusFilter, data]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      rowSelection,
      globalFilter,
      columnVisibility,
      pagination: internalPagination,
      ...(singleExpand ? { expanded } : {})
    },
    getRowId: getRowId || ((row, index) => String(row.resource_id ?? row.article_id ?? row.user_id ?? row.admin_id ?? row.id ?? index)),
    enableRowSelection: true,
    manualSorting: true,
    sortDescFirst: false,
    enableSortingRemoval: false,
    onSortingChange: (updater) => {
      /* Resolve against the current sorting so repeated clicks toggle asc <-> desc */
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(next);
      handleSortingChange(next);
    },
    // onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getRowCanExpand: () => Boolean(ExpandRow),
    ...(singleExpand
      ? {
          onExpandedChange: (updater) => {
            setExpanded((previous) => {
              const next = typeof updater === 'function' ? updater(previous) : updater;
              if (next === true) return true;
              if (!next || typeof next !== 'object') return {};
              const newlyOpened = Object.keys(next).find((id) => next[id] && !previous?.[id]);
              if (newlyOpened) return { [newlyOpened]: true };
              const remaining = Object.keys(next).find((id) => next[id]);
              return remaining ? { [remaining]: true } : {};
            });
          }
        }
      : {}),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: fuzzyFilter,
    onColumnVisibilityChange: setColumnVisibility,
    debugTable: false,
    manualPagination: true,
    onPaginationChange: setInternalPagination,
    pageCount: externalPagination?.totalPages || 1
  });

  // Trigger page change when internal pagination changes
  useEffect(() => {
    if (externalPagination && isInitialized && isUserInitiatedPagination) {
      setIsPaginationLoading(true); // Set loading state for pagination
      debouncedOnPaginationChange(internalPagination.pageIndex + 1, internalPagination.pageSize);
      setIsUserInitiatedPagination(false);
    }
  }, [internalPagination.pageIndex, internalPagination.pageSize, externalPagination, isInitialized, debouncedOnPaginationChange]);

  const prevPageSize = useRef(internalPagination.pageSize);
  useEffect(() => {
    setRowSelection({});
    table.resetRowSelection();
  }, [clearSelection]);
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
  const backColor = alpha(theme.palette.primary.lighter, 0.1);
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
      content={false}
      title={
        <DebouncedInput
          value={globalFilter ?? ''}
          // onFilterChange={(value) => handleSearchData(String(value))}
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
              {addTitle.trim() != '' ? (
                <Button
                  style={{ whiteSpace: 'nowrap', width: '100%' }}
                  variant="contained"
                  startIcon={<PlusOutlined />}
                  onClick={modalToggler}
                  disabled={isLoading}
                >
                  {addTitle}
                </Button>
              ) : null}
              {customFilter && customFilter.filterCode}
              {/* <SelectColumnSorting {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} /> */}
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
        <Stack>
          <RowSelection selected={Object.keys(rowSelection).length} />
          {data.length == 0 && !isLoading ? (
            <EmptyReactTable columns={columns} />
          ) : (
            <SimpleBarScroll sx={{ maxHeight: 'calc(100vh - 300px)' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          if (header.column.columnDef.meta !== undefined && header.column.getCanSort()) {
                            Object.assign(header.column.columnDef.meta, {
                              className: header.column.columnDef.meta.className + ' cursor-pointer prevent-select'
                            });
                          }
                          return (
                            <TableCell
                              key={header.id}
                              {...header.column.columnDef.meta}
                              onClick={header.column.getToggleSortingHandler()}
                              {...(header.column.getCanSort() &&
                                header.column.columnDef.meta === undefined && {
                                  className: 'cursor-pointer prevent-select'
                                })}
                            >
                              {header.isPlaceholder ? null : (
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                                  {header.column.getCanSort() && <HeaderSort column={header.column} />}
                                </Stack>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHead>
                  <TableBody>
                    {(isLoading && data.length == 0) || isPaginationLoading ? (
                      <TableRowsLoader rowsNum={10} colsNum={columns.length} />
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <Fragment key={`row-group-${row.id}`}>
                          <TableRow key={`main-row-${row.id}`}>
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                          {row.getIsExpanded() && (
                            <TableRow
                              key={`expanded-row-${row.id}`}
                              sx={{ bgcolor: backColor, '&:hover': { bgcolor: `${backColor} !important` } }}
                            >
                              <TableCell colSpan={row.getVisibleCells().length}>{ExpandRow(row)}</TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </SimpleBarScroll>
          )}
          <>
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
          </>
        </Stack>
      </ScrollX>
    </MainCard>
  );
}
