import invariant from 'tiny-invariant';
import { z } from 'zod';
import { db } from '~/utils/db.server';
import { compare } from 'bcryptjs';
import { FormStrategy } from 'remix-auth-form';
import { sessionStorage } from '~/services/session.server';
import { Authenticator, AuthorizationError } from 'remix-auth';

import type { User } from '@prisma/client';

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export const authenticator = new Authenticator<
  Optional<User, 'password' | 'activationToken'>
>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get('email');
    const password = form.get('password');

    invariant(typeof email === 'string', 'username must be a string');
    invariant(email.length > 0, 'username must not be empty');
    invariant(typeof password === 'string', 'password must be a string');
    invariant(password.length > 0, 'password must not be empty');

    const isEmail = z.string().email().safeParse(email).success;

    const user = isEmail
      ? await db.user.findUnique({
          where: {
            email,
          },
        })
      : await db.user.findUnique({
          where: {
            username: email,
          },
        });

    if (user) {
      if (user.activationToken === null) {
        const match = await compare(password, user?.password ?? '');
        if (match) {
          const { password, activationToken, ...safeUser } = user;
          return safeUser;
        } else {
          throw new AuthorizationError(
            JSON.stringify({ password: 'Passwort ist falsch' })
          );
        }
      } else {
        throw new AuthorizationError(
          JSON.stringify({ email: 'Konto wurde noch nicht aktiviert!' })
        );
      }
    } else {
      throw new AuthorizationError(
        JSON.stringify({
          email: `Benutzer mit ${
            isEmail ? 'dieser E-Mail Adresse' : 'diesem Benutzernamen'
          } gibt es nicht`,
        })
      );
    }
  }),
  'user-pass'
);
