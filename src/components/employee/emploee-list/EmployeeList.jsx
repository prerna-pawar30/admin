/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { EmployeeService } from "../../../backend/ApiService";
import TeamHeader from "./TeamHeader";
import SearchBar from "./SearchBar";
import EmployeeTable from "./EmployeeTable";
import PermissionsModal from "./PermissionsModal";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const filteredEmployees = employees.filter((emp) =>
    `${emp.firstName} ${emp.lastName} ${emp.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredEmployees.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);

  return (
    <div className="min-h-screen p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10">
          <TeamHeader 
            totalEmployees={employees.length} 
            filteredCount={totalItems} 
            showingStart={indexOfLastItem - itemsPerPage + 1}
            showingEnd={Math.min(indexOfLastItem, totalItems)}
          />
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>

       <EmployeeTable 
          employees={currentItems} 
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