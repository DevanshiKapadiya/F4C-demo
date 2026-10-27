import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project import
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import PagesLayout from 'layout/Pages';
import SimpleLayout from 'layout/Simple';
import { SimpleLayoutType } from 'config';
import Chat from 'pages/chat';

// import Faq from 'pages/faq';

const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/under-construction')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon')));

const AppContactUS = Loadable(lazy(() => import('pages/contact-us')));

// render - sample page
const Dashboard = Loadable(lazy(() => import('pages/dashboard/index')));
const HomePage = Loadable(lazy(() => import('pages/home-page')));
const AdminListPage = Loadable(lazy(() => import('pages/admin/index')));
const UserListPage  = Loadable(lazy(() => import('pages/user/index')));
const FaqMaster = Loadable(lazy(() => import('pages/faq-master/index')));
const FaqCategoryPage = Loadable(lazy(() => import('pages/faq-master/category/index')));
const FaqListPage = Loadable(lazy(() => import('pages/faq-master/faq/index')));



const LanguageListPage = Loadable(lazy(() => import('pages/language/index')));
const SiteSettings = Loadable(lazy(() => import('pages/site-settings/index')));
const GeneralSettings = Loadable(lazy(() => import('pages/site-settings/general')));
const SmtpSettings = Loadable(lazy(() => import('pages/site-settings/smtp')));
const ProfessionalBodyList = Loadable(lazy(() => import('pages/professional-bodies/index')));
const Team = Loadable(lazy(() => import('pages/team/index')));
const ClientTypes = Loadable(lazy(() => import('pages/client-type/index')));
const OnlinePlatform = Loadable(lazy(() => import('pages/online-platform/index')));
const AreaOfCounselling = Loadable(lazy(() => import('pages/area-of-counselling/index')));
const ComplaintsPolicy = Loadable(lazy(() => import('pages/manage-policy/complaints-policy/index')));
const TermsAndConditions = Loadable(lazy(() => import('pages/manage-policy/terms-and-conditions/index')));
const Policy = Loadable(lazy(() => import('pages/manage-policy/policy/index')));

const ManagePolicy = Loadable(lazy(() => import('pages/manage-policy/index')));
const HomeSetting = Loadable(lazy(() => import('pages/cms-pages/home')));
const AboutSetting = Loadable(lazy(() => import('pages/cms-pages/about')));
const ContactEnquiryPage = Loadable(lazy(() => import('pages/contact-enquiry')));
const Affordable4All = Loadable(lazy(() => import('pages/cms-pages/affordable4All')));
const BenefitsOfCounselling = Loadable(lazy(() => import('pages/cms-pages/BenefitsOfCounselling/BenefitsOfCounselling')));
const WhyYouNeedCounselling = Loadable(lazy(() => import('pages/cms-pages/BenefitsOfCounselling/WhyYouNeedCounselling')));
const BenefitsOfEngagingInCounselling = Loadable(
  lazy(() => import('pages/cms-pages/BenefitsOfCounselling/BenefitsOfEngagingInCounselling'))
);
const BecomeACounselor = Loadable(lazy(() => import('pages/cms-pages/BecomeACounselor')));
const CounselorMaster = Loadable(lazy(() => import('pages/counselor-master/index')));
const SessionType = Loadable(lazy(() => import('pages/session-type/index')));
const ProfileStatus = Loadable(lazy(() => import('pages/profile-status/index')));
const CMSPages = Loadable(lazy(() => import('pages/cms-pages/index')));
const TypeOfPractitioner = Loadable(lazy(() => import('pages/type-of-practitioner/index')));
const TherapyList = Loadable(lazy(() => import('pages/manage-therapy/therapy/index')));
const TherapyCategory = Loadable(lazy(() => import('pages/manage-therapy/therapy-category/index')));
const Concession = Loadable(lazy(() => import('pages/concession/index')));
const HealthInsurance = Loadable(lazy(() => import('pages/health-insurance/index')));

const Article = Loadable(lazy(() => import('pages/article/index')));
const Resources = Loadable(lazy(() => import('pages/resources/index')));

