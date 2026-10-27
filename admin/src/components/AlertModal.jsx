import PropTypes from 'prop-types';
// material-ui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

// assets
import DeleteFilled from '@ant-design/icons/DeleteFilled';
import { CheckCircleFilled, LoadingOutlined, LockOutlined } from '@ant-design/icons';
import { useState } from 'react';
import LoadingButton from './@extended/LoadingButton';

// ==============================|| CUSTOMER - DELETE ||============================== //

export default function AlertModal({ open, type, handleClose, onConfirm, ids }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const deletehandler = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
      aria-labelledby="column-delete-title"
      aria-describedby="column-delete-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack alignItems="center" spacing={3.5}>
          {type == 'Active' ? (
            <Avatar color="sucess" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
              <CheckCircleFilled />
            </Avatar>
          ) : type == 'Inactive' ? (
            <Avatar color="warning" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
              <LockOutlined />
            </Avatar>
          ) : (
            <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
              <DeleteFilled />
            </Avatar>
          )}
          <Stack spacing={2}>
            <Typography variant="h4" align="center">
              {type != 'Delete'
                ? `Are you sure you want to ${type} record${ids.length > 1 ? 's' : ''}?`
                : `Delete this record${ids.length > 1 ? 's' : ''}? This cannot be undone.`}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ width: 1 }}>
            <Button fullWidth onClick={handleClose} color="secondary" variant="outlined">
              Cancel
            </Button>
            <LoadingButton
              fullWidth
              disabled={isSubmitting}
              color={type == 'Active' ? 'success' : type == 'Inactive' ? 'warning' : 'error'}
              variant="contained"
              onClick={deletehandler}
              autoFocus
              endIcon={isSubmitting && <LoadingOutlined />}
            >
              {type}
            </LoadingButton>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

AlertModal.propTypes = { id: PropTypes.number, title: PropTypes.string, open: PropTypes.bool, handleClose: PropTypes.func };
