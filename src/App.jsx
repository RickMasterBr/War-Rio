// src/App.jsx
import React, { useState } from 'react';
import { Client } from 'boardgame.io/react';
import { WarRio } from './Game';
import { WarBoard } from './Board';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const WarBoardWrapper = (props) => {
    return <WarBoard {...props} onRestart={() => setGameKey(k => k + 1)} />;
  };

  const WarClient = Client({
    game: WarRio,
    board: WarBoardWrapper,
    numPlayers: 4,
    debug: false, 
  });

  // Dados das fações para o ecrã inicial
  const factions = [
    { name: 'CV', color: '#ff3333' },
    { name: 'TCP', color: '#33cc33' },
    { name: 'ADA', color: '#ffcc00' },
    { name: 'Milícia', color: '#3366ff' }
  ];

  if (!isPlaying) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        backgroundColor: '#0a0a0a', 
        backgroundImage: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)', 
        color: 'white', 
        fontFamily: 'monospace',
        margin: 0,
        padding: 0
      }}>
        
        {/* CAIXA DO MENU INICIAL ESTILIZADA */}
        <div style={{ 
          padding: '50px 60px', 
          border: '2px solid #5bc0de', 
          borderRadius: '12px', 
          backgroundColor: 'rgba(0, 0, 0, 0.6)', 
          boxShadow: '0 0 40px rgba(91, 192, 222, 0.15), inset 0 0 20px rgba(91, 192, 222, 0.1)', 
          textAlign: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          
          <h2 style={{ 
            color: '#888', 
            letterSpacing: '6px', 
            margin: '0 0 15px 0', 
            fontSize: '14px',
            textTransform: 'uppercase'
          }}>
            Sistema de Simulação Tática
          </h2>
          
          <h1 style={{ 
            fontSize: '4rem', 
            margin: '0 0 10px 0', 
            color: '#fff', 
            textShadow: '0 0 15px rgba(255,255,255,0.3)',
            lineHeight: '1.1'
          }}>
            WAR
          </h1>
          
          <h2 style={{ 
            fontSize: '2rem', 
            color: '#ffdd55', 
            margin: '0 0 30px 0',
            fontWeight: 'normal',
            letterSpacing: '2px'
          }}>
            Metrópole Fluminense
          </h2>

          {/* INDICADORES DAS FAÇÕES */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '15px', 
            marginBottom: '40px', 
            flexWrap: 'wrap' 
          }}>
            {factions.map(fac => (
              <div key={fac.name} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                backgroundColor: 'rgba(255,255,255,0.05)', 
                padding: '6px 14px', 
                borderRadius: '20px', 
                border: '1px solid rgba(255,255,255,0.1)' 
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: fac.color, 
                  borderRadius: '50%', 
                  boxShadow: `0 0 8px ${fac.color}` 
                }} />
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: '#eaeaea', 
                  letterSpacing: '1px' 
                }}>
                  {fac.name}
                </span>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => setIsPlaying(true)} 
            style={{ 
              padding: '18px 40px', 
              fontSize: '1.2rem', 
              backgroundColor: '#5bc0de', 
              color: '#000', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 4px 15px rgba(91, 192, 222, 0.4)',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 25px rgba(91, 192, 222, 0.6)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 15px rgba(91, 192, 222, 0.4)';
            }}
          >
            ➤ Iniciar Operação
          </button>
          
          <div style={{ marginTop: '30px', color: '#555', fontSize: '12px' }}>
            v1.0.0 | Módulo de Inteligência Ativo
          </div>

        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#111', minHeight: '100vh', margin: 0, padding: 0 }}>
      <WarClient key={gameKey} />
    </div>
  );
}