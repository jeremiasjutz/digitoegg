import { Link } from '@remix-run/react';
import {
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineMinus,
} from 'react-icons/hi';

import type { User } from '@prisma/client';

interface PlayersListProps {
  players: {
    elo: number;
    id: string;
    userId: string;
    previousElo: number;
    user: {
      firstName: string;
      username: string;
    };
  }[];
  user: User;
}

export default function PlayersList({ players, user }: PlayersListProps) {
  return (
    <div className="grid gap-2">
      {players.map((player, i) => (
        <Link
          to={`/profile${
            player.userId === user.id ? '' : `/${player.user.username}`
          }`}
          key={player.id}
          className={`${
            player.userId === user.id
              ? ' border-primary bg-primary/20'
              : ' border-gray bg-gray/20'
          } flex h-14 rounded-lg border font-medium backdrop-blur-md`}
        >
          <span className="grid h-full w-14 place-items-center border-r border-gray text-center">
            {i + 1}
          </span>
          <div className="flex flex-1 items-center justify-between px-3">
            <div className="grid">
              <span className="leading-none">{player.user.firstName}</span>
              <span className="text-xs text-white/50">
                @{player.user.username}
              </span>
            </div>
            <span className="flex items-center gap-2">
              {player.previousElo > player.elo ? (
                <HiOutlineChevronDown className="h-4 w-4 text-error" />
              ) : player.previousElo < player.elo ? (
                <HiOutlineChevronUp className="h-4 w-4 text-success" />
              ) : (
                <HiOutlineMinus className="h-4 w-4 text-warning" />
              )}{' '}
              {player.elo}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
