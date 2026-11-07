import { Dialog, DialogBody, DialogFooter, DialogHeader } from "./Dialog";

/**
 * Simple dialog: overlay, title, close on Escape / backdrop. `side="right"` renders a drawer.
 * Thin wrapper over ui/Dialog so older call sites keep their props.
 */
export default function Modal({ open, title, subtitle, icon, onClose, children, footer, side = "center", widthClass = "max-w-lg" }) {
  const isDrawer = side === "right";
  // Old call sites pass e.g. "max-w-2xl"; on phones the dialog is always full width.
  const size = widthClass
    .split(" ")
    .map((token) => (token.startsWith("max-w-") ? `sm:${token}` : token))
    .join(" ");

  return (
    <Dialog open={open} onClose={onClose} variant={isDrawer ? "drawer" : "modal"} size={size} label={title}>
      <DialogHeader icon={icon} title={title} subtitle={subtitle} onClose={onClose} />
      <DialogBody>{children}</DialogBody>
      {footer && <DialogFooter>{footer}</DialogFooter>}
    </Dialog>
  );
}
