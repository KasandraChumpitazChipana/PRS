"use client"

/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import Header from "../Header"
import Sidebar from "../Sidebar"
import { message } from "antd"
import FeatherIcon from "feather-icons-react/build/FeatherIcon"
import Select from "react-select"
import { Link, useNavigate, useParams } from "react-router-dom"
import { userService } from "../../services/UserService"
import { User } from "../../types/User"
import Swal from "sweetalert2"

const AddPatients = () => {
  const navigate = useNavigate()
  const { id } = useParams() // Para obtener el ID si estamos editando
  const isEditing = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    documentType: "",
    documentNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    status: "A",
    userImageBase64: "",
  })

  const [selectedOption, setSelectedOption] = useState(null)
  const [option, setOption] = useState([
    { value: 1, label: "Select City" },
    { value: 2, label: "Alaska" },
    { value: 3, label: "California" },
  ])

  const [options, setOptions] = useState([
    { value: 1, label: "Select Country" },
    { value: 2, label: "Usa" },
    { value: 3, label: "Uk" },
    { value: 4, label: "Italy" },
  ])

  const [documentTypes] = useState([
    { value: "DNI", label: "DNI" },
    { value: "PASSPORT", label: "Pasaporte" },
    { value: "CE", label: "Carnet de Extranjería" },
  ])

  // Roles actualizados: solo ADMIN y USER
  const [roles] = useState([
    { value: "ADMIN", label: "Administrador" },
    { value: "USER", label: "Usuario" },
  ])

  // Cargar datos del usuario si estamos editando
  useEffect(() => {
    if (isEditing && id) {
      loadUserData(id)
    }
  }, [isEditing, id])

  const loadUserData = async (userId) => {
    setInitialLoading(true)
    try {
      // Cambiado: getUserById -> findById
      const user = await userService.findById(userId)
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        documentType: user.documentType,
        documentNumber: user.documentNumber,
        email: user.email,
        password: "", // No cargar la contraseña por seguridad
        confirmPassword: "",
        role: user.role,
        status: user.status,
        userImageBase64: user.userImageBase64,
      })
      
      // Establecer preview de imagen si existe
      if (user.userImageBase64) {
        setImagePreview(`data:image/jpeg;base64,${user.userImageBase64}`)
      }
    } catch (error) {
      // Reemplazado message.error con SweetAlert2
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || "Error al cargar los datos del usuario",
        confirmButtonText: 'OK'
      })
      navigate("/patientslist")
    } finally {
      setInitialLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }))
  }

  const handleRadioChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Función mejorada para manejar la carga de archivos
  const loadFile = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'warning',
          title: 'Archivo inválido',
          text: 'Por favor, seleccione un archivo de imagen válido (JPG, PNG, GIF, etc.)',
          confirmButtonText: 'OK'
        })
        return
      }

      // Validar tamaño de archivo (máximo 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        Swal.fire({
          icon: 'warning',
          title: 'Archivo muy grande',
          text: 'El archivo debe ser menor a 5MB',
          confirmButtonText: 'OK'
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target.result
        const base64String = result.split(",")[1] // Remove data:image/...;base64, prefix
        
        // Actualizar el estado con la imagen en base64
        setFormData((prev) => ({
          ...prev,
          userImageBase64: base64String,
        }))
        
        // Establecer preview de la imagen
        setImagePreview(result)
      }
      
      reader.onerror = () => {
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar imagen',
          text: 'Hubo un error al procesar la imagen',
          confirmButtonText: 'OK'
        })
      }
      
      reader.readAsDataURL(file)
    }
  }

  // Función para remover la imagen
  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      userImageBase64: "",
    }))
    setImagePreview(null)
    
    // Limpiar el input file
    const fileInput = document.getElementById('file')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const validateForm = async () => {
    const user = new User(formData)

    if (!user.isValidForCreation()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: "Por favor, complete todos los campos obligatorios",
        confirmButtonText: 'OK'
      })
      return false
    }

    // Solo validar contraseñas si estamos creando o si se ingresó una nueva contraseña
    if (!isEditing || formData.password.trim() !== "") {
      if (formData.password !== formData.confirmPassword) {
        await Swal.fire({
          icon: 'error',
          title: 'Error de contraseña',
          text: "Las contraseñas no coinciden",
          confirmButtonText: 'OK'
        })
        return false
      }

      if (formData.password.length < 6) {
        await Swal.fire({
          icon: 'error',
          title: 'Contraseña muy corta',
          text: "La contraseña debe tener al menos 6 caracteres",
          confirmButtonText: 'OK'
        })
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!(await validateForm())) {
      return
    }

    // Confirmar acción con SweetAlert2
    const result = await Swal.fire({
      title: isEditing ? '¿Actualizar usuario?' : '¿Crear usuario?',
      text: isEditing 
        ? "Se actualizará la información del usuario" 
        : "Se creará un nuevo usuario con la información proporcionada",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: isEditing ? 'Sí, actualizar' : 'Sí, crear',
      cancelButtonText: 'Cancelar'
    })

    if (!result.isConfirmed) {
      return
    }

    setLoading(true)
    try {
      const userData = { ...formData }
      delete userData.confirmPassword // Remove confirm password before sending

      // Si estamos editando y no se cambió la contraseña, no enviarla
      if (isEditing && userData.password.trim() === "") {
        delete userData.password
      }

      // Crear instancia de User
      const user = new User(userData)

      let serviceResult
      if (isEditing) {
        // Cambiado: updateUser -> update
        serviceResult = await userService.update(id, user)
      } else {
        // Cambiado: createUser -> save
        serviceResult = await userService.save(user)
      }

      // Mostrar éxito con SweetAlert2
      await Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: isEditing ? "Usuario actualizado correctamente" : "Usuario creado correctamente",
        confirmButtonText: 'OK'
      })

      navigate("/patientslist")
    } catch (error) {
      // Mostrar error con SweetAlert2
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || `Error al ${isEditing ? "actualizar" : "crear"} usuario`,
        confirmButtonText: 'OK'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    // Confirmar cancelación con SweetAlert2
    const result = await Swal.fire({
      title: '¿Cancelar operación?',
      text: "Se perderán los cambios no guardados",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Continuar editando'
    })

    if (result.isConfirmed) {
      navigate("/patientslist")
    }
  }

  const onChange = (date, dateString) => {
    // Handle date change if needed
    console.log(date, dateString)
  }

  if (initialLoading) {
    return (
      <div>
        <Header />
        <Sidebar id="menu-item2" id1="menu-items2" activeClassName="add-patient" />
        <div className="page-wrapper">
          <div className="content">
            <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
              <div className="spinner-border" role="status">
                <span className="sr-only">Cargando...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <Sidebar id="menu-item2" id1="menu-items2" activeClassName="add-patient" />
      <>
        <div className="page-wrapper">
          <div className="content">
            {/* Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col-sm-12">
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="#">Usuarios </Link>
                    </li>
                    <li className="breadcrumb-item">
                      <i className="feather-chevron-right">
                        <FeatherIcon icon="chevron-right" />
                      </i>
                    </li>
                    <li className="breadcrumb-item active">{isEditing ? "Editar Usuario" : "Agregar Usuario"}</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}

            <div className="row">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-12">
                          <div className="form-heading">
                            <h4>{isEditing ? "Editar Usuario" : "Detalles del Usuario"}</h4>
                          </div>
                        </div>

                        <div className="col-12 col-md-6 col-xl-4">
                          <div className="form-group local-forms">
                            <label>
                              Nombre <span className="login-danger">*</span>
                            </label>
                            <input
                              className="form-control"
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              placeholder="Ingrese el nombre"
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-6 col-xl-4">
                          <div className="form-group local-forms">
                            <label>
                              Apellido <span className="login-danger">*</span>
                            </label>
                            <input
                              className="form-control"
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              placeholder="Ingrese el apellido"
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-6 col-xl-4">
                          <div className="form-group local-forms">
                            <label>
                              Tipo de Documento <span className="login-danger">*</span>
                            </label>
                            <Select
                              value={documentTypes.find((option) => option.value === formData.documentType)}
                              onChange={(selectedOption) => handleSelectChange("documentType", selectedOption)}
                              options={documentTypes}
                              placeholder="Seleccione tipo de documento"
                              components={{
                                IndicatorSeparator: () => null,
                              }}
                              styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  borderColor: state.isFocused ? "none" : "2px solid rgba(46, 55, 164, 0.1);",
                                  boxShadow: state.isFocused ? "0 0 0 1px #2e37a4" : "none",
                                  "&:hover": {
                                    borderColor: state.isFocused ? "none" : "2px solid rgba(46, 55, 164, 0.1)",
                                  },
                                  borderRadius: "10px",
                                  fontSize: "14px",
                                  minHeight: "45px",
                                }),
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-6 col-xl-4">
                          <div className="form-group local-forms">
                            <label>
                              Número de Documento <span className="login-danger">*</span>
                            </label>
                            <input
                              className="form-control"
                              type="text"
                              name="documentNumber"
                              value={formData.documentNumber}
                              onChange={handleInputChange}
                              placeholder="Ingrese número de documento"
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-6 col-xl-4">
                          <div className="form-group local-forms">
                            <label>
                              Email <span className="login-danger">*</span>
                            </label>
                            <input
                              className="form-control"
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Ingrese el email"
                              autoComplete="username"
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-6 col-xl-4">
                          <div className="form-group local-forms">
                            <label>
                              Rol <span className="login-danger">*</span>
                            </label>
                            <Select
                              value={roles.find((option) => option.value === formData.role)}
                              onChange={(selectedOption) => handleSelectChange("role", selectedOption)}
                              options={roles}
                              placeholder="Seleccione un rol"
                              components={{
                                IndicatorSeparator: () => null,
                              }}
                              styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  borderColor: state.isFocused ? "none" : "2px solid rgba(46, 55, 164, 0.1);",
                                  boxShadow: state.isFocused ? "0 0 0 1px #2e37a4" : "none",
                                  "&:hover": {
                                    borderColor: state.isFocused ? "none" : "2px solid rgba(46, 55, 164, 0.1)",
                                  },
                                  borderRadius: "10px",
                                  fontSize: "14px",
                                  minHeight: "45px",
                                }),
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-6 col-xl-6">
                          <div className="form-group local-forms">
                            <label>
                              Contraseña {!isEditing && <span className="login-danger">*</span>}
                              {isEditing && (
                                <small className="text-muted"> (Dejar vacío para mantener la actual)</small>
                              )}
                            </label>
                            <input
                              className="form-control"
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder="Ingrese la contraseña"
                              autoComplete="new-password"
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-6 col-xl-6">
                          <div className="form-group local-forms">
                            <label>
                              Confirmar Contraseña <span className="login-danger">*</span>
                            </label>
                            <input
                              className="form-control"
                              type="password"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              placeholder="Confirme la contraseña"
                              autoComplete="new-password"
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-6 col-xl-6">
                          <div className="form-group local-top-form">
                            <label className="local-top">
                              Avatar <span className="login-danger">*</span>
                            </label>
                            <div className="settings-btn upload-files-avator">
                              <input
                                type="file"
                                accept="image/*"
                                name="image"
                                id="file"
                                onChange={loadFile}
                                className="hide-input"
                              />
                              <label htmlFor="file" className="upload">
                                Elegir Archivo
                              </label>
                              {imagePreview && (
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm ms-2"
                                  onClick={removeImage}
                                  title="Remover imagen"
                                >
                                  <FeatherIcon icon="trash-2" size={16} />
                                </button>
                              )}
                            </div>
                            {imagePreview && (
                              <div className="mt-3">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  style={{
                                    width: "100px",
                                    height: "100px",
                                    objectFit: "cover",
                                    borderRadius: "10px",
                                    border: "2px solid #e9ecef"
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="col-12 col-md-6 col-xl-6">
                          <div className="form-group select-gender">
                            <label className="gen-label">
                              Estado <span className="login-danger">*</span>
                            </label>
                            <div className="form-check-inline">
                              <label className="form-check-label">
                                <input
                                  type="radio"
                                  name="status"
                                  className="form-check-input"
                                  checked={formData.status === "A"}
                                  onChange={() => handleRadioChange("status", "A")}
                                />
                                Activo
                              </label>
                            </div>
                            <div className="form-check-inline">
                              <label className="form-check-label">
                                <input
                                  type="radio"
                                  name="status"
                                  className="form-check-input"
                                  checked={formData.status === "I"}
                                  onChange={() => handleRadioChange("status", "I")}
                                />
                                Inactivo
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="doctor-submit text-end">
                            <button
                              type="submit"
                              className="btn btn-primary submit-form me-2"
                              disabled={loading || initialLoading}
                            >
                              {loading
                                ? isEditing
                                  ? "Actualizando..."
                                  : "Guardando..."
                                : isEditing
                                  ? "Actualizar"
                                  : "Guardar"}
                            </button>
                            <button type="button" className="btn btn-primary cancel-form" onClick={handleCancel}>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    </div>
  )
}

export default AddPatients