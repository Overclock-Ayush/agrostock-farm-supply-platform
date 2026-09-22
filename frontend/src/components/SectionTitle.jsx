export default function SectionTitle({ eyebrow, title, children }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
      </div>
      {children}
    </div>
  )
}
