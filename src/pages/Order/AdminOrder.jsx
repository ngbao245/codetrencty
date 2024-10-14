import React, { useState, useEffect } from "react";
import AdminHeader from "../../layouts/header/AdminHeader";
import { fetchOrder, assignStaff } from "../../services/OrderService";
import StaffDropdown from "../../components/StaffDropdown";
import { toast } from "react-toastify";
import "./AdminOrder.css";

const AdminOrder = () => {
  const [orders, setOrders] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderResponse, staffResponse] = await Promise.all([
          fetchOrder(),
          fetchAllStaff(),
        ]);

        const ordersWithDetails = await Promise.all(
          orderResponse.data.map(async (order) => {
            const assignedStaff = staffResponse.data.entities.find(
              (staff) => staff.id === order.staffId
            );
            return { ...order, assignedStaffName: assignedStaff?.name || "" };
          })
        );

        setOrders(ordersWithDetails);
        setStaffMembers(staffResponse.data.entities || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data", err);
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssignStaff = async (orderId, staffId) => {
    try {
      await assignStaff(orderId, staffId);
      toast.success("Staff assigned successfully!");
    } catch (error) {
      toast.error("Failed to assign staff");
    }
  };

  const filteredOrders = orders.filter((order) =>
    order.userName.toLowerCase().includes(searchTerm)
  );

  return (
    <>
      <AdminHeader />
      <div className="admin-order-container container">
        <div className="my-3">
          <input
            className="form-control"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="customize-table">
          <table className="table table-striped text-center">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Assigned Staff</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.orderId}>
                  <td>{order.orderId}</td>
                  <td>{order.userName}</td>
                  <td>{order.productName}</td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                  <td>{order.total}</td>
                  <td>{order.status}</td>
                  <td>{order.assignedStaffName || "Not assigned"}</td>
                  <td>
                    <StaffDropdown
                      className="assign"
                      staffMembers={staffMembers}
                      currentStaffId={order.staffId}
                      onAssign={(staffId) =>
                        handleAssignStaff(order.orderId, staffId)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminOrder;
