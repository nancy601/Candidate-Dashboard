import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../atoms/Button'
import FormField from '../molecules/FormField'
import { Input } from '../atoms/Input'
import { Label } from '../atoms/Label'
import { User, Mail, Phone, Building2, FileText, Briefcase, MapPin } from 'lucide-react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar'

const ProfilePage = () => {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    designation: '',
    location: '',
    mobileNumber: '',
    department: '',
    projectSummary: '',
    workExperience: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [profileCompletion, setProfileCompletion] = useState({
    mobileNumber: false,
    department: false,
    projectSummary: false,
    workExperience: false,
    skills: false,
    education: false,
    resume: false,
  });

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const employeeId = localStorage.getItem('employeeId')
    const companyName = localStorage.getItem('companyName')
    if (!employeeId || !companyName) {
      navigate('/login')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/profile/${companyName}/${employeeId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch profile data')
      }
      const data = await response.json()
      setProfileData({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        email: data.email || '',
        designation: data.designation || '',
        location: data.location || '',
        mobileNumber: data.mobile_number || '',
        department: data.department || '',
        projectSummary: data.project_summary || '',
        workExperience: data.work_experience || '',
      })
      checkProfileCompletion(data);
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load profile data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const employeeId = localStorage.getItem('employeeId')
    const companyName = localStorage.getItem('companyName')

    try {
      const response = await fetch(`http://localhost:5000/api/profile/${companyName}/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      setIsEditing(false)
      fetchProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile. Please try again.')
    }
  }

  const renderField = (icon, label, value, name) => (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
      <div className="p-2 rounded-full bg-orange-100">
        {icon}
      </div>
      <div className="flex-1 noborder">
        <Label className="text-sm text-gray-500 noborder">{label}</Label>
        {isEditing && name !== 'firstName' && name !== 'lastName' && name !== 'email' && name !== 'designation' && name !== 'location' ? (
          <Input
            name={name}
            value={value}
            onChange={handleChange}
            className="mt-1"
          />
        ) : (
          <p className="mt-1 text-gray-900 pl-2 py-1">{value || 'Not specified'}</p>
        )}
      </div>
    </div>
  )

  const checkProfileCompletion = (data) => {
    setProfileCompletion({
      mobileNumber: !!data.mobile_number,
      department: !!data.department,
      projectSummary: !!data.project_summary,
      workExperience: !!data.work_experience,
      skills: data.skills && data.skills.length > 0,
      education: data.education && Object.keys(data.education).length > 0,
      resume: !!data.resume_path,
    });
  };

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen">
        <Sidebar />
        <SidebarInset>
          <Header />
          <main className="p-6 bg-gray-50 border-none">
            <div className="max-w-4xl mx-auto border-none">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between border-none">
                  <CardTitle className="text-2xl border-none">Profile Details</CardTitle>
                  <Button
                    onClick={(e) => {
                      if (isEditing) {
                        handleSubmit(e)
                      } else {
                        setIsEditing(true)
                      }
                    }}
                    variant={isEditing ? "default" : "outline"}
                  >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6 border-none">
                    {renderField(
                      <User className="w-5 h-5 text-orange-600 noborder" />,
                      "Full Name",
                      `${profileData.firstName} ${profileData.lastName}`,
                      "fullName"
                    )}
                    {renderField(
                      <Mail className="w-5 h-5 text-orange-600 border-none" />,
                      "Email",
                      profileData.email,
                      "email"
                    )}
                    {renderField(
                      <Briefcase className="w-5 h-5 text-orange-600 border-none" />,
                      "Designation",
                      profileData.designation,
                      "designation"
                    )}
                    {renderField(
                      <MapPin className="w-5 h-5 text-orange-600 border-none" />,
                      "Location",
                      profileData.location,
                      "location"
                    )}
                    {renderField(
                      <Phone className="w-5 h-5 text-orange-600 border-none" />,
                      "Mobile Number",
                      profileData.mobileNumber,
                      "mobileNumber"
                    )}
                    {renderField(
                      <Building2 className="w-5 h-5 text-orange-600 border-none" />,
                      "Department",
                      profileData.department,
                      "department"
                    )}
                    {renderField(
                      <FileText className="w-5 h-5 text-orange-600 border-none" />,
                      "Project Summary",
                      profileData.projectSummary,
                      "projectSummary"
                    )}
                    {renderField(
                      <Briefcase className="w-5 h-5 text-orange-600 border-none" />,
                      "Work Experience",
                      profileData.workExperience,
                      "workExperience"
                    )}
                  </form>
                </CardContent>
              </Card>

              {/* Profile Completion Status */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Profile Completion Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {Object.entries(profileCompletion).map(([key, completed]) => (
                      <li key={key} className="flex items-center">
                        <span className={`w-4 h-4 mr-2 rounded-full ${completed ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default ProfilePage