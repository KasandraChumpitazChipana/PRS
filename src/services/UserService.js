import axios from "axios";
import { User } from "../types/User";

// URL base de la API
const BASE_URL = "https://yeasty-fedora-kasandrachumpitazchipana-f6aec34b.koyeb.app";
const API_URL = `${BASE_URL}/api/users`;

// Configuración global de axios
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor para manejo de errores
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout: La solicitud tardó demasiado tiempo');
    } else if (error.response) {
      console.error('Error de respuesta:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Error de red:', error.message);
    }
    return Promise.reject(error);
  }
);

export const UserService = {
  /**
   * Obtiene todos los usuarios con logging mejorado
   * @returns {Promise<User[]>}
   */
  async findAll() {
    try {
      console.log('🔍 Obteniendo todos los usuarios...');
      const response = await axios.get(API_URL);
      console.log('📡 Respuesta cruda del servidor:', response.data);
      
      const flux = response.data;
      let users = [];
      
      // Si el backend devuelve un Flux directamente (sin wrapper)
      if (Array.isArray(flux)) {
        users = flux.map(User.fromApiResponse);
      }
      // Si el backend devuelve un Flux dentro de un Mono ResponseEntity
      else if (flux?.data) {
        users = flux.data.map(User.fromApiResponse);
      }
      // Si viene envuelto en otro formato
      else if (flux?.content) {
        users = flux.content.map(User.fromApiResponse);
      }
      
      console.log('👥 Usuarios procesados:', users.length);
      console.log('📊 Estadísticas por estado:');
      const activeUsers = users.filter(user => user.status === "A");
      const inactiveUsers = users.filter(user => user.status === "I");
      console.log(`   - Activos (A): ${activeUsers.length}`);
      console.log(`   - Inactivos (I): ${inactiveUsers.length}`);
      
      // Log de algunos usuarios para verificar formato
      if (users.length > 0) {
        console.log('📋 Muestra de usuarios:');
        users.slice(0, 3).forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.getFullName()} - Estado: ${user.status}`);
        });
      }
      
      return users;
    } catch (error) {
      console.error("❌ Error al obtener los usuarios", error);
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  },
  async findInactive() {
  try {
    console.log('🔍 Obteniendo usuarios inactivos...');
    const response = await axios.get(`${API_URL}/inactive`);
    console.log('📡 Respuesta cruda de inactivos:', response.data);

    let payload = response.data;
    let users = [];

    // Si viene envuelto en ResponseEntity { data: [...] }
    if (payload?.data && Array.isArray(payload.data)) {
      users = payload.data.map(User.fromApiResponse);
    }
    // Si viene como un array directo
    else if (Array.isArray(payload)) {
      users = payload.map(User.fromApiResponse);
    }
    // Si viene como { content: [...] }
    else if (payload?.content && Array.isArray(payload.content)) {
      users = payload.content.map(User.fromApiResponse);
    }

    console.log(`✅ Usuarios inactivos procesados: ${users.length}`);
    return users;
  } catch (error) {
    console.error('❌ Error al obtener usuarios inactivos', error);
    throw new Error(`Error al obtener usuarios inactivos: ${error.message}`);
  }
},

  /**
   * Obtiene un usuario por ID
   * @param {number} id
   * @returns {Promise<User>}
   */
  async findById(id) {
    try {
      if (!id) {
        throw new Error("ID de usuario es requerido");
      }
      
      console.log(`🔍 Obteniendo usuario con ID: ${id}`);
      const response = await axios.get(`${API_URL}/${id}`);
      console.log('📡 Usuario obtenido:', response.data);
      
      return User.fromApiResponse(response.data);
    } catch (error) {
      console.error(`❌ Error al obtener el usuario con ID ${id}`, error);
      throw new Error(`Error al obtener usuario con ID ${id}: ${error.message}`);
    }
  },

  /**
   * Crea un nuevo usuario
   * @param {User} user
   * @returns {Promise<User>}
   */
  async save(user) {
    try {
      if (!user || !(user instanceof User)) {
        throw new Error("El parámetro debe ser una instancia de User");
      }
      
      if (!user.isValidForCreation()) {
        throw new Error("Datos incompletos para crear el usuario");
      }
      
      console.log('➕ Creando nuevo usuario:', user.getFullName());
      const response = await axios.post(API_URL, user.toCreateRequest());
      console.log('✅ Usuario creado:', response.data);
      
      return User.fromApiResponse(response.data);
    } catch (error) {
      console.error("❌ Error al crear usuario", error);
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  },

  /**
   * Actualiza un usuario existente
   * @param {number} id
   * @param {User} user
   * @returns {Promise<User>}
   */
  async update(id, user) {
    try {
      if (!id) {
        throw new Error("ID de usuario es requerido");
      }
      
      if (!user || !(user instanceof User)) {
        throw new Error("El parámetro debe ser una instancia de User");
      }
      
      if (!user.isValidForUpdate()) {
        throw new Error("Datos incompletos para actualizar el usuario");
      }
      
      console.log(`🔄 Actualizando usuario ID: ${id}`, user.getFullName());
      const response = await axios.put(`${API_URL}/${id}`, user.toUpdateRequest());
      console.log('✅ Usuario actualizado:', response.data);
      
      return User.fromApiResponse(response.data);
    } catch (error) {
      console.error(`❌ Error al actualizar el usuario con ID ${id}`, error);
      throw new Error(`Error al actualizar usuario con ID ${id}: ${error.message}`);
    }
  },

  /**
   * Elimina un usuario (delete lógico)
   * @param {number} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      if (!id) {
        throw new Error("ID de usuario es requerido");
      }
      
      console.log(`🗑️ Eliminando usuario ID: ${id}`);
      await axios.delete(`${API_URL}/${id}`);
      console.log('✅ Usuario eliminado correctamente');
    } catch (error) {
      console.error(`❌ Error al eliminar el usuario con ID ${id}`, error);
      throw new Error(`Error al eliminar usuario con ID ${id}: ${error.message}`);
    }
  },

  /**
   * Restaura un usuario
   * @param {number} id
   * @returns {Promise<User>}
   */
  async restore(id) {
    try {
      if (!id) {
        throw new Error("ID de usuario es requerido");
      }
      
      console.log(`🔄 Restaurando usuario ID: ${id}`);
      const response = await axios.put(`${API_URL}/${id}/restore`);
      console.log('✅ Usuario restaurado:', response.data);
      
      return User.fromApiResponse(response.data);
    } catch (error) {
      console.error(`❌ Error al restaurar el usuario con ID ${id}`, error);
      throw new Error(`Error al restaurar usuario con ID ${id}: ${error.message}`);
    }
  },

  /**
   * Busca usuarios por criterios con logging mejorado
   * @param {Object} criteria - Criterios de búsqueda
   * @returns {Promise<User[]>}
   */
  async search(criteria) {
    try {
      console.log('🔍 Buscando usuarios con criterios:', criteria);
      const params = new URLSearchParams();
      
      Object.keys(criteria).forEach(key => {
        if (criteria[key] !== null && criteria[key] !== undefined && criteria[key] !== '') {
          params.append(key, criteria[key]);
        }
      });
      
      console.log('📋 Parámetros de búsqueda:', params.toString());
      const response = await axios.get(`${API_URL}/search?${params}`);
      console.log('📡 Resultados de búsqueda:', response.data);
      
      const results = response.data;
      
      if (Array.isArray(results)) {
        const users = results.map(User.fromApiResponse);
        console.log(`✅ Usuarios encontrados: ${users.length}`);
        return users;
      }
      
      console.log('⚠️ No se encontraron usuarios');
      return [];
    } catch (error) {
      console.error("❌ Error al buscar usuarios", error);
      throw new Error(`Error al buscar usuarios: ${error.message}`);
    }
  },

  /**
   * Obtiene usuarios por estado con logging mejorado
   * @param {string} status - Estado del usuario (A o I)
   * @returns {Promise<User[]>}
   */
  async findByStatus(status) {
    try {
      if (!status) {
        throw new Error("Estado es requerido");
      }

      console.log(`🔍 Obteniendo usuarios con estado: ${status}`);
      
      // Intentar primero con el endpoint específico
      try {
        const response = await axios.get(`${API_URL}/status/${status}`);
        console.log('📡 Respuesta del endpoint específico:', response.data);
        
        const results = response.data;
        
        // Manejar diferentes formatos de respuesta
        if (Array.isArray(results)) {
          const users = results.map(User.fromApiResponse);
          console.log(`✅ Usuarios encontrados con estado ${status}: ${users.length}`);
          return users;
        }
        
        // Si la respuesta está encapsulada
        if (results?.data && Array.isArray(results.data)) {
          const users = results.data.map(User.fromApiResponse);
          console.log(`✅ Usuarios encontrados con estado ${status}: ${users.length}`);
          return users;
        }
        
        console.log('⚠️ Formato de respuesta inesperado, devolviendo array vacío');
        return [];
        
      } catch (endpointError) {
        console.log('⚠️ Endpoint específico no disponible, usando findAll y filtrando');
        
        // Si el endpoint específico no existe, usar findAll y filtrar
        const allUsers = await this.findAll();
        const filteredUsers = allUsers.filter(user => user.status === status);
        
        console.log(`✅ Usuarios filtrados con estado ${status}: ${filteredUsers.length}`);
        return filteredUsers;
      }
      
    } catch (error) {
      console.error(`❌ Error al obtener usuarios con estado ${status}`, error);
      
      // Si es un error 404, probablemente no hay usuarios con ese estado
      if (error.response?.status === 404) {
        console.log('ℹ️ No se encontraron usuarios con ese estado (404)');
        return [];
      }
      
      throw new Error(`Error al obtener usuarios con estado ${status}: ${error.message}`);
    }
  },

  /**
   * Obtiene usuarios por rol con logging mejorado
   * @param {string} role - Rol del usuario
   * @returns {Promise<User[]>}
   */
  async findByRole(role) {
    try {
      if (!role) {
        throw new Error("Rol es requerido");
      }

      console.log(`🔍 Obteniendo usuarios con rol: ${role}`);
      
      // Intentar primero con el endpoint específico
      try {
        const response = await axios.get(`${API_URL}/role/${role}`);
        console.log('📡 Respuesta del endpoint específico:', response.data);
        
        const results = response.data;
        
        // Manejar diferentes formatos de respuesta
        if (Array.isArray(results)) {
          const users = results.map(User.fromApiResponse);
          console.log(`✅ Usuarios encontrados con rol ${role}: ${users.length}`);
          return users;
        }
        
        // Si la respuesta está encapsulada
        if (results?.data && Array.isArray(results.data)) {
          const users = results.data.map(User.fromApiResponse);
          console.log(`✅ Usuarios encontrados con rol ${role}: ${users.length}`);
          return users;
        }
        
        return [];
        
      } catch (endpointError) {
        console.log('⚠️ Endpoint específico no disponible, usando findAll y filtrando');
        
        // Si el endpoint específico no existe, usar findAll y filtrar
        const allUsers = await this.findAll();
        const filteredUsers = allUsers.filter(user => user.role === role);
        
        console.log(`✅ Usuarios filtrados con rol ${role}: ${filteredUsers.length}`);
        return filteredUsers;
      }
      
    } catch (error) {
      console.error(`❌ Error al obtener usuarios con rol ${role}`, error);
      
      // Si es un error 404, probablemente no hay usuarios con ese rol
      if (error.response?.status === 404) {
        console.log('ℹ️ No se encontraron usuarios con ese rol (404)');
        return [];
      }
      
      throw new Error(`Error al obtener usuarios con rol ${role}: ${error.message}`);
    }
  },

  /**
   * Obtiene estadísticas de usuarios con logging mejorado
   * @returns {Promise<Object>}
   */
  async getStats() {
    try {
      console.log('📊 Obteniendo estadísticas de usuarios...');
      const allUsers = await this.findAll();
      const activeUsers = allUsers.filter(user => user.status === "A");
      const inactiveUsers = allUsers.filter(user => user.status === "I");
      
      const stats = {
        total: allUsers.length,
        active: activeUsers.length,
        inactive: inactiveUsers.length,
        activePercentage: allUsers.length > 0 ? (activeUsers.length / allUsers.length * 100).toFixed(1) : 0,
        inactivePercentage: allUsers.length > 0 ? (inactiveUsers.length / allUsers.length * 100).toFixed(1) : 0
      };
      
      console.log('📊 Estadísticas calculadas:', stats);
      return stats;
    } catch (error) {
      console.error("❌ Error al obtener estadísticas", error);
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  },

  /**
   * Función de diagnóstico para verificar el estado de los usuarios
   * @returns {Promise<Object>}
   */
  async diagnose() {
    try {
      console.log('🔧 Iniciando diagnóstico del sistema...');
      
      // 1. Verificar conexión con la API
      console.log('1️⃣ Verificando conexión con la API...');
      const response = await axios.get(`${BASE_URL}/health`).catch(() => null);
      const apiHealth = response ? '✅ API disponible' : '❌ API no disponible';
      console.log(apiHealth);
      
      // 2. Obtener todos los usuarios
      console.log('2️⃣ Obteniendo todos los usuarios...');
      const allUsers = await this.findAll();
      
      // 3. Analizar estados
      console.log('3️⃣ Analizando estados de usuarios...');
      const statusAnalysis = {};
      allUsers.forEach(user => {
        const status = user.status || 'undefined';
        statusAnalysis[status] = (statusAnalysis[status] || 0) + 1;
      });
      
      console.log('📋 Análisis de estados:', statusAnalysis);
      
      // 4. Verificar filtrado local
      console.log('4️⃣ Verificando filtrado local...');
      const activeFilter = allUsers.filter(user => user.status === "A");
      const inactiveFilter = allUsers.filter(user => user.status === "I");
      
      console.log(`   - Filtro activos (A): ${activeFilter.length}`);
      console.log(`   - Filtro inactivos (I): ${inactiveFilter.length}`);
      
      // 5. Verificar endpoint específico
      console.log('5️⃣ Verificando endpoint específico...');
      try {
        const inactiveEndpoint = await axios.get(`${API_URL}/status/I`);
        console.log('   ✅ Endpoint /status/I disponible');
        console.log('   📡 Respuesta:', inactiveEndpoint.data);
      } catch (endpointError) {
        console.log('   ❌ Endpoint /status/I no disponible');
        console.log('   📋 Error:', endpointError.response?.status || endpointError.message);
      }
      
      return {
        apiHealth: response ? 'available' : 'unavailable',
        totalUsers: allUsers.length,
        statusAnalysis,
        localFiltering: {
          active: activeFilter.length,
          inactive: inactiveFilter.length
        }
      };
      
    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
      throw new Error(`Error en diagnóstico: ${error.message}`);
    }
  }
};

// Exportación adicional para mantener compatibilidad con importaciones en minúscula
export const userService = UserService;

// Exportación por defecto
export default UserService;