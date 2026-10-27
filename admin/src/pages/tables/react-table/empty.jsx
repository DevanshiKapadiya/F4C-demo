import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

// material-ui
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';


// third-party
import {
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  flexRender,
  useReactTable
} from '@tanstack/react-table';

// project import
import makeData from 'data/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { CSVExport, DebouncedInput, EmptyTable, Filter } from 'components/third-party/react-table';

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data }) {
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      globalFilter
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter
  });

  return (
    <MainCard content={false}>
      <ScrollX>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(
                    (header) =>
                      header.id != 'id' && (
                        <TableCell key={header.id} {...header.column.columnDef.meta}>
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableCell>
                      )
                  )}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length}>
                    <EmptyTable msg="No Data" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </ScrollX>
    </MainCard>
  );
}

// ==============================|| REACT TABLE - EMPTY ||============================== //

export default function EmptyReactTable({ columns }) {
  const data = useMemo(() => makeData(0), []);

  // const columns = useMemo(
  //   () => [
  //     {
  //       header: 'Name',
  //       footer: 'Name',
  //       accessorKey: 'fullName'
  //     },
  //     {
  //       header: 'Email',
  //       footer: 'Email',
  //       accessorKey: 'email'
  //     },
  //     {
  //       header: 'Role',
  //       footer: 'Role',
  //       accessorKey: 'role'
  //     },
  //     {
  //       header: 'Age',
  //       footer: 'Age',
  //       accessorKey: 'age',
  //       meta: {
  //         className: 'cell-right'
  //       }
  //     },
  //     {
  //       header: 'Visits',
  //       footer: 'Visits',
  //       accessorKey: 'visits',
  //       meta: {
  //         className: 'cell-right'
  //       }
  //     },
  //     {
  //       header: 'Status',
  //       footer: 'Status',
  //       accessorKey: 'status'
  //     },
  //     {
  //       header: 'Profile Progress',
  //       footer: 'Profile Progress',
  //       accessorKey: 'progress'
  //     }
  //   ],
  //   []
  // );

  return <ReactTable columns={columns} data={data} />;
}

ReactTable.propTypes = { columns: PropTypes.array, data: PropTypes.array };
