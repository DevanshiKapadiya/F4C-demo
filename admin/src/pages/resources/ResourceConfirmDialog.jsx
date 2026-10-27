import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

// project import
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';
import LoadingButton from 'components/@extended/LoadingButton';

// assets
import DeleteFilled from '@ant-design/icons/DeleteFilled';
import CheckCircleFilled from '@ant-design/icons/CheckCircleFilled';
import LockOutlined from '@ant-design/icons/LockOutlined';
import LoadingOutlined from '@ant-design/icons/LoadingOutlined';

export default function ResourceConfirmDialog({ open, type, handleClose, onConfirm, items = [] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setReason('');
      setIsSubmitting(false);
    }
  }, [open]);

  const hasCounsellorItem = items.some(
    (row) => row.original?.counsellor_id || row.original?.author_type === 'Counsellor'
  );

  const handleAction = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(reason);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const count = items.length;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
      fullWidth
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack alignItems="center" spacing={3}>
          {type === 'Active' ? (
            <Avatar color="success" sx={{ width: 68, height: 68, fontSize: '1.75rem' }}>
              <CheckCircleFilled />
            </Avatar>
          ) : type === 'Inactive' ? (
            <Avatar color="warning" sx={{ width: 68, height: 68, fontSize: '1.75rem' }}>
              <LockOutlined />
            </Avatar>
          ) : (
            <Avatar color="error" sx={{ width: 68, height: 68, fontSize: '1.75rem' }}>
              <DeleteFilled />
            </Avatar>
          )}

          <Stack spacing={1} sx={{ width: '100%', textAlign: 'center' }}>
            <Typography variant="h4">
              {type === 'Active'
                ? `Activate Resource${count > 1 ? 's' : ''}?`
                : type === 'Inactive'
                ? `Deactivate Resource${count > 1 ? 's' : ''}?`
                : `Delete Resource${count > 1 ? 's' : ''}?`}
            </Typography>
            <Typography variant="body2" color="secondary">
              {type === 'Delete'
                ? 'This action cannot be undone.'
                : type === 'Inactive'
                ? 'This resource will be hidden from the public view.'
                : 'This resource will be made visible publicly.'}
            </Typography>
          </Stack>

          {/* If counsellor resource is being hidden or deleted, show notification note and reason field */}
          {hasCounsellorItem && (type === 'Inactive' || type === 'Delete') && (
            <Stack spacing={1} sx={{ width: '100%' }}>
              <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 600 }}>
                Notification will be sent to the Counsellor:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Reason for hiding/deleting (e.g. Content violates guidelines)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                size="small"
              />
            </Stack>
          )}

          <Stack direction="row" spacing={2} sx={{ width: 1 }}>
            <Button fullWidth onClick={handleClose} color="secondary" variant="outlined" disabled={isSubmitting}>
              Cancel
            </Button>
            <LoadingButton
              fullWidth
              disabled={isSubmitting}
              color={type === 'Active' ? 'success' : type === 'Inactive' ? 'warning' : 'error'}
              variant="contained"
              onClick={handleAction}
              autoFocus
              endIcon={isSubmitting && <LoadingOutlined />}
            >
              {type === 'Active' ? 'Activate' : type === 'Inactive' ? 'Make Inactive' : 'Delete'}
            </LoadingButton>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

ResourceConfirmDialog.propTypes = {
  open: PropTypes.bool,
  type: PropTypes.string,
  handleClose: PropTypes.func,
  onConfirm: PropTypes.func,
  items: PropTypes.array
};
