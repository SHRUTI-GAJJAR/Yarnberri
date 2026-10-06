import { LogOut } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { useAuth } from '../../context/AuthContext';

/**
 * Sign-out confirmation, with the trigger supplied by the caller.
 *
 * WHY THIS IS A COMPONENT
 *
 * The same dialog is needed in two places: the navbar's icon button, and the
 * mobile menu's text row. Both were reachable from the desktop bar only,
 * because `.yb-logout-btn` and `.yb-admin-btn` are `display: none` below
 * 992px - so on a phone the header showed an account icon that went nowhere
 * and there was no way to sign out at all. Rather than duplicate the dialog
 * markup in the menu (and risk the two copies drifting), the trigger is a
 * `children` prop and the copy lives here once.
 *
 * The caller owns the trigger's own className, icon and label, because the two
 * call sites look nothing alike: a 38px icon square in the bar versus a
 * full-width text row in the menu. Everything inside the dialog - wording,
 * button order, which action is destructive - is identical in both, which is
 * exactly what makes it a shared component.
 *
 * WHY THE LONG NOTES LIVE HERE AND NOT IN THE JSX
 *
 * An earlier version of this file carried these explanations as multi-line
 * `{/* ... *\/}` comments inside the returned markup. That does not parse: the
 * build failed with "Unterminated regular expression" pointing at a closing
 * `</div>` several lines below a comment that looked perfectly well formed.
 * Long prose does not belong inside JSX regardless - it is invisible to anyone
 * reading the rendered markup - so every note now sits in this comment or in a
 * JS `//` above the statement it describes.
 */
export default function LogoutDialog({ children, onSignedOut }) {
  const { logout } = useAuth();

  // Sign out first, then tell the caller. Radix unmounts the dialog either
  // way, so ordering only matters for the caller's own follow-up - closing the
  // mobile menu, which must not happen while the user is still signed in.
  const handleSignOut = () => {
    logout();
    onSignedOut?.();
  };

  return (
    <AlertDialog>
      {/* `asChild` with no className of its own: Radix merges its props
          (aria-haspopup, aria-expanded, data-state, onClick) into the caller's
          button instead of wrapping it in a second element, so the caller's
          className owns the appearance entirely. That is what lets the same
          dialog sit behind a 38px icon square and a full-width menu row. */}
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

      <AlertDialogContent>
        <div className="yb-alert-header">
          {/* Decorative; the title below carries the meaning. */}
          <span className="yb-alert-badge" aria-hidden="true">
            <LogOut size={18} strokeWidth={1.8} />
          </span>

          <AlertDialogTitle>Ready to sign out?</AlertDialogTitle>

          {/* One line, and that is a measured constraint rather than a style
              preference: the panel is 340px wide, leaving ~296px of content
              box, and at 0.88rem this sentence measures ~240px. Anything longer
              wraps and adds a line to the dialog. "You will be signed out" is
              already obvious from the title and the button; the reassurance
              that the basket survives is the one thing worth the words. */}
          <AlertDialogDescription>
            Your basket stays on your account.
          </AlertDialogDescription>
        </div>

        <div className="yb-alert-footer">
          <AlertDialogCancel>Stay signed in</AlertDialogCancel>
          <AlertDialogAction onClick={handleSignOut}>Sign out</AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}