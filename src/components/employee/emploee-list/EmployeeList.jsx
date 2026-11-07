/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { EmployeeService } from "../../../backend/ApiService";
import PageHeader from "../../ui/PageHeader";
import { HiUserGroup } from "react-icons/hi";
import SearchBar from "./SearchBar";
import EmployeeTable from "./EmployeeTable";
import PermissionsModal from "./PermissionsModal";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState(null);

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await EmployeeService.getAllEmployees();
      setEmployees(res.data || []);
    } catch (err) {
      Swal.fire("Error", "Could not load directory", "error");
    } finally { setLoading(false); }
  };

  // Full filtered list — NO slicing here. EmployeeTable owns pagination.
  const filteredEmployees = employees.filter((emp) =>
    `${emp.firstName} ${emp.lastName} ${emp.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div>
        <PageHeader
          icon={HiUserGroup}
          title="Employees"
          badge={`${employees.length} total`}
          description={`Manage roles, permissions and profiles for your team${searchTerm ? ` · ${filteredEmployees.length} matching` : ""}.`}
          actions={<SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
        />

        <EmployeeTable
          employees={filteredEmployees}
          loading={loading}
          onSelectEmployee={setSelectedEmp}
          setEmployees={setEmployees}
          refreshData={fetchEmployees}
        />
      </div>

      <PermissionsModal
        employee={selectedEmp}
        onClose={() => setSelectedEmp(null)}
      />
    </div>
  );
};

export default EmployeeList;