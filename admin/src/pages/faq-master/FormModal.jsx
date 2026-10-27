import PropTypes from 'prop-types';

// material-ui
import Modal from '@mui/material/Modal';

// project-imports
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import IconButton from 'components/@extended/IconButton';
import { CloseOutlined } from '@ant-design/icons';

// ==============================|| FAQ MASTER - ADD / EDIT MODAL ||============================== //

export default function FormModal({ open, onClose, children, label }) {
  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby={`modal-${label}-label`}
      BackdropProps={{ onClick: (e) => e.stopPropagation() }}
      sx={{ '& .MuiPaper-root:focus': { outline: 'none' } }}
    >
      <MainCard
        sx={{ width: `calc(100% - 48px)`, minWidth: 340, maxWidth: 880, height: 'auto', maxHeight: 'calc(100vh - 48px)' }}
        modal
        content={false}
      >
        <IconButton onClick={onClose} color="secondary" sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
          <CloseOutlined />
        </IconButton>
        <SimpleBar
          sx={{
            maxHeight: `calc(100vh - 48px)`,
            '& .simplebar-content': { display: 'flex', flexDirection: 'column' }
          }}
        >
          {children}
        </SimpleBar>
      </MainCard>
    </Modal>
  );
}

FormModal.propTypes = { open: PropTypes.bool, onClose: PropTypes.func, children: PropTypes.node, label: PropTypes.string };
