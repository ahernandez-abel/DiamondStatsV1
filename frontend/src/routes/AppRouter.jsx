import { Navigate, Route, Routes } from 'react-router-dom'

import ProtectedRoute from './ProtectedRoute'
import PublicTenantRoute from './PublicTenantRoute'

import LandingPage from '../pages/landing/LandingPage'
import RegisterTeamPage from '../pages/register/RegisterTeamPage'
import TeamAccessPage from '../pages/access/TeamAccessPage'

import HomePage from '../pages/home/HomePage'
import LoginPage from '../pages/auth/LoginPage'

import PlayersPage from '../pages/players/PlayersPage'
import CreatePlayerPage from '../pages/players/CreatePlayerPage'
import PlayerDetailsPage from '../pages/players/PlayerDetailsPage'
import AdminPlayersPage from '../pages/players/AdminPlayersPage'

import TeamsPage from '../pages/teams/TeamsPage'
import CreateTeamPage from '../pages/teams/CreateTeamPage'

import GamesPage from '../pages/games/GamesPage'
import CreateGamePage from '../pages/games/CreateGamePage'
import GameStatsPage from '../pages/games/GameStatsPage'
import UpdateGameResultPage from '../pages/games/UpdateGameResultPage'

import BattingStatsPage from '../pages/stats/BattingStatsPage'
import PitchingStatsPage from '../pages/stats/PitchingStatsPage'
import FieldingStatsPage from '../pages/stats/FieldingStatsPage'

import ComparePlayersPage from '../pages/compare/ComparePlayersPage'

import AdminDashboardPage from '../pages/admin/AdminDashboardPage'

function AppRouter() {
  return (
    <Routes>

      {/* LANDING PUBLICA */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register-team" element={<RegisterTeamPage />} />
      <Route path="/team-access" element={<TeamAccessPage />} />

      {/* PUBLIC TENANT ROUTES */}
      <Route
        path="/team/:tenantSlug"
        element={
          <PublicTenantRoute>
            <HomePage />
          </PublicTenantRoute>
        }
      />

      <Route
        path="/team/:tenantSlug/home"
        element={
          <PublicTenantRoute>
            <HomePage />
          </PublicTenantRoute>
        }
      />

      <Route
        path="/team/:tenantSlug/players"
        element={
          <PublicTenantRoute>
            <PlayersPage />
          </PublicTenantRoute>
        }
      />

      <Route
        path="/team/:tenantSlug/players/:id"
        element={
          <PublicTenantRoute>
            <PlayerDetailsPage />
          </PublicTenantRoute>
        }
      />

      <Route
        path="/team/:tenantSlug/comparar"
        element={
          <PublicTenantRoute>
            <ComparePlayersPage />
          </PublicTenantRoute>
        }
      />

      <Route
        path="/team/:tenantSlug/teams"
        element={
          <PublicTenantRoute>
            <TeamsPage />
          </PublicTenantRoute>
        }
      />

      <Route
        path="/team/:tenantSlug/games"
        element={
          <PublicTenantRoute>
            <GamesPage />
          </PublicTenantRoute>
        }
      />

      <Route
        path="/team/:tenantSlug/stats/batting"
        element={
          <PublicTenantRoute>
            <BattingStatsPage />
          </PublicTenantRoute>
        }
      />

      <Route
        path="/team/:tenantSlug/stats/pitching"
        element={
          <PublicTenantRoute>
            <PitchingStatsPage />
          </PublicTenantRoute>
        }
      />

      <Route
        path="/team/:tenantSlug/stats/fielding"
        element={
          <PublicTenantRoute>
            <FieldingStatsPage />
          </PublicTenantRoute>
        }
      />

      {/* AUTH */}
      <Route path="/login" element={<LoginPage />} />

      {/* ADMIN DASHBOARD */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* ADMIN PLAYERS */}
      <Route
        path="/admin/players"
        element={
          <ProtectedRoute>
            <AdminPlayersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/players/create"
        element={
          <ProtectedRoute>
            <CreatePlayerPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/players/:id/edit"
        element={
          <ProtectedRoute>
            <CreatePlayerPage />
          </ProtectedRoute>
        }
      />

      {/* ADMIN TEAMS */}
      <Route
        path="/admin/teams/create"
        element={
          <ProtectedRoute>
            <CreateTeamPage />
          </ProtectedRoute>
        }
      />

      {/* ADMIN GAMES */}
      <Route
        path="/admin/games"
        element={
          <ProtectedRoute>
            <GamesPage admin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/games/create"
        element={
          <ProtectedRoute>
            <CreateGamePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/games/:id/stats"
        element={
          <ProtectedRoute>
            <GameStatsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/games/:id/result"
        element={
          <ProtectedRoute>
            <UpdateGameResultPage />
          </ProtectedRoute>
        }
      />

      {/* ADMIN COMPARE */}
      <Route
        path="/admin/comparar"
        element={
          <ProtectedRoute>
            <ComparePlayersPage admin />
          </ProtectedRoute>
        }
      />

      {/* ADMIN STATS */}
      <Route
        path="/admin/stats/batting"
        element={
          <ProtectedRoute>
            <BattingStatsPage admin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/stats/pitching"
        element={
          <ProtectedRoute>
            <PitchingStatsPage admin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/stats/fielding"
        element={
          <ProtectedRoute>
            <FieldingStatsPage admin />
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

export default AppRouter