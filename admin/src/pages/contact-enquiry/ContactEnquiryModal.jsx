import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';

// project-imports
import FormAdminAdd from './FormAdminAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

// ==============================|| CUSTOMER ADD / EDIT ||============================== //

export default function AdminModal({ open, modalToggler, admin, isSucess }) {
  // const { adminsLoading: loading } = useGetAdmin();

  const closeModal = () => modalToggler(false);
  const isSuces = () => {
    modalToggler(false);
    isSucess(true);
  };

  const adminForm = useMemo(
    () => <FormAdminAdd admin={admin || null} closeModal={closeModal} isSucess={isSuces} />,
    // eslint-disable-next-line
    [admin]
  );
  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-admin-add-label"
          aria-describedby="modal-admin-add-description"
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
            <SimpleBar
              sx={{
                maxHeight: `calc(100vh - 48px)`,
                '& .simplebar-content': {
                  display: 'flex',
                  flexDirection: 'column'
                }
              }}
            >
              {/* {!admin ? (
                <Box sx={{ p: 5 }}>
                  <Stack direction="row" justifyContent="center">
                    <CircularWithPath />
                  </Stack>
                </Box>
              ) : ( */}
              {adminForm}
              {/* )} */}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}

AdminModal.propTypes = { open: PropTypes.bool, modalToggler: PropTypes.func, admin: PropTypes.any };
