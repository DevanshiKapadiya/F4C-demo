import { useEffect, useMemo, useState } from 'react';

// material-ui
import Modal from '@mui/material/Modal';

// project-imports
import FormProfessionalBodyAdd from './FormProfessionalBodyAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

const closeModal = () => handlerProfessionalBodyDialog(false);

// ==============================|| CUSTOMER ADD / EDIT ||============================== //

export default function AddProfessionalBody() {
  const { professionalBodyMasterLoading, professionalBodyMaster } = useGetFaqMaster();
  // const { professionalBodysLoading: loading, professionalBodys } = useGetProfessionalBody();

  const [list, setList] = useState(null);

  const isModal = professionalBodyMaster?.modal;

  useEffect(() => {
    if (professionalBodyMaster?.modal && typeof professionalBodyMaster.modal === 'number') {
      const newList = professionalBodys.filter((info) => info.id === isModal && info)[0];
      setList(newList);
    } else {
      setList(null);
    }
    // eslint-disable-next-line
  }, [professionalBodyMaster]);

  const professionalBodyForm = useMemo(() => <FormProfessionalBodyAdd professionalBody={list} closeModal={closeModal} />, [list]);

  return (
    <>
      {isModal && (
        <Modal
          open={true}
          onClose={closeModal}
          aria-labelledby="modal-professionalBody-add-label"
          aria-describedby="modal-professionalBody-add-description"
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
              {professionalBodyForm}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}
