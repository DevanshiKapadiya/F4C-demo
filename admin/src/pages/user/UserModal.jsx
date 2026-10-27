import PropTypes from 'prop-types';

/* material-ui */
import Modal from '@mui/material/Modal';

/* project-imports */
import FormUserAdd from './FormUserAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import IconButton from 'components/@extended/IconButton';
import { CloseOutlined } from '@ant-design/icons';

/* ==============================|| USER – ADD / EDIT MODAL ||============================== */

export default function UserModal({ open, modalToggler, user, isSucess }) {
  const closeModal = () => modalToggler(false);

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-user-add-label"
          aria-describedby="modal-user-add-description"
          BackdropProps={{ onClick: (e) => e.stopPropagation() }}
          sx={{ '& .MuiPaper-root:focus': { outline: 'none' } }}
        >
          <MainCard
            sx={{
              width: 'calc(100% - 48px)',
              minWidth: 340,
              maxWidth: 880,
              height: 'auto',
              maxHeight: 'calc(100vh - 48px)'
            }}
            modal
            content={false}
          >
            {/* Close button */}
            <IconButton onClick={closeModal} color="secondary" sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
              <CloseOutlined />
            </IconButton>

            <SimpleBar
              sx={{
                maxHeight: 'calc(100vh - 48px)',
                '& .simplebar-content': { display: 'flex', flexDirection: 'column' }
              }}
            >
              <FormUserAdd user={user || null} closeModal={closeModal} isSucess={isSucess} />
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}

UserModal.propTypes = {
  open: PropTypes.bool,
  modalToggler: PropTypes.func,
  user: PropTypes.any,
  isSucess: PropTypes.func
};
