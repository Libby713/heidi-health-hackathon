'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="flex h-screen flex-col items-center justify-center p-4" style={{ backgroundColor: '#F9F4F1' }}>
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <Image
            src="/heidi-logo.jpg"
            alt="Heidi"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h1 className="mb-2 text-4xl font-bold" style={{ color: '#211217' }}>
            Welcome to Heidi
          </h1>
          <p className="text-lg text-muted-foreground">
            Please select your role to continue
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={() => router.push('/patient')}
            size="lg"
            className="h-14 w-40 text-lg text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#211217' }}
          >
            Patient
          </Button>
          <Button
            onClick={() => router.push('/doctor/signin')}
            size="lg"
            variant="outline"
            className="h-14 w-40 border-2 text-lg transition-colors"
            style={{ borderColor: '#211217', color: '#211217' }}
          >
            Doctor
          </Button>
        </div>
      </div>
    </div>
  )
}
