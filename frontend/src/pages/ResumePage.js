import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '../molecules/Modal';
import { Input } from '../atoms/Input';

const ResumePage = () => {
  const navigate = useNavigate();
  const [resumePath, setResumePath] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    fetchResumeInfo();
  }, []);

  const fetchResumeInfo = async () => {
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
      setResumePath(data.resume_path);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching resume info:', err);
    } finally {
      setIsLoading(false);
    }
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
        setIsUploadModalOpen(false);
        setResumePath(data.filename);
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
    }
  };

  const openResume = () => {
    if (resumePath) {
      const employeeId = localStorage.getItem('employeeId');
      const companyName = localStorage.getItem('companyName');
      window.open(`http://localhost:5000/api/view-resume/${companyName}/${employeeId}`, '_blank');
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
        <Sidebar />
        <SidebarInset>
          <Header />
          <main className="p-6 bg-gray-50">
            <div className="mb-6 border-none">
              <h1 className="text-2xl font-bold text-gray-900 border-none">Resume</h1>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center border-none">Your Resume</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                {resumePath ? (
                  <div className="flex flex-col items-center">
                    <FileText className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{resumePath}</h3>
                    <Button onClick={openResume}>View Resume</Button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No resume uploaded yet</h3>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsUploadModalOpen(true)}
                      className="mt-4"
                    >
                      Upload Resume
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>

      <Modal open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
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
    </SidebarProvider>
  );
};

export default ResumePage;