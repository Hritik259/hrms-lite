import React, { useEffect, useState } from "react";
import { getEmployees, addEmployee, deleteEmployee, getAttendance, markAttendance } from "./api";

function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ employee_id: "", full_name: "", email: "", department: "" });
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [attendance, setAttendance] = useState([]);

  async function loadEmployees() {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
    } catch (e) {
      setError(e.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    try {
      await addEmployee(form);
      setForm({ employee_id: "", full_name: "", email: "", department: "" });
      loadEmployees();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    await deleteEmployee(id);
    loadEmployees();
  }

  async function loadAttendance(emp) {
    setSelectedEmp(emp);
    const data = await getAttendance(emp.id);
    setAttendance(data);
  }

  async function handleMark(status) {
    const today = new Date().toISOString().split("T")[0];
    await markAttendance(selectedEmp.id, { date: today, status });
    loadAttendance(selectedEmp);
  }

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>HRMS Lite</h1>

      {/* Add Employee */}
      <div style={styles.card}>
        <h2>Add Employee</h2>
        <form onSubmit={handleAdd} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Employee ID"
            value={form.employee_id}
            onChange={e => setForm({ ...form, employee_id: e.target.value })}
            required
          />
          <input
            style={styles.input}
            placeholder="Full Name"
            value={form.full_name}
            onChange={e => setForm({ ...form, full_name: e.target.value })}
            required
          />
          <input
            style={styles.input}
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            style={styles.input}
            placeholder="Department"
            value={form.department}
            onChange={e => setForm({ ...form, department: e.target.value })}
            required
          />
          <button style={styles.primaryBtn}>Add Employee</button>
        </form>
      </div>

      {/* Employees List */}
      <div style={styles.card}>
        <h2>Employees</h2>
        {employees.length === 0 ? (
          <p>No employees yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {employees.map(emp => (
              <li key={emp.id} style={styles.employeeRow}>
                <div>
                  <b>{emp.full_name}</b>
                  <div style={{ fontSize: 13, color: "#555" }}>
                    {emp.department} • {emp.email}
                  </div>
                </div>
                <div>
                  <button style={styles.smallBtn} onClick={() => loadAttendance(emp)}>
                    Attendance
                  </button>
                  <button style={styles.dangerBtn} onClick={() => handleDelete(emp.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Attendance */}
      {selectedEmp && (
        <div style={styles.card}>
          <h2>Attendance — {selectedEmp.full_name}</h2>
          <div style={{ marginBottom: 10 }}>
            <button style={styles.successBtn} onClick={() => handleMark("Present")}>
              Mark Present
            </button>
            <button style={styles.warningBtn} onClick={() => handleMark("Absent")}>
              Mark Absent
            </button>
          </div>

          {attendance.length === 0 ? (
            <p>No records yet.</p>
          ) : (
            <ul>
              {attendance.map(a => (
                <li key={a.id}>
                  {a.date} — {a.status}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* 🎨 Styles */
const styles = {
  page: {
    maxWidth: 900,
    margin: "auto",
    padding: 20,
    fontFamily: "Segoe UI, Arial, sans-serif",
    background: "#f5f7fb",
    minHeight: "100vh"
  },
  title: {
    textAlign: "center",
    marginBottom: 20
  },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: 20
  },
  form: {
    display: "grid",
    gap: 10
  },
  input: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 14
  },
  primaryBtn: {
    padding: 10,
    borderRadius: 6,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontSize: 15
  },
  smallBtn: {
    marginRight: 8,
    padding: "6px 10px",
    borderRadius: 5,
    border: "none",
    background: "#0ea5e9",
    color: "#fff",
    cursor: "pointer"
  },
  dangerBtn: {
    padding: "6px 10px",
    borderRadius: 5,
    border: "none",
    background: "#dc2626",
    color: "#fff",
    cursor: "pointer"
  },
  successBtn: {
    marginRight: 8,
    padding: "8px 12px",
    borderRadius: 6,
    border: "none",
    background: "#16a34a",
    color: "#fff",
    cursor: "pointer"
  },
  warningBtn: {
    padding: "8px 12px",
    borderRadius: 6,
    border: "none",
    background: "#f59e0b",
    color: "#000",
    cursor: "pointer"
  },
  employeeRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottom: "1px solid #eee"
  }
};

export default App;
