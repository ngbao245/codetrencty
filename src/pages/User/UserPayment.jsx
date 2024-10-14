import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { fetchAllPayment } from '../../services/PaymentService';
import './UserPayment.css';

const UserPayment = () => {
  const { user } = useContext(UserContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getPayments = async () => {
      try {
        const response = await fetchAllPayment();
        console.log('Payments data:', response.data);
        const paymentsData = Array.isArray(response.data) ? response.data : 
                             (Array.isArray(response.data?.data) ? response.data.data : []);
        setPayments(paymentsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching payments:", err);
        setError("Không thể tải lịch sử thanh toán. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    if (user.auth) {
      getPayments();
    }
  }, [user]);

  if (!user.auth) {
    return <div className="user-payment">Vui lòng đăng nhập để xem lịch sử thanh toán.</div>;
  }

  if (loading) {
    return <div className="user-payment">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="user-payment error-message">{error}</div>;
  }

  return (
    <div className="user-payment">
      <h1>Lịch sử thanh toán</h1>
      {payments.length === 0 ? (
        <p>Bạn chưa có lịch sử thanh toán nào.</p>
      ) : (
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
                <td>{payment.amount.toLocaleString('vi-VN')} VND</td>
                <td>{payment.paymentMethod}</td>
                <td>{new Date(payment.paymentDate).toLocaleDateString('vi-VN')}</td>
                <td>{payment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserPayment;

