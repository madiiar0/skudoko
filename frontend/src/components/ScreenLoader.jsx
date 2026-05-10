export default function ScreenLoader({ label = 'Loading...' }) {
  return (
    <div className="screen-loader">
      <div className="screen-loader-spinner" />
      <p className="screen-loader-label">{label}</p>
    </div>
  )
}
