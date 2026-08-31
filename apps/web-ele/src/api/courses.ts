import { requestClient } from '#/api/request';

/**
 * 课程数据模型（对应后端 CourseOut 契约）
 */
export interface CourseItem {
  id: number;
  title: string;
  content?: string | null;
  address: string;
  startTime: string; // YYYY-MM-DD HH:mm:ss
  endTime: string; // YYYY-MM-DD HH:mm:ss
  teacherId?: number | null;
  createdBy?: number | null;
  maxCapacity: number;
  currentCapacity: number;
  status: number; // 1=招募中, 2=已满额, 3=上课中, 4=已结束, 5=已取消
  createdTime?: string;
  updatedTime?: string;
}

/** 学员考勤核验明细模型 */
export interface CheckinLogItem {
  id: number;
  reservationId: number;
  courseId: number;
  userId: number;
  snapshotName?: string | null;
  snapshotPhone?: string | null;
  checkinTime: string;
  operatorType: number;
}

export interface CourseQueryParams {
  status?: number | null;
  pageNum?: number;
  pageSize?: number;
  page?: number;
  limit?: number;
}

export interface CourseCreatePayload {
  title: string;
  address: string;
  startTime: string;
  endTime: string;
  content?: string | null;
  teacherId?: number | null;
  maxCapacity?: number;
  status?: number;
}

export interface CourseUpdatePayload {
  title?: string | null;
  content?: string | null;
  address?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  teacherId?: number | null;
  maxCapacity?: number | null;
  status?: number | null;
}

/**
 * [管理后台] 分页查询课程列表
 */
export async function getAdminCoursesApi(params?: CourseQueryParams) {
  return requestClient.get<{
    items: CourseItem[];
    count: number;
    page?: number;
    pageSize?: number;
  }>('/admin/courses/', {
    params,
  });
}

/**
 * [管理后台] 发布新课程
 */
export async function createAdminCourseApi(data: CourseCreatePayload) {
  return requestClient.post<CourseItem>('/admin/courses/', data);
}

/**
 * [管理后台] 编辑课程信息
 */
export async function updateAdminCourseApi(
  courseId: number | string,
  data: CourseUpdatePayload,
) {
  return requestClient.put<CourseItem>(`/admin/courses/${courseId}`, data);
}

/**
 * [管理后台] 删除课程
 */
export async function deleteAdminCourseApi(courseId: number | string) {
  return requestClient.delete(`/admin/courses/${courseId}`);
}

/**
 * [管理后台] 查看课程学员签到核验名册
 */
export async function getCourseCheckinsApi(courseId: number | string) {
  return requestClient.get<{
    items: CheckinLogItem[];
    count: number;
  }>(`/admin/courses/${courseId}/checkins`);
}

/**
 * [管理后台/教师] 手动代学员完成打卡
 */
export async function teacherCheckinApi(reservationId: number | string) {
  return requestClient.post(`/admin/courses/reservations/${reservationId}/teacher-checkin`);
}
