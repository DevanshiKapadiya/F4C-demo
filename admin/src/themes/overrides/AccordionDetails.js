// ==============================|| OVERRIDES - ALERT TITLE ||============================== //

export default function AccordionDetails(theme) {
  return {
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: theme.spacing(2),
          borderTop: '1px solid',
          borderTopColor: theme.palette.secondary.light
        }
      }
    }
  };
}
