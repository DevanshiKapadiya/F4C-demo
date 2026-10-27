import PropTypes from 'prop-types';
import { forwardRef } from 'react';

// material-ui
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

// third-party
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { flexRender } from '@tanstack/react-table';

// project imports
import IconButton from 'components/@extended/IconButton';

// assets
import DragOutlined from '@ant-design/icons/DragOutlined';

// ==============================|| DRAGGABLE ROW ||============================== //

const DraggableRow = forwardRef(function DraggableRow({ row, children, isDragging = false, onDrop }, forwardedRef) {
  const { attributes, listeners, setNodeRef, transform, transition } = useDraggable({
    id: `row-${row.id}`
  });

  const { setNodeRef: setDropRef } = useDroppable({
    id: `row-${row.id}`
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    position: isDragging ? 'absolute' : 'static',
    zIndex: isDragging ? 1000 : 'auto'
  };

  return (
    <TableRow
      ref={(node) => {
        setNodeRef(node);
        setDropRef(node);

        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      }}
      key={row.id}
      style={style}
      aria-grabbed={isDragging}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={onDrop ? () => onDrop(row.id) : undefined}
    >
      {/* Move Button */}
      <TableCell>
        <IconButton
          {...listeners}
          {...attributes}
          size="small"
          color="secondary"
          sx={{
            p: 0,
            width: 24,
            height: 24,
            fontSize: '1rem',
            mr: 0.75,
            cursor: 'grab',
            touchAction: 'none'
          }}
        >
          <DragOutlined />
        </IconButton>
      </TableCell>

      {/* Table Data */}
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} {...cell.column.columnDef.meta}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
});

// ==============================|| PROP TYPES ||============================== //

DraggableRow.propTypes = {
  row: PropTypes.object.isRequired,
  children: PropTypes.node,
  isDragging: PropTypes.bool,
  onDrop: PropTypes.func
};

export default DraggableRow;

// ==============================|| DRAGGING OVERLAY ||============================== //

export function DraggingOverlay({ rowData }) {
  return (
    <div
      style={{
        position: 'absolute',
        backgroundColor: 'white',
        border: '1px solid gray',
        padding: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 1000
      }}
    >
      {rowData && <div key={rowData.id}>{rowData}</div>}
    </div>
  );
}

DraggingOverlay.propTypes = {
  rowData: PropTypes.any
};
