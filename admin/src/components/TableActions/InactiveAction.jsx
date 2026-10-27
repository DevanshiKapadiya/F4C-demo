// components/TableActions/InactiveAction.jsx
import { openSnackbar } from 'api/snackbar';
import { AuthService } from 'services';

export default async function InactiveAction({ selectedRows, idKey, endpoint, updateStatuses }) {
  const ids = selectedRows.map((item) => item.original[idKey]);
  const idsString = ids.join(', ');

  const payload = { [`${idKey}s`]: idsString };

  try {
    const response = await AuthService.axiosPrivatePost(endpoint, payload);
    if (response.data.status) {
      openSnackbar({
        open: true,
        message: response.data.message,
        variant: 'alert',
        alert: { color: 'success' }
      });

      // ✅ Update local statuses to 'Inactive'
      updateStatuses(ids, 0); // assuming 0 means Inactive
    }
  } catch (error) {
    console.error(error);
  }
}
