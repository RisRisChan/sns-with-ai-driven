"use client";

import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getCurrentUser, type User } from "@/lib/dal";

export default function Sidebar() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (isSignedIn && user) {
      getCurrentUser().then((userData) => {
        if (userData) {
          setCurrentUser(userData);
        }
      });
    }
  }, [isSignedIn, user]);

  const DesktopSidebar = (
    <aside className="hidden md:flex w-64 p-4 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 overflow-y-auto">
      <div className="flex flex-col gap-6 w-full">
        <h1 className="text-2xl font-bold mb-4">SNS</h1>

        <nav className="flex flex-col gap-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span className="font-semibold">ホーム</span>
          </Link>

          {currentUser && (
            <Link
              href={`/users/${currentUser.id}`}
              className="flex items-center gap-3 px-4 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <span className="font-semibold">プロフィール</span>
            </Link>
          )}
        </nav>

        {currentUser ? (
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
            <Link
              href={`/users/${currentUser.id}`}
              className="flex items-center gap-3 px-4 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Image
                src={currentUser.profileImage}
                alt={currentUser.displayName}
                width={40}
                height={40}
                className="rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">
                  {currentUser.displayName}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  @{currentUser.username}
                </div>
              </div>
            </Link>
            <div className="mt-2">
              <SignOutButton>
                <button className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  ログアウト
                </button>
              </SignOutButton>
            </div>
          </div>
        ) : (
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
            <SignInButton mode="redirect">
              <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors">
                ログイン
              </button>
            </SignInButton>
          </div>
        )}
      </div>
    </aside>
  );

  const MobileNavSignedOut = (
    <div className="md:hidden w-full border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
      <h1 className="text-xl font-bold">SNS</h1>
      <SignInButton mode="modal">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors">
          ログイン
        </button>
      </SignInButton>
    </div>
  );

  const MobileNavSignedIn = currentUser && (
    <div className="md:hidden w-full border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
      <h1 className="text-xl font-bold">SNS</h1>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
          </svg>
        </Link>
        <Link
          href={`/users/${currentUser.id}`}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </Link>
        <SignOutButton>
          <button className="p-2 rounded-full text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            ログアウト
          </button>
        </SignOutButton>
      </div>
    </div>
  );

  if (!isSignedIn) {
    return (
      <>
        {MobileNavSignedOut}
        {DesktopSidebar}
      </>
    );
  }

  return (
    <>
      {MobileNavSignedIn}
      {DesktopSidebar}
    </>
  );
}
