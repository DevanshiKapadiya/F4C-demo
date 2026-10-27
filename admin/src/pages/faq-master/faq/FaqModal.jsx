import PropTypes from 'prop-types';

/* material-ui */
import Modal from '@mui/material/Modal';

/* project-imports */
import FormFaq from './FormFaq';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import IconButton from 'components/@extended/IconButton';
import { CloseOutlined } from '@ant-design/icons';

/* ==============================|| FAQ – ADD / EDIT MODAL ||============================== */

export default function FaqModal({ open, modalToggler, faq, defaultCategoryId, isSucess, onSaved }) {
  const closeModal = () => modalToggler(false);

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-faq-add-label"
          aria-describedby="modal-faq-add-description"
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
              <FormFaq
                faq={faq || null}
                defaultCategoryId={defaultCategoryId}
                closeModal={closeModal}
                isSucess={isSucess}
                onSaved={onSaved}
              />
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}

FaqModal.propTypes = {
  open: PropTypes.bool,
  modalToggler: PropTypes.func,
  faq: PropTypes.any,
  defaultCategoryId: PropTypes.any,
  isSucess: PropTypes.func,
  onSaved: PropTypes.func
};
