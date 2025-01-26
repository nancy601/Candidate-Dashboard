import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, Briefcase, GraduationCap, Clock, Award, FileText, ChevronRight, Building2, Phone, FileSpreadsheet, Menu, X, Trash2, Bell } from 'lucide-react';

import { Button } from '../atoms/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar';
import { Progress } from '../components/ui/progress';
import Sidebar from '../components/Sidebar';
import ProfileCompletion from '../components/ProfileCompletion';
import RecentActivity from '../components/RecentActivity';
import KeySkills from '../components/KeySkills';
import EducationCard from '../components/EducationCard';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '../molecules/Modal';
import FormField from '../molecules/FormField';
import Header from '../components/Header';
import { Input } from '../atoms/Input';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([
    { title: 'Verify mobile number', percentage: 0, completed: false, icon: Phone },
    { title: 'Add department', percentage: 0, completed: false, icon: Building2 },
    { title: 'Add project summary', percentage: 0, completed: false, icon: FileSpreadsheet },
    { title: 'Add work experience', percentage: 0, completed: false, icon: Briefcase }
  ]);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [profileData, setProfileData] = useState({
    mobileNumber: '',
    department: '',
    projectSummary: '',
    workExperience: '',
    skills: [],
    education: {},
    resumePath: null,
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchNotifications();
  }, []);

  const fetchProfile = async () => {
    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    if (!employeeId || !companyName) {
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/profile/${companyName}/${employeeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }
      const data = await response.json();
      setProfile(data);
      setProfileData({
        mobileNumber: data.mobile_number || '',
        department: data.department || '',
        projectSummary: data.project_summary || '',
        workExperience: data.work_experience || '',
        skills: data.skills || [],
        education: data.education || {},
        resumePath: data.resume_path || null,
      });
      updateTaskCompletion(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskCompletion = (data) => {
    const updatedTasks = [...tasks];
    if (data.mobile_number) updatedTasks[0].completed = true;
    if (data.department) updatedTasks[1].completed = true;
    if (data.project_summary) updatedTasks[2].completed = true;
    if (data.work_experience) updatedTasks[3].completed = true;
    setTasks(updatedTasks);
  };

  const handleResumeUpload = (event) => {
    setResumeFile(event.target.files[0]);
  };

  const handleResumeSubmit = async () => {
    if (!resumeFile) return;

    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const response = await fetch(`http://localhost:5000/api/upload-resume/${companyName}/${employeeId}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setIsResumeModalOpen(false);
        setProfileData(prev => ({ ...prev, resumePath: data.filename }));
        fetchProfile();
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
    }
  };

  const handleResumeDelete = async () => {
    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    try {
      const response = await fetch(`http://localhost:5000/api/delete-resume/${companyName}/${employeeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProfileData(prev => ({ ...prev, resumePath: null }));
        fetchProfile();
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async () => {
    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    try {
      const response = await fetch(`http://localhost:5000/api/profile/${companyName}/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        setIsProfileModalOpen(false);
        fetchProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleEducationUpdate = async (educationData) => {
    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    try {
      const response = await fetch(`http://localhost:5000/api/profile/${companyName}/${employeeId}/education`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(educationData),
      });

      if (!response.ok) {
        throw new Error('Failed to update education data');
      }

      const updatedData = await response.json();
      setProfileData(prev => ({
        ...prev,
        education: updatedData.education
      }));
      fetchProfile();
    } catch (err) {
      console.error('Error updating education:', err);
      throw err;
    }
  };

  const handleSkillsUpdate = async (skills) => {
    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    try {
      const response = await fetch(`http://localhost:5000/api/profile/${companyName}/${employeeId}/skills`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skills }),
      });

      if (!response.ok) {
        throw new Error('Failed to update skills');
      }

      const updatedData = await response.json();
      setProfileData(prev => ({
        ...prev,
        skills: updatedData.skills
      }));
      fetchProfile();
    } catch (err) {
      console.error('Error updating skills:', err);
      throw err;
    }
  };

  const fetchNotifications = async () => {
    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    if (!employeeId || !companyName) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${companyName}/${employeeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      setNotifications(data.slice(0, 5)); // Display only the 5 most recent notifications
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen border-none">
        <Sidebar resumePath={profileData.resumePath} />
        <SidebarInset>
          <Header />
          <main className="p-6 bg-gray-50">
            <div className="mb-6 border-none">
              <h1 className="text-2xl font-bold text-gray-900 border-none">Dashboard</h1>
            </div>
            {/* Notifications Section
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2" />
                  Recent Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <ul className="space-y-2">
                    {notifications.map((notification, index) => (
                      <li key={index} className="flex items-start p-2 bg-gray-100 rounded">
                        <Briefcase className="mr-2 text-blue-500" />
                        <span>{notification.message}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No new notifications</p>
                )}
              </CardContent>
            </Card> */}
            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-none">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-center border-none">Resume Upload</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  {profileData.resumePath ? (
                    <div className="flex flex-col items-center">
                      <FileText className="w-16 h-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{profileData.resumePath}</h3>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsResumeModalOpen(true)}
                        >
                          Replace Resume
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleResumeDelete}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">Click to upload your resume</h3>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsResumeModalOpen(true)}
                        className="mt-4"
                      >
                        Upload Resume
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <ProfileCompletion tasks={tasks} />

              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-center border-none">Job Search Activity</CardTitle>
                  <CardDescription className="flex justify-center border-none">Track your job search progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 mt-2 border-none">
                  <div className="grid gap-4 border-none">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm border-none">Applications Submitted</span>
                      <span className="font-medium border-none">{profile?.applications_count || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm border-none">Interviews Scheduled</span>
                      <span className="font-medium border-none">{profile?.interviews_count || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm border-none">Saved Jobs</span>
                      <span className="font-medium border-none">{profile?.saved_jobs_count || 0}</span>
                    </div>
                  </div>
                  <Button variant="link" className="w-full">
                    View All Activity
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <KeySkills 
                skills={profileData.skills} 
                onEdit={handleSkillsUpdate}
              />
              <EducationCard 
                education={profileData.education} 
                onUpdate={handleEducationUpdate}
              />
              <RecentActivity 
                activities={[
                  { icon: FileText, title: 'Resume Updated', time: '2 hours ago' },
                  { icon: Briefcase, title: 'Application Submitted', time: '1 day ago' },
                ]}
              />
            </div>
          </main>
        </SidebarInset>
      </div>

      <Modal open={isResumeModalOpen} onOpenChange={setIsResumeModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Upload Resume</ModalTitle>
            <ModalDescription>Upload your latest resume (PDF, DOC, DOCX - Max 5MB)</ModalDescription>
          </ModalHeader>
          <Input 
            type="file" 
            onChange={handleResumeUpload} 
            accept=".pdf,.doc,.docx"
            className="w-full"
          />
          <ModalFooter>
            <Button onClick={handleResumeSubmit}>Upload</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Edit Profile</ModalTitle>
          </ModalHeader>
          <FormField
            label="Mobile Number"
            id="mobileNumber"
            name="mobileNumber"
            value={profileData.mobileNumber}
            onChange={handleProfileChange}
          />
          <FormField
            label="Department"
            id="department"
            name="department"
            value={profileData.department}
            onChange={handleProfileChange}
          />
          <FormField
            label="Project Summary"
            id="projectSummary"
            name="projectSummary"
            value={profileData.projectSummary}
            onChange={handleProfileChange}
          />
          <FormField
            label="Work Experience"
            id="workExperience"
            name="workExperience"
            value={profileData.workExperience}
            onChange={handleProfileChange}
          />
          <ModalFooter>
            <Button onClick={handleProfileSubmit}>Save Changes</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal open={isSkillsModalOpen} onOpenChange={setIsSkillsModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Add Skill</ModalTitle>
          </ModalHeader>
          <FormField
            label="Skill"
            id="skill"
            name="skill"
            placeholder="Enter a skill"
          />
          <ModalFooter>
            <Button onClick={() => {
              const skillInput = document.getElementById('skill');
              if (skillInput.value) {
                handleSkillsUpdate([...profileData.skills, skillInput.value]);
                skillInput.value = '';
              }
            }}>Add Skill</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SidebarProvider>
  );
};

export default DashboardPage;