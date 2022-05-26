import { cropAvatar } from '~/utils';

import type { Game as PrismaGame, Player, Score } from '@prisma/client';

type Game = PrismaGame & {
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
};

export default function LastGame({ game }: { game: Game }) {
  return (
    <div className="flex items-center justify-between">
      <GameParty party={game?.winner} score={game.score?.winner!} />
      <GameParty party={game?.loser} score={game?.score?.loser!} />
    </div>
  );
}

const GameParty = ({
  party,
  score,
}: {
  party: Game['winner'] | Game['loser'];
  score: number;
}) => (
  <div className="grid gap-2">
    <div className="flex flex-row-reverse justify-end">
      {party?.map((player, i) => (
        <GameAvatar
          key={player.id}
          src={player.user.profileImageUrl}
          alt={player.user.firstName}
          className={i !== 0 ? '-mr-8 sm:-mr-6 md:-mr-4' : ''}
        />
      ))}
    </div>
    <div className="flex items-center gap-2">
      <span className="text-4xl font-medium">{score}</span>
      <div>
        <span className="flex gap-1 truncate text-sm font-medium leading-none text-white/75">
          {party
            ?.reverse()
            .map(({ user: { firstName } }) => firstName)
            .join(', ')}
        </span>
        <div className="mt-1 flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-[3px] border-2 border-white sm:h-3 sm:w-3 sm:rounded ${
                i < score ? 'bg-white' : ''
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const GameAvatar = ({
  src,
  alt,
  className = '',
}: {
  src: string | null | undefined;
  alt: string | undefined;
  className?: string;
}) => (
  <img
    src={cropAvatar(src, {
      width: 150,
      height: 150,
    })}
    alt={alt}
    className={`h-12 w-12 rounded-full ring-4 ring-black sm:h-14 sm:w-14 ${className}`}
  />
);
