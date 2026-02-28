import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockPrescriptions } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PatientPrescriptionsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const myPrescriptions = mockPrescriptions.filter(p => p.patientName === user?.name || p.patientId === 'p-1');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">My Prescriptions</h1>

        {myPrescriptions.length === 0 ? (
          <Card className="glass-card"><CardContent className="py-10 text-center text-muted-foreground">No prescriptions found.</CardContent></Card>
        ) : (
          myPrescriptions.map(rx => (
            <Card key={rx.id} className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{rx.diagnosis}</CardTitle>
                    <p className="text-sm text-muted-foreground">By {rx.doctorName} • {rx.createdAt}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => toast({ title: 'PDF download (demo)' })}>
                    <Download className="mr-1 h-3 w-3" /> PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Medicines</h4>
                  <div className="space-y-2">
                    {rx.medicines.map((m, i) => (
                      <div key={i} className="bg-accent/50 rounded-lg p-3 text-sm">
                        <p className="font-medium">{m.name} - {m.dosage}</p>
                        <p className="text-muted-foreground">{m.frequency} for {m.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Instructions</h4>
                  <p className="text-sm text-muted-foreground">{rx.instructions}</p>
                </div>
                {rx.aiExplanation && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-semibold text-primary">AI Explanation</h4>
                    </div>
                    <p className="text-sm">{rx.aiExplanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientPrescriptionsPage;
