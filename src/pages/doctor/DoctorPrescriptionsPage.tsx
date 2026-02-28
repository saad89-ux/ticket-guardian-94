import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockPrescriptions } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DoctorPrescriptionsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const myPrescriptions = mockPrescriptions.filter(p => p.doctorId === user?.id);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Prescriptions</h1>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Medicines</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myPrescriptions.map(rx => (
                  <TableRow key={rx.id}>
                    <TableCell className="font-medium">{rx.patientName}</TableCell>
                    <TableCell>{rx.diagnosis}</TableCell>
                    <TableCell>{rx.medicines.map(m => m.name).join(', ')}</TableCell>
                    <TableCell>{rx.createdAt}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => toast({ title: 'PDF download (demo)' })}>
                        <Download className="mr-1 h-3 w-3" /> PDF
                      </Button>
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

export default DoctorPrescriptionsPage;
