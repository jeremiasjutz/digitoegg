import { redirect } from '@remix-run/node';
import { HiOutlineCheck, HiOutlineRefresh } from 'react-icons/hi';
import { Form, Link, useLoaderData, useTransition } from '@remix-run/react';

import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node';
import type { SelectPlayer } from '~/components/PlayerSelect';

import Button from '~/components/Button';
import PlayerSelect from '~/components/PlayerSelect';
import { db } from '~/utils/db.server';
import { authenticator } from '~/services/auth.server';
import { getElo, getTeamElo } from '~/utils/elo';

export const meta: MetaFunction = () => {
  return { title: 'Digitögg | Neues Spiel' };
};

export const loader: LoaderFunction = async ({ request }) => {
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const players = await db.player.findMany({
    orderBy: {
      user: {
        firstName: 'asc',
      },
    },
    include: {
      user: {
        select: {
          firstName: true,
          profileImageUrl: true,
          username: true,
        },
      },
    },
  });

  return players;
};

type Players = {
  players: SelectPlayer[];
  isWinner: boolean;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const scoreA = +data.playersAScore;
  const scoreB = +data.playersBScore;

  if (scoreA > 10 || scoreB > 10)
    throw Error('Punktzahl kann nicht mehr als 10 betragen!');

  const playersA: Players = { players: [], isWinner: scoreA > scoreB };
  const playersB: Players = { players: [], isWinner: scoreB > scoreA };

  for (const [key, value] of Object.entries(data)) {
    const newKey = key.split(/\]|\[/).filter(Boolean);
    // easier
    // newKey.reduce((acc, cur) => (acc[cur] = ''), {});
    if (newKey[0] === 'playersA') {
      playersA.players[+newKey[1]] = {
        ...playersA.players[+newKey[1]],
        ...(newKey[3]
          ? {
              [newKey[2]]: {
                // @ts-ignore
                ...(playersA.players?.[+newKey[1]]?.[newKey[2]] ?? {}),
                [newKey[3]]: value,
              },
            }
          : {
              [newKey[2]]: newKey[2] === 'elo' ? +value : value,
            }),
      };
    } else {
      playersB.players[+newKey[1]] = {
        ...playersB.players[+newKey[1]],
        ...(newKey[3]
          ? {
              [newKey[2]]: {
                // @ts-ignore
                ...(playersB.players?.[+newKey[1]]?.[newKey[2]] ?? {}),
                [newKey[3]]: value,
              },
            }
          : {
              [newKey[2]]: newKey[2] === 'elo' ? +value : value,
            }),
      };
    }
  }

  const players = [playersA, playersB];
  const scores = [scoreA, scoreB];

  const winners = players.find((player) => player.isWinner)?.players;
  const losers = players.find((player) => !player.isWinner)?.players;

  const elo =
    [...playersA.players, ...playersB.players].length > 2
      ? getTeamElo(
          {
            isWinner: playersA.isWinner,
            teamScore: playersA.players.map((player) => player.elo),
          },
          {
            isWinner: playersB.isWinner,
            teamScore: playersB.players.map((player) => player.elo),
          }
        )
      : getElo(
          { elo: playersA.players[0].elo, isWinner: playersA.isWinner },
          { elo: playersB.players[0].elo, isWinner: playersB.isWinner }
        );

  for (const player of playersA.players) {
    await db.player.update({
      data: {
        elo: Math.max(0, player.elo + elo.aNewRating),
        previousElo: player.elo,
      },
      where: {
        id: player.id,
      },
    });
  }

  for (const player of playersB.players) {
    await db.player.update({
      data: {
        elo: Math.max(0, player.elo + elo.bNewRating),
        previousElo: player.elo,
      },
      where: {
        id: player.id,
      },
    });
  }

  await db.game.create({
    data: {
      winner: {
        connect: winners?.map(({ id }) => ({ id })),
      },
      loser: {
        connect: losers?.map(({ id }) => ({ id })),
      },
      score: {
        create: {
          winner: Math.max(...scores),
          loser: Math.min(...scores),
        },
      },
    },
  });

  return redirect('/');
};

export default function NewGame() {
  const players = useLoaderData<SelectPlayer[]>();
  const transition = useTransition();
  const isLoading = transition.state === 'submitting';

  return (
    <div className="py-6 md:py-16">
      <div className="mx-auto grid w-full max-w-xl gap-12">
        <section>
          <h1 className="mb-6 font-serif text-2xl">Neues Spiel</h1>
          <Form method="post" className="grid gap-8 sm:gap-4">
            <PlayerSelect players={players} party="A" />
            <PlayerSelect players={players} party="B" />
            <Button
              type="submit"
              secondary
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              Spiel erfassen{isLoading ? '...' : ''}
              <HiOutlineCheck className="h-6 w-6" />
            </Button>
          </Form>
        </section>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="grid h-full place-items-center">
      <div className="grid place-items-center gap-6">
        <h1 className="text-center font-serif text-4xl">{error.message}</h1>
        <Link
          to=""
          prefetch="render"
          className="flex items-center gap-2 text-xl font-medium text-success"
        >
          <span>Neu eingeben</span>
          <HiOutlineRefresh className="h-6 w-6" />
        </Link>
      </div>
    </div>
  );
}
