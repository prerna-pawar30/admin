/**
 * Reusable page wrapper: consistent padding, title row, responsive width for all admin screens.
 * Colors stay on parent layout; this only handles spacing and typography rhythm.
 */
export default function PageShell({
  title,
  description,
  actions,
  children,
  className = "",
  contentClassName = "",
}) {
  return (
    <section className={`w-full min-w-0 ${className}`}>
      {(title || description || actions) && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title && (
              <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-1 max-w-2xl text-sm text-gray-600">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      <div className={`min-w-0 ${contentClassName}`}>{children}</div>
    </section>
  );
}
