import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout } from './components/PublicLayout'
import { DashboardLayout } from './components/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HomePage } from './pages/public/HomePage'
import { ExamPage } from './pages/public/ExamPage'
import { DiagnosticIntroPage } from './pages/public/DiagnosticIntroPage'
import { LoginPage } from './pages/public/LoginPage'
import { NotFoundPage } from './pages/public/NotFoundPage'
import { AccountPage, CatalogPage, CentCheckoutPage, CentCheckoutResult, LibraryPage, NotesPage } from './pages/CommercePages'
import { StudyReader } from './pages/StudyReader'
import { LearningProgress } from './pages/LearningProgress'
import { CourseDetails } from './pages/CourseCatalog'
import { CentDashboard, CentExamPage, CentResultPage, CentResultsPage, CentSimulatorsPage } from './pages/PracticePages'
import { CentAdminDashboard, CentContentAdmin, CentOrdersAdmin, CentProductsAdmin, CentQuestionsAdmin, CentUsersAdmin } from './pages/admin/CentAdmin'

export default function App() {
  return <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}><Routes>
    <Route element={<PublicLayout/>}>
      <Route path="/" element={<HomePage/>}/><Route path="/exam" element={<ExamPage/>}/>
      <Route path="/courses/:code" element={<CourseDetails/>}/>
      <Route path="/diagnostic/intro" element={<DiagnosticIntroPage/>}/><Route path="/diagnostic/results" element={<Navigate to="/student/results" replace/>}/>
      <Route path="/package" element={<CatalogPage/>}/><Route path="/checkout" element={<CentCheckoutPage/>}/>
      <Route path="/checkout/success" element={<CentCheckoutResult/>}/><Route path="/login" element={<LoginPage/>}/>
    </Route>
    <Route path="/diagnostic/test" element={<CentExamPage/>}/>
    <Route element={<ProtectedRoute role="STUDENT"/>}>
      <Route path="/student" element={<DashboardLayout mode="student"/>}>
        <Route index element={<CentDashboard/>}/><Route path="preparation" element={<LibraryPage/>}/>
        <Route path="results" element={<CentResultsPage/>}/><Route path="results/:id" element={<CentResultPage/>}/>
        <Route path="analysis" element={<LearningProgress/>}/><Route path="practice" element={<CentExamPage kind="practice"/>}/><Route path="content" element={<LibraryPage/>}/>
        <Route path="notes" element={<NotesPage/>}/><Route path="simulators" element={<CentSimulatorsPage/>}/>
        <Route path="simulators/test" element={<CentExamPage kind="simulator"/>}/><Route path="simulators/result" element={<Navigate to="/student/results" replace/>}/>
        <Route path="profile" element={<AccountPage/>}/>
      </Route>
      <Route path="/student/study/:id" element={<StudyReader/>}/>
    </Route>
    <Route element={<ProtectedRoute role="ADMIN"/>}>
      <Route path="/admin" element={<DashboardLayout mode="admin"/>}>
        <Route index element={<CentAdminDashboard/>}/><Route path="users" element={<CentUsersAdmin/>}/>
        <Route path="content" element={<CentContentAdmin/>}/><Route path="subjects" element={<CentContentAdmin/>}/>
        <Route path="packages" element={<CentProductsAdmin/>}/><Route path="orders" element={<CentOrdersAdmin/>}/>
        <Route path="finance" element={<CentOrdersAdmin/>}/><Route path="questions" element={<CentQuestionsAdmin/>}/>
        <Route path="diagnostics" element={<CentQuestionsAdmin/>}/><Route path="simulators" element={<CentQuestionsAdmin/>}/>
        <Route path="*" element={<Navigate to="/admin" replace/>}/>
      </Route>
    </Route>
    <Route path="*" element={<NotFoundPage/>}/>
  </Routes></BrowserRouter>
}
