import { useLoaderData } from '@remix-run/react';

import { db } from '~/utils/db.server';
import { authenticator } from '~/services/auth.server';

import PlayersList from '~/components/PlayersList';

import type { User } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const players = await db.player.findMany({
    orderBy: {
      elo: 'desc',
    },
    select: {
      id: true,
      userId: true,
      elo: true,
      previousElo: true,
      user: {
        select: {
          id: true,
          firstName: true,
          username: true,
        },
      },
    },
  });
  return { user, players };
};

type Players = {
  elo: number;
  id: string;
  userId: string;
  previousElo: number;
  user: {
    firstName: string;
    username: string;
  };
}[];

export default function Ranking() {
  const { user, players } = useLoaderData<{ user: User; players: Players }>();
  return (
    <div className="py-6 md:py-16">
      <div className="mx-auto grid w-full max-w-xl gap-12">
        <section>
          <h1 className="mb-6 font-serif text-2xl">Rangliste</h1>
          <PlayersList players={players} user={user} />
        </section>
      </div>
    </div>
  );
}
