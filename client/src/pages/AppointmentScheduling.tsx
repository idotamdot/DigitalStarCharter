import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, parseISO, isAfter, isBefore } from "date-fns";
import { Calendar as CalendarIcon, Clock, Users, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Sheet, 
  SheetClose, 
  SheetContent, 
  SheetDescription, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define interfaces for our data models
interface ServiceOffering {
  id: number;
  providerId: number;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: string;
  category: string;
  requiredTier: string;
  maxBookingsPerDay: number;
  isActive: boolean;
  createdAt: string;
}

interface Appointment {
  id: number;
  serviceId: number;
  clientId: number;
  providerId: number;
  startTime: string;
  endTime: string;
  timeZone: string;
  status: string;
  notes: string | null;
  meetingLink: string | null;
  createdAt: string;
  updatedAt: string;
  reminderSent: boolean;
  feedbackProvided: boolean;
}

interface Provider {
  id: number;
  fullName: string;
  role: string;
  starName: string;
  starColor: string;
}

// Available time slots for booking
const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM"
];

// Form schema for booking an appointment
const bookingSchema = z.object({
  serviceId: z.coerce.number(),
  date: z.date(),
  timeSlot: z.string(),
  notes: z.string().optional(),
  timezone: z.string().default("UTC"),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

// Status badge colors
const STATUS_COLORS = {
  scheduled: "bg-blue-500",
  confirmed: "bg-green-500",
  completed: "bg-purple-500",
  cancelled: "bg-red-500",
  "no-show": "bg-amber-500",
};

export default function AppointmentScheduling() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<ServiceOffering | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isCancellationDialogOpen, setIsCancellationDialogOpen] = useState(false);

  // Set up form for booking appointments
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: 0,
      date: new Date(),
      timeSlot: "",
      notes: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  // Query for service offerings
  const { 
    data: serviceOfferings = [], 
    isLoading: isLoadingServices 
  } = useQuery({
    queryKey: ['/api/service-offerings'],
    queryFn: async () => {
      const res = await fetch('/api/service-offerings');
      if (!res.ok) {
        throw new Error('Failed to fetch service offerings');
      }
      return res.json();
    }
  });

  // Query for upcoming appointments where the user is the client
  const { 
    data: upcomingAppointments = [], 
    isLoading: isLoadingUpcoming 
  } = useQuery({
    queryKey: ['/api/appointments', 'upcoming'],
    queryFn: async () => {
      const res = await fetch('/api/appointments?upcoming=true');
      if (!res.ok) {
        throw new Error('Failed to fetch upcoming appointments');
      }
      return res.json();
    },
    enabled: !!user,
  });

  // Query for past appointments
  const { 
    data: pastAppointments = [], 
    isLoading: isLoadingPast 
  } = useQuery({
    queryKey: ['/api/appointments', 'past'],
    queryFn: async () => {
      const res = await fetch('/api/appointments');
      if (!res.ok) {
        throw new Error('Failed to fetch past appointments');
      }
      
      // Filter past appointments on the client side
      const appointments = await res.json();
      return appointments.filter((appointment: Appointment) => 
        isAfter(new Date(), new Date(appointment.endTime)) || 
        appointment.status === 'completed' || 
        appointment.status === 'cancelled'
      );
    },
    enabled: !!user,
  });

  // Get provider appointments to check availability
  const {
    data: providerAppointments = [],
    isLoading: isLoadingProviderAppointments
  } = useQuery({
    queryKey: ['/api/appointments', 'provider', selectedService?.providerId],
    queryFn: async () => {
      if (!selectedService) return [];
      
      const res = await fetch(`/api/appointments?asProvider=true&providerId=${selectedService.providerId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch provider appointments');
      }
      return res.json();
    },
    enabled: !!selectedService,
  });

  // Book appointment mutation
  const bookAppointmentMutation = useMutation({
    mutationFn: async (formData: BookingFormValues) => {
      if (!selectedService) {
        throw new Error('No service selected');
      }
      
      const timeSlotHour = parseInt(formData.timeSlot.split(':')[0]);
      const isPM = formData.timeSlot.includes('PM');
      const hour = isPM && timeSlotHour !== 12 ? timeSlotHour + 12 : timeSlotHour;
      const minute = parseInt(formData.timeSlot.split(':')[1]) || 0;
      
      const startDate = new Date(formData.date);
      startDate.setHours(hour, minute, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + selectedService.durationMinutes);
      
      const appointmentData = {
        serviceId: formData.serviceId,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        timeZone: formData.timezone,
        notes: formData.notes,
      };
      
      const response = await apiRequest('POST', '/api/appointments', appointmentData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Appointment Booked",
        description: "Your appointment has been successfully scheduled.",
      });
      setIsBookingSheetOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: error.message || "There was an error booking your appointment.",
      });
    },
  });

  // Cancel appointment mutation
  const cancelAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      await apiRequest('POST', `/api/appointments/${appointmentId}/cancel`);
    },
    onSuccess: () => {
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been successfully cancelled.",
      });
      setIsCancellationDialogOpen(false);
      setIsAppointmentDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Cancellation Failed",
        description: error.message || "There was an error cancelling your appointment.",
      });
    },
  });

  // Filter available time slots based on provider's appointments
  const getAvailableTimeSlots = () => {
    if (!selectedDate || !selectedService) {
      return [];
    }
    
    // Check which time slots are already booked
    const bookedSlots = providerAppointments
      .filter((appointment: Appointment) => {
        const appointmentDate = new Date(appointment.startTime);
        return (
          appointmentDate.getDate() === selectedDate.getDate() &&
          appointmentDate.getMonth() === selectedDate.getMonth() &&
          appointmentDate.getFullYear() === selectedDate.getFullYear() &&
          appointment.status !== 'cancelled'
        );
      })
      .map((appointment: Appointment) => {
        const start = new Date(appointment.startTime);
        const end = new Date(appointment.endTime);
        return { start, end };
      });
    
    // Filter out booked time slots
    return TIME_SLOTS.filter(timeSlot => {
      const [hourStr, minuteStr] = timeSlot.split(':');
      let hour = parseInt(hourStr);
      const isPM = timeSlot.includes('PM');
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
      
      const minute = parseInt(minuteStr);
      
      const slotStart = new Date(selectedDate);
      slotStart.setHours(hour, minute, 0, 0);
      
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + selectedService.durationMinutes);
      
      // If the slot is in the past, it's not available
      if (isBefore(slotStart, new Date())) {
        return false;
      }
      
      // Check if the slot overlaps with any booked appointments
      for (const bookedSlot of bookedSlots) {
        if (
          (slotStart >= bookedSlot.start && slotStart < bookedSlot.end) ||
          (slotEnd > bookedSlot.start && slotEnd <= bookedSlot.end) ||
          (slotStart <= bookedSlot.start && slotEnd >= bookedSlot.end)
        ) {
          return false;
        }
      }
      
      return true;
    });
  };

  const availableTimeSlots = getAvailableTimeSlots();

  // Handle selecting a service
  const handleServiceSelect = (service: ServiceOffering) => {
    setSelectedService(service);
    form.setValue('serviceId', service.id);
    setIsBookingSheetOpen(true);
  };

  // Group services by tier
  const groupedServices = serviceOfferings.reduce((acc: Record<string, ServiceOffering[]>, service: ServiceOffering) => {
    if (!acc[service.requiredTier]) {
      acc[service.requiredTier] = [];
    }
    acc[service.requiredTier].push(service);
    return acc;
  }, {});

  // Handle form submission
  const onSubmit = (data: BookingFormValues) => {
    bookAppointmentMutation.mutate(data);
  };

  // Handle viewing appointment details
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentDialogOpen(true);
  };

  // Format appointment date/time
  const formatAppointmentTime = (appointment: Appointment) => {
    const start = new Date(appointment.startTime);
    return `${format(start, 'MMMM d, yyyy')} at ${format(start, 'h:mm a')}`;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Scheduling</CardTitle>
            <CardDescription>
              Please log in to book appointments with our constellation members.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/auth")}>Log In / Register</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Appointment Scheduling</h1>
          <p className="text-muted-foreground">
            Book consultations and services with our constellation of professionals
          </p>
        </div>

        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services">Available Services</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
            <TabsTrigger value="past">Past Appointments</TabsTrigger>
          </TabsList>

          {/* Available Services Tab */}
          <TabsContent value="services" className="space-y-4">
            {Object.keys(groupedServices).length === 0 ? (
              <Alert>
                <AlertTitle>No services available</AlertTitle>
                <AlertDescription>
                  There are currently no services available for booking. Please check back later.
                </AlertDescription>
              </Alert>
            ) : (
              Object.entries(groupedServices).map(([tier, services]) => (
                <div key={tier} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{tier} Services</h2>
                    <Badge variant="outline">{services.length} Available</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service: ServiceOffering) => (
                      <Card key={service.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <CardTitle>{service.title}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {service.durationMinutes} minutes
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                          <div className="mt-3 flex items-center font-medium">
                            {service.price > 0 ? (
                              <p>{new Intl.NumberFormat('en-US', { style: 'currency', currency: service.currency }).format(service.price)}</p>
                            ) : (
                              <p>Free consultation</p>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            onClick={() => handleServiceSelect(service)}
                            className="w-full"
                          >
                            Book Appointment
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  <Separator className="my-6" />
                </div>
              ))
            )}
          </TabsContent>

          {/* Upcoming Appointments Tab */}
          <TabsContent value="upcoming" className="space-y-4">
            {isLoadingUpcoming ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <Alert>
                <AlertTitle>No upcoming appointments</AlertTitle>
                <AlertDescription>
                  You don't have any upcoming appointments. Schedule a consultation or service to get started.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingAppointments.map((appointment: Appointment) => {
                  const service = serviceOfferings.find((s: ServiceOffering) => s.id === appointment.serviceId);
                  return (
                    <Card 
                      key={appointment.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{service?.title || "Appointment"}</CardTitle>
                          <Badge className={STATUS_COLORS[appointment.status] || ""}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                        </div>
                        <CardDescription>
                          {formatAppointmentTime(appointment)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm">
                          <p className="font-medium">Duration: {service?.durationMinutes || 30} minutes</p>
                          {appointment.meetingLink && (
                            <p className="mt-2">
                              <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                Join Meeting
                              </a>
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Past Appointments Tab */}
          <TabsContent value="past" className="space-y-4">
            {isLoadingPast ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : pastAppointments.length === 0 ? (
              <Alert>
                <AlertTitle>No past appointments</AlertTitle>
                <AlertDescription>
                  You don't have any past appointments. Once you complete consultations, they will appear here.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastAppointments.map((appointment: Appointment) => {
                  const service = serviceOfferings.find((s: ServiceOffering) => s.id === appointment.serviceId);
                  return (
                    <Card 
                      key={appointment.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{service?.title || "Appointment"}</CardTitle>
                          <Badge className={STATUS_COLORS[appointment.status] || ""}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                        </div>
                        <CardDescription>
                          {formatAppointmentTime(appointment)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm">
                          <p className="font-medium">Duration: {service?.durationMinutes || 30} minutes</p>
                          {!appointment.feedbackProvided && appointment.status === "completed" && (
                            <Button variant="outline" size="sm" className="mt-2">
                              Provide Feedback
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Booking Sheet */}
        <Sheet open={isBookingSheetOpen} onOpenChange={setIsBookingSheetOpen}>
          <SheetContent className="sm:max-w-lg w-full">
            <SheetHeader>
              <SheetTitle>Book an Appointment</SheetTitle>
              <SheetDescription>
                {selectedService && (
                  <span>
                    {selectedService.title} ({selectedService.durationMinutes} minutes)
                  </span>
                )}
              </SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "MMMM d, yyyy")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setSelectedDate(date);
                                form.setValue("timeSlot", "");
                              }}
                              disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeSlot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedDate}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a time slot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {availableTimeSlots.length === 0 ? (
                                <SelectItem value="none" disabled>
                                  No available times
                                </SelectItem>
                              ) : (
                                availableTimeSlots.map((slot) => (
                                  <SelectItem key={slot} value={slot}>
                                    {slot}
                                  </SelectItem>
                                ))
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any information that might help the provider prepare for your appointment"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Zone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Automatically set to your local timezone
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <SheetFooter>
                    <Button 
                      type="submit" 
                      disabled={bookAppointmentMutation.isPending || !form.getValues("timeSlot")}
                    >
                      {bookAppointmentMutation.isPending ? "Booking..." : "Book Appointment"}
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </div>
          </SheetContent>
        </Sheet>

        {/* Appointment Details Dialog */}
        <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>
                {selectedAppointment && (
                  <span>
                    {formatAppointmentTime(selectedAppointment)}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            {selectedAppointment && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Service</h3>
                  <p>
                    {serviceOfferings.find(
                      (s: ServiceOffering) => s.id === selectedAppointment.serviceId
                    )?.title || "Appointment"}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Status</h3>
                  <Badge className={STATUS_COLORS[selectedAppointment.status] || ""}>
                    {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                  </Badge>
                </div>

                {selectedAppointment.meetingLink && (
                  <div>
                    <h3 className="font-medium">Meeting Link</h3>
                    <a 
                      href={selectedAppointment.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Join Meeting
                    </a>
                  </div>
                )}

                {selectedAppointment.notes && (
                  <div>
                    <h3 className="font-medium">Notes</h3>
                    <p className="text-sm text-muted-foreground">{selectedAppointment.notes}</p>
                  </div>
                )}

                {selectedAppointment.status === "scheduled" && (
                  <DialogFooter>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setIsCancellationDialogOpen(true);
                      }}
                    >
                      Cancel Appointment
                    </Button>
                  </DialogFooter>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Cancellation Confirmation Dialog */}
        <Dialog open={isCancellationDialogOpen} onOpenChange={setIsCancellationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCancellationDialogOpen(false)}
              >
                Keep Appointment
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedAppointment) {
                    cancelAppointmentMutation.mutate(selectedAppointment.id);
                  }
                }}
                disabled={cancelAppointmentMutation.isPending}
              >
                {cancelAppointmentMutation.isPending ? "Cancelling..." : "Yes, Cancel"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}