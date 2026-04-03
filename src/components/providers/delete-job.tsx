"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import Modal from "../ui/modal";
import { deleteJobAction } from "@/lib/actions/job-actions";
import { useToast } from "@/components/providers/toast-provider";
import { Trash2 } from "lucide-react";

type DeleteJobProps = {
  jobId: string;
  companyName: string;
  onSuccess: () => void;
  trigger?: React.ReactNode;
};

function DeleteJob({ jobId, companyName, onSuccess, trigger }: DeleteJobProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteJobAction(jobId);
    setDeleting(false);
    if (result?.error) {
      toast(result.error, "error");
    } else {
      toast("Job deleted");
      onSuccess();
      setIsDeleteOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsDeleteOpen(true)}
        className="rounded p-1 cursor-pointer text-zinc-500 hover:bg-red-50 dark:text-zinc-400 dark:hover:bg-red-950/30"
      >
        {trigger ?? <Trash2 className="h-4 w-4" />}
      </button>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Job Application"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="shrink-0">
              <svg
                className="h-10 w-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Are you sure?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This will permanently delete{" "}
                <span className="font-semibold">{companyName}</span> and all
                associated data.
              </p>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>Warning:</strong> This action cannot be reversed.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              className=" cursor-pointer"
              onClick={() => setIsDeleteOpen(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              className=" cursor-pointer"
              onClick={handleDelete}
              variant="danger"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default DeleteJob;
