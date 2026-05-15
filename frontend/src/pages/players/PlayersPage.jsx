// src/pages/players/PlayersPage.jsx

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import PublicLayout from '../../layouts/PublicLayout';

import { getPlayers } from '../../api/players.api';
import { getPublicHome } from '../../api/public.api';

import PlayerCard from '../../components/cards/PlayerCard';

import './PlayersPage.css';

function PlayersPage() {
  const { tenantSlug } = useParams();

  const [players, setPlayers] = useState([]);
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    loadPlayers();
  }, [tenantSlug]);

  const loadPlayers = async () => {
    try {
      if (tenantSlug) {
        const res = await getPublicHome(tenantSlug);

        setTenant(res.data.tenant || null);
        setPlayers(res.data.players || []);

        return;
      }

      const res = await getPlayers();

      setPlayers(res.data.players || []);
    } catch (error) {
      console.log(error);
    }
  };

  const basePath = tenantSlug ? `/team/${tenantSlug}` : '';

  return (
    <PublicLayout tenantSlug={tenantSlug}>
      <section className="players-page">
        <div className="players-overlay"></div>

        <div className="players-content">
          <div className="players-header">
            <div>
              <span className="players-badge">
                {tenant?.name || 'DiamondStats Players'}
              </span>

              <h1 className="players-title">
                Jugadores
              </h1>

              <p className="players-subtitle">
                Estadísticas, perfiles y rendimiento completo de los jugadores de softball.
              </p>
            </div>

            <div className="players-stats-box">
              <h3>
                Total Jugadores
              </h3>

              <span>
                {players.length}
              </span>
            </div>
          </div>

          <div className="players-grid">
            {players.map((player) => (
              <Link
                key={player.id}
                to={`${basePath}/players/${player.id}`}
                className="player-link"
              >
                <PlayerCard player={player} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

export default PlayersPage;