import { useEffect, useMemo, useState } from 'react';

// material-ui
import Modal from '@mui/material/Modal';

// project-imports
import FormTeamAdd from './TeamAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

const closeModal = () => handlerTeamDialog(false);

// ==============================|| CUSTOMER ADD / EDIT ||============================== //

export default function AddTeam() {
  const { teamMasterLoading, teamMaster } = useGetTeamMaster();
  // const { teamsLoading: loading, teams } = useGetTeam();

  const [list, setList] = useState(null);

  const isModal = teamMaster?.modal;

  useEffect(() => {
    if (teamMaster?.modal && typeof teamMaster.modal === 'number') {
      const newList = teams.filter((info) => info.id === isModal && info)[0];
      setList(newList);
    } else {
      setList(null);
    }
    // eslint-disable-next-line
  }, [teamMaster]);

  const teamForm = useMemo(() => <FormTeamAdd team={list} closeModal={closeModal} />, [list]);

  return (
    <>
      {isModal && (
        <Modal
          open={true}
          onClose={closeModal}
          aria-labelledby="modal-team-add-label"
          aria-describedby="modal-team-add-description"
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
              {teamForm}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}
