import { json } from '@remix-run/node';
import { AuthorizationError } from 'remix-auth';
import { HiOutlineAtSymbol, HiOutlineKey } from 'react-icons/hi';
import { Form, useActionData, Link, useTransition } from '@remix-run/react';

import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node';

import Input from '~/components/Input';
import Button from '~/components/Button';
import { authenticator } from '~/services/auth.server';
import { useEffect, useRef } from 'react';

export let action: ActionFunction = async ({ request }) => {
  try {
    return await authenticator.authenticate('user-pass', request, {
      successRedirect: '/',
      throwOnError: true,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof AuthorizationError) {
      return json({
        ...JSON.parse(error.message),
      });
    }
  }
};

export let loader: LoaderFunction = async ({ request }) => {
  return await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  });
};

export const meta: MetaFunction = () => {
  return { title: 'Digitögg | Login' };
};

export default function Login() {
  const formErrors = useActionData();
  const transition = useTransition();
  const isLoading = transition.state === 'submitting';

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (formErrors?.email) {
      emailRef.current?.focus();
    } else if (formErrors?.password) {
      passwordRef.current?.focus();
    }
  }, [formErrors]);

  return (
    <div className="grid h-full place-items-center">
      <div className="w-full max-w-md">
        <h1 className="mb-6 font-serif text-2xl">Anmelden</h1>
        <div className="grid gap-6 divide-y divide-white/30">
          <Form method="post">
            <fieldset className="grid gap-2" disabled={isLoading}>
              <Input
                ref={emailRef}
                type="text"
                name="email"
                placeholder="E-Mail oder Benutzername"
                required
                icon={<HiOutlineAtSymbol />}
                error={formErrors?.email}
              />
              <Input
                ref={passwordRef}
                type="password"
                name="password"
                placeholder="Passwort"
                autoComplete="current-password"
                required
                icon={<HiOutlineKey />}
                error={formErrors?.password}
              />
              <Button type="submit">Anmelden{isLoading ? '...' : ''}</Button>
            </fieldset>
          </Form>
          <div>
            <p className="pt-6 text-center leading-none">
              Passwort vergessen?{' '}
              <Link
                to="/reset-password"
                prefetch="render"
                className="text-primary underline"
              >
                Zurücksetzen
              </Link>
            </p>
            <p className="pt-4 text-center leading-none">
              Noch kein Konto?{' '}
              <Link
                to="/register"
                prefetch="render"
                className="text-primary underline"
              >
                Registrieren
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
