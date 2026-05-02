import { Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminSignUp from "./pages/AdminSignUp";
import AdminDashboard from "./pages/AdminDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import BrowseProviders from "./pages/BrowseProviders";
import Home from "./pages/Home";
import Application from "./pages/Application";
import BookingStatus from "./pages/BookingStatus";
import PatientSignUp from "./pages/PatientSignUp";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./components/PublicLayout";
import FloatingChatbot from "./components/FloatingChatbot";

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Home />
              <FloatingChatbot />
            </>
          }
        />
        <Route
          path="/home"
          element={
            <>
              <Home />
              <FloatingChatbot />
            </>
          }
        />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignUp />} />
        <Route path="/signup" element={<PatientSignUp />} />
        <Route element={<PublicLayout />}>
          <Route path="/browse" element={<BrowseProviders />} />
          <Route path="/apply" element={<Application />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/bookings" element={<BookingStatus />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/staff/create" element={<AdminDashboard />} />
          <Route path="/admin/staff" element={<AdminDashboard />} />
          <Route path="/admin/applications" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/worker/dashboard" element={<WorkerDashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
