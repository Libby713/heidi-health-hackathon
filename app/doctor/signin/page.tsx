'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function DoctorSignIn() {
  const router = useRouter()
  const [doctorId, setDoctorId] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // TODO: Add actual authentication logic
    console.log('[v0] Doctor sign-in attempt:', { doctorId, password })
    
    setTimeout(() => {
      setIsLoading(false)
      router.push('/doctor/chat')
    }, 1000)
  }

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
            {/* </CHANGE> */}
            <h1 className="mb-1 text-2xl font-bold" style={{ color: '#211217' }}>
              Doctor Sign In
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doctorId" style={{ color: '#211217' }}>
                Doctor ID
              </Label>
              <Input
                id="doctorId"
                type="text"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                placeholder="Enter your doctor ID"
                required
                className="border-gray-300"
                style={{ backgroundColor: '#FCFAF8' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: '#211217' }}>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="border-gray-300"
                style={{ backgroundColor: '#FCFAF8' }}
              />
            </div>

            <Button
              type="submit"
              className="w-full text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#211217' }}
              disabled={isLoading || !doctorId || !password}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
