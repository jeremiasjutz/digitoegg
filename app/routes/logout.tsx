import { authenticator } from '~/services/auth.server';

import type { LoaderFunction } from '@remix-run/node';

export const loader: LoaderFunction = async ({ request }) => {
  return authenticator.logout(request, { redirectTo: '/login' });
};
