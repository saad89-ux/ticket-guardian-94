import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { mockPatients, mockAppointments } from '@/lib/mock-data';
import { Users, Calendar, UserPlus, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/Badges';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const todayAppointments = mockAppointments.filter(a => a.status !== 'Cancelled');
  const pendingCount = mockAppointments.filter(a => a.status === 'Pending').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Receptionist Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Patients" value={mockPatients.length} icon={<Users className="h-5 w-5" />} />
          <StatCard title="Today's Appointments" value={todayAppointments.length} icon={<Calendar className="h-5 w-5" />} />
          <StatCard title="Pending" value={pendingCount} icon={<Clock className="h-5 w-5" />} />
          <div onClick={() => navigate('/receptionist/register-patient')} className="cursor-pointer">
            <StatCard title="Register Patient" value="+" icon={<UserPlus className="h-5 w-5" />} />
          </div>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Today's Schedule</CardTitle>
              <Button size="sm" onClick={() => navigate('/receptionist/appointments')}>View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAppointments.slice(0, 6).map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.time}</TableCell>
                    <TableCell>{a.patientName}</TableCell>
                    <TableCell>{a.doctorName}</TableCell>
                    <TableCell>{a.reason || '-'}</TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
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

export default ReceptionistDashboard;
