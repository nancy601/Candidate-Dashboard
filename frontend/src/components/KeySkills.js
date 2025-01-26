import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from '../atoms/Button';
import { Plus, X } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '../molecules/Modal';
import { Input } from '../atoms/Input';

const KeySkills = ({ skills, onEdit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [editedSkills, setEditedSkills] = useState(skills);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setEditedSkills(skills);
  }, [skills]);

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    setEditedSkills([...editedSkills, newSkill.trim()]);
    setNewSkill('');
  };

  const handleRemoveSkill = (index) => {
    const updatedSkills = editedSkills.filter((_, i) => i !== index);
    setEditedSkills(updatedSkills);
  };

  const handleUpdateSkills = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onEdit(editedSkills);
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to update skills. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="ml-20 px-20">Key Skills</CardTitle>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-orange-500 hover:text-black-600 bg-orange-400"
          >
            <Plus className="w-5 h-5 border-none" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-auto max-h-[300px]">
          <div className="flex flex-wrap gap-2 border-none">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-sm flex items-center group hover:bg-orange-100 transition-colors border-none"
              >
                {skill}
              </div>
            ))}
          </div>
          {!skills.length && (
            <div className="flex flex-col items-center justify-center py-8 text-center border-none">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-orange-600 border-none" />
              </div>
              <p className="text-sm text-gray-500 border-none">No skills added yet. Click the plus icon to add your key skills.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Manage Skills</ModalTitle>
          </ModalHeader>
          <div className="mb-4">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Enter a new skill"
              className="mb-2"
            />
            <Button onClick={handleAddSkill} disabled={isSubmitting || !newSkill.trim()}>
              Add Skill
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 border-none">
            {editedSkills.map((skill, index) => (
              <div key={index} className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-sm flex items-center group hover:bg-orange-100 transition-colors border-none">
                <span className='noborder'>{skill}</span>
                <Button
                  onClick={() => handleRemoveSkill(index)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 noborder"
                >
                  <X className="h-4 w-4 noborder"/>
                </Button>
              </div>
            ))}
          </div>
          {error && (
            <div className="text-red-500 text-sm mb-4">
              {error}
            </div>
          )}
          <ModalFooter>
            <Button onClick={handleUpdateSkills} disabled={isSubmitting}>
              Update Skills
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default KeySkills;

