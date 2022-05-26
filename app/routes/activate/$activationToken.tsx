import invariant from 'tiny-invariant';
import { Prisma } from '@prisma/client';
import { compare } from 'bcryptjs';
import { HiOutlineKey } from 'react-icons/hi';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useTransition } from '@remix-run/react';

import type { ActionFunction } from '@remix-run/node';

import Button from '~/components/Button';
import Input from '~/components/Input';
import { db } from '~/utils/db.server';

export const action: ActionFunction = async ({
  request,
  params: { activationToken },
}) => {
  const { password } = Object.fromEntries(await request.formData());
  const user = await db.user.findUnique({
    where: { activationToken },
  });

  invariant(typeof password === 'string');

  const match = await compare(password, user?.password ?? '');
  if (match) {
    try {
      await db.user.update({
        where: { activationToken },
        data: { activationToken: null },
      });
      return redirect('/login');
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        return json({ error: e.message });
      } else {
        throw new Error(e as string);
      }
    }
  } else {
    return json({ formErrors: { password: 'Passwort ist falsch' } });
  }
};

export default function ActivateWithToken() {
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
        <h1 className="mb-2 font-serif text-2xl">Aktivierung</h1>
        <p className="mb-4">Zur Aktivierung bitte dein Passwort eingeben.</p>
        <Form method="post">
          <fieldset className="grid gap-2" disabled={isLoading}>
            <Input
              type="password"
              name="password"
              placeholder="Passwort"
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
      </div>
    </div>
  );
}
