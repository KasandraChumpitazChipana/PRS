"use client"
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import { Table, message, Input, Select as AntSelect } from "antd"
import Swal from "sweetalert2"
import Header from "../Header"
import Sidebar from "../Sidebar"
import { onShowSizeChange, itemRender } from "../Pagination"
import { blogimg10, imagesend, pdficon, pdficon3, pdficon4, plusicon, refreshicon } from "../imagepath"
import { Link } from "react-router-dom"
import jsPDF from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"
import { UserService } from "../../services/UserService"
import { User } from "../../types/User"

const { Search } = Input
const { Option } = AntSelect

const PatientsList = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

 useEffect(() => {
  loadUsers();
}, [statusFilter]);

useEffect(() => {
  filterUsers();
}, [users, searchTerm]);

  const loadUsers = async () => {
  setLoading(true);
  try {
    let userData = [];

    if (statusFilter === "inactive") {
      userData = await UserService.findInactive();
    } else {
      userData = await UserService.findAll();
    }

    setUsers(userData);
    message.success("Usuarios cargados correctamente");
  } catch (error) {
    message.error(error.message || "Error al cargar usuarios");
  } finally {
    setLoading(false);
  }
};

  const filterUsers = () => {
  let filtered = [...users];

  if (searchTerm.trim()) {
    const lower = searchTerm.toLowerCase();
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(lower) ||
      user.lastName.toLowerCase().includes(lower) ||
      user.email.toLowerCase().includes(lower)
    );
  }

  setFilteredUsers(filtered);
};

  const handleSearch = (value) => {
    setSearchTerm(value)
  }

  const handleStatusFilter = (value) => {
    setStatusFilter(value)
  }

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      html: `
        <div class="text-center">
          <h4>¿Quieres eliminar este usuario?</h4>
          <p><strong>${user.getFullName()}</strong></p>
          <small class="text-muted">Esta acción cambiará el estado del usuario a inactivo</small>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    })

    if (result.isConfirmed) {
      try {
        await UserService.delete(user.id)
        await Swal.fire({
          title: '¡Eliminado!',
          text: 'El usuario ha sido eliminado correctamente.',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        })
        await loadUsers()
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: error.message || 'Error al eliminar usuario',
          icon: 'error',
          confirmButtonColor: '#3085d6'
        })
      }
    }
  }

  const handleRestore = async (userId) => {
    const result = await Swal.fire({
      title: '¿Restaurar usuario?',
      text: 'El usuario será restaurado y estará disponible nuevamente.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        await UserService.restore(userId)
        await Swal.fire({
          title: '¡Restaurado!',
          text: 'El usuario ha sido restaurado correctamente.',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        })
        await loadUsers()
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: error.message || 'Error al restaurar usuario',
          icon: 'error',
          confirmButtonColor: '#3085d6'
        })
      }
    }
  }

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "A" ? "I" : "A"
    const actionText = newStatus === "A" ? "activar" : "desactivar"
    
    const result = await Swal.fire({
      title: `¿${actionText.charAt(0).toUpperCase() + actionText.slice(1)} usuario?`,
      html: `
        <div class="text-center">
          <p>¿Quieres ${actionText} a <strong>${user.getFullName()}</strong>?</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: newStatus === "A" ? '#28a745' : '#ffc107',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        const userToUpdate = new User({
          ...user,
          status: newStatus,
        })

        await UserService.update(user.id, userToUpdate)
        await Swal.fire({
          title: '¡Actualizado!',
          text: `Usuario ${newStatus === "A" ? "activado" : "desactivado"} correctamente.`,
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        })
        await loadUsers()
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: error.message || 'Error al cambiar el estado del usuario',
          icon: 'error',
          confirmButtonColor: '#3085d6'
        })
      }
    }
  }

  // Función mejorada para exportar a PDF
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF()

      // Título
      doc.setFontSize(20)
      doc.text("Lista de Usuarios", 14, 22)

      // Subtitle con filtro actual
      doc.setFontSize(12)
      let subtitle = "Todos los usuarios"
      if (statusFilter === "active") subtitle = "Usuarios activos"
      if (statusFilter === "inactive") subtitle = "Usuarios inactivos"
      if (searchTerm) subtitle += ` - Búsqueda: "${searchTerm}"`
      doc.text(subtitle, 14, 30)

      // Fecha y hora
      doc.setFontSize(10)
      doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 38)

      // Preparar datos para la tabla
      const tableColumn = ["Nombre", "Documento", "Email", "Rol", "Estado"]
      const tableRows = []

      filteredUsers.forEach((user) => {
        const userData = [
          user.getFullName ? user.getFullName() : `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          `${user.documentType || ''}: ${user.documentNumber || ''}`,
          user.email || '',
          user.role || '',
          user.status === "A" ? "Activo" : "Inactivo",
        ]
        tableRows.push(userData)
      })

      // Agregar tabla
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      })

      // Guardar el archivo
      doc.save(`usuarios_${new Date().toISOString().split('T')[0]}.pdf`)
      
      Swal.fire({
        title: '¡Descargado!',
        text: 'El archivo PDF ha sido descargado correctamente.',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      })
    } catch (error) {
      console.error('Error al generar PDF:', error)
      Swal.fire({
        title: 'Error',
        text: 'Error al generar el archivo PDF.',
        icon: 'error',
        confirmButtonColor: '#3085d6'
      })
    }
  }

  // Función mejorada para exportar a Excel
  const handleDownloadExcel = () => {
    try {
      const excelData = filteredUsers.map((user) => ({
        Nombre: user.getFullName ? user.getFullName() : `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        "Tipo Documento": user.documentType || '',
        "Número Documento": user.documentNumber || '',
        Email: user.email || '',
        Rol: user.role || '',
        Estado: user.status === "A" ? "Activo" : "Inactivo",
        "Fecha Generación": new Date().toLocaleString()
      }))

      const worksheet = XLSX.utils.json_to_sheet(excelData)
      
      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 25 }, // Nombre
        { wch: 15 }, // Tipo Documento
        { wch: 15 }, // Número Documento
        { wch: 30 }, // Email
        { wch: 15 }, // Rol
        { wch: 10 }, // Estado
        { wch: 20 }, // Fecha Generación
      ]
      worksheet['!cols'] = colWidths

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios")

      // Agregar metadatos
      workbook.Props = {
        Title: "Lista de Usuarios",
        Subject: "Exportación de usuarios",
        Author: "Sistema",
        CreatedDate: new Date()
      }

      const fileName = `usuarios_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, fileName)
      
      Swal.fire({
        title: '¡Descargado!',
        text: 'El archivo Excel ha sido descargado correctamente.',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      })
    } catch (error) {
      console.error('Error al generar Excel:', error)
      Swal.fire({
        title: 'Error',
        text: 'Error al generar el archivo Excel.',
        icon: 'error',
        confirmButtonColor: '#3085d6'
      })
    }
  }

  // Función mejorada para exportar a CSV
  const handleDownloadCSV = () => {
    try {
      const csvData = filteredUsers.map((user) => ({
        Nombre: user.getFullName ? user.getFullName() : `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        "Tipo Documento": user.documentType || '',
        "Número Documento": user.documentNumber || '',
        Email: user.email || '',
        Rol: user.role || '',
        Estado: user.status === "A" ? "Activo" : "Inactivo",
        "Fecha Generación": new Date().toLocaleString()
      }))

      const worksheet = XLSX.utils.json_to_sheet(csvData)
      const csv = XLSX.utils.sheet_to_csv(worksheet)

      // Agregar BOM para UTF-8
      const BOM = '\uFEFF'
      const csvWithBOM = BOM + csv

      const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      
      link.setAttribute("href", url)
      link.setAttribute("download", `usuarios_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = "hidden"
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Liberar memoria
      URL.revokeObjectURL(url)

      Swal.fire({
        title: '¡Descargado!',
        text: 'El archivo CSV ha sido descargado correctamente.',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      })
    } catch (error) {
      console.error('Error al generar CSV:', error)
      Swal.fire({
        title: 'Error',
        text: 'Error al generar el archivo CSV.',
        icon: 'error',
        confirmButtonColor: '#3085d6'
      })
    }
  }

  const handleRefresh = async () => {
    const result = await Swal.fire({
      title: '¿Actualizar lista?',
      text: 'Se recargarán todos los usuarios y se limpiarán los filtros.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      await loadUsers()
      setSearchTerm("")
      setStatusFilter("all")
      
      Swal.fire({
        title: '¡Actualizado!',
        text: 'La lista ha sido actualizada correctamente.',
        icon: 'success',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false
      })
    }
  }

  const onSelectChange = (newSelectedRowKeys) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys)
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  }

  const columns = [
    {
      title: "Nombre",
      dataIndex: "fullName",
      sorter: (a, b) => {
        const nameA = a.getFullName ? a.getFullName() : `${a.firstName || ''} ${a.lastName || ''}`.trim()
        const nameB = b.getFullName ? b.getFullName() : `${b.firstName || ''} ${b.lastName || ''}`.trim()
        return nameA.localeCompare(nameB)
      },
      render: (text, record) => (
        <>
          <h2 className="profile-image">
            <Link to="#" className="avatar avatar-sm me-2">
              <img 
                className="avatar-img rounded-circle" 
                src={record.userImageBase64 || blogimg10} 
                alt="#" 
                onError={(e) => {
                  e.target.src = blogimg10
                }}
              />
            </Link>
            <Link to="#">
              {record.getFullName ? record.getFullName() : `${record.firstName || ''} ${record.lastName || ''}`.trim()}
            </Link>
          </h2>
        </>
      ),
    },
    {
      title: "Tipo Documento",
      dataIndex: "documentType",
      sorter: (a, b) => (a.documentType || '').localeCompare(b.documentType || ''),
    },
    {
      title: "Número Documento",
      dataIndex: "documentNumber",
      sorter: (a, b) => (a.documentNumber || '').localeCompare(b.documentNumber || ''),
    },
    {
      title: "Email",
      dataIndex: "email",
      sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),
    },
    {
      title: "Rol",
      dataIndex: "role",
      sorter: (a, b) => (a.role || '').localeCompare(b.role || ''),
    },
    {
      title: "Estado",
      dataIndex: "status",
      sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
      render: (status) => (
        <span className={`badge ${status === "A" ? "badge-success" : "badge-danger"}`}>
          {status === "A" ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      title: "Acciones",
      dataIndex: "actions",
      render: (text, record) => (
        <>
          <div className="text-end">
            <div className="dropdown dropdown-action">
              <Link to="#" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="fas fa-ellipsis-v" />
              </Link>
              <div className="dropdown-menu dropdown-menu-end">
                <Link className="dropdown-item" to={`/editpatients/${record.id}`}>
                  <i className="far fa-edit me-2" />
                  Editar
                </Link>
                
                {/* Mostrar diferentes opciones según el estado */}
                {record.status === "A" ? (
                  <>
                    <Link className="dropdown-item" to="#" onClick={() => handleToggleStatus(record)}>
                      <i className="fa fa-toggle-off me-2" />
                      Desactivar
                    </Link>
                    <Link className="dropdown-item" to="#" onClick={() => handleDelete(record)}>
                      <i className="fa fa-trash-alt me-2"></i>
                      Eliminar
                    </Link>
                  </>
                ) : (
                  <>
                    <Link className="dropdown-item" to="#" onClick={() => handleToggleStatus(record)}>
                      <i className="fa fa-toggle-on me-2" />
                      Activar
                    </Link>
                    <Link className="dropdown-item" to="#" onClick={() => handleRestore(record.id)}>
                      <i className="fa fa-undo me-2"></i>
                      Restaurar
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <>
      <Header />
      <Sidebar id="menu-item2" id1="menu-items2" activeClassName="patient-list" />
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
                    <i className="feather-chevron-right" />
                  </li>
                  <li className="breadcrumb-item active">Lista de Usuarios</li>
                </ul>
              </div>
            </div>
          </div>
          {/* /Page Header */}

          <div className="row">
            <div className="col-sm-12">
              <div className="card card-table show-entire">
                <div className="card-body">
                  {/* Table Header */}
                  <div className="page-table-header mb-2">
                    <div className="row align-items-center">
                      <div className="col">
                        <div className="doctor-table-blk">
                          <h3>Lista de Usuarios</h3>
                          <div className="doctor-search-blk">
                            <div className="top-nav-search table-search-blk">
                              <Search
                                placeholder="Buscar usuarios..."
                                allowClear
                                onSearch={handleSearch}
                                onChange={(e) => handleSearch(e.target.value)}
                                style={{ width: 300 }}
                                value={searchTerm}
                              />
                            </div>
                            <div className="add-group">
                              <AntSelect
                                defaultValue="all"
                                value={statusFilter}
                                onChange={(value) => setStatusFilter(value)}
                              >
                                <Option value="all">Todos</Option>
                                <Option value="active">Activos</Option>
                                <Option value="inactive">Inactivos</Option>
                              </AntSelect>
                              <Link to="/addpatients" className="btn btn-primary add-pluss ms-2">
                                <img src={plusicon || "/placeholder.svg"} alt="#" />
                              </Link>
                              <Link to="#" className="btn btn-primary doctor-refresh ms-2" onClick={handleRefresh}>
                                <img src={refreshicon || "/placeholder.svg"} alt="#" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-auto text-end float-end ms-auto download-grp">
                        <Link 
                          to="#" 
                          className="me-2" 
                          onClick={(e) => {
                            e.preventDefault()
                            handleDownloadPDF()
                          }}
                          title="Descargar PDF"
                        >
                          <img src={pdficon || "/placeholder.svg"} alt="PDF" />
                        </Link>
                        <Link 
                          to="#" 
                          className="me-2" 
                          onClick={(e) => {
                            e.preventDefault()
                            handleDownloadExcel()
                          }}
                          title="Descargar Excel"
                        >
                          <img src={pdficon3 || "/placeholder.svg"} alt="Excel" />
                        </Link>
                        <Link 
                          to="#" 
                          onClick={(e) => {
                            e.preventDefault()
                            handleDownloadCSV()
                          }}
                          title="Descargar CSV"
                        >
                          <img src={pdficon4 || "/placeholder.svg"} alt="CSV" />
                        </Link>
                      </div>
                    </div>
                  </div>
                  {/* /Table Header */}

                  {/* Información del filtro actual */}
                  <div className="mb-3">
                    <small className="text-muted">
                      Mostrando {filteredUsers.length} usuarios 
                      {statusFilter === "active" && " activos"}
                      {statusFilter === "inactive" && " inactivos"}
                      {searchTerm && ` que coinciden con "${searchTerm}"`}
                    </small>
                  </div>

                  <div className="table-responsive doctor-list">
                    <Table
                      loading={loading}
                      pagination={{
                        total: filteredUsers.length,
                        showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} entradas`,
                        onShowSizeChange: onShowSizeChange,
                        itemRender: itemRender,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        defaultPageSize: 10,
                      }}
                      columns={columns}
                      dataSource={filteredUsers}
                      rowSelection={rowSelection}
                      rowKey={(record) => record.id}
                      locale={{
                        emptyText: statusFilter === "inactive" 
                          ? "No hay usuarios inactivos" 
                          : "No hay usuarios que coincidan con los criterios de búsqueda"
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PatientsList