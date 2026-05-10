export default function AuthShell({ title, subtitle, footer, children }) {
  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-brand">
          Sudok
          <span>o</span>
        </div>

        <div className="auth-copy">
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </div>

        {children}

        {footer ? <div className="auth-footer">{footer}</div> : null}
      </div>
    </div>
  )
}
