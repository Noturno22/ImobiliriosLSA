import type {
  AppointmentStatus,
  LeadSource,
  LeadStatus,
  RequestType,
} from "./enums";

export interface Lead {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  propertyId?: string | null;
  source: LeadSource;
  requestType: RequestType;
  message?: string | null;
  /** Whether the contact consented to being contacted / data processing. */
  consent: boolean;
  status: LeadStatus;
  assignedAgentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  propertyId: string;
  leadId: string;
  assignedAgentId?: string | null;
  requestedAt: string;
  timezone: string;
  status: AppointmentStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}
