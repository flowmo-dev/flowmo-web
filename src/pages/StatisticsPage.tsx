import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { useSpring, animated } from 'react-spring';
import StatisticsChart from '../components/StatisticsChart';
import useApi from '../hooks/useApi';

interface FocusSession {
  id: string;
  taskName: string;
  duration: number;
  date: string;
}

function StatisticsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const api = useApi();

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 300 },
  });

  useEffect(() => {
    fetchFocusSessions();
  }, [selectedDate]);

  const fetchFocusSessions = async () => {
    try {
      const response = await api.get('/focus-sessions', {
        params: {
          startDate: startOfDay(selectedDate).toISOString(),
          endDate: endOfDay(selectedDate).toISOString(),
        },
      });
      setFocusSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch focus sessions:', error);
    }
  };

  const totalFocusTime = focusSessions.reduce((total, session) => total + session.duration, 0);
  const averageFocusTime = focusSessions.length > 0 ? totalFocusTime / focusSessions.length : 0;

  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const sessionsInHour = focusSessions.filter(session => new Date(session.date).getHours() === hour);
    const totalDuration = sessionsInHour.reduce((total, session) => total + session.duration, 0);
    return { hour, duration: totalDuration };
  });

  return (
    <animated.div style={fadeIn} className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Statistics</h1>
      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-2xl font-bold">Date Selection</h2>
        </CardHeader>
        <CardBody>
          <Select
            label="Select Date"
            selectedKeys={[selectedDate.toISOString()]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          >
            {Array.from({ length: 7 }, (_, i) => {
              const date = subDays(new Date(), i);
              return (
                <SelectItem key={date.toISOString()} value={date.toISOString()}>
                  {format(date, 'yyyy-MM-dd')}
                </SelectItem>
              );
            })}
          </Select>
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-2xl font-bold">Summary</h2>
        </CardHeader>
        <CardBody>
          <p>Total Focus Time: {Math.round(totalFocusTime / 60)} minutes</p>
          <p>Average Focus Session: {Math.round(averageFocusTime / 60)} minutes</p>
          <p>Number of Sessions: {focusSessions.length}</p>
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-2xl font-bold">Hourly Distribution</h2>
        </CardHeader>
        <CardBody>
          <StatisticsChart data={hourlyData} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Focus Sessions</h2>
        </CardHeader>
        <CardBody>
          <Table>
            <TableHeader>
              <TableColumn>Task</TableColumn>
              <TableColumn>Duration (minutes)</TableColumn>
              <TableColumn>Time</TableColumn>
            </TableHeader>
            <TableBody>
              {focusSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{session.taskName}</TableCell>
                  <TableCell>{Math.round(session.duration / 60)}</TableCell>
                  <TableCell>{format(new Date(session.date), 'HH:mm')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </animated.div>
  );
}

export default StatisticsPage;