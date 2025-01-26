import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from '../atoms/Button';
import { School, GraduationCap, Calendar, Percent, Edit } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '../molecules/Modal';
import EducationForm from './EducationForm';

const EducationCard = ({ education, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleEdit = () => {
    setSelectedEducation(education);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onUpdate(data);
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to update education details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEducationItem = (title, data, icon) => (
    <div className="mb-6 last:mb-0 border-orange-200 p-3 rounded-lg">
      <div className="flex items-center mb-2 noborder">
        <div className="p-2 rounded-full bg-orange-100 mr-3 noborder">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-800 noborder">{title}</h3>
      </div>
      <div className="ml-12 space-y-2 noborder">
        {title === "College" ? (
          <>
            <p className="text-gray-700 noborder"><strong className='noborder'>College Name:</strong> {data.collegeName}</p>
            <p className="text-gray-700 noborder"><strong className='noborder'>Degree:</strong> {data.degree}</p>
            <p className="text-gray-700 noborder"><strong className='noborder'>Major:</strong> {data.major}</p>
          </>
        ) : (
          <>
            <p className="text-gray-700 noborder"><strong className='noborder'>Institution:</strong> {data.institutionName}</p>
            <p className="text-gray-700 noborder"><strong className='noborder'>Board:</strong> {data.board}</p>
          </>
        )}
        {/* <div className="flex items-center space-x-4"> */}
          <div className="flex items-center text-gray-600 noborder">
            <Calendar className="w-4 h-4 mr-1 noborder" />
            <strong className='noborder pr-2'>Passing Year:</strong> 
            <span className='noborder pr-2'>{data.yearOfPassing}</span>
          </div>
          {data.percentage && (
            <div className="flex items-center text-gray-600 noborder">
              <Percent className="w-4 h-4 mr-1 noborder" />
              <strong className='noborder pr-2'>Percentage:</strong> 
              <span className='noborder pr-2'>{data.percentage}%</span>
            </div>
          )}
        {/* </div> */}
      </div>
    </div>
  );

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-200 noborder">
          <CardTitle className="text-xl font-semibold noborder">Education</CardTitle>
          <Button 
            onClick={handleEdit}
            variant="ghost" 
            size="sm"
            className="hover:bg-orange-100 noborder"
            disabled={isSubmitting}
          >
            <Edit className="w-4 h-4 mr-2 noborder" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 overflow-auto max-h-[300px]">
          {education && education.xSchool && renderEducationItem(
            "Class X",
            {
              institutionName: education.xSchool,
              board: education.xBoard,
              percentage: education.xPercentage,
              yearOfPassing: education.xYearOfPassing
            },
            <School className="w-5 h-5 text-orange-600 noborder" />
          )}
          
          {education && education.xiiSchool && renderEducationItem(
            "Class XII",
            {
              institutionName: education.xiiSchool,
              board: education.xiiBoard,
              percentage: education.xiiPercentage,
              yearOfPassing: education.xiiYearOfPassing
            },
            <School className="w-5 h-5 text-orange-600" />
          )}
          
          {education && education.collegeName && renderEducationItem(
            "College",
            {
              collegeName: education.collegeName,
              degree: education.degree,
              major:  education.major,
              percentage: education.collegePercentage,
              yearOfPassing: education.collegeYearOfPassing
            },
            <GraduationCap className="w-5 h-5 text-orange-600" />
          )}

          {(!education || (!education.xSchool && !education.xiiSchool && !education.collegeName)) && (
            <p className="text-sm text-gray-500 bg-orange-50 p-4 rounded-md">
              No education details added yet. Click the edit button to add your education.
            </p>
          )}
        </CardContent>
      </Card>

      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent className="max-h-[80vh] overflow-y-auto w-full max-w-3xl">
          <ModalHeader>
            <ModalTitle>
            {selectedEducation ? 'Edit Education' : 'Add Education'}
            </ModalTitle>
          </ModalHeader>
          {error && (
            <div className="text-red-500 text-sm mb-4 px-4">
              {error}
            </div>
          )}
          <EducationForm
            initialData={selectedEducation}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </ModalContent>
      </Modal>
    </>
  );
};

export default EducationCard;

