import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { z, ZodError } from 'zod';
import { redirect, json } from '@remix-run/node';
import { Form, useActionData, Link, useTransition } from '@remix-run/react';
import { HiOutlineAtSymbol, HiOutlineKey, HiOutlineUser } from 'react-icons/hi';

import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node';

import { db } from '~/utils/db.server';
import { authenticator } from '~/services/auth.server';
import Input from '~/components/Input';
import Button from '~/components/Button';
import { sendMail } from '~/services/send-mail.server';

export const meta: MetaFunction = () => {
  return { title: 'Digitögg | Registrieren' };
};

export const action: ActionFunction = async ({ request }) => {
  const validDomains = ['stud.hslu.ch', 'hslu.ch'];
  const formData = await request.formData();
  const userData = Object.fromEntries(formData);
  const url = new URL(request.url);

  const passwordRegex =
    process.env.NODE_ENV === 'production'
      ? /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?^&#_-]).{8,}$/
      : /.*/;

  const User = z.object({
    email: z.string().email({ message: 'Ungültige E-Mail Adresse' }),
    password: z.string().regex(passwordRegex, {
      message:
        'Minimum 8 Zeichen, mindestens ein Gross- und ein Kleinbuchstabe, eine Zahl und ein Sonderzeichen.',
    }),
    passwordRepeat: z.string().regex(passwordRegex, {
      message:
        'Minimum 8 Zeichen, mindestens ein Gross- und ein Kleinbuchstabe, eine Zahl und ein Sonderzeichen.',
    }),
    username: z
      .string()
      .regex(/^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/, {
        message:
          '3 – 20 Zeichen. Keine Leerzeichen. Keine _ oder . am Anfang oder Ende. __ ._ .. _. nicht erlaubt.',
      }),
    firstName: z.string().min(1, { message: 'Vorname darf nicht leer sein!' }),
    lastName: z.string().min(1, { message: 'Nachname darf nicht leer sein!' }),
  });

  const errors: Partial<z.infer<typeof User>> = {};

  try {
    const { email, password, passwordRepeat, username, firstName, lastName } =
      User.parse(userData);
    if (
      !validDomains.includes(email.split('@')[1]) &&
      process.env.NODE_ENV === 'production'
    ) {
      errors.email =
        'Nur HSLU Nutzer sind berechtigt. Bitte verwende eine HSLU E-Mail Adresse';
      return json(errors);
    }

    if (password === passwordRepeat) {
      try {
        const hash = await bcrypt.hash(password, 10);
        try {
          const player = await db.player.create({
            data: {
              user: {
                create: {
                  email,
                  password: hash,
                  username,
                  firstName,
                  lastName,
                  ...(process.env.NODE_ENV === 'development'
                    ? { activationToken: null }
                    : {}),
                },
              },
            },
            include: {
              user: true,
            },
          });

          if (process.env.NODE_ENV === 'production') {
            await sendMail({
              to: email,
              activationUrl: `${url.origin}/activate/${player.user.activationToken}`,
            });
            return redirect('/activate');
          } else {
            return redirect('/login');
          }
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
              // TODO: per field errors when https://github.com/prisma/prisma/issues/10829 is resolved
              errors.email =
                'E-Mail Adresse oder Benutzername wird bereits verwendet.';
              errors.username =
                'E-Mail Adresse oder Benutzername wird bereits verwendet.';
              return json(errors);
            }
          } else {
            throw e;
          }
        } finally {
          db.$disconnect();
        }
      } catch (e) {
        throw e;
      }
    } else {
      errors.passwordRepeat = 'Passwörter sind nicht gleich';
      return json(errors);
    }
  } catch (e) {
    if (e instanceof ZodError) {
      return json(e.flatten().fieldErrors);
    } else {
      throw e;
    }
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  return authenticator.isAuthenticated(request, { successRedirect: '/' });
};

export default function Register() {
  const formErrors = useActionData();
  const transition = useTransition();
  const isLoading = transition.state === 'submitting';

  return (
    <div className="grid h-full place-items-center">
      <div className="w-full max-w-md">
        <h1 className="mb-6 font-serif text-2xl">Registrieren</h1>
        <div className="grid gap-6 divide-y divide-white/30">
          <Form method="post">
            <fieldset className="grid gap-2" disabled={isLoading}>
              <Input
                type="email"
                error={formErrors?.email}
                name="email"
                placeholder="HSLU E-Mail Adresse"
                required
                icon={<HiOutlineAtSymbol />}
              />
              <Input
                type="text"
                name="firstName"
                error={formErrors?.firstName}
                placeholder="Vorname"
                icon={<HiOutlineUser />}
                required
              />
              <Input
                type="text"
                name="lastName"
                error={formErrors?.lastName}
                placeholder="Nachname"
                icon={<HiOutlineUser />}
                required
              />
              <Input
                type="text"
                name="username"
                error={formErrors?.username}
                placeholder="Benutzername"
                icon={<HiOutlineUser />}
                required
              />
              <Input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                placeholder="Passwort"
                error={formErrors?.password}
                icon={<HiOutlineKey />}
              />
              <Input
                type="password"
                name="passwordRepeat"
                error={formErrors?.passwordRepeat}
                icon={<HiOutlineKey />}
                autoComplete="current-password"
                required
                placeholder="Passwort wiederholen"
              />
              <Button type="submit">
                Registrieren{isLoading ? '...' : ''}
              </Button>
            </fieldset>
          </Form>
          <p className="py-6 text-center leading-none">
            Bereits ein Konto?{' '}
            <Link
              to="/login"
              prefetch="render"
              className="text-primary underline"
            >
              Anmelden
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
