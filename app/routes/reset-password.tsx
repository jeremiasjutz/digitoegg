import { HiOutlineKey, HiOutlineMail } from 'react-icons/hi';
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from '@remix-run/react';

import type { ActionFunction, LoaderFunction } from '@remix-run/node';

import Button from '~/components/Button';
import Input from '~/components/Input';
import { authenticator } from '~/services/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);

  return user;
};

export const action: ActionFunction = async ({ request }) => {
  return null;
};

export default function ResetPassword() {
  const user = useLoaderData();
  const token = false;
  console.log(user);

  const data = useActionData();
  const transition = useTransition();
  const isLoading = transition.state === 'submitting';
  // TODO: nicer error message
  return data?.error ? (
    <div>
      Aktivierung fehlgeschlagen.<pre>{data.error}</pre>
    </div>
  ) : (
    <div className="grid h-full place-items-center">
      <div className="w-full max-w-md">
        <h1 className="mb-2 font-serif text-2xl">Passwort Zurücksetzen</h1>
        {user || token ? (
          <Form method="post">
            <fieldset className="grid gap-2" disabled={isLoading}>
              <Input
                type="password"
                name="oldPassword"
                placeholder="Altes Passwort"
                autoComplete="current-password"
                required
                icon={<HiOutlineKey />}
                error={data?.formErrors?.password}
              />
              <Input
                type="password"
                name="newPassword"
                placeholder="Neues Passwort"
                autoComplete="current-password"
                required
                icon={<HiOutlineKey />}
                error={data?.formErrors?.password}
              />
              <Input
                type="password"
                name="passwordRepeat"
                placeholder="Neues Passwort wiederholen"
                autoComplete="current-password"
                required
                icon={<HiOutlineKey />}
                error={data?.formErrors?.password}
              />
              <Button type="submit">
                Konto aktivieren{isLoading ? '...' : ''}
              </Button>
            </fieldset>
          </Form>
        ) : (
          <Form method="post">
            <fieldset className="grid gap-2" disabled={isLoading}>
              <Input
                type="email"
                name="email"
                placeholder="E-Mail"
                required
                icon={<HiOutlineMail />}
                error={data?.formErrors?.email}
              />
              <Button type="submit">
                Konto aktivieren{isLoading ? '...' : ''}
              </Button>
            </fieldset>
          </Form>
        )}
      </div>
    </div>
  );
}
