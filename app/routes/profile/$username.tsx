import { useLoaderData } from '@remix-run/react';

import type { LoaderFunction } from '@remix-run/node';
import type { Game, Player, Score } from '@prisma/client';

import LastGame from '~/components/LastGame';
import { db } from '~/utils/db.server';
import { cropAvatar, lerpColor, map } from '~/utils';
import { HiOutlineStar } from 'react-icons/hi';

export const loader: LoaderFunction = async ({ params }) => {
  const { username } = params;
  const playerData = await db.player.findFirst({
    where: { user: { username } },
    include: {
      gameLoser: true,
      gameWinner: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          profileImageUrl: true,
          username: true,
        },
      },
    },
  });

  const lastGames = await db.game.findMany({
    orderBy: {
      playedAt: 'desc',
    },
    where: {
      OR: [
        {
          winner: {
            some: {
              user: {
                username,
              },
            },
          },
        },
        {
          loser: {
            some: {
              user: {
                username,
              },
            },
          },
        },
      ],
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
    take: 5,
  });

  const wins = playerData?.gameWinner.length;
  const losses = playerData?.gameLoser.length;

  return {
    playerData: {
      elo: playerData?.elo,
      wins,
      losses,
      user: playerData?.user,
    },
    lastGames,
  };
};

export default function () {
  const { playerData, lastGames } = useLoaderData<{
    playerData: {
      elo: number;
      wins: number;
      losses: number;
      user: {
        firstName: string;
        lastName: string;
        username: string;
        profileImageUrl: string | null;
      };
    };
    lastGames: (Game & {
      loser: (Player & {
        user: {
          firstName: string;
          profileImageUrl: string | null;
        };
      })[];
      winner: (Player & {
        user: {
          firstName: string;
          profileImageUrl: string | null;
        };
      })[];
      score: Score | null;
    })[];
  }>();
  const games = playerData.wins + playerData.losses;
  const winRate = playerData.wins / games;
  return (
    <div className="grid place-items-center py-6">
      <div className="grid place-items-center gap-4">
        <img
          src={cropAvatar(playerData.user.profileImageUrl, {
            width: 320,
            height: 320,
          })}
          alt={playerData.user.username}
          className="h-40 w-40 rounded-full ring-2 ring-white"
        />
        <div className="text-center">
          <h1 className="text-2xl font-semibold">
            {playerData.user.firstName} {playerData.user.lastName}
          </h1>
          <p className="text-sm text-white/75">@{playerData.user.username}</p>
        </div>
      </div>
      <div className="mt-12 grid w-full max-w-xl gap-4">
        <div className="flex items-center gap-2">
          <HiOutlineStar className="h-6 w-6" />
          <h1 className="text-2xl font-medium">{playerData.elo}</h1>
        </div>
        <div className="relative flex w-full items-center">
          <div className="h-1 w-full rounded-lg bg-gradient-to-r from-error via-warning to-success"></div>
          <div
            className="absolute inset-y-0 right-0 bg-black/80"
            style={{ left: winRate * 100 + '%' }}
          ></div>
          <div
            className="absolute h-3 w-3 -translate-x-1/2 rounded border-white ring ring-white"
            style={{
              left: winRate * 100 + '%',
              backgroundColor:
                winRate < 0.5
                  ? lerpColor(0xff0000, 0xffd600, map(winRate, 0, 0.5, 0, 1))
                  : lerpColor(0xffd600, 0x00ff85, winRate - 0.5),
            }}
          />
        </div>
        <div className="relative flex justify-between">
          <div className="grid">
            <span className="font-medium">Verloren</span>
            <span className="opacity-75">{playerData.losses}</span>
          </div>
          <div className="absolute left-1/2 grid -translate-x-1/2 place-items-center">
            <span className="font-medium">Spiele</span>
            <span className="opacity-75">{games}</span>
          </div>
          <div className="grid place-items-end">
            <span className="font-medium">Gewonnen</span>
            <span className="opacity-75">{playerData.wins}</span>
          </div>
        </div>
      </div>
      <div className="mt-12 w-full max-w-xl">
        <h1 className="mb-6 font-serif text-2xl">Letzte Spiele</h1>
        <div className="grid gap-12">
          {lastGames.map((lastGame) => (
            <LastGame key={lastGame.id} game={lastGame} />
          ))}
        </div>
      </div>
    </div>
  );
}
