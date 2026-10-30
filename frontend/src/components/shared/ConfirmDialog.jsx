import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AlertTriangle, AlertCircle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center p-2">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
            variant === 'danger'
              ? 'bg-rose-50 text-rose-600'
              : 'bg-amber-50 text-amber-600'
          }`}
        >
          {variant === 'danger' ? <AlertTriangle className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
        </div>
        <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-sm">{message}</p>
        <div className="flex items-center justify-center gap-3 w-full">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            className="flex-1"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
