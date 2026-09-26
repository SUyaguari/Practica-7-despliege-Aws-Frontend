import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize, type Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  CreateEmployeeRequest,
  Employee,
  PaginatedEmployees,
  PaginationMeta,
  UpdateEmployeeRequest,
} from '../models/employee.model';

interface EmployeeResponse {
  success: boolean;
  message: string;
  data: Employee;
}

interface EmployeeListResponse {
  success: boolean;
  message: string;
  data: PaginatedEmployees | Employee[];
}

const initialPagination: PaginationMeta = {
  page: 1,
  limit: 5,
  total: 0,
  totalPages: 0,
};

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly apiUrl = `${environment.apiBaseUrl}/empleados`;
  private legacyEmployeesCache: Employee[] | null = null;

  private readonly employeesSubject = new BehaviorSubject<Employee[]>([]);
  private readonly paginationSubject = new BehaviorSubject<PaginationMeta>(initialPagination);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly employees$: Observable<Employee[]> = this.employeesSubject.asObservable();
  readonly pagination$: Observable<PaginationMeta> = this.paginationSubject.asObservable();
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();
  readonly error$: Observable<string | null> = this.errorSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  loadEmployees(page = this.paginationSubject.value.page, limit = this.paginationSubject.value.limit): void {
    if (this.legacyEmployeesCache) {
      this.publishLocalPage(this.legacyEmployeesCache, page, limit);
      return;
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.http
      .get<EmployeeListResponse>(this.apiUrl, {
        params: {
          page,
          limit,
        },
      })
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (response) => {
          if (Array.isArray(response.data)) {
            this.legacyEmployeesCache = response.data;
            this.publishLocalPage(response.data, page, limit);
            return;
          }

          this.legacyEmployeesCache = null;
          this.publishPaginatedResponse(response.data, page, limit);
        },
        error: () => {
          this.errorSubject.next('No se pudo cargar la lista de empleados.');
        },
      });
  }

  private publishLocalPage(data: Employee[], page: number, limit: number): void {
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.min(page, totalPages || 1);
    const start = (currentPage - 1) * limit;

    this.employeesSubject.next(data.slice(start, start + limit));
    this.paginationSubject.next({
      total,
      page: currentPage,
      limit,
      totalPages,
    });
  }

  private publishPaginatedResponse(data: PaginatedEmployees, page: number, limit: number): void {
    const normalizedPage = data.page ?? page;
    const normalizedLimit = data.limit ?? limit;

    this.employeesSubject.next([...data.items]);
    this.paginationSubject.next({
      page: normalizedPage,
      limit: normalizedLimit,
      total: data.total,
      totalPages: data.totalPages,
    });
  }

  private invalidateLegacyCache(): void {
    this.legacyEmployeesCache = null;
  }

  createEmployee(data: CreateEmployeeRequest): void {
    this.errorSubject.next(null);

    this.http.post<EmployeeResponse>(this.apiUrl, data).subscribe({
      next: () => {
        this.invalidateLegacyCache();
        this.loadEmployees(1, this.paginationSubject.value.limit);
      },
      error: () => {
        this.errorSubject.next('No se pudo guardar el empleado.');
      },
    });
  }

  updateEmployee(id: string, data: UpdateEmployeeRequest): void {
    this.errorSubject.next(null);

    this.http.put<EmployeeResponse>(`${this.apiUrl}/${id}`, data).subscribe({
      next: () => {
        this.invalidateLegacyCache();
        this.loadEmployees(this.paginationSubject.value.page, this.paginationSubject.value.limit);
      },
      error: () => {
        this.errorSubject.next('No se pudo actualizar el empleado.');
      },
    });
  }

  deleteEmployee(id: string): void {
    this.errorSubject.next(null);

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        const { page, limit, total } = this.paginationSubject.value;
        const shouldGoBack = this.employeesSubject.value.length === 1 && page > 1 && total > 1;
        this.invalidateLegacyCache();
        this.loadEmployees(shouldGoBack ? page - 1 : page, limit);
      },
      error: () => {
        this.errorSubject.next('No se pudo eliminar el empleado.');
      },
    });
  }
}
