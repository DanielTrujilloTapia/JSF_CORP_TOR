document.addEventListener("DOMContentLoaded", function () {
    const apiUrl = "https://api-corp-tort.onrender.com/empleados/get_empleados";
    const tableBody = document.getElementById("employeeTable");
    const pagination = document.getElementById("pagination");
    const itemsPerPage = 10;
    let employees = [];
    let currentPage = 1;

    async function fetchEmployees() {
        try {
            const response = await fetch(apiUrl);
            employees = await response.json();
            renderTable();
        } catch (error) {
            console.error("Error al obtener empleados:", error);
        }
    }

    function renderTable() {
        tableBody.innerHTML = "";
        const start = (currentPage - 1) * itemsPerPage;
        const paginatedEmployees = employees.slice(start, start + itemsPerPage);

        paginatedEmployees.forEach(employee => {
            const row = document.createElement("tr");
            row.setAttribute("data-id", employee.id_empleado); // Agregamos un atributo para identificar la fila
            row.innerHTML = `
                <td>${employee.id_empleado}</td>
                <td>${employee.nombre}</td>
                <td>${employee.apellidos}</td>
                <td>${employee.puesto || "N/A"}</td>
                <td>${employee.salario}</td>
                <td>${employee.fecha_contratacion}</td>
                <td>${employee.telefono || "N/A"}</td>
                <td>${employee.correo || "N/A"}</td>
                <td>${employee.estado || "N/A"}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editEmployee(${employee.id_empleado})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${employee.id_empleado})">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        renderPagination();
    }

    function renderPagination() {
        pagination.innerHTML = "";
        const totalPages = Math.ceil(employees.length / itemsPerPage);

        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement("li");
            li.classList.add("page-item");
            if (i === currentPage) li.classList.add("active");

            const a = document.createElement("a");
            a.classList.add("page-link");
            a.href = "#";
            a.textContent = i;
            a.addEventListener("click", function (event) {
                event.preventDefault();
                currentPage = i;
                renderTable();
            });

            li.appendChild(a);
            pagination.appendChild(li);
        }
    }

    window.deleteEmployee = async function (id) {
        if (confirm("¿Seguro que quieres eliminar este empleado?")) {

            console.log(id);
            try {

                await fetch(`https://api-corp-tort.onrender.com/empleados/delete_empleado/${id}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" }
                });

                // Eliminar el empleado del array de datos
                employees = employees.filter(emp => emp.id_empleado !== id);

                // Eliminar la fila directamente del DOM sin recargar
                const rowToDelete = document.querySelector(`tr[data-id="${id}"]`);
                if (rowToDelete) {
                    rowToDelete.remove();
                }

                renderPagination(); // Volver a renderizar la paginación
            } catch (error) {
                console.error("Error al eliminar:", error);
            }
        }
    };

    window.editEmployee = function (id) {
        const employee = employees.find(emp => emp.id_empleado === id);
        if (employee) {
            const newName = prompt("Nuevo nombre:", employee.nombre);
            const newSalary = prompt("Nuevo salario:", employee.salario);

            if (newName && newSalary) {
                fetch(`https://api-corp-tort.onrender.com/empleados/update/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nombre: newName, salario: parseFloat(newSalary) }),
                })
                    .then(() => fetchEmployees())
                    .catch(error => console.error("Error al actualizar:", error));
            }
        }
    };

    fetchEmployees();
});
