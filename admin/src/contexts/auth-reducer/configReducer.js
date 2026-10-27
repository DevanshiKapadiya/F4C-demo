// reducers/configReducer.js
const initialState = {
  container: true,
  i18n: 'en', // default language
  mode: 'light', // default mode
  presetColor: 'default',
  themeDirection: 'ltr',
  miniDrawer: false,
  menuOrientation: 'vertical',
  fontFamily: 'Arial, sans-serif'
};

const configReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'CHANGE_CONTAINER':
      return { ...state, container: !state.container };
    case 'CHANGE_LOCALIZATION':
      return { ...state, i18n: action.payload };
    case 'CHANGE_MODE':
      return { ...state, mode: action.payload };
    case 'CHANGE_PRESET_COLOR':
      return { ...state, presetColor: action.payload };
    case 'CHANGE_DIRECTION':
      return { ...state, themeDirection: action.payload };
    case 'CHANGE_MINI_DRAWER':
      return { ...state, miniDrawer: action.payload };
    case 'CHANGE_MENU_ORIENTATION':
      return { ...state, menuOrientation: action.payload };
    case 'CHANGE_FONT_FAMILY':
      return { ...state, fontFamily: action.payload };
    default:
      return state;
  }
};

export default configReducer;
