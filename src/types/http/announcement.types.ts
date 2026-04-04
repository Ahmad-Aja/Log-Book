export enum AnnouncementTargetAudience {
  STUDENTS = "students",
  SUPERVISORS = "supervisors",
  ALL = "all",
}

export interface AnnouncementCreatedBy {
  id: number;
  username: string;
  fullName: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  targetAudience: AnnouncementTargetAudience;
  attachments: string[];
  createdById: number;
  createdBy: AnnouncementCreatedBy;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  type: string;
  targetAudience: AnnouncementTargetAudience;
  attachments?: string[];
}

export interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
  type?: string;
  targetAudience?: AnnouncementTargetAudience;
  attachments?: string[];
}

export interface AnnouncementFilters {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  createdFrom?: string;
  createdTo?: string;
}

export interface AnnouncementStatistics {
  total: number;
  thisMonth: number;
  thisWeek: number;
}
