import PropTypes from 'prop-types';

// material-ui
import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';

// third-party
import { useDroppable, useDraggable } from '@dnd-kit/core';

// ==============================|| DRAGGABLE COLUMN ||============================== //

export default function DraggableColumnHeader({ header, children }) {
  const { column } = header;

  const { setNodeRef: setDropRef, isOver: isOverCurrent } = useDroppable({
    id: column.id
  });

  const {
    setNodeRef: setDragRef,
    attributes,
    listeners,
    isDragging
  } = useDraggable({
    id: column.id
  });

  return (
    <TableCell ref={setDropRef} colSpan={header.colSpan} sx={{ cursor: 'move' }} {...header.column.columnDef.meta}>
      <Box
        ref={setDragRef}
        {...listeners}
        {...attributes}
        sx={{ color: isOverCurrent ? 'primary.main' : 'text.primary', opacity: isDragging ? 0.9 : 1 }}
      >
        {children}
      </Box>
    </TableCell>
  );
}

DraggableColumnHeader.propTypes = { header: PropTypes.object, table: PropTypes.object, children: PropTypes.node };
