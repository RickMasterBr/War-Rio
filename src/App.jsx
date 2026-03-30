// src/App.jsx
import React, { useState } from 'react';
import { Client } from 'boardgame.io/react';
import { WarRio } from './Game';
import { WarBoard } from './Board';

// Inicialização do Motor do Jogo
const WarClient = Client({
  game: WarRio,
  board: WarBoard,
  numPlayers: 4,
  debug: false // Desliga o painel de debug para imersão total
});

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);

  // Se o estado for true, renderiza a guerra!
  if (isPlaying) {
    return <WarClient />;
  }

  // Se for false, renderiza a nossa Tela Inicial Cinematográfica
  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      backgroundColor: '#0a0a0a',
      color: '#eaeaea',
      fontFamily: 'monospace',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'radial-gradient(circle at center, #2a2a2a 0%, #000000 100%)',
      overflow: 'hidden'
    }}>
      
      {/* Título Estilizado */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '5rem', 
          margin: '0', 
          color: '#ffffff', 
          textShadow: '0 0 20px #ff3333, 0 0 40px #ff3333',
          letterSpacing: '5px'
        }}>
          WAR
        </h1>
        <h2 style={{ 
          fontSize: '2rem', 
          margin: '10px 0 0 0', 
          color: '#ffdd55', 
          letterSpacing: '2px',
          fontWeight: 'normal'
        }}>
          METRÓPOLE FLUMINENSE
        </h2>
      </div>

      {/* Lore / Contexto do Jogo */}
      <div style={{
        maxWidth: '600px',
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: '30px',
        borderRadius: '10px',
        border: '1px solid #333',
        marginBottom: '40px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
      }}>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6', margin: '0 0 15px 0' }}>
          O Estado do Rio de Janeiro colapsou. Quatro facções lutam pelo controle absoluto dos 42 territórios estratégicos da região metropolitana.
        </p>
        <p style={{ fontSize: '1rem', color: '#888', margin: '0' }}>
          Assuma o comando. Mobilize suas tropas pela Ponte Rio-Niterói, conquiste os morros da Zona Sul e domine o asfalto da Baixada. Apenas uma força prevalecerá.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
          <span style={{ color: '#ff3333', fontWeight: 'bold' }}>■ CV</span>
          <span style={{ color: '#33cc33', fontWeight: 'bold' }}>■ TCP</span>
          <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>■ ADA</span>
          <span style={{ color: '#3366ff', fontWeight: 'bold' }}>■ Milícia</span>
        </div>
      </div>

      {/* Botão de Start */}
      <button 
        onClick={() => setIsPlaying(true)}
        style={{
          padding: '20px 50px',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          backgroundColor: '#ff3333',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          transition: 'all 0.3s ease',
          boxShadow: '0 0 15px #ff3333'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'scale(1.05)';
          e.target.style.backgroundColor = '#ff4444';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.backgroundColor = '#ff3333';
        }}
      >
        Iniciar Operação
      </button>

      {/* Créditos Discretos */}
      <p style={{ position: 'absolute', bottom: '20px', color: '#555', fontSize: '0.9rem' }}>
        Engine de Jogo Híbrida | v1.0.0
      </p>

    </div>
  );
}