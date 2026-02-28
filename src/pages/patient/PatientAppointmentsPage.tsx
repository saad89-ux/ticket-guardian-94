import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockAppointments } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/Badges';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const PatientAppointmentsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const myAppointments = mockAppointments.filter(a => a.patientName === user?.name || a.patientId === 'p-1');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">My Appointments</h1>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
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
                    <TableCell>
                      {a.status === 'Pending' && (
                        <Button size="sm" variant="destructive" onClick={() => toast({ title: 'Cancelled (demo)' })}>
                          Cancel
                        </Button>
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

export default PatientAppointmentsPage;