const SEOMaster = Loadable(lazy(() => import('pages/seo-master/index')));
const HomePageSEO = Loadable(lazy(() => import('pages/seo-master/home')));
const AboutPageSEO = Loadable(lazy(() => import('pages/seo-master/about')));
const BenefitsOfCounsellingPageSEO = Loadable(lazy(() => import('pages/seo-master/benefits_of_counselling')));
const ComplaintsPolicyPageSEO = Loadable(lazy(() => import('pages/seo-master/complaints_policy')));
const TermsAndConditionsPageSEO = Loadable(lazy(() => import('pages/seo-master/terms_and_conditions')));
const ContactUsPageSEO = Loadable(lazy(() => import('pages/seo-master/contact_us')));
const BecomeACounsellorPageSEO = Loadable(lazy(() => import('pages/seo-master/become_a_counsellor')));
const Affordable4allPageSEO = Loadable(lazy(() => import('pages/seo-master/affordable4all')));
// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'dashboard',
          element: <Dashboard />
        },
        {
          path: '/',
          element: <Dashboard />
        },
        {
          path: '*',
          element: <MaintenanceError />
        },
        {
          path: 'faq-master',
          element: <FaqMaster />,
          type: 'group',
          children: [
            {
              index: true,
              element: <Navigate to="/faq-master/category" replace />
            },
            {
              path: 'category',
              element: <FaqCategoryPage />
            },
            {
              path: 'faq',
              element: <FaqListPage />
            }
          ]
        },
       
        
        {
          path: '/home',
          element: <HomePage />
        },
        {
          path: 'counselor-master',
          type: 'group',
          element: <CounselorMaster />,
          children: [
            {
              path: 'language',
              type: 'item',
              element: <LanguageListPage />
            },
            {
              path: 'language',
              element: <LanguageListPage />
            },
            {
              path: 'professional-bodies',
              element: <ProfessionalBodyList />
            },
            {
              path: 'client-type',
              element: <ClientTypes />
            },
            {
              path: 'online-platform',
              element: <OnlinePlatform />
            },
            {
              path: 'area-of-counseling',
              element: <AreaOfCounselling />
            },
            {
              path: 'session-type',
              element: <SessionType />
            },
            {
              path: 'profile-status',
              element: <ProfileStatus />
            },
            {
              path: 'type-of-practitioner',
              element: <TypeOfPractitioner />
            },
            {
              path: 'therapy',
              element: <TherapyList />
            },
            {
              path: 'therapy-category',
              element: <TherapyCategory />
            },
           
            {
              path: 'concession',
              element: <Concession />
            },
            {
              path: 'health-insurance',
              element: <HealthInsurance />
            }
          ]
        },
        {
          path: 'articles',
          element: <Article />
        },
        {
          path: 'resources',
          element: <Resources />
        },
        {
          path: 'seo-master',
          type: 'group',
          element: <SEOMaster />,
          children: [
            {
              path: 'home-page',
              element: <HomePageSEO />
            },
            {
              path: 'about-page',
              element: <AboutPageSEO />
            },
            {
              path: 'benefits-of-counselling',
              element: <BenefitsOfCounsellingPageSEO />
            },
            {
              path: 'complaints-policy',
              element: <ComplaintsPolicyPageSEO />
            },
            {
              path: 'terms-and-conditions',
              element: <TermsAndConditionsPageSEO />
            },
            {
              path: 'contact-us',
              element: <ContactUsPageSEO />
            },
            {
              path: 'become-a-counsellor',
              element: <BecomeACounsellorPageSEO />
            },
            {
              path: 'affordable4all',
              element: <Affordable4allPageSEO />
            }
          ]
        },
        // {
        //   path: 'counselor-master2',
        //   element: <CounselorMaster2 />,
        //   children: [
        //     {
        //       path: 'language',
        //       element: <LanguageListPage />
        //     },
        //     {
        //       path: 'general-settings',
        //       element: <SiteSettings />
        //     }
        //   ]
        // },
        {
          path: 'admin-list',
          element: <AdminListPage />
        },
        {
          path: 'user-list',
          element: <UserListPage />
        },
        {
          path: 'site-settings',
          element: <SiteSettings />,
          type: 'group',
          children: [
            {
              path: 'general-settings',
              element: <GeneralSettings />
            },
            {
              path: 'smtp-settings',
              element: <SmtpSettings />
            }
          ]
        },
        {
          path: 'manage-policy',
          element: <ManagePolicy />,
          children: [
            {
              path: 'complaintsPolicy',
              element: <ComplaintsPolicy />
            },
            {
              path: 'termsAndConditions',
              element: <TermsAndConditions />
            },
             {
              path: 'policy',
              element: <Policy />
            }
          ]
        },
        {
          path: 'team',
          element: <Team />
        },
        {
          path: 'cms-pages',
          element: <CMSPages />,
          type: 'group',
          children: [
            {
              path: 'home',
              element: <HomeSetting />
            },
            {
              path: 'about',
              element: <AboutSetting />
            },
            {
              path: 'affordable-for-all',
              element: <Affordable4All />
            },
            {
              path: 'benefits-of-counselling',
              element: <BenefitsOfCounselling />
            },
            {
              path: 'benefits-of-counselling/why-you-need-counselling',
              element: <WhyYouNeedCounselling />
            },
            {
              path: 'benefits-of-counselling/benefits-of-engaging-in-counselling',
              element: <BenefitsOfEngagingInCounselling />
            },
            {
              path: 'become-a-counselor',
              element: <BecomeACounselor />
            }
          ]
        },
        {
          path: 'contact-enquiry',
          element: <ContactEnquiryPage />
        },
        {
          path: 'chat',
          element: <Chat />
        }
      ]
    },
    // {
    //   path: '/faq',
    //   element: <Faq />,
    //   children: [
    //     {
    //       path: 'contact-us',
    //       element: <AppContactUS />
    //     }
    //   ]
    // },
    {
      path: '/',
      element: <SimpleLayout layout={SimpleLayoutType.SIMPLE} />,
      children: [
        {
          path: 'contact-us',
          element: <AppContactUS />
        }
      ]
    },
    {
      path: '/maintenance',
      element: <PagesLayout />,
      type: 'collapse',
      children: [
        {
          path: '404',
          element: <MaintenanceError />
        },
        {
          path: '500',
          element: <MaintenanceError500 />
        },
        {
          path: 'under-construction',
          element: <MaintenanceUnderConstruction />
        }
      ]
    }
  ]
};

export default MainRoutes;
