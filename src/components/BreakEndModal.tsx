import React, { useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { useBreakTimer } from '../contexts/BreakTimerContext';
import { useSessionHistory } from '../contexts/SessionHistoryContext';
import { useStopwatch } from 'react-timer-hook';

const BreakEndModal: React.FC = () => {
  const { showBreakEndModal, setShowBreakEndModal, stopBreak, currentBreakDuration } = useBreakTimer();
  const { addSessionRecord } = useSessionHistory();

  const handleEndBreak = () => {
    addSessionRecord('break', currentBreakDuration, seconds);
    reset(undefined, false);
    stopBreak();
    setShowBreakEndModal(false);
  };

  const {
    seconds,
    reset,
    start
  } = useStopwatch({ autoStart: false });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // showBreakEndModal を監視して, trueになったときストップウォッチをスタート
  useEffect(() => {
    if (showBreakEndModal) {
      start();
    }
  }, [showBreakEndModal]);

  return (
    <Modal isOpen={showBreakEndModal} onClose={() => setShowBreakEndModal(false)}>
      <ModalContent>
        <ModalHeader>Break Over</ModalHeader>
        <ModalBody>
          <p className="text-center text-red-600 text-3xl font-bold">
            {formatTime(seconds)}
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
