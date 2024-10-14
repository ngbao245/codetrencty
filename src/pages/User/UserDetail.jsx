import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import "./UserDetail.css";
import { updateUserInfo } from "../../services/UserService";
import { getOrderByUser } from "../../services/OrderService";
import { fetchAllPayment } from "../../services/PaymentService";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({
    name: "",
    email: user.email || "",
    password: "",
    address: "",
    phone: "",
  });

  const isPaymentPage = window.location.pathname.includes("/payments");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (isPaymentPage) {
          const paymentsResponse = await fetchAllPayment();
          setPayments(paymentsResponse.data?.data || []);
        } else {
          const ordersResponse = await getOrderByUser();
          setOrders(ordersResponse.data || []);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    if (user.auth) {
      fetchData();
    }
  }, [user, isPaymentPage]);

  const handleNavigateToPayments = () => {
    navigate(`/${id}/payments`);
  };

  const handleNavigateToOrders = () => {
    navigate(`/${id}/detail`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!updatedUser.password) {
      setError("Vui lòng nhập mật khẩu để cập nhật thông tin.");
      return;
    }
    try {
      const response = await updateUserInfo(updatedUser);
      setUpdatedUser((prev) => ({ ...prev, ...response.data, password: "" }));
      setEditMode(false);
      setError(null);
    } catch (err) {
      setError(
        err.message || "Không thể cập nhật thông tin. Vui lòng thử lại."
      );
      console.error(err);
    }
  };

  if (!user.auth) {
    return (
      <div className="user-detail-container">
        Vui lòng đăng nhập để xem thông tin.
      </div>
    );
  }

  if (loading) {
    return <div className="user-detail-container">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="user-detail-container error-message">{error}</div>;
  }

  return (
    <div className="user-detail-container">
      <h1>{isPaymentPage ? "Lịch sử thanh toán" : "Thông tin người dùng"}</h1>

      {!isPaymentPage && (
        <div className="user-info">
          {editMode ? (
            <form onSubmit={handleSubmit} className="edit-form">
              <div>
                <label htmlFor="name">Tên:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={updatedUser.name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={updatedUser.email}
                  onChange={handleInputChange}
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="password">
                  Mật khẩu (bắt buộc để cập nhật):
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={updatedUser.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="address">Địa chỉ:</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={updatedUser.address}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="phone">Số điện thoại:</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={updatedUser.phone}
                  onChange={handleInputChange}
                />
              </div>
              <button type="submit">Lưu thay đổi</button>
              <button type="button" onClick={() => setEditMode(false)}>
                Hủy
              </button>
            </form>
          ) : (
            <>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Tên:</strong> {updatedUser.name || "Chưa cung cấp"}
              </p>
              <p>
                <strong>Địa chỉ:</strong>{" "}
                {updatedUser.address || "Chưa cung cấp"}
              </p>
              <p>
                <strong>Số điện thoại:</strong>{" "}
                {updatedUser.phone || "Chưa cung cấp"}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                <span
                  className={`auth-status ${
                    user.auth ? "authenticated" : "not-authenticated"
                  }`}
                >
                  {user.auth ? "Đã xác thực" : "Chưa xác thực"}
                </span>
              </p>
              <button onClick={() => setEditMode(true)}>
                Chỉnh sửa thông tin
              </button>
            </>
          )}
        </div>
      )}

      {isPaymentPage ? (
        <>
          <table className="payment-table">
            <thead>
              <tr>
                <th>Mã thanh toán</th>
                <th>Số tiền</th>
                <th>Phương thức</th>
                <th>Ngày thanh toán</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>{payment.amount.toLocaleString("vi-VN")} VND</td>
                  <td>{payment.paymentMethod}</td>
                  <td>
                    {new Date(payment.paymentDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td>{payment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleNavigateToOrders} className="btn btn-primary">
            Xem thông tin người dùng
          </button>
        </>
      ) : (
        <>
          <h2>Đơn hàng của bạn</h2>
          {orders.length === 0 ? (
            <p>Bạn chưa có đơn hàng nào.</p>
          ) : (
            <table className="order-table">
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Số lượng sản phẩm</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId}>
                    <td>{order.orderId}</td>
                    <td>{order.total.toLocaleString("vi-VN")} VND</td>
                    <td>{order.status}</td>
                    <td>
                      {order.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button
            onClick={handleNavigateToPayments}
            className="btn btn-primary"
          >
            Xem lịch sử thanh toán
          </button>
        </>
      )}
    </div>
  );
};

export default UserDetail;
