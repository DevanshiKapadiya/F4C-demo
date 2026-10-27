import { useEffect, useMemo, useState } from 'react';

// material-ui
import Modal from '@mui/material/Modal';

// project-imports
import FormFaqAdd from './FormFaqAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

const closeModal = () => handlerFaqDialog(false);

// ==============================|| CUSTOMER ADD / EDIT ||============================== //

export default function AddFaq() {
  const { faqMasterLoading, faqMaster } = useGetFaqMaster();
  // const { faqsLoading: loading, faqs } = useGetFaq();

  const [list, setList] = useState(null);

  const isModal = faqMaster?.modal;

  useEffect(() => {
    if (faqMaster?.modal && typeof faqMaster.modal === 'number') {
      const newList = faqs.filter((info) => info.id === isModal && info)[0];
      setList(newList);
    } else {
      setList(null);
    }
    // eslint-disable-next-line
  }, [faqMaster]);

  const faqForm = useMemo(() => <FormFaqAdd faq={list} closeModal={closeModal} />, [list]);

  return (
    <>
      {isModal && (
        <Modal
          open={true}
          onClose={closeModal}
          aria-labelledby="modal-faq-add-label"
          aria-describedby="modal-faq-add-description"
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
              {faqForm}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}
