import { openSnackbar } from 'api/snackbar';
import { AuthService } from 'services';

export default function DeleteAction({ selectedRows, idKey, endpoint, fetchList, pagination }) {
  const ids = selectedRows.map((item) => item.original[idKey]);
  const idsString = ids.join(', ');

  const payload = { [`${idKey}s`]: idsString };

  return AuthService.axiosPrivatePost(endpoint, payload)
    .then((response) => {
      if (response.data.status) {
        openSnackbar({
          open: true,
          message: response.data.message,
          variant: 'alert',
          alert: { color: 'success' }
        });

        // Handle pagination shift after delete
        const newTotalRecords = pagination.totalRecords - ids.length;
        const newTotalPages = Math.ceil(newTotalRecords / pagination.limit);
        let newPage = pagination.currentPage;

        if (newPage > newTotalPages && newTotalPages > 0) {
          newPage = newTotalPages;
        }

        // Only fetch list AFTER delete confirmed success
        return fetchList(newPage);
      }
    })
    .catch((error) => {
      console.error(error);
    });
}
