// ==============================|| OVERRIDES - TABLE CELL ||============================== //

export default function TableFooter(theme) {
  return {
    MuiTableFooter: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.grey[50],
          borderTop: '2px solid',
          borderTopColor: theme.palette.divider,
          borderBottom: '1px solid',
          borderBottomColor: theme.palette.divider
        }
      }
    }
  };
}
