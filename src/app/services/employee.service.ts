import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize, type Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  CreateEmployeeRequest,
  Employee,
  UpdateEmployeeRequest,
} from '../models/employee.model';

// Reflejan solo los campos que este servicio realmente lee del ApiResponse del
// backend (api-response.ts); success/message/errors/timestamp también viajan
// pero no se tipan aquí porque no se usan.
interface EmployeeResponse {
  success: boolean;
  message: string;
  data: Employee;
}

interface EmployeeListResponse {
  success: boolean;
  message: string;
  data: Employee[];
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly apiUrl = `${environment.apiBaseUrl}/empleados`;

  // Los Subject son privados y solo mutables desde este servicio; los componentes
  // (Smart/Dumb) reciben las versiones de solo lectura de abajo vía async pipe,
  // nunca pueden llamar a .next() directamente. Esto centraliza el estado reactivo.
  private readonly employeesSubject = new BehaviorSubject<Employee[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly employees$: Observable<Employee[]> = this.employeesSubject.asObservable();
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();
  readonly error$: Observable<string | null> = this.errorSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  loadEmployees(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.http
      .get<EmployeeListResponse>(this.apiUrl)
      // finalize corre tanto en success como en error: garantiza apagar el loading
      // sin duplicar esa línea en los dos callbacks de abajo.
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (response) => {
          // Se clona el arreglo (spread) en vez de reasignar response.data tal cual:
          // mantiene la disciplina de inmutabilidad aunque acá no sea estrictamente
          // necesario, para que todo mutation del estado siga el mismo patrón.
          this.employeesSubject.next([...response.data]);
        },
        error: () => {
          this.errorSubject.next('No se pudo cargar la lista de empleados.');
        },
      });
  }

  createEmployee(data: CreateEmployeeRequest): void {
    this.errorSubject.next(null);

    this.http.post<EmployeeResponse>(this.apiUrl, data).subscribe({
      next: (response) => {
        // Nunca se hace push() sobre el arreglo existente: se construye uno nuevo
        // con spread para que BehaviorSubject emita una referencia distinta y
        // Angular/RxJS detecten el cambio de forma predecible.
        const currentEmployees = this.employeesSubject.value;
        this.employeesSubject.next([...currentEmployees, response.data]);
      },
      error: () => {
        this.errorSubject.next('No se pudo guardar el empleado.');
      },
    });
  }

  updateEmployee(id: string, data: UpdateEmployeeRequest): void {
    this.errorSubject.next(null);

    this.http.put<EmployeeResponse>(`${this.apiUrl}/${id}`, data).subscribe({
      next: (response) => {
        const currentEmployees = this.employeesSubject.value;
        // .map() en vez de mutar el objeto encontrado: solo la fila editada se
        // reemplaza por el registro que devuelve el backend (fuente de verdad),
        // el resto del arreglo conserva sus referencias intactas.
        const updatedEmployees = currentEmployees.map((employee) =>
          employee.id === id ? response.data : employee,
        );

        this.employeesSubject.next([...updatedEmployees]);
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
        const currentEmployees = this.employeesSubject.value;
        // .filter() descarta el eliminado sin tocar los demás elementos; el 200
        // sin body del DELETE (ver controller) confirma que ya no existe en la DB.
        const remainingEmployees = currentEmployees.filter((employee) => employee.id !== id);
        this.employeesSubject.next([...remainingEmployees]);
      },
      error: () => {
        this.errorSubject.next('No se pudo eliminar el empleado.');
      },
    });
  }
}
