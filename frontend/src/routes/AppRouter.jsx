import { Routes, Route } from 'react-router-dom'

import ProtectedRoute from './ProtectedRoute'

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

function AppRouter() {

  return (
    <Routes>

      <Route
    path="/"
    element={<HomePage defaultTenantSlug="team-mahanaim" />}
  />

  <Route
    path="/team/:tenantSlug"
    element={<HomePage />}
  />

  <Route
    path="/login"
    element={<LoginPage />}
  />

      <Route
        path="/players"
        element={<PlayersPage />}
      />

      <Route
        path="/players/:id"
        element={<PlayerDetailsPage />}
      />

      <Route
        path="/comparar"
        element={<ComparePlayersPage />}
      />

      <Route
        path="/teams"
        element={<TeamsPage />}
      />

      <Route
        path="/games"
        element={<GamesPage />}
      />

      <Route
        path="/stats/batting"
        element={<BattingStatsPage />}
      />

      <Route
        path="/stats/pitching"
        element={<PitchingStatsPage />}
      />

      <Route
        path="/stats/fielding"
        element={<FieldingStatsPage />}
      />

      <Route
        path="/players/create"
        element={
          <ProtectedRoute>
            <CreatePlayerPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/players"
        element={
          <ProtectedRoute>
            <AdminPlayersPage />
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

      <Route
        path="/teams/create"
        element={
          <ProtectedRoute>
            <CreateTeamPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/games/create"
        element={
          <ProtectedRoute>
            <CreateGamePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/games"
        element={
          <ProtectedRoute>
            <GamesPage admin />
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

    </Routes>
  )
}

export default AppRouter