export default function StatusPill({ status }) {
  return <span className={`status status-${String(status).toLowerCase()}`}>{status}</span>
}
