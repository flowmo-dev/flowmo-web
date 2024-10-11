import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, DatePicker, DateValue } from "@nextui-org/react";
import { format, startOfDay, endOfDay } from 'date-fns';
import { useSpring, animated } from 'react-spring';
import StatisticsChart from '../components/StatisticsChart';
import useApi from '../hooks/useApi';
import { today } from '@internationalized/date';

interface FocusSession {
  id: string;
  taskName: string;
  duration: number;
  date: string;
}

function StatisticsPage() {
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const api = useApi();

  const [value, setValue] = useState<DateValue>(today("Asia/Tokyo") as unknown as DateValue);

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 300 },
  });

  useEffect(() => {
    fetchFocusSessions();
  }, [value]);

  const fetchFocusSessions = async () => {
    try {
      const response = await api.get('/focus-sessions', {
        params: {
          startDate: startOfDay(new Date(value.toString())).toISOString(),
          endDate: endOfDay(new Date(value.toString())).toISOString(),
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
          <DatePicker
            value={value}
            onChange={(newValue) => setValue(newValue)}
            label="Birth Date"
            variant="bordered"
            showMonthAndYearPickers
          />
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
