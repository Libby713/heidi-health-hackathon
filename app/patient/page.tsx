import { Suspense } from 'react'
import PatientChat from './patient-chat'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Tell Heidi',
}

function PatientChatLoading() {
  return (
    <div className="flex h-screen items-center justify-center" style={{ backgroundColor: '#F9F4F1' }}>
      <div className="text-center">
        <div className="mb-4 text-lg font-medium text-muted-foreground">Loading...</div>
      </div>
    </div>
  )
}

export default function PatientPage() {
  return (
    <Suspense fallback={<PatientChatLoading />}>
      <PatientChat />
    </Suspense>
  )
}
