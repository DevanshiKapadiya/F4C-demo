// icons
import AppstoreAddOutlined from '@ant-design/icons/AppstoreAddOutlined';
import BuildOutlined from '@ant-design/icons/BuildOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import UsergroupDeleteOutlined from '@ant-design/icons/UsergroupDeleteOutlined';
import UploadOutlined from '@ant-design/icons/UndoOutlined';


import {
  CaretRightFilled,
  MailOutlined,
  ManOutlined,
  SettingOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  RiseOutlined,
  FileDoneOutlined,
  BookOutlined
} from '@ant-design/icons';
// ==============================|| MENU ITEMS - SAMPLE PAGE ||============================== //

const Group1 = {
  id: 'group-pages',
  title: 'Dashboard',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard',
      icon: AppstoreAddOutlined
    },
    {
      id: 'admin',
      title: 'Admin List',
      type: 'item',
      url: '/admin-list',
      icon: UserOutlined
    },
    {
      id: 'user',
      title: 'User List',
      type: 'item',
      url: '/user-list',
      icon: UsergroupDeleteOutlined
    },
    {
      id: 'faq-master',
      title: 'FAQ Master',
      type: 'item',
      icon: BuildOutlined,
      breadcrumbs: false,
      url: '/faq-master',
      children: [
        {
          id: 'faq-master-category',
          title: 'FAQ Category',
          type: 'item',
          breadcrumbs: true,
          url: '/faq-master/category'
        },
        {
          id: 'faq-master-faq',
          title: 'FAQ',
          type: 'item',
          breadcrumbs: true,
          url: '/faq-master/faq'
        }
      ]
    },

    {
      id: 'counselor-master',
      title: 'Counsellor Master',
      type: 'item',
      url: '/counselor-master',
      icon: UsergroupAddOutlined,
      breadcrumbs: false,
      children: [
        {
          id: 'counselor-master-language',
          title: 'Language',
          type: 'item',
          breadcrumbs: true,
          url: '/counselor-master/language'
        },
        {
          id: 'counselor-master-settings',
          title: 'General Settings',
          breadcrumbs: true,
          url: '/counselor-master/general-settings'
        },
        {
          id: 'professional-bodies',
          title: 'Professional Bodies',
          breadcrumbs: true,
          url: '/counselor-master/professional-bodies'
        },
        {
          id: 'client-type',
          title: 'Types of client',
          breadcrumbs: true,
          url: '/counselor-master/client-type'
        },
        {
          id: 'online-platform',
          title: 'Online Platforms',
          breadcrumbs: true,
          url: '/counselor-master/online-platform'
        },
        {
          id: 'area-of-counseling',
          title: 'Area Of Counseling',
          breadcrumbs: true,
          url: '/counselor-master/area-of-counseling'
        },
        {
          id: 'type-of-therapy',
          title: 'Type of therapy',
          breadcrumbs: true,
          url: '/counselor-master/type-of-therapy'
        },
      ]
    },
    {
      id: 'articles',
      title: 'Articles',
      type: 'item',
      url: '/articles',
      icon: FileDoneOutlined
    },
    {
      id: 'resources',
      title: 'Resources',
      type: 'item',
      url: '/resources',
      icon: BookOutlined
    },
    // {
    //   id: 'counselor-master2',
    //   title: 'Counselor Master 2',
    //   type: 'item',
    //   url: '/counselor-master2/language',
    //   icon: SettingOutlined,
    // },

    {
      id: 'site-settings',
      title: 'Settings',
      type: 'item',
      icon: SettingOutlined,
      breadcrumbs: false,
      url: '/site-settings',
      children: [
        {
          id: 'general-settings',
          title: 'General Settings',
          type: 'item',
          url: '/site-settings/general-settings'
        },
        {
          id: 'smtp-settings',
          title: 'SMTP settings',
          type: 'item',
          url: '/site-settings/smtp-settings'
        }
      ]
    },
    {
      id: 'seo-master',
      title: 'SEO',
      type: 'item',
      icon: RiseOutlined,
      breadcrumbs: false,
      url: '/seo-master',
      children: [
        {
          id: 'home-page',
          title: 'Home',
          type: 'item',
          url: '/seo-master/home-page'
        },
        {
          id: 'about-page',
          title: 'About',
          type: 'item',
          url: '/seo-master/about-page'
        },
        {
          id: 'benefits-of-counselling',
          title: 'Benefits of Counselling',
          type: 'item',
          url: '/seo-master/benefits-of-counselling'
        },
        {
          id: 'complaints-policy',
          title: 'Complaints Policy',
          type: 'item',
          url: '/seo-master/complaints-policy'
        },
        {
          id: 'terms-and-conditions',
          title: 'Terms & Conditions',
          type: 'item',
          url: '/seo-master/terms-and-conditions'
        },
        {
          id: 'contact-us',
          title: 'Contact Us',
          type: 'item',
          url: '/seo-master/contact-us'
        },
        {
          id: 'become-a-counsellor',
          title: 'Become a Counsellor',
          type: 'item',
          url: '/seo-master/become-a-counsellor'
        },
        {
          id: 'affordable4all',
          title: 'Affordable 4 All',
          type: 'item',
          url: '/seo-master/affordable4all'
        }
      ]
    },
    {
      id: 'team',
      title: 'Team',
      type: 'item',
      url: '/team',
      icon: TeamOutlined
    },
    {
      id: 'contact-enquiry',
      title: 'Contact Enquiry',
      type: 'item',
      url: '/contact-enquiry',
      icon: MailOutlined
    }
  ]
};

export default Group1;
