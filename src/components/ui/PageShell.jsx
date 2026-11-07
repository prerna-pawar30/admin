import PageHeader from "./PageHeader";

/**
 * Reusable page wrapper: title row + content. Spacing comes from the app layout.
 */
export default function PageShell({ title, description, actions, badge, icon, children, className = "", contentClassName = "" }) {
  return (
    <section className={`w-full min-w-0 ${className}`}>
      {(title || description || actions) && (
        <PageHeader title={title} description={description} actions={actions} badge={badge} icon={icon} />
      )}
      <div className={`min-w-0 ${contentClassName}`}>{children}</div>
    </section>
  );
}
