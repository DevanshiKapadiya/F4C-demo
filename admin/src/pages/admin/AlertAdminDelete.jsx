import PropTypes from 'prop-types';
/* material-ui */
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/* project import */
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

/* assets */
import DeleteFilled from '@ant-design/icons/DeleteFilled';
import { CheckCircleFilled, LockOutlined } from '@ant-design/icons';

/* ==============================|| CUSTOMER - DELETE ||============================== */

export default function AlertAdminDelete({ open, type, handleClose, onConfirm }) {
  const deletehandler = async () => {
    await onConfirm();
    /* try {
      const payload = {
        admin_ids: String(id)
      };
      const response = await AuthService.axiosPrivatePost('/deleteAdmin', payload);
      if (response.data.status) {
        openSnackbar({
          open: true,
          message: 'Admin deleted successfully',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          variant: 'alert',
          alert: {
            color: 'success'
          }
        });
        isSucess();
        handleClose();
      } else {
        openSnackbar({
          open: true,
          message: response.data.message,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          variant: 'alert',
          alert: {
            color: 'warning'
          }
        });
      }
    } catch (error) {} */
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
              Are you sure you want to {type} record?
            </Typography>
            {/* <Typography align="center">
              By deleting
              <Typography variant="subtitle1" component="span">
                {' '}
                &quot;{title}&quot;{' '}
              </Typography>
              user, all task assigned to that user will also be deleted.
            </Typography> */}
          </Stack>

          <Stack direction="row" spacing={2} sx={{ width: 1 }}>
            <Button fullWidth onClick={handleClose} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button fullWidth color="error" variant="contained" onClick={deletehandler} autoFocus>
              {type}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

AlertAdminDelete.propTypes = { id: PropTypes.number, title: PropTypes.string, open: PropTypes.bool, handleClose: PropTypes.func };
