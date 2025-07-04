/**
 * @typedef {Object} User
 * @property {number} id - ID único del usuario
 * @property {string} firstName - Nombre del usuario
 * @property {string} lastName - Apellido del usuario
 * @property {string} documentType - Tipo de documento (DNI, CE, PASAPORTE)
 * @property {string} documentNumber - Número de documento
 * @property {string} email - Correo electrónico
 * @property {string} role - Rol del usuario
 * @property {string} [password] - Contraseña (solo al crear o actualizar)
 * @property {string} userImageBase64 - Imagen del usuario en base64
 * @property {string} status - Estado del usuario (A: Activo, I: Inactivo)
 */

export class User {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.firstName = data.firstName ?? '';
    this.lastName = data.lastName ?? '';
    this.documentType = data.documentType ?? '';
    this.documentNumber = data.documentNumber ?? '';
    this.email = data.email ?? '';
    this.password = data.password ?? null;
    this.role = data.role ?? '';
    this.status = data.status ?? '';
    this.userImageBase64 = data.userImageBase64 ?? null;
  }

  static fromApiResponse(apiResponse) {
    return new User({
      id: apiResponse.id,
      firstName: apiResponse.firstName,
      lastName: apiResponse.lastName,
      documentType: apiResponse.documentType,
      documentNumber: apiResponse.documentNumber,
      email: apiResponse.email,
      role: apiResponse.role,
      status: apiResponse.status,
      userImageBase64: apiResponse.userImageBase64
    });
  }

  toCreateRequest() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      documentType: this.documentType,
      documentNumber: this.documentNumber,
      email: this.email,
      password: this.password,
      role: this.role,
      status: this.status,
      userImageBase64: this.userImageBase64
    };
  }

  toUpdateRequest() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      documentType: this.documentType,
      documentNumber: this.documentNumber,
      email: this.email,
      password: this.password,
      role: this.role,
      status: this.status,
      userImageBase64: this.userImageBase64
    };
  }

  isValidForCreation() {
    return (
      this.firstName.trim() &&
      this.lastName.trim() &&
      this.email.trim() &&
      this.password &&
      this.role &&
      this.status
    );
  }

  isValidForUpdate() {
    return (
      this.firstName &&
      this.lastName &&
      this.email &&
      this.role &&
      this.status
    );
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  isActive() {
    return this.status === UserStatus.ACTIVE;
  }

  isInactive() {
    return this.status === UserStatus.INACTIVE;
  }
}

export const DocumentType = {
  DNI: "DNI",
  CE: "CE",
  PASSPORT: "PASAPORTE"
};

export const UserStatus = {
  ACTIVE: "A",
  INACTIVE: "I"
};

export const UserRole = {
  ADMIN: "ADMIN",
  USER: "USER"
};
