import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../atoms/Button'
import FormField from '../molecules/FormField'

const SignupPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        navigate('/login')
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to sign up. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background border-none">
      <div className="w-full max-w-md space-y-8 p-8 border-[2px]">
        <div className="text-center border-none">
          <h2 className="text-2xl font-bold border-none">Create an account</h2>
          <p className="text-muted-foreground border-none">Sign up to get started</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 border-none">
          <FormField
            label="Full Name"
            type="text"
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          <FormField
            label="Email"
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <FormField
            label="Password"
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">
            Sign up
          </Button>
        </form>
        <p className="text-center text-sm border-none">
          Already have an account?{' '}
          <Button variant="default" onClick={() => navigate('/login')} >
            Sign in
          </Button>
        </p>
      </div>
    </div>
  )
}

export default SignupPage

