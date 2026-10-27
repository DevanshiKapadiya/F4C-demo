import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import Modal from '@mui/material/Modal';

// project-imports
import FormLanguageAdd from './FormLanguageAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import IconButton from 'components/@extended/IconButton';
import { CloseOutlined } from '@ant-design/icons';

// ==============================|| CUSTOMER ADD / EDIT ||============================== //

export default function LanguageModal({ open, modalToggler, language, isSucess, isView }) {
  // const { languagesLoading: loading } = useGetLanguage();

  const closeModal = () => {
    modalToggler(false);
    // onHide();
  };
  const isSuces = () => {
    modalToggler(false);
    isSucess(true);
  };

  const languageForm = useMemo(
    () => <FormLanguageAdd language={language || null} closeModal={closeModal} isSucess={isSuces} isView={isView} />,
    // eslint-disable-next-line
    [language]
  );
  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-language-add-label"
          aria-describedby="modal-language-add-description"
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
              {languageForm}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}

LanguageModal.propTypes = { open: PropTypes.bool, modalToggler: PropTypes.func, language: PropTypes.any };
