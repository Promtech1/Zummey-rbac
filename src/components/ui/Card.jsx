export default function Card({ className = '', children }) {
  return <section className={`rounded-2xl border border-line bg-white ${className}`}>{children}</section>
}
