import { Transition } from '@headlessui/react';
import { Link, NavLink, useLocation } from '@remix-run/react';
import { useState, Fragment, useMemo } from 'react';
import {
  HiOutlineHome,
  HiOutlineLogout,
  HiOutlineMenuAlt1,
  HiOutlinePlus,
  HiOutlineSwitchVertical,
  HiOutlineUser,
  HiOutlineX,
} from 'react-icons/hi';

const Logo = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      width="27"
      height="24"
      viewBox="0 0 27 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.2191 0H7.73595V3.3H12.7416V0H14.2584V3.3H19.264V0H20.7809V3.3H25.4831H27V4.8V7.8V9.3V14.4V15.9V19.05V20.55H25.4831H20.7809V24H19.264V20.55H14.2584V24H12.7416V20.55H7.73595V24H6.2191V20.55H1.51685H0V19.05V15.9V14.4V9.3V7.8V4.8V3.3H1.51685H6.2191V0ZM1.51685 19.05V15.9H3.03371H4.55056V14.4V9.3V7.8H3.03371H1.51685V4.8H6.2191V19.05H1.51685ZM1.51685 14.4V9.3H3.03371V14.4H1.51685ZM23.9663 14.4H25.4831V9.3H23.9663V14.4ZM25.4831 7.8V4.8H20.7809V19.05H25.4831V15.9H23.9663H22.4494V14.4V9.3V7.8H23.9663H25.4831ZM7.73595 4.8V19.05H12.7416V15.8307C10.842 15.479 9.40449 13.8305 9.40449 11.85C9.40449 9.8695 10.842 8.22103 12.7416 7.86931V4.8H7.73595ZM12.7416 9.41208C11.6876 9.73235 10.9213 10.7027 10.9213 11.85C10.9213 12.9973 11.6876 13.9676 12.7416 14.2879V9.41208ZM14.2584 14.2879V9.41208C15.3124 9.73235 16.0787 10.7027 16.0787 11.85C16.0787 12.9973 15.3124 13.9676 14.2584 14.2879ZM14.2584 15.8307C16.158 15.479 17.5955 13.8305 17.5955 11.85C17.5955 9.8695 16.158 8.22103 14.2584 7.86931V4.8H19.264V19.05H14.2584V15.8307Z"
        fill="currentColor"
      />
    </svg>
  );
};

const tabbarLinks: {
  to: string;
  title: string;
  prefetch: 'render' | 'intent' | 'none';
  icon: JSX.Element;
}[] = [
  {
    to: '/',
    title: 'Home',
    prefetch: 'render',
    icon: <HiOutlineHome className="h-6 w-6" />,
  },
  {
    to: '/profile',
    title: 'Profil',
    prefetch: 'render',
    icon: <HiOutlineUser className="h-6 w-6" />,
  },
  {
    to: '/new-game',
    title: 'Neues Spiel',
    prefetch: 'render',
    icon: <HiOutlinePlus className="h-6 w-6" />,
  },
  {
    to: '/ranking',
    title: 'Rangliste',
    prefetch: 'render',
    icon: <HiOutlineSwitchVertical className="h-6 w-6" />,
  },
  {
    to: '/logout',
    title: 'Logout',
    prefetch: 'none',
    icon: <HiOutlineLogout className="h-6 w-6" />,
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const renderNavbar = useMemo(
    () => !['/login', '/register'].includes(location.pathname),
    [location]
  );
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return renderNavbar ? (
    <>
      <nav className="px-safe fixed inset-x-0 z-50 bg-black/20 backdrop-blur-xl sm:top-0 pwa:bottom-0 sm:pwa:bottom-auto">
        <div className="mx-auto mt-safe-top flex h-18 max-w-5xl items-center justify-between px-6 pwa:hidden pwa:sm:flex">
          <Link
            prefetch="intent"
            to="/"
            className="-ml-2 flex items-center rounded-lg border border-transparent p-2 transition focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            <Logo />
            <span className="ml-4 font-medium">digitögg</span>
          </Link>
          <button
            onClick={toggle}
            className="-mr-2 rounded-lg border border-transparent p-2 transition focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            {isOpen ? (
              <HiOutlineX className="h-6 w-6" />
            ) : (
              <HiOutlineMenuAlt1 className="h-6 w-6 -scale-x-100" />
            )}
          </button>
        </div>
        <div className="mb-safe-bottom hidden items-center justify-between border-t border-gray/50 px-8 py-8 font-medium pwa:flex pwa:sm:hidden">
          {tabbarLinks.map(({ to, icon, title, prefetch }) => (
            <NavLink
              key={to}
              to={to}
              prefetch={prefetch}
              className={({ isActive }) =>
                `relative -mt-5 flex flex-col items-center focus:outline-none ${
                  isActive ? 'font-semibold text-white' : 'text-[#8b8b8b]'
                }`
              }
              onClick={close}
            >
              {icon}
              <span className="absolute -bottom-5 whitespace-nowrap text-[0.65rem] leading-normal">
                {title}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>
      <Transition
        as={Fragment}
        show={isOpen}
        enter="transition"
        enterFrom="opacity-0 translate-x-20"
        enterTo="opacity-100 translate-x-0"
        leave="transition"
        leaveFrom="opacity-100 translate-x-0"
        leaveTo="opacity-0 translate-x-20"
      >
        <div className="fixed inset-0 z-40 overflow-auto bg-black/20 backdrop-blur-xl">
          <div className="pb-6-safe mt-18-safe px-6-safe mx-auto grid w-full max-w-5xl gap-6 overflow-auto border-t border-gray/20 pt-6 font-serif text-2xl">
            {tabbarLinks
              .slice(1, tabbarLinks.length)
              .map(({ to, prefetch, title, icon }) => (
                <Link
                  key={to}
                  to={to}
                  prefetch={prefetch}
                  className="-mx-2 flex items-center gap-6 rounded-lg border border-transparent p-2 transition focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                  onClick={close}
                >
                  {icon}
                  <span>{title}</span>
                </Link>
              ))}
          </div>
        </div>
      </Transition>
    </>
  ) : (
    <nav className="px-safe fixed inset-x-0 top-0 z-50 bg-black/20 backdrop-blur-xl">
      <div className="mx-auto mt-safe-top flex h-18 max-w-5xl items-center justify-between px-6">
        <div className="-ml-2 flex items-center rounded-lg border border-transparent p-2 transition focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30">
          <Logo />
          <span className="ml-4 font-medium">digitögg</span>
        </div>
      </div>
    </nav>
  );
}
