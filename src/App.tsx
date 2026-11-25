import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout } from './components/PublicLayout'
import { DashboardLayout } from './components/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HomePage } from './pages/public/HomePage'
import { ExamPage } from './pages/public/ExamPage'
import { DiagnosticIntroPage } from './pages/public/DiagnosticIntroPage'
import { LoginPage } from './pages/public/LoginPage'
import { NotFoundPage } from './pages/public/NotFoundPage'
import { AccountPage, CentCheckoutResult, LibraryPage, NotesPage } from './pages/CommercePages'
import { CheckoutPage, DevelopmentPaymentPage, SubjectCatalogPage } from './pages/SubjectCommercePages'
import { StudyReader } from './pages/StudyReader'
import { LearningProgress } from './pages/LearningProgress'
import { ReadinessPage } from './pages/ReadinessPage'
import { CourseDetails } from './pages/CourseCatalog'
import { MockAttemptPage, MockExamsPage, MockResultPage } from './pages/MockExams'
import { CentDashboard, CentExamPage, CentResultPage, CentResultsPage, CentSimulatorsPage } from './pages/PracticePages'
import { AdminLayout } from './pages/admin/AdminLayout'
import { ContentPreview } from './pages/admin/ContentPreview'
import { AdminOverviewPage, AdminUsersPage, AdminResourcesPage, AdminContentPage, AdminAssessmentsPage, AdminQuestionsPage, AdminOrdersPage, AdminSubscriptionsPage, AdminProductsPage, AdminReportsPage, AdminRolesPage, AdminSettingsPage } from './pages/admin/AdminPages'

export default function App() {
  return <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}><Routes>
    <Route element={<PublicLayout/>}>
      <Route path="/" element={<HomePage/>}/><Route path="/exam" element={<ExamPage/>}/>
      <Route path="/courses/:code" element={<CourseDetails/>}/>
      <Route path="/diagnostic/intro" element={<DiagnosticIntroPage/>}/><Route path="/diagnostic/results" element={<Navigate to="/student/results" replace/>}/>
      <Route path="/package" element={<SubjectCatalogPage/>}/><Route path="/checkout" element={<CheckoutPage/>}/>
      <Route path="/checkout/development" element={<DevelopmentPaymentPage/>}/>
      <Route path="/checkout/success" element={<CentCheckoutResult/>}/><Route path="/login" element={<LoginPage/>}/>
    </Route>
    <Route path="/diagnostic/test" element={<CentExamPage/>}/>
    <Route element={<ProtectedRoute role="STUDENT"/>}>
      <Route path="/student" element={<DashboardLayout mode="student"/>}>
        <Route index element={<CentDashboard/>}/><Route path="preparation" element={<ReadinessPage/>}/>
        <Route path="results" element={<CentResultsPage/>}/><Route path="results/:id" element={<CentResultPage/>}/>
        <Route path="analysis" element={<LearningProgress/>}/><Route path="practice" element={<CentExamPage kind="practice"/>}/><Route path="content" element={<LibraryPage/>}/>
        <Route path="notes" element={<NotesPage/>}/><Route path="simulators" element={<CentSimulatorsPage/>}/>
        <Route path="mock-exams" element={<MockExamsPage/>}/><Route path="mock-exams/:id" element={<MockAttemptPage/>}/><Route path="mock-exams/:id/result" element={<MockResultPage/>}/>
        <Route path="simulators/test" element={<CentExamPage kind="simulator"/>}/><Route path="simulators/result" element={<Navigate to="/student/results" replace/>}/>
        <Route path="profile" element={<AccountPage/>}/>
      </Route>
      <Route path="/student/study/:id" element={<StudyReader/>}/>
    </Route>
    <Route element={<ProtectedRoute role="ADMIN"/>}>
      <Route path="/admin/content-preview/:id" element={<ContentPreview/>}/>
      <Route path="/admin" element={<AdminLayout/>}>
        <Route index element={<AdminOverviewPage/>}/><Route path="users" element={<AdminUsersPage/>}/>
        <Route path="resources" element={<AdminResourcesPage/>}/><Route path="content" element={<AdminContentPage/>}/>
        <Route path="assessments" element={<AdminAssessmentsPage/>}/><Route path="questions" element={<AdminQuestionsPage/>}/>
        <Route path="orders" element={<AdminOrdersPage/>}/><Route path="subscriptions" element={<AdminSubscriptionsPage/>}/>
        <Route path="packages" element={<AdminProductsPage/>}/><Route path="reports" element={<AdminReportsPage/>}/>
        <Route path="roles" element={<AdminRolesPage/>}/><Route path="settings" element={<AdminSettingsPage/>}/>
        <Route path="finance" element={<Navigate to="/admin/orders" replace/>}/>
        <Route path="diagnostics" element={<Navigate to="/admin/questions" replace/>}/>
        <Route path="simulators" element={<Navigate to="/admin/assessments" replace/>}/>
        <Route path="subjects" element={<Navigate to="/admin/content" replace/>}/>
        <Route path="*" element={<Navigate to="/admin" replace/>}/>
      </Route>
    </Route>
    <Route path="*" element={<NotFoundPage/>}/>
  </Routes></BrowserRouter>
}
