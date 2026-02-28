import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { mockAppointments, mockPrescriptions } from '@/lib/mock-data';
import { Calendar, FileText, Clock, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/Badges';

const PatientDashboard = () => {
  const { user } = useAuth();
  // In a real app, filter by patient's linked patient record
  const myAppointments = mockAppointments.filter(a => a.patientName === user?.name || a.patientId === 'p-1');
  const myPrescriptions = mockPrescriptions.filter(p => p.patientName === user?.name || p.patientId === 'p-1');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">Your health dashboard</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Appointments" value={myAppointments.length} icon={<Calendar className="h-5 w-5" />} />
          <StatCard title="Prescriptions" value={myPrescriptions.length} icon={<FileText className="h-5 w-5" />} />
          <StatCard title="Upcoming" value={myAppointments.filter(a => a.status === 'Pending' || a.status === 'Confirmed').length} icon={<Clock className="h-5 w-5" />} />
          <StatCard title="Completed" value={myAppointments.filter(a => a.status === 'Completed').length} icon={<Activity className="h-5 w-5" />} />
        </div>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Recent Appointments</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myAppointments.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.doctorName}</TableCell>
                    <TableCell>{a.date}</TableCell>
                    <TableCell>{a.time}</TableCell>
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

export default PatientDashboard;
