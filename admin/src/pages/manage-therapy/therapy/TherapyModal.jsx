import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import Modal from '@mui/material/Modal';

// project-imports
import FormTherapyAdd from './FormTherapyAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import IconButton from 'components/@extended/IconButton';
import { CloseOutlined } from '@ant-design/icons';

// ==============================|| CUSTOMER ADD / EDIT ||============================== //

export default function ClientTypeModal({ open, modalToggler, therapy, isSucess, isView }) {
  // const { clientTypesLoading: loading } = useGetClientType();

  const closeModal = () => {
    modalToggler(false);
  };
  const isSuces = () => {
    modalToggler(false);
    isSucess(true);
  };

  const clientTypeForm = useMemo(
    () => <FormTherapyAdd therapy={therapy || null} closeModal={closeModal} isSucess={isSuces} isView={isView} />,
    // eslint-disable-next-line
    [therapy]
  );
  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-clientType-add-label"
          aria-describedby="modal-clientType-add-description"
          sx={{
            '& .MuiPaper-root:focus': {
              outline: 'none'
            }
          }}
          BackdropProps={{
            onClick: (e) => e.stopPropagation()
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
              {clientTypeForm}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}

ClientTypeModal.propTypes = { open: PropTypes.bool, modalToggler: PropTypes.func, clientType: PropTypes.any };
