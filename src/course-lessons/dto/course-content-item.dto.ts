export type CourseContentType = 'lesson' | 'quiz';

export interface CourseContentItemDto {
  id: string;
  title: string;
  createdAt: Date;
  courseId: string;
  moduleId?: string;
  type: CourseContentType;
}
