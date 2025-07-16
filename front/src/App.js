import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import './App.css';
import NavBar from './components/navbar/Navbar'
import Home from './pages/home/home'
import Competitors from "./pages/Competitors/Competitors";
import TournamentDetails from "./pages/TournoiDetails/TournamentDetails"
import Telecommande from "./pages/Telecommande/components/Telecommande";
import Scoreboard from "./pages/Scoreboard/Scoarboard";
import TournamentList from "./pages/TournamentList/TournamentList";
import OngoingTournaments from "./pages/OngoingTournaments/OngoingTournaments";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Profile from "./pages/Auth/Profile";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import Support from "./pages/Support/Support";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="App">
      <Router>
        <NavBar />
        <Routes>
          {/* Routes accessibles sans connexion */}
          <Route path='/' element={<div className='content'><Home /></div>} />
          <Route path='/ongoing-tournaments' element={<div className='content'><OngoingTournaments /></div>} />
          <Route path='/login' element={<div className='content'><Login /></div>} />
          <Route path='/register' element={<div className='content'><Register /></div>} />
          <Route path='/forgot-password' element={<div className='content'><ForgotPassword /></div>} />
          <Route path='/reset-password' element={<div className='content'><ResetPassword /></div>} />
          
          {/* Routes accessibles aux utilisateurs connectés (user et admin) */}
          <Route path='/support' element={
            <ProtectedRoute>
              <div className='content'><Support /></div>
            </ProtectedRoute>
          } />
          <Route path='/profile' element={
            <ProtectedRoute>
              <div className='content'><Profile /></div>
            </ProtectedRoute>
          } />
          <Route path='/competiteurs' element={
            <ProtectedRoute>
              <div className='content'><Competitors /></div>
            </ProtectedRoute>
          } />
          <Route path='/tournois' element={
            <ProtectedRoute>
              <div className='content'><TournamentList /></div>
            </ProtectedRoute>
          } />
          <Route path='/tournament/:id' element={
            <ProtectedRoute>
              <div className='content'><TournamentDetails /></div>
            </ProtectedRoute>
          } />
          
          {/* Routes accessibles aux administrateurs de club et super administrateurs */}
          <Route path='/telecommande' element={
            <ProtectedRoute allowedRoles={['admin', 'club_admin']}>
              <div className='content'><Telecommande /></div>
            </ProtectedRoute>
          } />
          <Route path='/scoreboard' element={
            <ProtectedRoute allowedRoles={['admin', 'club_admin']}>
              <div className='content'><Scoreboard /></div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
