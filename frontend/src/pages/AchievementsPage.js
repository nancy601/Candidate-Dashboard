import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Upload, Plus, Calendar, FileText, Trash2, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '../molecules/Modal';
import FormField from '../molecules/FormField';

const AchievementsPage = () => {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    id: null,
    title: '',
    description: '',
    date: '',
    quarter: ''
  });
  const [certificateFile, setCertificateFile] = useState(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    if (!employeeId || !companyName) {
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/achievements/${companyName}/${employeeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch achievements data');
      }
      const data = await response.json();
      setAchievements(data.achievements);
      setCertificates(data.certificates);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching achievements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAchievementChange = (e) => {
    setNewAchievement({
      ...newAchievement,
      [e.target.name]: e.target.value
    });
  };

  const handleAchievementSubmit = async () => {
    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    try {
      const method = newAchievement.id ? 'PUT' : 'POST';
      const url = newAchievement.id
        ? `http://localhost:5000/api/achievements/${companyName}/${employeeId}/${newAchievement.id}`
        : `http://localhost:5000/api/achievements/${companyName}/${employeeId}`;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAchievement),
      });

      if (response.ok) {
        setIsAchievementModalOpen(false);
        fetchAchievements();
        setNewAchievement({ id: null, title: '', description: '', date: '', quarter: '' });
      }
    } catch (error) {
      console.error('Error adding/updating achievement:', error);
    }
  };

  const handleEditAchievement = (achievement) => {
    setNewAchievement(achievement);
    setIsAchievementModalOpen(true);
  };

  const handleDeleteAchievement = async (achievementId) => {
    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    try {
      const response = await fetch(`http://localhost:5000/api/achievements/${companyName}/${employeeId}/${achievementId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAchievements();
      }
    } catch (error) {
      console.error('Error deleting achievement:', error);
    }
  };

  const handleViewCertificate = (certificateId) => {
    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    const url = `http://localhost:5000/api/certificates/${companyName}/${employeeId}/${certificateId}`;
    window.open(url, '_blank');
  };

  const handleCertificateUpload = async () => {
    if (!certificateFile) return;

    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    const formData = new FormData();
    formData.append('certificate', certificateFile);

    try {
      const response = await fetch(`http://localhost:5000/api/certificates/${companyName}/${employeeId}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setIsCertificateModalOpen(false);
        fetchAchievements();
        setCertificateFile(null);
      }
    } catch (error) {
      console.error('Error uploading certificate:', error);
    }
  };

  const handleDeleteCertificate = async (certificateId) => {
    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    try {
      const response = await fetch(`http://localhost:5000/api/certificates/${companyName}/${employeeId}/${certificateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAchievements();
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
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
      <div className="relative flex min-h-screen noborder">
        <Sidebar />
        <SidebarInset>
          <Header />
          <main className="p-6 bg-gray-50 noborder">
            <div className="mb-6 noborder">
              <h1 className="text-2xl font-bold text-gray-900 noborder">Achievements</h1>
              <p className="text-gray-600 noborder">Track your quarterly achievements and certificates</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 noborder">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between noborder">
                  <CardTitle>Quarterly Achievements</CardTitle>
                  <Button className=' noborder' onClick={() => {
                    setNewAchievement({ id: null, title: '', description: '', date: '', quarter: '' });
                    setIsAchievementModalOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2 noborder" />
                    Add Achievement
                  </Button>
                </CardHeader>
                <CardContent>
                  {achievements.length > 0 ? (
                    <ul className="space-y-4 noborder">
                      {achievements.map((achievement) => (
                        <li key={achievement.id} className="bg-white p-4 rounded-lg shadow">
                          <div className="flex justify-between items-start noborder">
                            <div className=' noborder'>
                              <h3 className="font-semibold text-lg noborder">{achievement.title}</h3>
                              <p className="text-gray-600 noborder">{achievement.description}</p>
                              {/* <div className="flex justify-between mt-2 text-sm text-gray-500 noborder"> */}
                              <p className="text-gray-600 noborder">Date: {achievement.date}</p>
                              <p className="text-gray-600 noborder">Quarter: {achievement.quarter}</p>
                              {/* </div> */}
                            </div>
                            <div className="flex space-x-2 noborder">
                              <Button size="sm" onClick={() => handleEditAchievement(achievement)}>
                                <Edit2 className="w-4 h-4 noborder" />
                              </Button>
                              <Button size="sm" onClick={() => handleDeleteAchievement(achievement.id)}>
                                <Trash2 className="w-4 h-4 noborder" />
                              </Button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 noborder">No achievements added yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between noborder">
                  <CardTitle>Certificates</CardTitle>
                  <Button className=" noborder" onClick={() => setIsCertificateModalOpen(true)}>
                    <Upload className="w-4 h-4 mr-2 noborder" />
                    Upload Certificate
                  </Button>
                </CardHeader>
                <CardContent>
                  {certificates.length > 0 ? (
                    <ul className="space-y-4 noborder">
                      {certificates.map((certificate) => (
                        <li key={certificate.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
                          <div className="flex items-center noborder">
                            <FileText className="w-6 h-6 mr-3 text-blue-500 noborder" />
                            <span className=' noborder'>{certificate.filename}</span>
                          </div>
                          <div className="flex space-x-2 noborder">
                            <Button className=" noborder" size="sm" onClick={() => handleViewCertificate(certificate.id)}>
                              View
                            </Button>
                            <Button className=" noborder" size="sm" onClick={() => handleDeleteCertificate(certificate.id)}>
                              <Trash2 className="w-4 h-4 noborder" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 noborder">No certificates uploaded yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>

      <Modal open={isAchievementModalOpen} onOpenChange={setIsAchievementModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{newAchievement.id ? 'Edit Achievement' : 'Add Achievement'}</ModalTitle>
          </ModalHeader>
          <FormField
            label="Title"
            id="title"
            name="title"
            value={newAchievement.title}
            onChange={handleAchievementChange}
          />
          <FormField
            label="Description"
            id="description"
            name="description"
            value={newAchievement.description}
            onChange={handleAchievementChange}
          />
          <FormField
            label="Date"
            id="date"
            name="date"
            type="date"
            value={newAchievement.date}
            onChange={handleAchievementChange}
          />
          <FormField
            label="Quarter"
            id="quarter"
            name="quarter"
            value={newAchievement.quarter}
            onChange={handleAchievementChange}
          />
          <ModalFooter>
            <Button onClick={handleAchievementSubmit}>
              {newAchievement.id ? 'Update Achievement' : 'Add Achievement'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal open={isCertificateModalOpen} onOpenChange={setIsCertificateModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Upload Certificate</ModalTitle>
            <ModalDescription>Upload your certificate (PDF, JPG, PNG - Max 5MB)</ModalDescription>
          </ModalHeader>
          <Input 
            type="file" 
            onChange={(e) => setCertificateFile(e.target.files[0])} 
            accept=".pdf,.jpg,.jpeg,.png"
            className="w-full"
          />
          <ModalFooter>
            <Button onClick={handleCertificateUpload}>Upload</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SidebarProvider>
  );
};

export default AchievementsPage;

