import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { mockPatients } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const ReceptionistPatientsPage = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Patient Records</h1>
          <Button onClick={() => navigate('/receptionist/register-patient')}>
            <UserPlus className="mr-2 h-4 w-4" />Register New
          </Button>
        </div>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Allergies</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPatients.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.age}</TableCell>
                    <TableCell>{p.gender}</TableCell>
                    <TableCell>{p.contact}</TableCell>
                    <TableCell>{p.bloodGroup || '-'}</TableCell>
                    <TableCell>{p.allergies?.join(', ') || 'None'}</TableCell>
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

export default ReceptionistPatientsPage;
