import { AsyncPipe, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { EmployeeFormComponent } from './components/employee-form/employee-form';
import { EmployeeTableComponent } from './components/employee-table/employee-table';
import type { CreateEmployeeRequest, Employee, UpdateEmployeeRequest } from './models/employee.model';
import { EmployeeService } from './services/employee.service';

@Component({
  imports: [AsyncPipe, EmployeeFormComponent, EmployeeTableComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
// Smart component: es el único que conoce EmployeeService e inyecta estado real.
// employee-form y employee-table son Dumb components — solo reciben datos por
// @Input() y notifican intenciones por @Output(), nunca llaman al servicio.
export class App implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly platformId = inject(PLATFORM_ID);

  // Los observables se exponen tal cual (sin .subscribe() aquí); el template los
  // consume con `async` pipe, que además se desuscribe solo al destruir la vista.
  readonly employees$ = this.employeeService.employees$;
  readonly pagination$ = this.employeeService.pagination$;
  readonly loading$ = this.employeeService.loading$;
  readonly error$ = this.employeeService.error$;

  // Empleado seleccionado para edición; null mantiene el formulario en modo "crear".
  editingEmployee: Employee | null = null;

  ngOnInit(): void {
    // SSR (Angular Universal) ejecuta este componente también en Node, donde no
    // hay backend HTTP disponible durante el render; se evita el fetch ahí y se
    // carga solo cuando el código corre en el navegador.
    if (isPlatformBrowser(this.platformId)) {
      this.employeeService.loadEmployees();
    }
  }

  createEmployee(employee: CreateEmployeeRequest): void {
    this.employeeService.createEmployee(employee);
  }

  startEdit(employee: Employee): void {
    this.editingEmployee = employee;
  }

  updateEmployee(event: { id: string; data: UpdateEmployeeRequest }): void {
    this.employeeService.updateEmployee(event.id, event.data);
    this.editingEmployee = null;
  }

  cancelEdit(): void {
    this.editingEmployee = null;
  }

  deleteEmployee(id: string): void {
    this.employeeService.deleteEmployee(id);
  }

  changePage(page: number): void {
    this.editingEmployee = null;
    this.employeeService.loadEmployees(page);
  }

  changePageSize(limit: number): void {
    this.editingEmployee = null;
    this.employeeService.loadEmployees(1, limit);
  }
}
