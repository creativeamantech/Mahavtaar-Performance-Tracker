import { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { DEFAULT_PERMISSIONS, VIEWS, Role } from '../constants/permissions';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../components/ui/command';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

import { TargetInput } from '../components/TargetInput';

export default function SettingsPage() {
  const [tab, setTab] = useState<'targets' | 'users'>('targets');

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-heading text-xl font-extrabold uppercase tracking-wide">Settings</h1>
        <p className="font-data text-xs text-muted-foreground">Admin configuration</p>
      </div>

      <div className="mb-4 flex gap-1 rounded-lg border border-border bg-card p-1">
        <button
          onClick={() => setTab('targets')}
          className={`rounded-md px-4 py-2 font-heading text-xs font-bold transition-colors ${tab === 'targets' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >State Targets</button>
        <button
          onClick={() => setTab('users')}
          className={`rounded-md px-4 py-2 font-heading text-xs font-bold transition-colors ${tab === 'users' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >User Management</button>
      </div>

      {tab === 'targets' ? <StateTargetsTab /> : <UserManagementTab />}
    </AppLayout>
  );
}

function StateTargetsTab() {
  const { targets, setTarget, records } = useData();
  const { user } = useAuth();
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBkt, setSelectedBkt] = useState('');
  const [newPct, setNewPct] = useState('');
  const [openCity, setOpenCity] = useState(false);
  const [openState, setOpenState] = useState(false);

  const entries = Object.entries(targets).sort(([a], [b]) => a.localeCompare(b));

  const availableStates = useMemo(() => {
    const states = new Set<string>();
    records.forEach((r: any) => {
      const state = String(r.state || r.State || '').trim().toUpperCase();
      if (state) states.add(state);
    });
    return Array.from(states).sort();
  }, [records]);

  const recordsByState = useMemo(() => {
    if (selectedStates.length === 0) return [];
    if (selectedStates.includes('ALL')) return records;
    return records.filter((r: any) => selectedStates.includes(String(r.state || r.State || '').trim().toUpperCase()));
  }, [records, selectedStates]);

  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    recordsByState.forEach((r: any) => {
      const city = String(r.city || r.City || '').trim().toUpperCase();
      if (city) cities.add(city);
    });
    return Array.from(cities).sort();
  }, [recordsByState]);

  const recordsByStateAndCity = useMemo(() => {
    if (selectedCity === 'ALL' || !selectedCity) return recordsByState;
    return recordsByState.filter((r: any) => String(r.city || r.City || '').trim().toUpperCase() === selectedCity);
  }, [recordsByState, selectedCity]);

  const availableBuckets = useMemo(() => {
    const buckets = new Set<string>();
    recordsByStateAndCity.forEach((r: any) => {
      const bkt = String(r.bom_bkt || '').trim();
      if (bkt) buckets.add(bkt);
    });
    return Array.from(buckets).sort((a,b) => Number(a) - Number(b));
  }, [recordsByStateAndCity]);

  // Reset logic
  useEffect(() => {
    if (selectedCity && selectedCity !== 'ALL' && !availableCities.includes(selectedCity)) {
      setSelectedCity('');
    }
  }, [availableCities, selectedCity]);

  useEffect(() => {
    if (selectedBkt && selectedBkt !== 'ALL' && !availableBuckets.includes(selectedBkt)) {
      setSelectedBkt('');
    }
  }, [availableBuckets, selectedBkt]);

  const toggleState = (st: string) => {
    if (st === 'ALL') {
      setSelectedStates(prev => prev.includes('ALL') ? [] : ['ALL']);
      return;
    }
    setSelectedStates(prev => {
      const filtered = prev.filter(p => p !== 'ALL');
      if (filtered.includes(st)) return filtered.filter(p => p !== st);
      return [...filtered, st];
    });
  };

  const addTarget = () => {
    if (selectedStates.length === 0 || !selectedCity || !selectedBkt || !newPct.trim()) {
      toast.error('Please select State, City, Bucket, and enter Target %');
      return;
    }
    
    const val = parseFloat(newPct);
    if (isNaN(val) || val < 0) {
      toast.error('Please enter a valid positive percentage (e.g. 40)');
      return;
    }
    
    const statesToProcess = selectedStates.includes('ALL') ? availableStates : selectedStates;
    const cy = selectedCity === 'ALL' ? '' : selectedCity;
    const bk = selectedBkt === 'ALL' ? '' : selectedBkt;
    const targetVal = val;

    let confirmationMsg = '';
    if (statesToProcess.length > 1 && cy === '') {
      confirmationMsg = `Apply ${targetVal}% bulk target to ${statesToProcess.length} States${bk ? ` for Bucket ${bk}` : ''}?`;
    } else if (cy === '') {
      confirmationMsg = `Apply ${targetVal}% bulk target to ${statesToProcess[0]}${bk ? ` for Bucket ${bk}` : ''}?`;
    }

    if (confirmationMsg && !window.confirm(confirmationMsg)) {
      return;
    }

    statesToProcess.forEach(st => {
      let key = '';
      if (cy && bk) key = `CITY__${cy}__BKT__${bk}`;
      else if (!cy && bk) key = `STATE__${st}__BKT__${bk}`;
      else if (cy && !bk) key = `CITY__${cy}`;
      else key = `STATE__${st}`;

      setTarget(key, targetVal, user?.name || '');
    });

    toast.success(`Targets applied successfully`);
    setNewPct('');
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h2 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider">Target Configuration</h2>
        <p className="mb-4 font-data text-xs text-muted-foreground">Target = (Total POS × X%) − Main Paid POS</p>
        
        <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-4">
          <div>
            <label className="mb-1.5 block font-heading text-[10px] font-bold text-muted-foreground uppercase tracking-wider">State</label>
            <Popover open={openState} onOpenChange={setOpenState}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={openState} className="w-full justify-between h-9 px-3 text-xs bg-input border-border hover:bg-input hover:text-foreground font-data">
                  {selectedStates.includes('ALL') ? 'All States' : selectedStates.length > 0 ? `${selectedStates.length} selected` : 'Select States...'}
                  <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search state..." className="h-8 text-xs" />
                  <CommandList>
                    <CommandEmpty>No state found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem onSelect={() => toggleState('ALL')} className="text-xs">
                        <div className={cn("mr-2 flex h-3.5 w-3.5 items-center justify-center rounded-sm border border-primary", selectedStates.includes('ALL') ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                          <Check className="h-3 w-3" />
                        </div>
                        All States
                      </CommandItem>
                      {availableStates.map(s => (
                        <CommandItem key={s} onSelect={() => toggleState(s)} className="text-xs">
                          <div className={cn("mr-2 flex h-3.5 w-3.5 items-center justify-center rounded-sm border border-primary", selectedStates.includes(s) && !selectedStates.includes('ALL') ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                            <Check className="h-3 w-3" />
                          </div>
                          {s}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="mb-1.5 block font-heading text-[10px] font-bold text-muted-foreground uppercase tracking-wider">City</label>
            <Popover open={openCity} onOpenChange={setOpenCity}>
              <PopoverTrigger asChild>
                <Button disabled={selectedStates.length === 0} variant="outline" role="combobox" aria-expanded={openCity} className="w-full justify-between h-9 px-3 text-xs bg-input border-border hover:bg-input hover:text-foreground font-data truncate">
                  {selectedCity === 'ALL' ? 'All (Bulk)' : selectedCity ? selectedCity : 'Select City...'}
                  <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search city..." className="h-8 text-xs" />
                  <CommandList>
                    <CommandEmpty>No city found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem onSelect={() => { setSelectedCity('ALL'); setOpenCity(false); }} className="text-xs">
                        <Check className={cn("mr-2 h-3.5 w-3.5", selectedCity === 'ALL' ? "opacity-100" : "opacity-0")} />
                        All (Bulk)
                      </CommandItem>
                      {availableCities.map(c => (
                        <CommandItem key={c} onSelect={() => { setSelectedCity(c); setOpenCity(false); }} className="text-xs">
                          <Check className={cn("mr-2 h-3.5 w-3.5", selectedCity === c ? "opacity-100" : "opacity-0")} />
                          {c}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="mb-1.5 block font-heading text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bucket</label>
            <Select value={selectedBkt} onValueChange={setSelectedBkt} disabled={selectedStates.length === 0}>
              <SelectTrigger className="h-9 px-3 text-xs bg-input border-border font-data"><SelectValue placeholder="Select Bucket" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">All Buckets</SelectItem>
                {availableBuckets.map(b => <SelectItem key={b} value={b} className="text-xs">Bucket {b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block font-heading text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Target %</label>
            <div className="flex gap-2">
              <input value={newPct} onChange={e => setNewPct(e.target.value)} placeholder="e.g. 40" className="h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              <button onClick={addTarget} className="rounded bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">Add</button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full font-data text-xs">
            <thead><tr className="border-b border-border bg-card">
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Target Key</th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">X%</th>
            </tr></thead>
            <tbody>
              {entries.map(([key, pct]) => (
                <tr key={key} className="border-b border-border hover:bg-bg-hover">
                  <td className="px-3 py-2">{key}</td>
                  <td className="px-3 py-2 text-right">
                    <TargetInput
                      targetKey={key}
                      initialPct={pct}
                      onSave={(k, v) => setTarget(k, v, user?.name || '')}
                    />
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-3 py-4 text-center text-muted-foreground">No targets configured.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-2 font-heading text-sm font-bold">Formula</h3>
        <p className="font-data text-xs text-muted-foreground leading-relaxed">
          Targets are evaluated per row. Priority:<br />
          1. CITY + BKT<br />
          2. STATE + BKT<br />
          3. CITY<br />
          4. STATE<br /><br />
          City Target = Sum of (Row POS × Row X%) − City Main Paid POS
        </p>
      </div>
    </div>
  );
}

function UserManagementTab() {
  const { users, user: currentUser, addUser, updateUser, deleteUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'VIEWER' as Role, password: '' });
  const [editPerms, setEditPerms] = useState<string[]>([]);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', email: '', role: 'VIEWER', password: '' });
    setEditPerms(DEFAULT_PERMISSIONS.VIEWER);
    setShowModal(true);
  };

  const openEdit = (u: any) => {
    setEditId(u.id);
    setForm({ name: u.name, email: u.email, role: u.role, password: '' });
    setEditPerms(u.permissions?.views || []);
    setShowModal(true);
  };

  const handleSave = () => {
    if (editId) {
      updateUser(editId, { name: form.name, email: form.email, role: form.role, permissions: { views: editPerms } });
      toast.success('User updated');
    } else {
      addUser({ name: form.name, email: form.email, role: form.role, permissions: { views: editPerms } });
      toast.success('User created');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (id === currentUser?.id) return toast.error("Cannot delete own account");
    deleteUser(id);
    toast.success('User deleted');
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (v: string) => {
      const variant = v === 'ADMIN' ? 'admin' : v === 'MANAGER' ? 'manager' : v === 'EXECUTIVE' ? 'executive' : 'viewer';
      return <StatusBadge variant={variant}>{v}</StatusBadge>;
    }},
    { key: '_actions', label: 'Actions', sortable: false, render: (_: any, row: any) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(row)} className="rounded p-1 text-muted-foreground hover:bg-bg-hover hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
        <button onClick={() => handleDelete(row.id)} disabled={row.id === currentUser?.id} className="rounded p-1 text-muted-foreground hover:bg-bg-hover hover:text-destructive disabled:opacity-30"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider">User Management</h2>
        <button onClick={openCreate} className="flex h-[34px] items-center gap-2 rounded-md bg-primary px-4 font-heading text-xs font-bold text-primary-foreground hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> Create User
        </button>
      </div>
      <DataTable columns={columns} data={users} />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-heading text-sm font-bold">{editId ? 'Edit User' : 'Create User'}</h3>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className="h-8 w-full rounded-md border border-border bg-input px-3 font-data text-xs outline-none focus:border-primary" />
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="h-8 w-full rounded-md border border-border bg-input px-3 font-data text-xs outline-none focus:border-primary" />
              <select value={form.role} onChange={e => { const role = e.target.value as Role; setForm(f => ({ ...f, role })); setEditPerms(DEFAULT_PERMISSIONS[role]); }} className="h-8 w-full rounded-md border border-border bg-input px-3 font-data text-xs outline-none focus:border-primary">
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="EXECUTIVE">Executive</option>
                <option value="VIEWER">Viewer</option>
              </select>
              {!editId && <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Password" type="password" className="h-8 w-full rounded-md border border-border bg-input px-3 font-data text-xs outline-none focus:border-primary" />}
              {(form.role === 'MANAGER' || form.role === 'VIEWER') && (
                <div>
                  <p className="mb-2 font-data text-[10px] uppercase tracking-[2px] text-muted-foreground">Access to Views:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(VIEWS).map(v => (
                      <label key={v} className="flex items-center gap-1 text-xs">
                        <input type="checkbox" checked={editPerms.includes(v)} onChange={e => setEditPerms(prev => e.target.checked ? [...prev, v] : prev.filter(p => p !== v))} className="accent-primary" />
                        {v.replace(/_/g, ' ')}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="rounded-md border border-border px-4 py-2 font-heading text-xs hover:bg-bg-hover">Cancel</button>
              <button onClick={handleSave} className="rounded-md bg-primary px-4 py-2 font-heading text-xs font-bold text-primary-foreground">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
