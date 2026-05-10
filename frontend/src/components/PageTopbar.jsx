import ProfileShortcut from './ProfileShortcut'

export default function PageTopbar({ title, subtitle }) {
  return (
    <div className="page-topbar">
      <div className="page-topbar-copy">
        {title ? <h1 className="play-title">{title}</h1> : null}
        {subtitle ? <p className="play-subtitle">{subtitle}</p> : null}
      </div>
      <div className="page-topbar-actions">
        <ProfileShortcut />
      </div>
    </div>
  )
}
