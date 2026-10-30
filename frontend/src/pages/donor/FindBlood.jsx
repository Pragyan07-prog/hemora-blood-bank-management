import React, { useState } from 'react';
import { Search, MapPin, Phone, Building2, AlertCircle, Droplet } from 'lucide-react';
import inventoryService from '../../services/inventoryService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import BloodGroupBadge from '../../components/shared/BloodGroupBadge';
import { BLOOD_GROUPS } from '../../utils/constants';
import toast from 'react-hot-toast';

export const FindBlood = () => {
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [city, setCity] = useState('');
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      const res = await inventoryService.searchInventory({ blood_group: bloodGroup, city });
      setResults(res.data || []);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl animate-fade-in">
      <div>
        <h2 className="font-heading text-2xl font-bold text-slate-900">Find Blood Availability</h2>
        <p className="text-sm text-slate-500">Query regional storage hubs and hospital centers for current stock</p>
      </div>

      {/* Search Form Card */}
      <Card>
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Blood Group"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            options={BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }))}
            required
          />

          <Input
            label="City or Region"
            placeholder="e.g. Metro City or Westside"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            icon={MapPin}
          />

          <div className="flex items-end">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSearching}
              icon={Search}
            >
              Search Inventory
            </Button>
          </div>
        </form>
      </Card>

      {/* Notice info banner */}
      <div className="p-4 rounded-2xl bg-crimson-50 border border-crimson-100 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-crimson-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-crimson-900 leading-relaxed">
          <strong>Patient Care Protocol:</strong> For emergency surgical releases or acute trauma cases, please ask the attending physician or hospital desk to initiate a prioritized direct dispatch request through the HEMORA helpline at <strong>+1 (800) 555-HEMO</strong>.
        </div>
      </div>

      {/* Search Results */}
      {results && (
        <div className="space-y-4">
          <h3 className="font-heading text-lg font-bold text-slate-900">
            Availability for {bloodGroup} {city ? `in ${city}` : 'Across Network'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((item) => (
              <Card key={item.blood_group} className="border border-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <BloodGroupBadge bloodGroup={item.blood_group} size="md" />
                    <div>
                      <p className="font-bold text-slate-800 text-base">{item.units} Total Units Available</p>
                      <p className="text-xs text-slate-400">Regional Aggregate</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      item.status === 'GOOD'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'LOW'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.status === 'GOOD' ? 'Available' : item.status === 'LOW' ? 'Limited Stock' : 'Critical Low'}
                  </span>
                </div>

                <div className="pt-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Partner Center Allocations:
                  </p>
                  {item.available_centers?.map((ctr, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {ctr.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{ctr.city} • {ctr.contact}</p>
                      </div>
                      <span className="font-heading font-black text-crimson-900 text-base">
                        {ctr.units} units
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FindBlood;
