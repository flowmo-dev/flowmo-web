import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { useSpring, animated } from 'react-spring';
import StatisticsChart from '../components/StatisticsChart';
import { useAuth } from '../contexts/AuthContext';
import createApi from '../services/api';

interface FocusSession {
  id: string;
  taskName: string;
  duration: number;
  date: string;
}

function StatisticsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const { apiUrl } = useAuth();
  const api = createApi(apiUrl);

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 300 },
  });

  useEffect(() => {
    fetchFocusSessions();
  }, [selectedDate, apiUrl]);

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

  // ... rest of the component remains the same
}

export default StatisticsPage;