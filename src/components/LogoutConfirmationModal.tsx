import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';

interface LogoutConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({ visible, onClose, onConfirm }) => {
  return (
    <Modal isOpen={visible} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <p>Logout Confirmation</p>
        </ModalHeader>
        <ModalBody>
          <p>Are you sure you want to log out?</p>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={onConfirm}>
            Confirm
          </Button>
          <Button onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LogoutConfirmationModal;
