import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

interface SessionRecord {
  type: 'focus' | 'break';
  duration: number;
  overTime?: number;
}

interface SessionHistoryProps {
  history: SessionRecord[];
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ history }) => {
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSessionClick = (session: SessionRecord) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  return (
    <>
      <Card className="max-w-md mx-auto">
        <CardHeader className="flex justify-center">
          <h3 className="text-xl font-bold">Session History</h3>
        </CardHeader>
        <CardBody>
          {history.length === 0 ? (
            <p className="text-center">No sessions recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((record, index) => (
                <li 
                  key={index} 
                  className={`p-2 rounded ${record.type === 'focus' ? 'bg-blue-100' : 'bg-green-100'} cursor-pointer hover:opacity-80`}
                  onClick={() => handleSessionClick(record)}
                >
                  <span className="font-semibold">{record.type === 'focus' ? 'Focus' : 'Break'}: </span>
                  {formatTime(record.duration)}
                  {record.overTime !== undefined && record.overTime > 0 && (
                    <span className="ml-2 text-red-500">
                      (Overtime: {formatTime(record.overTime)})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Session Details</ModalHeader>
              <ModalBody>
                {selectedSession && (
                  <div>
                    <p><strong>Type:</strong> {selectedSession.type === 'focus' ? 'Focus' : 'Break'}</p>
                    <p><strong>Duration:</strong> {formatTime(selectedSession.duration)}</p>
                    {selectedSession.overTime !== undefined && selectedSession.overTime > 0 && (
                      <p><strong>Overtime:</strong> {formatTime(selectedSession.overTime)}</p>
                    )}
                    {selectedSession.type === 'focus' ? (
                      <p>During this focus session, you concentrated on your task for {formatTime(selectedSession.duration)}.</p>
                    ) : (
                      <p>This was a break session lasting {formatTime(selectedSession.duration)}
                        {selectedSession.overTime !== undefined && selectedSession.overTime > 0 ? 
                          `, with an additional ${formatTime(selectedSession.overTime)} of overtime.` : 
                          '.'}
                      </p>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default SessionHistory;