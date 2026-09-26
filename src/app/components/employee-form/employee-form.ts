import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { CreateEmployeeRequest, Employee, UpdateEmployeeRequest } from '../../models/employee.model';

const emptyEmployee = { nombre: '', cargo: '', departamento: '', sueldo: 0 };

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-employee-form',
  styleUrl: './employee-form.scss',
  templateUrl: './employee-form.html',
})
export class EmployeeFormComponent implements OnChanges {
  // Cuando es null el formulario está en modo "crear"; con un empleado, en modo "editar".
  @Input() employee: Employee | null = null;
  @Input() loading: boolean | null = false;
  @Output() readonly createEmployee = new EventEmitter<CreateEmployeeRequest>();
  @Output() readonly updateEmployee = new EventEmitter<{ id: string; data: UpdateEmployeeRequest }>();
  @Output() readonly cancelEdit = new EventEmitter<void>();

  private readonly formBuilder = inject(FormBuilder);

  readonly employeeForm = this.formBuilder.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    cargo: ['', [Validators.required, Validators.minLength(3)]],
    departamento: ['', [Validators.required, Validators.minLength(2)]],
    sueldo: [0, [Validators.required, Validators.min(1)]],
  });

  get isEditing(): boolean {
    return this.employee !== null;
  }

  // El componente padre (App) es quien decide el modo asignando @Input() employee;
  // este componente solo reacciona precargando el form cuando ese input cambia.
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['employee']) return;

    this.employeeForm.reset(this.employee ?? emptyEmployee);
  }

  submitForm(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    // Mismo formulario, dos intenciones distintas: si hay un empleado cargado se
    // emite updateEmployee (PUT) con su id; si no, createEmployee (POST). El padre
    // decide a qué método del servicio mapear cada evento.
    if (this.employee) {
      this.updateEmployee.emit({ id: this.employee.id, data: this.employeeForm.getRawValue() });
      return;
    }

    this.createEmployee.emit({ ...this.employeeForm.getRawValue() });
    this.employeeForm.reset(emptyEmployee);
  }

  cancel(): void {
    this.employeeForm.reset(emptyEmployee);
    this.cancelEdit.emit();
  }
}
