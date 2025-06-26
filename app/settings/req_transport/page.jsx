'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Loader2, Info, ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import secureLocalStorage from 'react-secure-storage';

const initialFormData = {
  Commodity: '',
  HSN_Code: '',
  Incoterms: '',
  USD: '',
  EURO: '',
  Transit_Days: '',
  Dest_Port: '',
  Free_Days: '',
  Pref_Vessel: '',
  Pref_Service: '',
  Pref_Liners: '',
  Avg_Cont_Per_Mnth: '',
  Remarks: '',
};

const STATIC_LOCATION_VALUE = "GTI, Naidupeta";

export default function PremiumTransportFormFixed() {
  const [apiData, setApiData] = React.useState([]);
  const [locations, setLocations] = React.useState([]);

  const [selectedDate, setSelectedDate] = React.useState(null);
  const [transportType, setTransportType] = React.useState('');
  const [shipmentType, setShipmentType] = React.useState('');
  const [containerSize, setContainerSize] = React.useState('');
  const [weight, setWeight] = React.useState('');

  const [fromLocation, setFromLocation] = React.useState(null);
  const [toLocation, setToLocation] = React.useState(null);

  const [transportOpen, setTransportOpen] = React.useState(false);
  const [shipmentOpen, setShipmentOpen] = React.useState(false);
  const [containerOpen, setContainerOpen] = React.useState(false);
  const [locationOpen, setLocationOpen] = React.useState(false);

  const [formData, setFormData] = React.useState(initialFormData);
  const [createdBy, setCreatedBy] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
      const check_sc = secureLocalStorage.getItem("sc");
      setIsAdmin(check_sc === 'admin');
      if (check_sc !== 'admin') {
        window.location.href = "/";
      }
  }, []);

  React.useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [fieldsRes, locationsRes] = await Promise.all([
          fetch('/api/req_transport/fields'),
          fetch('/api/req_transport/locations')
        ]);
        if (!fieldsRes.ok || !locationsRes.ok) throw new Error('Network response was not ok');
        const fieldsData = await fieldsRes.json();
        const locationsData = await locationsRes.json();
        setApiData(fieldsData.result || []);
        setLocations(locationsData.result.filter(loc => loc.Location) || []);
      } catch (fetchError) {
        console.error('Failed to fetch initial data:', fetchError);
        setError('Failed to load initial data. Please refresh.');
      }
    };
    fetchInitialData();
    const username = secureLocalStorage.getItem('un');
    if (username) setCreatedBy(username);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const transportTypeOptions = React.useMemo(() => [...new Set(apiData.map(item => item.transport_types))], [apiData]);
  const shipmentTypeOptions = React.useMemo(() => !transportType ? [] : [...new Set(apiData.filter(item => item.transport_types === transportType).map(item => item.Shipment_types))], [apiData, transportType]);
  const containerSizeOptions = React.useMemo(() => {
    if (!transportType || !shipmentType) return [];
    const item = apiData.find(d => d.transport_types === transportType && d.Shipment_types === shipmentType);
    return item ? item.container_sizes.split(',').map(s => s.trim()) : [];
  }, [apiData, transportType, shipmentType]);

  const handleReset = () => {
    setSelectedDate(null);
    setTransportType('');
    setShipmentType('');
    setContainerSize('');
    setWeight('');
    setFromLocation(null);
    setToLocation(null);
    setFormData(initialFormData);
    setIsSaved(false);
    setError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setIsSaved(false);
    setError(null);

    const finalFrom = transportType === 'export' ? { Location_Code: 'GTI_NAIDUPETA', Location: STATIC_LOCATION_VALUE } : fromLocation;
    const finalTo = transportType === 'import' ? { Location_Code: 'GTI_NAIDUPETA', Location: STATIC_LOCATION_VALUE } : toLocation;
    
    const payload = {
      requestDate: format(selectedDate, 'yyyy-MM-dd'),
      transportType,
      shipmentType,
      containerSize,
      weight: parseFloat(weight) || 0,
      fromLocation: finalFrom,
      toLocation: finalTo,
      ...formData,
      createdBy,
    };

    try {
      const response = await fetch('/api/req_transport/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Error: ${response.statusText}`);
      }

      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        handleReset();
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const allSelectionsComplete = !!selectedDate && !!transportType && !!shipmentType && !!containerSize && !!weight;
  const locationIsSelected = transportType === 'import' ? !!fromLocation : transportType === 'export' ? !!toLocation : false;
  const allFieldsComplete = allSelectionsComplete && locationIsSelected;

  return (
    <TooltipProvider>
      <div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">New Transport Request</CardTitle>
            <CardDescription>Please fill out the form below.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Request Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="requestDate">Request Date</Label>
                    <div className="relative">
                      <Input
                        id="requestDate"
                        type="date"
                        value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                            const dateValue = e.target.value;
                            const date = dateValue ? new Date(dateValue + 'T00:00:00') : null;
                            setSelectedDate(date);
                            setTransportType('');
                            setShipmentType('');
                            setContainerSize('');
                            setWeight('');
                            setFromLocation(null);
                            setToLocation(null);
                        }}
                        className="w-full pr-8"
                      />
                      <CalendarIcon className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Transport Type</Label>
                    <Popover open={transportOpen} onOpenChange={setTransportOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" disabled={!selectedDate} className="w-full justify-between">
                          <span className="truncate">{transportType || "Select type..."}</span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search type..." />
                          <CommandList>
                            <CommandEmpty>No type found.</CommandEmpty>
                            <CommandGroup>
                              {transportTypeOptions.map((type) => (
                                <CommandItem key={type} value={type} onSelect={(currentValue) => {
                                  const newType = currentValue === transportType ? '' : currentValue;
                                  setTransportType(newType);
                                  setShipmentType('');
                                  setContainerSize('');
                                  setWeight('');
                                  setFromLocation(null);
                                  setToLocation(null);
                                  setTransportOpen(false);
                                }}>
                                  <Check className={cn("mr-2 h-4 w-4", transportType === type ? "opacity-100" : "opacity-0")} />
                                  {type}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Shipment Type</Label>
                    <Popover open={shipmentOpen} onOpenChange={setShipmentOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" disabled={!transportType} className="w-full justify-between">
                          <span className="truncate">{shipmentType || "Select type..."}</span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search type..." />
                          <CommandList>
                            <CommandEmpty>No type found.</CommandEmpty>
                            <CommandGroup>
                              {shipmentTypeOptions.map((type) => (
                                <CommandItem key={type} value={type} onSelect={(currentValue) => {
                                  setShipmentType(currentValue === shipmentType ? '' : currentValue);
                                  setContainerSize('');
                                  setWeight('');
                                  setShipmentOpen(false);
                                }}>
                                  <Check className={cn("mr-2 h-4 w-4", shipmentType === type ? "opacity-100" : "opacity-0")} />
                                  {type}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Container Size</Label>
                    <Popover open={containerOpen} onOpenChange={setContainerOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" disabled={!shipmentType} className="w-full justify-between">
                          <span className="truncate">{containerSize || "Select size..."}</span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search size..." />
                          <CommandList>
                            <CommandEmpty>No size found.</CommandEmpty>
                            <CommandGroup>
                              {containerSizeOptions.map((size) => (
                                <CommandItem key={size} value={size} onSelect={(currentValue) => {
                                  setContainerSize(currentValue === containerSize ? '' : currentValue);
                                  setContainerOpen(false);
                                }}>
                                  <Check className={cn("mr-2 h-4 w-4", containerSize === size ? "opacity-100" : "opacity-0")} />
                                  {size}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (KG)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g., 22000.50"
                      disabled={!containerSize}
                      autoComplete="off"
                      step="0.01"
                    />
                  </div>

                </div>
              </div>

              {containerSize && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Location Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                    <div className="space-y-2">
                      <Label>From</Label>
                      {transportType === 'import' ? (
                        <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between">
                              <span className="truncate">{fromLocation?.Location || "Select location..."}</span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Search location..." />
                              <CommandList>
                                <CommandEmpty>No location found.</CommandEmpty>
                                <CommandGroup>
                                  {locations.map((location) => (
                                    <CommandItem key={location.Location_Code} value={location.Location} onSelect={() => { setFromLocation(location); setLocationOpen(false); }}>
                                      <Check className={cn("mr-2 h-4 w-4", fromLocation?.Location_Code === location.Location_Code ? "opacity-100" : "opacity-0")} />
                                      {location.Location}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <Input value={STATIC_LOCATION_VALUE} disabled className="bg-muted" />
                      )}
                    </div>
                    <div className="self-end pb-2"><ArrowRight className="w-5 h-5 text-muted-foreground" /></div>
                    <div className="space-y-2">
                      <Label>To</Label>
                      {transportType === 'export' ? (
                        <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between">
                              <span className="truncate">{toLocation?.Location || "Select location..."}</span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Search location..." />
                              <CommandList>
                                <CommandEmpty>No location found.</CommandEmpty>
                                <CommandGroup>
                                  {locations.map((location) => (
                                    <CommandItem key={location.Location_Code} value={location.Location} onSelect={() => { setToLocation(location); setLocationOpen(false); }}>
                                      <Check className={cn("mr-2 h-4 w-4", toLocation?.Location_Code === location.Location_Code ? "opacity-100" : "opacity-0")} />
                                      {location.Location}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <Input value={STATIC_LOCATION_VALUE} disabled className="bg-muted" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center">
                  <span>Transport Details</span>
                  {!allSelectionsComplete && (
                    <Tooltip>
                      <TooltipTrigger asChild><Info className="h-4 w-4 ml-2 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent><p>Complete all request selections to enable.</p></TooltipContent>
                    </Tooltip>
                  )}
                </h3>
                <fieldset disabled={!allFieldsComplete} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 disabled:opacity-40 transition-opacity">
                  {[
                    { id: 'Commodity', label: 'Commodity', placeholder: 'e.g., Turbo charger and Engine components/No Commodity' },
                    { id: 'HSN_Code', label: 'HSN Code', placeholder: 'e.g., 851712' },
                    { id: 'Incoterms', label: 'Incoterms', placeholder: 'e.g., DAP' },
                    { id: 'USD', label: 'USD', placeholder: 'e.g., In Indian Rupees' },
                    { id: 'EURO', label: 'EURO', placeholder: 'e.g., In Indian Rupees' },
                    { id: 'Transit_Days', label: 'Transit Days', placeholder: 'e.g., 42' },
                    { id: 'Dest_Port', label: 'Destination Port', placeholder: 'e.g., Antwerp' },
                    { id: 'Free_Days', label: 'Free Days', placeholder: 'e.g., 14' },
                    { id: 'Pref_Vessel', label: 'Preferred Vessel', placeholder: 'e.g., Direct Vessel' },
                    { id: 'Pref_Service', label: 'Preferred Service', placeholder: 'e.g., Truck' },
                    { id: 'Pref_Liners', label: 'Preferred Liners', placeholder: 'e.g., All direct vessel liners preferable' },
                    { id: 'Avg_Cont_Per_Mnth', label: 'Avg Containers/Month', placeholder: 'e.g., 10' }
                  ].map(input => (
                    <div className="space-y-2" key={input.id}>
                      <Label htmlFor={input.id}>{input.label}</Label>
                      <Input id={input.id} name={input.id} value={formData[input.id]} onChange={handleInputChange} placeholder={input.placeholder} autoComplete="off" />
                    </div>
                  ))}
                  
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                    <Label htmlFor="Remarks">Remarks</Label>
                    <Textarea
                      id="Remarks"
                      name="Remarks"
                      value={formData.Remarks}
                      onChange={handleInputChange}
                      placeholder="Add any additional comments or instructions here..."
                      rows={3}
                      autoComplete="off"
                    />
                  </div>

                </fieldset>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end items-center gap-4 border-t pt-6 mt-8">
            {error && <p className="text-sm font-bold text-destructive mr-auto">{error}</p>}
            <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">Reset</Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full sm:w-auto">
                  <Button onClick={handleSave} disabled={!allFieldsComplete || isSaving || isSaved} className="w-full">
                    {isSaving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>)
                      : isSaved ? (<><Check className="mr-2 h-4 w-4" /> Saved Successfully</>)
                        : ('Create Request')}
                  </Button>
                </div>
              </TooltipTrigger>
              {!allFieldsComplete && (
                <TooltipContent><p>Please complete all selections to save.</p></TooltipContent>
              )}
            </Tooltip>
          </CardFooter>
        </Card>
      </div>
    </TooltipProvider>
  );
}