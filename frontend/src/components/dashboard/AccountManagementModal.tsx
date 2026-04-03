import { Dialog } from 'radix-ui'
import { LogOut, UserRound, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

type AccountManagementModalProps = {
  email: string
  isDarkMode: boolean
  isSigningOut: boolean
  onOpenChange: (open: boolean) => void
  onSignOut: () => Promise<void>
  onToggleDarkMode: () => void
  open: boolean
}

function AccountManagementModal({
  email,
  isDarkMode,
  isSigningOut,
  onOpenChange,
  onSignOut,
  onToggleDarkMode,
  open,
}: AccountManagementModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-stone-950/25 backdrop-blur-[2px] dark:bg-stone-950/55" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-200 bg-stone-50 p-6 shadow-2xl shadow-stone-950/10 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:shadow-black/35 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Dialog.Title className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Account
              </Dialog.Title>
              <Dialog.Description className="text-sm text-stone-600 dark:text-stone-400">
                Signed in with your current dashboard session.
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 dark:focus-visible:ring-stone-600"
                aria-label="Close account modal"
              >
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-6 rounded-xl border border-stone-200 bg-white px-4 py-4 dark:border-stone-700 dark:bg-stone-950/70">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                <UserRound className="size-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
                  Email
                </p>
                <p className="truncate text-sm text-stone-900 dark:text-stone-100">{email}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-stone-200 bg-white px-4 py-4 dark:border-stone-700 dark:bg-stone-950/70">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-stone-900 dark:text-stone-100">Dark mode</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">Apply to the dashboard and session pages.</p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isDarkMode}
                aria-label="Toggle dark mode"
                onClick={onToggleDarkMode}
                className="inline-flex items-center"
              >
                <span
                  className={`flex h-7 w-12 items-center rounded-full border transition-colors ${
                    isDarkMode ? 'border-lime-700 bg-lime-700/90' : 'border-stone-300 bg-stone-200'
                  }`}
                >
                  <span
                    className={`size-5 rounded-full bg-white shadow-sm transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <Dialog.Close asChild>
              <Button type="button" variant="ghost" className="text-stone-700 dark:text-stone-200">
                Close
              </Button>
            </Dialog.Close>

            <Button
              type="button"
              className="bg-red-700 text-white hover:bg-red-800 focus-visible:ring-rose-200"
              onClick={() => void onSignOut()}
              disabled={isSigningOut}
            >
              <LogOut className="size-4" />
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default AccountManagementModal
