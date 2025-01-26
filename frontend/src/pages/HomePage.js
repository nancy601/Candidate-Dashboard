import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../atoms/Button'

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background border-none">
      <div className="max-w-3xl text-center space-y-8 border-none">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl border-none">
          Find Your Dream Job Today
        </h1>
        <p className="text-xl text-muted-foreground border-none">
          Connect with top employers and discover opportunities that match your skills and aspirations.
        </p>
        <div className="flex gap-4 justify-center border-none">
          <Button onClick={() => navigate('/signup')} size="lg">
            Get Started
          </Button>
          <Button variant="outline" onClick={() => navigate('/login')} size="lg">
            Sign In
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HomePage

