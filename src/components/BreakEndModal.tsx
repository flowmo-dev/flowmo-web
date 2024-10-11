import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { useBreakTimer } from '../contexts/BreakTimerContext';
import { useSessionHistory } from '../contexts/SessionHistoryContext';

const BreakEndModal: React.FC = () => {
  const { showBreakEndModal, setShowBreakEndModal, stopBreak, currentBreakDuration } = useBreakTimer();
  const { addSessionRecord } = useSessionHistory();

  const handleEndBreak = () => {
    addSessionRecord('break', currentBreakDuration, 1);
    stopBreak();
    setShowBreakEndModal(false);
  };

  return (
    <Modal isOpen={showBreakEndModal} onClose={() => setShowBreakEndModal(false)}>
      <ModalContent>
        <ModalHeader>Break Over</ModalHeader>
        <ModalBody>
          <p className="text-center text-red-600 text-3xl font-bold">
            Over Time
          </p>
          <p>The break time has ended. Please wrap up.</p>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleEndBreak}>End Break</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BreakEndModal;
