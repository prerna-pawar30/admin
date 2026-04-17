/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { UserService } from "../../backend/ApiService"; 
import Pagination from "../ui/Pagination"; // Adjust path to where you saved your file

export default function UserDetails() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States to match your Pagination props
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await UserService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const safeUsers = users || [];
  
  // Calculate sliced data for the table
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = safeUsers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="py-6 md:py-12 px-2 sm:px-4 md:px-4">
      <div className="w-full bg-white rounded-lg md:rounded-3xl border border-gray-200 overflow-hidden">
        
        {/* HEADER */}
        <div className="p-4 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-[#E68736]">
            Users <span className="text-black">Details</span>
          </h2>
          
          <select 
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); 
            }}
            className="border rounded-xl p-2 text-xs font-black text-slate-500 outline-orange-400 cursor-pointer"
          >
            {[5, 10, 20, 50].map(val => (
              <option key={val} value={val}>SHOW {val}</option>
            ))}
          </select>
        </div>

        {/* TABLE SECTION */}
        <div className="overflow-x-auto px-4 sm:px-8">
          {loading ? (
            <div className="py-20 text-center animate-pulse text-slate-400 font-black uppercase text-[10px] tracking-widest">
              Syncing Database...
            </div>
          ) : (
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="p-4 text-left">User Name</th>
                  <th className="p-4 text-left hidden sm:table-cell">Email Address</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-700">{u.firstName} {u.lastName}</td>
                    <td className="p-4 text-slate-500 hidden sm:table-cell">{u.email}</td>
                    <td className="p-4 text-center">
                      <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* --- YOUR PAGINATION COMPONENT --- */}
        <Pagination 
          totalItems={safeUsers.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
}