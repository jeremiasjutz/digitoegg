import { Dialog, Transition } from '@headlessui/react';
import { HiOutlinePencil, HiOutlineStar } from 'react-icons/hi';
import { Form, Link, useLoaderData, useTransition } from '@remix-run/react';
import { Fragment, useCallback, useEffect, useState } from 'react';
import {
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';

import type { SetStateAction } from 'react';
import type { Game, Player, Score } from '@prisma/client';
import type {
  LoaderFunction,
  ActionFunction,
  MetaFunction,
} from '@remix-run/node';

import Button from '~/components/Button';
import cropAvatar from '~/utils/crop-avatar';
import { db } from '~/utils/db.server';
import { authenticator } from '~/services/auth.server';
import { lerpColor, map } from '~/utils';
import Input from '~/components/Input';
import LastGame from '~/components/LastGame';
import uploadImageToCloudinary from '~/services/upload-avatar.server';

export const meta: MetaFunction = () => {
  return { title: 'Digitögg | Profil' };
};

export const loader: LoaderFunction = async ({ request }) => {
  const { email } = await authenticator.isAuthenticated(request, {
    failureRedirect: '/',
  });

  const user = await db.user.findUnique({
    where: { email },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      profileImageUrl: true,
      username: true,
    },
  });

  const playerData = await db.player.findFirst({
    where: { user: { username: user?.username } },
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
                username: user?.username,
              },
            },
          },
        },
        {
          loser: {
            some: {
              user: {
                username: user?.username,
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
    user,
    playerData: {
      elo: playerData?.elo,
      wins,
      losses,
      user: playerData?.user,
    },
    lastGames,
  };
};

export const action: ActionFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  const userId = user?.id;

  const uploadHandler = unstable_composeUploadHandlers(
    async ({ name, data }) => {
      if (name !== 'avatar') {
        return undefined;
      }
      const uploadedImage = await uploadImageToCloudinary(
        data,
        userId as string
      );
      return uploadedImage.secure_url;
    },
    // fallback to memory for everything else
    unstable_createMemoryUploadHandler()
  );

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  if (formData.get('action') === 'profileImage') {
    const profileImageUrl = formData.get('avatar') as string;
    await db.user.update({
      data: { profileImageUrl },
      where: { id: userId },
    });
  }

  return null;
};

type User = {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  profileImageUrl: string | null;
};

export default function Profile() {
  const [isProfileImageUploadOpen, setIsProfileImageUploadOpen] =
    useState(false);
  const [isUserDataEditorOpen, setIsUserDataEditorOpen] = useState(false);
  const { playerData, user, lastGames } = useLoaderData<{
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
    user: User;
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
  const url = cropAvatar(user.profileImageUrl, { width: 320, height: 320 });

  const games = playerData.wins + playerData.losses;
  const winRate = playerData.wins / games;

  return (
    <div className="relative">
      <ChangeProfileImageModal
        isOpen={isProfileImageUploadOpen}
        setIsOpen={setIsProfileImageUploadOpen}
      />
      <ChangeUserDataModal
        user={user}
        isOpen={isUserDataEditorOpen}
        setIsOpen={setIsUserDataEditorOpen}
      />
      <button
        className="absolute -right-2 p-2 top-1 focus:outline-none rounded-lg ring-2 ring-transparent border border-transparent focus-within:border-primary focus-within:ring-primary/30"
        onClick={() => setIsUserDataEditorOpen(true)}
      >
        <div className="">
          <HiOutlinePencil className="w-6 h-6 " />
        </div>
      </button>
      <div className="grid place-items-center py-6">
        <div className="grid place-items-center gap-4">
          <button
            onClick={() => setIsProfileImageUploadOpen(true)}
            className="relative rounded-full ring-2 ring-white overflow-hidden"
          >
            <img
              src={url}
              alt={playerData.user.username}
              className="h-40 w-40 "
            />
            <p className="absolute bottom-0 inset-x-0 bg-black/50 py-1 text-sm">
              Ändern
            </p>
          </button>
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
    </div>
  );
}

function ChangeProfileImageModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<SetStateAction<boolean>>;
}) {
  const transition = useTransition();

  const isLoading = transition.state === 'submitting';

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  useEffect(() => {
    if (transition.state === 'loading') {
      closeModal();
    }
  }, [transition, closeModal]);
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={closeModal}
      >
        <div className="grid h-full place-items-center px-6">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-md" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="z-10 w-full max-w-md overflow-hidden rounded-lg">
              <div className="max-w-lg w-full">
                <Dialog.Title as="h3" className="font-serif text-lg leading-6">
                  Profilbild ändern
                </Dialog.Title>
                <Form encType="multipart/form-data" method="post">
                  <fieldset disabled={isLoading}>
                    <input
                      type="file"
                      name="avatar"
                      accept="image/*"
                      required
                      className="my-4 block w-full cursor-pointer outline-none file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-transparent file:px-3 file:py-2 file:text-white file:ring-2 file:ring-inset file:ring-primary disabled:opacity-50"
                    />
                    <Button type="submit" name="action" value="profileImage">
                      {isLoading ? 'Hochladen...' : 'Hochladen'}
                    </Button>
                  </fieldset>
                </Form>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
function ChangeUserDataModal({
  user,
  isOpen,
  setIsOpen,
}: {
  user: User;
  isOpen: boolean;
  setIsOpen: React.Dispatch<SetStateAction<boolean>>;
}) {
  const transition = useTransition();

  const isLoading = transition.state === 'submitting';

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  useEffect(() => {
    if (transition.state === 'loading') {
      closeModal();
    }
  }, [transition, closeModal]);

  const { firstName, lastName, username } = user;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={closeModal}
      >
        <div className="grid h-full place-items-center px-6">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-md" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="z-10 w-full overflow-hidde grid place-items-center">
              <div className="max-w-lg w-full">
                <Dialog.Title as="h3" className="font-serif text-lg mb-2">
                  Benutzerdaten ändern
                </Dialog.Title>
                <div className="grid gap-6 divide-y divide-white/30">
                  <Form method="post">
                    <fieldset disabled={isLoading} className="grid gap-2">
                      <Input
                        type="text"
                        name="firstName"
                        placeholder="Vorname"
                        defaultValue={firstName}
                        required
                      />
                      <Input
                        type="text"
                        name="lastName"
                        placeholder="Nachname"
                        defaultValue={lastName}
                        required
                      />
                      <Input
                        type="text"
                        name="username"
                        placeholder="Benutzername"
                        defaultValue={username}
                        required
                      />
                      <Button type="submit" name="action" value="userData">
                        {isLoading ? 'Ändern...' : 'Ändern'}
                      </Button>
                    </fieldset>
                  </Form>
                  <p className="text-center pt-6">
                    Passwort vergessen?{' '}
                    <Link
                      className="text-primary underline"
                      to="/reset-password"
                    >
                      Zurücksetzen
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
