import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, CreditCard } from 'lucide-react';

const plans = [
  {
    name: 'Free Plan',
    price: 'Rs. 0/mo',
    features: ['Up to 50 patients', 'Basic appointment booking', 'Manual prescriptions', 'No AI features'],
    excluded: ['AI Smart Diagnosis', 'Predictive Analytics', 'Advanced Reports'],
    current: false,
  },
  {
    name: 'Pro Plan',
    price: 'Rs. 5,000/mo',
    features: ['Unlimited patients', 'AI Smart Diagnosis', 'Prescription Explanation AI', 'Risk Flagging', 'Predictive Analytics', 'Advanced Reports', 'Priority Support'],
    excluded: [],
    current: true,
  },
];

const AdminSubscriptionsPage = () => (
  <DashboardLayout>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Subscription Plans</h1>
      <p className="text-muted-foreground">Manage your clinic's subscription (simulated)</p>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
        {plans.map(plan => (
          <Card key={plan.name} className={`glass-card ${plan.current ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {plan.current && <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">Current</span>}
              </div>
              <CardDescription className="text-2xl font-bold text-foreground mt-2">{plan.price}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.features.map(f => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>{f}</span>
                </div>
              ))}
              {plan.excluded.map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <X className="h-4 w-4 text-red-400" />
                  <span>{f}</span>
                </div>
              ))}
              <Button className="w-full mt-4" variant={plan.current ? 'outline' : 'default'} disabled={plan.current}>
                <CreditCard className="mr-2 h-4 w-4" />
                {plan.current ? 'Current Plan' : 'Upgrade'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default AdminSubscriptionsPage;
