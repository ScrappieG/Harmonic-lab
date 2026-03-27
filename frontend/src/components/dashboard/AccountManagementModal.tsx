import { Dialog } from 'radix-ui'
import { LogOut, UserRound, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

type AccountManagementModalProps = {
  email: string
  isSigningOut: boolean
  onOpenChange: (open: boolean) => void
  onSignOut: () => Promise<void>
  open: boolean
}

function AccountManagementModal({
  email,
  isSigningOut,
  onOpenChange,
  onSignOut,
  open,
}: AccountManagementModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-stone-950/25 backdrop-blur-[2px]" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-200 bg-stone-50 p-6 shadow-2xl shadow-stone-950/10 focus:outline-none sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Dialog.Title className="text-sm font-semibold text-stone-900">
                Account
              </Dialog.Title>
              <Dialog.Description className="text-sm text-stone-600">
                Signed in with your current dashboard session.
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
                aria-label="Close account modal"
              >
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-6 rounded-xl border border-stone-200 bg-white px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-stone-100 text-stone-700">
                <UserRound className="size-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">
                  Email
                </p>
                <p className="truncate text-sm text-stone-900">{email}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <Dialog.Close asChild>
              <Button type="button" variant="ghost" className="text-stone-700">
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
