import { Sparkles } from 'lucide-react'
import PageHeader from './PageHeader'
import Card from './Card'

export default function ComingSoon({ title, description }) {
  return (
    <>
      <PageHeader title={title} />
      <Card className="flex flex-col items-center px-6 py-16 text-center">
        <span className="size-12 rounded-full bg-badge-orange text-badge-orange-fg grid place-items-center">
          <Sparkles size={22} />
        </span>
        <p className="mt-4 font-semibold text-primary">Coming soon</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      </Card>
    </>
  )
}
