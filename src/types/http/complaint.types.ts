export enum ComplaintStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

export enum ComplaintCategory {
  TECHNICAL = "technical",
  ADMINISTRATIVE = "administrative",
  ACADEMIC = "academic",
  OTHER = "other",
}

export enum ComplaintCreatorType {
  STUDENT = "student",
  SUPERVISOR = "supervisor",
}

export enum ComplaintSenderType {
  STUDENT = "student",
  SUPERVISOR = "supervisor",
  ADMIN = "admin",
}

export interface ComplaintMessage {
  id: number;
  complaintId: number;
  senderId: number;
  senderType: ComplaintSenderType;
  message: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Complaint {
  id: number;
  creatorId: number;
  creatorType: ComplaintCreatorType;
  category: ComplaintCategory;
  status: ComplaintStatus;
  messages: ComplaintMessage[];
  createdAt: string;
  updatedAt: string;
  creatorDetails?: { fullName: string };
}

export interface ComplaintSummary {
  id: number;
  creatorId: number;
  creatorType: ComplaintCreatorType;
  category: ComplaintCategory;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  creatorDetails?: { fullName: string };
}

export interface AddComplaintMessageDto {
  message: string;
  attachments?: string[];
}

export interface UpdateComplaintStatusDto {
  status: ComplaintStatus;
}

export interface ComplaintFilters {
  page: number;
  limit: number;
  category?: ComplaintCategory;
  status?: ComplaintStatus;
  creatorType?: ComplaintCreatorType;
  creatorId?: number;
  createdFrom?: string;
  createdTo?: string;
}

export interface ComplaintStatistics {
  totalComplaints: number;
  statusBreakdown: {
    pending: number;
    in_progress: number;
    resolved: number;
    closed: number;
  };
}
