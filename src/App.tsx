import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PublicLayout } from './components/PublicLayout'
import { DashboardLayout } from './components/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HomePage } from './pages/public/HomePage'
import { ExamPage } from './pages/public/ExamPage'
import { DiagnosticIntroPage } from './pages/public/DiagnosticIntroPage'
import { DiagnosticTestPage } from './pages/public/DiagnosticTestPage'
import { DiagnosticResultsPage } from './pages/public/DiagnosticResultsPage'
import { PackagePage } from './pages/public/PackagePage'
import { CheckoutPage, CheckoutSuccessPage } from './pages/public/CheckoutPage'
import { LoginPage } from './pages/public/LoginPage'
import { NotFoundPage } from './pages/public/NotFoundPage'
import { MyResultsPage, PackageContentPage, PreparationPage, ProfilePage, SimulatorResultPage, SimulatorsPage, SimulatorTestPage, StudentAnalysisPage, StudentDashboardPage } from './pages/student/StudentPages'
import { AdminDashboardPage, AIAdminPage, ContentAdminPage, DiagnosticsAdminPage, PackagesAdminPage, SimulatorsAdminPage, UsersAdminPage } from './pages/admin/AdminPages'
import { DatabaseAdminPage, FinanceAdminPage, N8nAdminPage } from './pages/admin/AdminIntegrations'

export default function App() {
  return <BrowserRouter><Routes>
    <Route element={<PublicLayout/>}>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/exam" element={<ExamPage/>}/>
      <Route path="/diagnostic/intro" element={<DiagnosticIntroPage/>}/>
      <Route path="/diagnostic/results" element={<DiagnosticResultsPage/>}/>
      <Route path="/package" element={<PackagePage/>}/>
      <Route path="/checkout" element={<CheckoutPage/>}/>
      <Route path="/checkout/success" element={<CheckoutSuccessPage/>}/>
      <Route path="/login" element={<LoginPage/>}/>
    </Route>
    <Route path="/diagnostic/test" element={<DiagnosticTestPage/>}/>
    <Route element={<ProtectedRoute role="STUDENT"/>}>
      <Route path="/student" element={<DashboardLayout mode="student"/>}>
        <Route index element={<StudentDashboardPage/>}/><Route path="preparation" element={<PreparationPage/>}/><Route path="results" element={<MyResultsPage/>}/><Route path="analysis" element={<StudentAnalysisPage/>}/><Route path="content" element={<PackageContentPage/>}/><Route path="simulators" element={<SimulatorsPage/>}/><Route path="simulators/test" element={<SimulatorTestPage/>}/><Route path="simulators/result" element={<SimulatorResultPage/>}/><Route path="profile" element={<ProfilePage/>}/>
      </Route>
    </Route>
    <Route element={<ProtectedRoute role="ADMIN"/>}>
      <Route path="/admin" element={<DashboardLayout mode="admin"/>}>
        <Route index element={<AdminDashboardPage/>}/><Route path="users" element={<UsersAdminPage/>}/><Route path="questions" element={<DiagnosticsAdminPage/>}/><Route path="subjects" element={<ContentAdminPage/>}/><Route path="diagnostics" element={<DiagnosticsAdminPage/>}/><Route path="simulators" element={<SimulatorsAdminPage/>}/><Route path="packages" element={<PackagesAdminPage/>}/><Route path="orders" element={<FinanceAdminPage/>}/><Route path="finance" element={<FinanceAdminPage/>}/><Route path="ai" element={<AIAdminPage/>}/><Route path="n8n" element={<N8nAdminPage/>}/><Route path="database" element={<DatabaseAdminPage/>}/><Route path="content" element={<ContentAdminPage/>}/><Route path="settings" element={<DatabaseAdminPage/>}/>
      </Route>
    </Route>
    <Route path="*" element={<NotFoundPage/>}/>
  </Routes></BrowserRouter>
}
