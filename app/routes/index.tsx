import type { Game, Player, Score, User } from '@prisma/client';
import { HiOutlineArrowRight, HiOutlinePlus } from 'react-icons/hi';
import { Link, useLoaderData } from '@remix-run/react';

import type { LoaderFunction } from '@remix-run/node';

import Button from '~/components/Button';
import PlayersList from '~/components/PlayersList';
import cropAvatar from '~/utils/crop-avatar';
import { db } from '~/utils/db.server';
import { authenticator } from '~/services/auth.server';
import LastGameComponent from '~/components/LastGame';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const player = await db.player.findUnique({
    where: {
      userId: user.id,
    },
    include: {
      gameLoser: true,
      gameWinner: true,
      user: true,
    },
  });

  const players = await db.player.findMany({
    orderBy: {
      elo: 'desc',
    },
    take: 5,
    select: {
      id: true,
      userId: true,
      elo: true,
      previousElo: true,
      user: {
        select: {
          firstName: true,
          username: true,
        },
      },
    },
  });

  const lastGame = await db.game.findFirst({
    orderBy: {
      playedAt: 'desc',
    },
    include: {
      loser: {
        include: {
          user: {
            select: {
              profileImageUrl: true,
              firstName: true,
            },
          },
        },
      },
      score: true,
      winner: {
        include: {
          user: {
            select: {
              profileImageUrl: true,
              firstName: true,
            },
          },
        },
      },
    },
  });

  return { user, player, players, lastGame };
};

type PlayerWithName = {
  elo: number;
  id: string;
  userId: string;
  previousElo: number;
  user: {
    firstName: string;
    username: string;
  };
}[];

type LastGame =
  | (Game & {
      score: Score | null;
      loser: (Player & {
        user: {
          profileImageUrl: string | null;
          firstName: string;
        };
      })[];
      winner: (Player & {
        user: {
          profileImageUrl: string | null;
          firstName: string;
        };
      })[];
    })
  | null;

export default function Index() {
  const { user, player, players, lastGame } = useLoaderData<{
    user: User;
    player: Player & {
      gameLoser: Game[];
      gameWinner: Game[];
      user: User;
    };
    players: PlayerWithName;
    lastGame: LastGame;
  }>();

  return (
    <div className="py-6 md:py-16">
      <div className="mx-auto grid w-full max-w-xl gap-12">
        <section>
          <h1 className="mb-6 font-serif text-2xl">
            Hallo, {player.user.firstName}
          </h1>
          <div className="flex gap-4">
            <img
              src={cropAvatar(player.user.profileImageUrl, {
                width: 48 * 2,
                height: 48 * 2,
              })}
              alt={player.user.firstName + ' ' + player.user.lastName}
              className="h-12 w-12 rounded-full border-2 border-white"
            />
            <div className="flex items-center gap-5 font-medium">
              <div>
                <p className="leading-none">{player.user.firstName}</p>
                <p className="text-sm text-white/50">@{player.user.username}</p>
              </div>
              <div>
                <p className="leading-none">Elo</p>
                <p className="text-sm text-white/50">{player.elo}</p>
              </div>
              <div>
                <p className="leading-none">Spiele</p>
                <p className="text-sm text-white/50">
                  {[...player.gameLoser, ...player.gameWinner].length}
                </p>
              </div>
            </div>
          </div>
        </section>
        <section>
          <h1 className="mb-6 font-serif text-2xl">Neues Spiel</h1>
          <Link
            to="/new-game"
            prefetch="render"
            tabIndex={-1}
            className="focus:outline-none"
          >
            <Button secondary className="flex items-center gap-2">
              Neues Spiel
              <HiOutlinePlus className="h-5 w-5" />
            </Button>
          </Link>
        </section>
        <section>
          <h1 className="mb-6 font-serif text-2xl">Top Spieler:innen</h1>
          <PlayersList players={players} user={user} />
          <Link
            to="/ranking"
            prefetch="render"
            tabIndex={-1}
            className="focus:outline-none"
          >
            <Button className="mt-2 flex items-center gap-2" secondary>
              Alle anzeigen
              <HiOutlineArrowRight />
            </Button>
          </Link>
        </section>
        <section>
          <h1 className={`${lastGame ? 'mb-10' : 'mb-6'} font-serif text-2xl`}>
            Letztes Spiel
          </h1>
          {lastGame ? (
            <LastGameComponent game={lastGame} />
          ) : (
            <p className="font-medium">Noch keine Spiele</p>
          )}
        </section>
      </div>
    </div>
  );
}
