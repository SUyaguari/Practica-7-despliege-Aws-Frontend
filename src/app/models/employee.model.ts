export interface Employee {
  id: string;
  nombre: string;
  cargo: string;
  departamento: string;
  sueldo: number;
}

// Derivados de Employee (no declarados a mano) para que un cambio de campo se
// propague automáticamente aquí; reflejan los mismos shapes que createEmployeeSchema
// / updateEmployeeSchema en el backend (backend/src/dtos/employee.dto.ts).
export type CreateEmployeeRequest = Omit<Employee, 'id'>;
export type UpdateEmployeeRequest = Partial<CreateEmployeeRequest>;
