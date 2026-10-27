import { openSnackbar } from 'api/snackbar';

export default function useFileCheck(event) {
  const selectedFile = event.target.files[0];
  const maxFileSize = 1 * 1024 * 1024;
  const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];
  if (selectedFile) {
    if (!allowedTypes.includes(selectedFile.type)) {
      openSnackbar({
        open: true,
        message: 'Only image files (JPG, JPEG, PNG, GIF) are allowed.',
        variant: 'alert',
        alert: {
          color: 'warning'
        }
      });
    } else if (selectedFile.size > maxFileSize) {
      openSnackbar({
        open: true,
        message: 'File size exceeds the 1 MB.',
        variant: 'alert',
        alert: {
          color: 'warning'
        }
      });
    } else {
      return true;
    }
  }
}
