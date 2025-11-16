'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function PatientSignIn() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [nhsId, setNhsId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    console.log('[v0] Patient sign-in attempt:', { fullName, dateOfBirth, nhsId })
    
    setTimeout(() => {
      setIsLoading(false)
      const params = new URLSearchParams({
        nhsId: nhsId,
        fullName: fullName,
        dateOfBirth: dateOfBirth
      })
      router.push(`/patient?${params.toString()}`)
    }, 1000)
  }

  const isFormValid = fullName.trim() && dateOfBirth && nhsId.trim()

  return (
    <div className="flex h-screen flex-col items-center justify-center p-4" style={{ backgroundColor: '#F9F4F1' }}>
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-6 text-sm"
          style={{ color: '#211217' }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="rounded-lg border p-8 shadow-sm" style={{ backgroundColor: '#FCFAF8' }}>
          <div className="mb-6 text-center">
            <Image
              src="/heidi-logo.png"
              alt="Heidi"
              width={60}
              height={60}
              className="mx-auto mb-3"
            />
            <h1 className="mb-1 text-2xl font-bold" style={{ color: '#211217' }}>
              Patient Sign In
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your information to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" style={{ color: '#211217' }}>
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="border-gray-300"
                style={{ backgroundColor: '#FCFAF8' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" style={{ color: '#211217' }}>
                Date of Birth
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                className="border-gray-300"
                style={{ backgroundColor: '#FCFAF8' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nhsId" style={{ color: '#211217' }}>
                NHS ID
              </Label>
              <Input
                id="nhsId"
                type="text"
                value={nhsId}
                onChange={(e) => setNhsId(e.target.value)}
                placeholder="Enter your NHS ID"
                required
                className="border-gray-300"
                style={{ backgroundColor: '#FCFAF8' }}
              />
            </div>

            <Button
              type="submit"
              className="w-full text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#211217' }}
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
