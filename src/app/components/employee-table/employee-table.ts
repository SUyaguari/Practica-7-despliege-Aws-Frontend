import { CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { Employee } from '../../models/employee.model';

@Component({
  imports: [CurrencyPipe],
  selector: 'app-employee-table',
  styleUrl: './employee-table.scss',
  templateUrl: './employee-table.html',
})
// Dumb component: no inyecta EmployeeService ni decide qué pasa con los clics,
// solo emite la intención (editar/eliminar) hacia arriba vía @Output().
export class EmployeeTableComponent {
  @Input() employees: Employee[] | null = [];
  @Output() readonly editEmployee = new EventEmitter<Employee>();
  @Output() readonly deleteEmployee = new EventEmitter<string>();

  // employees puede llegar null en el primer render (el observable del padre aún
  // no emitió); este getter evita repetir `?? []` en el template.
  get employeeList(): Employee[] {
    return this.employees ?? [];
  }

  requestEdit(employee: Employee): void {
    this.editEmployee.emit(employee);
  }

  requestDelete(id: string): void {
    this.deleteEmployee.emit(id);
  }
}
