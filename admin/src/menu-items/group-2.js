// This is example of menu item without group for horizontal layout. There will be no children.

// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { CaretRightFilled, ChromeOutlined, FileSearchOutlined, RocketOutlined } from '@ant-design/icons';

// icons
const icons = {
  ChromeOutlined
};

// ==============================|| MENU ITEMS - SAMPLE PAGE ||============================== //

const Group2 = {
  id: 'group-pages2',
  title: 'Manage Policies',
  type: 'group',
  children: [
    {
      id: 'policies',
      title: 'Manage Policies',
      type: 'item',
      breadcrumbs: false,
      url: '/manage-policy',
      icon: FileSearchOutlined,
      isDropdown: false,
      children: [
        {
          id: 'complaintsPolicy',
          title: 'Complaints Policy',
          type: 'item',
          url: '/manage-policy/complaintsPolicy',
          icon: CaretRightFilled,
          target: false
        },
        {
          id: 'termsAndConditions',
          title: 'Terms and Conditions',
          type: 'item',
          url: '/manage-policy/termsAndConditions',
          icon: CaretRightFilled,
          target: false
        },
        {
          id: 'policy',
          title: 'Policy',
          type: 'item',
          url: '/manage-policy/policy',
          icon: CaretRightFilled,
          target: false
        },
       
        // {
        //   id: 'error-500',
        //   title: 'error-500',
        //   type: 'item',
        //   url: '/maintenance/500',
        //   target: true
        // },
        // {
        //   id: 'coming-soon',
        //   title: 'coming-soon',
        //   type: 'item',
        //   url: '/maintenance/coming-soon',
        //   target: true
        // },
        // {
        //   id: 'under-construction',
        //   title: 'under-construction',
        //   type: 'item',
        //   url: '/maintenance/under-construction',
        //   target: true
        // }
      ]
    }
    // {
    //   id: 'contact-us',
    //   title: 'contact-us',
    //   type: 'item',
    //   url: '/contact-us',
    //   icon: icons.PhoneOutlined,
    //   target: true
    // }
  ]
};

export default Group2;
