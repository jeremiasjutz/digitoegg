import { Combobox, Transition } from '@headlessui/react';
import { Fragment, useMemo, useState } from 'react';
import {
  HiOutlineCheck,
  HiOutlineChevronDown,
  HiOutlineX,
} from 'react-icons/hi';

import type { Player } from '@prisma/client';

import cropAvatar from '~/utils/crop-avatar';
import Input from './Input';

export type SelectPlayer = Player & {
  user: {
    firstName: string;
    profileImageUrl: string | null;
    username: string;
  };
};

interface PlayerSelectProps {
  players: SelectPlayer[];
  party: string;
  className?: string;
}

// const pointsArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function PlayerSelect({
  players,
  party,
  className = '',
}: PlayerSelectProps) {
  const [query, setQuery] = useState('');
  const [activePlayers, setActivePlayers] = useState<SelectPlayer[]>([]);
  const [errors, setErrors] = useState('');
  const filteredPlayers = useMemo(
    () =>
      players.filter((player) =>
        (player.user.firstName + player.user.username)
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [query, players]
  );
  // const [points, setPoints] = useState(pointsArray[0]);
  return (
    <fieldset>
      <p className="mb-1 text-lg font-medium">Spieler:innen {party}</p>
      <div className="flex gap-2 sm:gap-4">
        <Combobox
          value={activePlayers}
          multiple
          onChange={(e) => {
            if (e.length <= 4) {
              setActivePlayers(e);
              setErrors('');
            } else {
              setErrors('Maximal 4 Spieler pro Team');
            }
          }}
          name={`players${party}`}
          as="div"
          className="flex-1"
        >
          <Combobox.Label className="sr-only">
            Spieler:innen {party}
          </Combobox.Label>
          <div className="relative">
            <div className="relative">
              <Combobox.Input
                as={Input}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Spieler:in suchen...`}
                error={errors}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                <HiOutlineChevronDown className="h-4 w-4" />
              </Combobox.Button>
            </div>
            <div
              className={`relative col-span-full w-full cursor-default text-left focus-within:outline-none ${
                activePlayers.length > 0 ? 'mt-2' : ''
              }`}
            >
              <div className="flex flex-wrap gap-2">
                {activePlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2 rounded-lg border border-gray bg-gray/20 p-2 backdrop-blur-md"
                  >
                    <img
                      src={cropAvatar(player.user.profileImageUrl, {
                        width: 48,
                        height: 48,
                      })}
                      className="h-6 w-6 rounded-full object-cover ring-1 ring-white"
                      alt={player.user.firstName}
                    />
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {player.user.firstName}
                      </p>
                      <p className="text-xs leading-none text-white/60">
                        @{player.user.username}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setActivePlayers((existing) =>
                          existing.filter((p) => p !== player)
                        );
                      }}
                      className="rounded-lg border border-transparent ring-2 ring-transparent focus:border-primary focus:outline-none focus:ring-primary/30"
                    >
                      <HiOutlineX className="h-6 w-6" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`absolute z-20 mt-2 w-full rounded-md bg-gray/20 shadow-lg backdrop-blur-md ${className}`}
            >
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                afterLeave={() => setQuery('')}
              >
                <Combobox.Options className="max-h-60 overflow-auto rounded-lg border border-gray bg-black/20 py-2 text-base backdrop-blur-md focus:outline-none">
                  {filteredPlayers.length > 0 ? (
                    filteredPlayers.map((player) => (
                      <Combobox.Option
                        key={player.id}
                        value={player}
                        className={({ active }) => {
                          return `relative cursor-default select-none py-2 pl-3 pr-9 focus:outline-none ${
                            active ? 'bg-primary/10' : ''
                          }`;
                        }}
                      >
                        {({ active, selected }) => (
                          <>
                            <div
                              className={`flex items-center gap-2 truncate ${
                                selected ? 'font-medium' : 'font-normal'
                              }`}
                            >
                              <img
                                src={cropAvatar(player.user.profileImageUrl, {
                                  width: 48,
                                  height: 48,
                                })}
                                className="h-6 w-6 rounded-full border border-white object-cover"
                                alt={player.user.firstName}
                              />
                              <div>
                                <p className="text-sm font-medium leading-none">
                                  {player.user.firstName}
                                </p>
                                <p className="text-xs leading-none text-white/60">
                                  @{player.user.username}
                                </p>
                              </div>
                            </div>

                            {selected && (
                              <span
                                className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                  active ? 'text-white' : 'text-success'
                                }`}
                              >
                                <HiOutlineCheck className="h-4 w-4" />
                              </span>
                            )}
                          </>
                        )}
                      </Combobox.Option>
                    ))
                  ) : (
                    <span className="p-3">Keine Resultate</span>
                  )}
                </Combobox.Options>
              </Transition>
            </div>
          </div>
        </Combobox>
        <label className="col-span-2">
          <span className="sr-only">Punkte {party}</span>
          <Input
            required
            type="number"
            pattern="[0-9]*"
            inputMode="decimal"
            min="0"
            max="10"
            name={`players${party}Score`}
            placeholder="Punkte"
          />
          {/* <Tab.Group onChange={(i) => setPoints(pointsArray[i])}>
            <Tab.List className="flex space-x-1 rounded-lg border border-gray bg-gray/20 p-3 text-white backdrop-blur-md">
              {pointsArray.map((point) => (
                <Tab
                  key={point}
                  className={({ selected }) =>
                    `aspect-square w-full rounded-lg text-sm font-medium leading-5 ring-gray ring-opacity-50 focus:outline-none focus-visible:ring-2 ${
                      selected
                        ? 'bg-gray-500 text-white shadow'
                        : 'text-gray-900 hover:bg-gray-900/10'
                    }`
                  }
                >
                  {point}
                </Tab>
              ))}
            </Tab.List>
          </Tab.Group> */}
        </label>
      </div>
    </fieldset>
  );
}
