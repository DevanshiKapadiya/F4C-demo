import PropTypes from 'prop-types';

/* material-ui */
import Modal from '@mui/material/Modal';

/* project-imports */
import FormAdminAdd from './FormAdminAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import FormChangeAdminPassword from './ChangeAdminPassword';
import IconButton from 'components/@extended/IconButton';
import { CloseOutlined } from '@ant-design/icons';
/* ==============================|| CUSTOMER ADD / EDIT ||============================== */

export default function AdminModal({ open, modalToggler, admin, isSucess, isPassword }) {
  const closeModal = () => modalToggler(false);
  const setCurrentAdminDetail = (detail) => {
    const currentData = JSON.parse(localStorage.getItem('users'));
    if (currentData && currentData.admin_id == detail.admin_id) {
      const updatedData = { ...currentData, ...detail };
      localStorage.setItem('users', JSON.stringify(updatedData));
    } else {
      console.log('No data found in localStorage');
    }
  };
  const isSuces = (data) => {
    isSucess();
    setCurrentAdminDetail(data);
    modalToggler(false);
  };

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-admin-add-label"
          aria-describedby="modal-admin-add-description"
          BackdropProps={{
            onClick: (e) => e.stopPropagation()
          }}
          sx={{
            '& .MuiPaper-root:focus': {
              outline: 'none'
            }
          }}
        >
          <MainCard
            sx={{ width: `calc(100% - 48px)`, minWidth: 340, maxWidth: 880, height: 'auto', maxHeight: 'calc(100vh - 48px)' }}
            modal
            content={false}
          >
            {/* Close button */}
            <IconButton
              onClick={closeModal}
              color="secondary"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1
              }}
            >
              <CloseOutlined />
            </IconButton>
            <SimpleBar
              sx={{
                maxHeight: `calc(100vh - 48px)`,
                '& .simplebar-content': {
                  display: 'flex',
                  flexDirection: 'column'
                }
              }}
            >
              {!isPassword ? (
                <FormAdminAdd admin={admin || null} closeModal={closeModal} isSucess={isSuces} />
              ) : (
                <FormChangeAdminPassword admin={admin} closeModal={closeModal} isSucess={isSuces} />
              )}
              {/* )} */}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}

AdminModal.propTypes = { open: PropTypes.bool, modalToggler: PropTypes.func, admin: PropTypes.any };
