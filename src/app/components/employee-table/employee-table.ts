import { CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { Employee, PaginationMeta } from '../../models/employee.model';

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
  @Input() pagination: PaginationMeta | null = null;
  @Input() selectedEmployeeId: string | null = null;
  @Output() readonly editEmployee = new EventEmitter<Employee>();
  @Output() readonly deleteEmployee = new EventEmitter<string>();
  @Output() readonly pageChange = new EventEmitter<number>();
  @Output() readonly pageSizeChange = new EventEmitter<number>();

  readonly pageSizeOptions = [5, 10, 20, 50];

  // employees puede llegar null en el primer render (el observable del padre aún
  // no emitió); este getter evita repetir `?? []` en el template.
  get employeeList(): Employee[] {
    return this.employees ?? [];
  }

  get currentPage(): number {
    return this.pagination?.page ?? 1;
  }

  get currentLimit(): number {
    return this.pagination?.limit ?? this.pageSizeOptions[0];
  }

  get totalRecords(): number {
    return this.pagination?.total ?? this.employeeList.length;
  }

  get totalPages(): number {
    return this.pagination?.totalPages ?? 0;
  }

  get firstRecord(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage - 1) * this.currentLimit + 1;
  }

  get lastRecord(): number {
    return Math.min(this.currentPage * this.currentLimit, this.totalRecords);
  }

  get hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  get hasNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }

  requestEdit(employee: Employee): void {
    this.editEmployee.emit(employee);
  }

  isSelected(employee: Employee): boolean {
    return employee.id === this.selectedEmployeeId;
  }

  requestDelete(id: string): void {
    this.deleteEmployee.emit(id);
  }

  requestPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  requestPreviousPage(): void {
    this.requestPage(this.currentPage - 1);
  }

  requestNextPage(): void {
    this.requestPage(this.currentPage + 1);
  }

  requestPageSize(event: Event): void {
    const limit = Number((event.target as HTMLSelectElement).value);
    if (!Number.isFinite(limit) || limit === this.currentLimit) return;
    this.pageSizeChange.emit(limit);
  }
}
