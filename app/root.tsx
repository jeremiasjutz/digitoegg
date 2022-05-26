import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { HiOutlineArrowRight, HiOutlineRefresh } from 'react-icons/hi';
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useTransition,
} from '@remix-run/react';

import type { MetaFunction, LinksFunction } from '@remix-run/node';

import Navbar from '~/components/Navbar';
import useRevalidateOnFocus from '~/hooks/useRevalidateOnFocus';
import { assetLinks } from '~/utils';

import styles from '~/styles/app.css';

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: styles },
    {
      rel: 'manifest',
      href: '/site.webmanifest',
    },
    ...assetLinks,
  ];
};

export const meta: MetaFunction = () => {
  return {
    title: 'Digitögg',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  };
};

export default function App() {
  const transition = useTransition();
  useRevalidateOnFocus();
  return (
    <html lang="de" className="bg-black text-white pwa:h-screen browser:h-full">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no"
        />
        <Meta />
        <Links />
      </head>
      <body
        className="flex h-full flex-col text-lg pwa:overflow-hidden"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <Transition
          appear
          show={transition.state === 'loading'}
          as={Fragment}
          enter="transition"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 grid place-items-center">
            <HiOutlineRefresh className="w-6 h-6 animate-spin-reverse" />
          </div>
        </Transition>
        <div className="fixed inset-x-0 z-10 hidden h-[env(safe-area-inset-top)] bg-black pwa:ios:block"></div>
        <Navbar />
        <main className="px-6-safe pt-18-safe pwa:no-scrollbar pwa:pt-6-safe pwa:pb-18-safe mx-auto w-full max-w-5xl flex-1 self-center pb-safe-bottom pwa:overflow-auto">
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const transition = useTransition();

  return (
    <html lang="de" className="h-full bg-black text-white">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no"
        />
        <Meta />
        <Links />
      </head>
      <body
        className="flex h-full flex-col text-lg"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <Transition
          appear
          show={transition.state === 'loading'}
          as={Fragment}
          enter="transition"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 grid place-items-center">
            <HiOutlineRefresh className="w-6 h-6 animate-spin-reverse" />
          </div>
        </Transition>
        <div className="fixed inset-x-0 z-10 hidden h-[env(safe-area-inset-top)] bg-black pwa:ios:block"></div>
        <Navbar />
        <main className="px-6-safe pt-18-safe pwa:no-scrollbar pwa:pt-6-safe pwa:pb-18-safe mx-auto w-full max-w-5xl flex-1 self-center pb-safe-bottom pwa:overflow-auto">
          <div className="grid place-items-center gap-6">
            <h1 className="text-center font-serif text-4xl">
              {caught.status === 404
                ? 'Oh no, diese Seite wurde nicht gefunden!'
                : caught.status + ' ' + caught.statusText}
            </h1>
            <Link
              to="/"
              prefetch="render"
              className="flex items-center gap-2 text-xl font-medium text-success"
            >
              <span>Zurück zur Startseite</span>
              <HiOutlineArrowRight className="h-6 w-6" />
            </Link>
          </div>
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
