import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { UserPlus, Shield, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BASE_URL = 'http://localhost:5001';
const AdminAgentsPage = () => {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [department, setDepartment] = useState('Technical');

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/api/users/agents`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setAgents(data || []));
    // Removed non-existent /performance endpoint per Postman collection
  }, [token]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agent Management</h1>
          <p className="text-muted-foreground">{agents.length} agents</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus size={16} className="mr-2" /> Create Agent</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Agent</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={async e => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const name = (form[0] as HTMLInputElement).value;
              const email = (form[1] as HTMLInputElement).value;
              const password = (form[2] as HTMLInputElement).value;
              const res = await fetch(`${BASE_URL}/api/users/agent`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name, email, password, department })
              });
              const data = await res.json();
              console.log(data);
              if (res.ok) {
                toast.success('Agent created!');
                setOpen(false);
                // Refresh agent list
                fetch(`${BASE_URL}/api/users/agents`, {
                  headers: { Authorization: `Bearer ${token}` }
                })
                  .then(res => res.ok ? res.json() : [])
                  .then(data => setAgents(data || []));
              } else {
                toast.error(data.message || 'Failed to create agent');
              }
            }}>
              <div><Label>Full Name</Label><Input placeholder="Agent name" className="mt-1.5" required /></div>
              <div><Label>Email</Label><Input type="email" placeholder="agent@support.com" className="mt-1.5" required /></div>
              <div><Label>Password</Label><Input type="password" placeholder="Temporary password" className="mt-1.5" required /></div>
              <div>
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment} name="department">
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Billing">Billing</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Create Agent</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Agent</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Department</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Resolved</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Avg Time</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rating</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(agent => {
                const perf = performance.find(p => p.agentId === (agent._id || agent.id));
                return (
                  <tr key={agent._id || agent.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{agent.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{agent.email}</td>
                    <td className="py-3 px-4 text-muted-foreground">{agent.department}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${agent.isActive !== false ? 'bg-status-resolved-bg text-status-resolved' : 'bg-status-closed-bg text-status-closed'}`}>
                        {agent.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-foreground">{perf?.totalResolved || 0}</td>
                    <td className="py-3 px-4 text-muted-foreground">{perf?.avgResolutionTime || '—'}h</td>
                    <td className="py-3 px-4 text-foreground">{perf ? `⭐ ${perf.rating}` : '—'}</td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const res = await fetch(`${BASE_URL}/api/users/agent/${agent._id || agent.id}/${agent.isActive !== false ? 'deactivate' : 'activate'}`, {
                            method: 'PUT',
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          if (res.ok) {
                            toast.success(agent.isActive !== false ? 'Agent deactivated' : 'Agent reactivated');
                            // Refresh agent list
                            fetch(`${BASE_URL}/api/users/agents`, {
                              headers: { Authorization: `Bearer ${token}` }
                            })
                              .then(res => res.ok ? res.json() : [])
                              .then(data => setAgents(data || []));
                          } else {
                            toast.error('Failed to update agent status');
                          }
                        }}
                      >
                        {agent.isActive !== false ? <ShieldOff size={14} /> : <Shield size={14} />}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAgentsPage;
