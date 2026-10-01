export function Menu({ title, onClose, children, footer = null }) {
  return (
    <div className="menu_backdrop" role="presentation" onClick={onClose}>
      <section className="menu" role="dialog" aria-modal="true" aria-labelledby="menu_title" onClick={(event) => event.stopPropagation()}>
        <header className="menu_header">
          <h2 id="menu_title">{title}</h2>
          <button className="menu_close" type="button" onClick={onClose} aria-label="Close menu">×</button>
        </header>
        <div className="menu_body">{children}</div>
        {footer && <footer className="menu_footer">{footer}</footer>}
      </section>
    </div>
  );
}
