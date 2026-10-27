// This is example of menu item without group for horizontal layout. There will be no children.

// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { BarsOutlined, CaretRightFilled, ChromeOutlined, FileSearchOutlined, RocketOutlined } from '@ant-design/icons';

// icons
const icons = {
  ChromeOutlined
};

// ==============================|| MENU ITEMS - SAMPLE PAGE ||============================== //

const Group3 = {
  id: 'group-pages3',
  title: 'CMS Pages',
  type: 'group',
  children: [
    {
      id: 'pages',
      title: 'Pages',
      type: 'item',
      url: '/cms-pages',
      icon: BarsOutlined,
      breadcrumbs: false,
      // isDropdown: false,
      children: [
        {
          id: 'home',
          title: 'Home',
          type: 'item',
          breadcrumbs: true,
          url: '/cms-pages/home'
        },
        {
          id: 'about',
          title: 'About',
          type: 'item',
          breadcrumbs: true,
          url: '/cms-pages/about'
        },
        {
          id: 'affordable4All',
          title: 'Affordable 4 All',
          type: 'item',
          url: '/cms-pages/affordable-for-all'
        },
        {
          id: 'benefitsOfCounselling',
          title: 'Benefits Of Counselling',
          url: '/cms-pages/benefits-of-counselling',
          type: 'collapse',
          isDropdown: false,
          children: [
            {
              id: 'Whyyouneedcounseling',
              title: 'Why you need counseling',
              type: 'item',
              url: '/cms-pages/benefits-of-counselling/why-you-need-counselling'
            },
            {
              id: 'Benefitsofengagingincounseling',
              title: 'Benefits Of EngagingIn Counseling',
              type: 'item',
              url: '/cms-pages/benefits-of-counselling/benefits-of-engaging-in-counselling'
            }
          ]
        },
        {
          id: 'becomeacounselor',
          title: 'Become a counselor',
          type: 'item',
          url: '/cms-pages/become-a-counselor'
        },
      ]
    }
  ]
};

export default Group3;