import { useState } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockAppointments } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/Badges';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const DoctorAppointmentsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState('all');
  const myAppointments = mockAppointments.filter(a => a.doctorId === user?.id);
  const filtered = filter === 'all' ? myAppointments : myAppointments.filter(a => a.status === filter);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">My Appointments</h1>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.patientName}</TableCell>
                    <TableCell>{a.date}</TableCell>
                    <TableCell>{a.time}</TableCell>
                    <TableCell>{a.reason || '-'}</TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
                    <TableCell className="space-x-2">
                      {a.status === 'Pending' && (
                        <Button size="sm" onClick={() => toast({ title: 'Confirmed (demo)' })}>Confirm</Button>
                      )}
                      {a.status === 'Confirmed' && (
                        <Button size="sm" variant="outline" onClick={() => toast({ title: 'Completed (demo)' })}>Complete</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DoctorAppointmentsPage;
