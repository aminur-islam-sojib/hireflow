"use client";

import React, { useState, useCallback } from "react";
import { Button } from "../ui/button";
import Modal from "../ui/modal";
import { JobForm } from "@/components/jobs/job-form";
import { Plus } from "lucide-react";

type AddJobProps = {
  title?: string;
  onSuccess?: () => void;
};

const AddJob = ({ title, onSuccess }: AddJobProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSuccess = useCallback(() => {
    setIsOpen(false);
    onSuccess?.();
  }, [onSuccess]);

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsOpen(true)} variant="primary">
        <Plus className="mr-2 h-4 w-4" /> {title || "Add Job"}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Add Job Application"
        size="md"
        animation="scale"
      >
        <JobForm
          mode="create"
          onSuccess={handleSuccess}
          onCancel={handleClose}
        />
      </Modal>
    </div>
  );
};

export default AddJob;
