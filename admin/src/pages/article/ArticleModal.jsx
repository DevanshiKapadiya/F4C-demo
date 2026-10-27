import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import Modal from '@mui/material/Modal';

// project-imports
import FormArticleAdd from './ArticleAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import IconButton from 'components/@extended/IconButton';
import { CloseOutlined } from '@ant-design/icons';
// ==============================|| CUSTOMER ADD / EDIT ||============================== //

export default function ArticleModal({ open, modalToggler, article, isSucess, isView }) {
  // const { articlesLoading: loading } = useGetArticle();

  const closeModal = () => {
    modalToggler(false);
    // onHide();
  };
  const isSuces = () => {
    modalToggler(false);
    isSucess(true);
  };
  const articleForm = useMemo(
    () => <FormArticleAdd article={article || null} closeModal={closeModal} isSucess={isSuces} isView={isView} />,
    // eslint-disable-next-line
    [article]
  );
  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-article-add-label"
          aria-describedby="modal-article-add-description"
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
              {articleForm}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}

ArticleModal.propTypes = { open: PropTypes.bool, modalToggler: PropTypes.func, article: PropTypes.any };
