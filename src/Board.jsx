// src/Board.jsx
import React, { useState, useEffect } from 'react';
import { territoryNames } from './Game'; 

export function WarBoard({ G, ctx, moves, events }) {
  const currentPlayer = G.players[ctx.currentPlayer];
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [targetTerritory, setTargetTerritory] = useState(null); 
  const [selectedCards, setSelectedCards] = useState([]);
  
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  useEffect(() => {
    setIsInfoVisible(false);
    setSelectedTerritory(null);
    setTargetTerritory(null);
    setSelectedCards([]);
  }, [ctx.currentPlayer]);

  const getObjectiveDesc = (obj) => {
    if (!obj) return 'A sortear missão...';
    if (obj.type === 'continent') return `Conquistar o continente ${G.continents[obj.continent].name}.`;
    if (obj.type === 'destroy') return `Destruir totalmente as forças do ${G.players[obj.target].faction}.`;
    if (obj.type === 'territories') return `MUTAÇÃO TÁTICA: Conquistar ${obj.count} territórios quaisquer.`;
    return 'Objetivo desconhecido.';
  };
  
  const currentStage = ctx.activePlayers?.[ctx.currentPlayer] || 'reinforcement';
  const stageNames = { reinforcement: "Recebimento de Tropas", attack: "Fase de Ataque", maneuver: "Remanejamento" };

  const getReachableTerritories = (sourceId) => {
    if (!sourceId || G.territories[sourceId].owner !== ctx.currentPlayer) return [];
    const visited = new Set();
    const queue = [sourceId];
    visited.add(sourceId);
    while (queue.length > 0) {
      const current = queue.shift();
      const neighbors = G.connections[current] || [];
      for (const neighbor of neighbors) {
        if (G.territories[neighbor].owner === ctx.currentPlayer && !visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return Array.from(visited);
  };

  const reachableNetwork = (currentStage === 'maneuver' && selectedTerritory) 
    ? getReachableTerritories(selectedTerritory) 
    : [];

  const handleTerritoryClick = (id) => {
    if (currentPlayer.eliminated) return;
    if (G.pendingOccupation) {
      alert("Resolva a ocupação do território conquistado primeiro!");
      return;
    }

    if (currentStage === 'reinforcement') {
      moves.placeArmy(id);
    } 
    else if (currentStage === 'attack' || currentStage === 'maneuver') {
      if (!selectedTerritory) {
        if (G.territories[id].owner !== ctx.currentPlayer) {
          alert("Selecione um território SEU para iniciar a ação."); return;
        }
        setSelectedTerritory(id);
      } 
      else if (selectedTerritory === id) {
        setSelectedTerritory(null);
        setTargetTerritory(null);
      }
      else {
        if (currentStage === 'maneuver') {
          moves.moveArmy(selectedTerritory, id);
          setSelectedTerritory(null);
        } 
        else if (currentStage === 'attack') {
          setTargetTerritory(id);
        }
      }
    }
  };

  const executeAttack = (type) => {
    if (type === 'CLASSIC') moves.declareAttack(selectedTerritory, targetTerritory);
    if (type === 'BLITZ') moves.blitzAttack(selectedTerritory, targetTerritory);
    setSelectedTerritory(null);
    setTargetTerritory(null);
  };

  const handleCardClick = (index) => {
    if (currentStage !== 'reinforcement') return; 
    if (selectedCards.includes(index)) setSelectedCards(selectedCards.filter(i => i !== index));
    else if (selectedCards.length < 3) setSelectedCards([...selectedCards, index]);
  };

  const handleNextStep = () => {
    if (G.pendingOccupation) return alert("Conclua a ocupação antes de encerrar o ataque!");
    if (currentStage === 'reinforcement' && G.troopsToPlace > 0) return alert(`Posicione as ${G.troopsToPlace} tropas!`);
    if (currentStage === 'reinforcement' && currentPlayer.cards.length >= 5) return alert("Troca Obrigatória Exigida!");

    setSelectedTerritory(null); setTargetTerritory(null); setSelectedCards([]);
    
    if (ctx.phase === 'initialDraft') {
      events.endTurn();
      return;
    }

    if (currentStage === 'reinforcement') events.setStage('attack');
    else if (currentStage === 'attack') events.setStage('maneuver');
    else if (currentStage === 'maneuver') events.endTurn();
  };

  const isNextButtonDisabled = 
    (currentStage === 'reinforcement' && G.troopsToPlace > 0) || 
    (currentStage === 'reinforcement' && currentPlayer.cards.length >= 5) ||
    (G.pendingOccupation !== null); 

  const shapeIcons = { 'Triângulo': '▲', 'Quadrado': '■', 'Círculo': '●', 'Coringa': '★' };

  return ctx.gameover ? (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', zIndex: 10000, fontFamily: 'monospace', textAlign: 'center', padding: '20px' }}>
        <h1 style={{ fontSize: '3em', color: G.players[ctx.gameover.winner].color }}>🏆 VITÓRIA! 🏆</h1>
        <h2 style={{ fontSize: '2em', margin: '20px 0' }}>{G.players[ctx.gameover.winner].faction} dominou o Rio de Janeiro!</h2>
        <p style={{ fontSize: '1.5em' }}>Missão cumprida: <span style={{color: '#ffdd55'}}>{getObjectiveDesc(G.players[ctx.gameover.winner].objective)}</span></p>
      </div>
    ) : (
      <div style={{ padding: '20px', backgroundColor: '#1a1a1a', color: '#eaeaea', minHeight: '100vh', fontFamily: 'monospace' }}>
        <h1>WAR: Metrópole Fluminense</h1>
        {currentPlayer.eliminated ? (
          <div style={{ backgroundColor: '#8b0000', padding: '40px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
            <h2>☠️ FACÇÃO ERRADICADA ☠️</h2>
            <button onClick={() => events.endTurn()} style={{ marginTop: '20px', padding: '15px 30px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }}>Pular Turno</button>
          </div>
        ) : (
          <div style={{ marginBottom: '20px', padding: '15px', border: `2px solid ${currentPlayer.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
            
            <div style={{ flex: '1', minWidth: '250px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h2 style={{ margin: 0 }}>Painel Tático</h2>
                <button 
                  onClick={() => setIsInfoVisible(!isInfoVisible)}
                  style={{ padding: '8px 12px', backgroundColor: '#444', color: '#fff', border: '1px solid #666', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {isInfoVisible ? '🙈 Ocultar Dados' : '👁️ Revelar Dados'}
                </button>
              </div>

              <p>Comandante: <strong style={{color: currentPlayer.color}}>{currentPlayer.faction}</strong> | Fase: <strong style={{color: '#ffdd55'}}>{ctx.phase === 'initialDraft' ? 'PREPARAÇÃO (Fase Zero)' : stageNames[currentStage]}</strong></p>
              
              <p>Missão Secreta: {' '}
                <strong style={{
                  color: isInfoVisible ? '#ffaa00' : '#888', 
                  backgroundColor: isInfoVisible ? 'transparent' : '#2a2a2a', 
                  padding: isInfoVisible ? '0' : '2px 10px', 
                  borderRadius: '4px',
                  letterSpacing: isInfoVisible ? 'normal' : '2px'
                }}>
                  {isInfoVisible ? getObjectiveDesc(currentPlayer.objective) : '•••••••••••••••• (Oculto)'}
                </strong>
              </p>

              {currentStage === 'reinforcement' && <p>Reforços: <strong>🪖 {G.troopsToPlace}</strong></p>}
              {selectedTerritory && !G.pendingOccupation && <p>Origem: <span style={{color: '#5bc0de'}}>{territoryNames[selectedTerritory]}</span></p>}
              
              {G.pendingOccupation && currentStage === 'attack' ? (
                <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#333', border: '2px solid #ffaa00', borderRadius: '5px' }}>
                  <p style={{ margin: '0 0 10px 0', color: '#ffdd55', fontSize: '18px' }}><strong>Ocupação Bem-Sucedida!</strong></p>
                  <p style={{ fontSize: '13px', marginBottom: '15px' }}>
                    1 tropa ocupou a base. Envie reforços de <strong>{territoryNames[G.pendingOccupation.sourceId]}</strong> para <strong>{territoryNames[G.pendingOccupation.targetId]}</strong>:
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[...Array(G.pendingOccupation.maxExtra + 1).keys()].map(num => (
                      <button key={num} onClick={() => moves.occupy(num)} style={{ padding: '10px 15px', backgroundColor: '#5bc0de', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '3px', flex: '1' }}>
                        +{num} Tropas
                      </button>
                    ))}
                  </div>
                </div>
              ) : targetTerritory && currentStage === 'attack' && (
                <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#333', border: '1px solid #ff4444', borderRadius: '5px' }}>
                  <p style={{ margin: '0 0 10px 0' }}>Alvo Travado: <strong>{territoryNames[targetTerritory]}</strong></p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => executeAttack('CLASSIC')} style={{ padding: '10px', backgroundColor: '#5bc0de', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                      🎲 Ataque Clássico
                    </button>
                    <button onClick={() => executeAttack('BLITZ')} style={{ padding: '10px', backgroundColor: '#d9534f', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                      ⚡ Engajamento Blitz
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ backgroundColor: '#222', padding: '15px', borderRadius: '5px', minWidth: '220px', flex: '1' }}>
              <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #555', paddingBottom: '5px', fontSize: '16px' }}>Domínio Continental</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(G.continents).map(([key, cont]) => {
                  const owned = cont.territories.filter(t => G.territories[t].owner === ctx.currentPlayer).length;
                  const total = cont.territories.length;
                  const percentage = (owned / total) * 100;
                  const isDominated = owned === total;

                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                        <span style={{ color: isDominated ? '#ffdd55' : '#ccc', fontWeight: isDominated ? 'bold' : 'normal' }}>
                          {cont.name} {isDominated && `(+${cont.bonus} 🪖)`}
                        </span>
                        <span style={{ color: '#888' }}>{owned}/{total}</span>
                      </div>
                      <div style={{ width: '100%', backgroundColor: '#111', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${percentage}%`, backgroundColor: isDominated ? '#ffdd55' : currentPlayer.color, height: '100%', transition: 'width 0.3s' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '5px', minWidth: '200px' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Inventário</h3>
              <div style={{ 
                display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px',
                filter: isInfoVisible ? 'none' : 'blur(6px)',
                pointerEvents: isInfoVisible ? 'auto' : 'none', 
                transition: 'filter 0.3s ease'
              }}>
                {currentPlayer.cards.length === 0 && <span style={{color: '#666', fontSize: '12px'}}>Sem cartas no momento.</span>}
                {currentPlayer.cards.map((card, idx) => (
                  <div key={idx} onClick={() => handleCardClick(idx)} style={{ border: selectedCards.includes(idx) ? '2px solid #5bc0de' : '1px solid #888', borderRadius: '5px', padding: '8px', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ color: '#ffdd55', fontSize: '18px' }}>{shapeIcons[card.shape]}</div>
                    <div style={{ fontSize: '10px', marginTop: '4px', maxWidth: '80px', wordWrap: 'break-word' }}>
                      {card.id.includes('Coringa') ? 'Coringa' : territoryNames[card.id]}
                    </div>        
                  </div>
                ))}
              </div>
              {currentStage === 'reinforcement' && (
                <button onClick={() => { moves.exchangeCards(selectedCards); setSelectedCards([]); }} disabled={selectedCards.length !== 3} style={{ width: '100%', padding: '5px', cursor: selectedCards.length === 3 ? 'pointer' : 'not-allowed' }}>Trocar</button>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(selectedTerritory || targetTerritory) && !G.pendingOccupation && (
                 <button onClick={() => { setSelectedTerritory(null); setTargetTerritory(null); }} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#555', color: 'white', border: 'none' }}>Cancelar</button>
              )}
              <button onClick={handleNextStep} disabled={isNextButtonDisabled} style={{ padding: '10px 20px', cursor: isNextButtonDisabled ? 'not-allowed' : 'pointer', backgroundColor: currentStage === 'maneuver' || ctx.phase === 'initialDraft' ? '#d9534f' : '#5bc0de', color: 'white', border: 'none', fontWeight: 'bold' }}>
                {ctx.phase === 'initialDraft' ? 'Passar Vez' : currentStage === 'maneuver' ? 'Encerrar Turno' : 'Avançar Fase ➔'}
              </button>
            </div>
          </div>
        )}

        {/* RELATÓRIOS E DIÁRIO DE GUERRA */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
          
          {!currentPlayer.eliminated && G.lastCombat && currentStage === 'attack' && (
            <div style={{ backgroundColor: '#333', border: '1px solid #777', padding: '15px', borderRadius: '5px', flex: '1', minWidth: '300px' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{G.lastCombat.type === 'BLITZ' ? '⚡ Relatório Pós-Blitz' : '🎲 Relatório Balístico'}</h3>
              <p><strong>{territoryNames[G.lastCombat.sourceId]} vs {territoryNames[G.lastCombat.targetId]}</strong> {G.lastCombat.type === 'BLITZ' && `(Durou ${G.lastCombat.rounds} rodadas)`}</p>
              <div style={{ display: 'flex', gap: '40px' }}>
                <div><p style={{ color: '#ff5555' }}>Suas Baixas: -{G.lastCombat.attackerLosses}</p></div>
                <div><p style={{ color: '#ffff55' }}>Baixas Inimigas: -{G.lastCombat.defenderLosses}</p></div>
              </div>
            </div>
          )}

          <div style={{ backgroundColor: '#222', border: '1px solid #444', padding: '15px', borderRadius: '5px', flex: '1', minWidth: '300px', maxHeight: '150px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #555', paddingBottom: '5px', fontSize: '16px' }}>📜 Diário de Guerra</h3>
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', flexGrow: 1, paddingRight: '5px' }}>
              {G.log && [...G.log].reverse().map((entry, idx) => (
                <div key={idx} style={{ fontSize: '13px', marginBottom: '8px', lineHeight: '1.4' }}>
                  <strong style={{ color: entry.color }}>{entry.faction}</strong> {entry.msg}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARTOGRAFIA VISUAL COM SUPORTE A FORMATOS CUSTOMIZADOS (MASK) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', opacity: currentPlayer.eliminated ? 0.2 : 1, pointerEvents: currentPlayer.eliminated ? 'none' : 'auto' }}>
          
          {Object.entries(G.continents).map(([continentKey, continentObj]) => (
            <div key={continentKey} style={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '8px', padding: '20px' }}>
              
              <h2 style={{ margin: '0 0 15px 0', borderBottom: '2px solid #555', paddingBottom: '10px', color: '#eaeaea', textTransform: 'uppercase', letterSpacing: '1px' }}>
                🌍 {continentObj.name} <span style={{ fontSize: '14px', color: '#888', fontWeight: 'normal', textTransform: 'none' }}>(Bônus: +{continentObj.bonus} 🪖)</span>
              </h2>
              
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {continentObj.territories.map(id => {
                  const data = G.territories[id];
                  const ownerData = G.players[data.owner];
                  const isSelected = selectedTerritory === id;
                  const isTarget = targetTerritory === id;
                  
                  let isHighlight = false;
                  let highlightColor = '';
                  
                  if (currentStage === 'attack' && selectedTerritory) {
                      isHighlight = G.connections[selectedTerritory]?.includes(id) && ownerData.faction !== currentPlayer.faction;
                      highlightColor = '#ffdd55'; 
                  } else if (currentStage === 'maneuver' && selectedTerritory) {
                      isHighlight = reachableNetwork.includes(id) && id !== selectedTerritory;
                      highlightColor = '#5bc0de'; 
                  }

                  const isDimmed = selectedTerritory && !isSelected && !isHighlight && !isTarget;
                  
                  // LÓGICA DE CORES: Mantemos a lógica padrão para o stroke (borda) e fill (fundo)
                  const borderColor = isTarget ? '#ff4444' : isSelected ? '#ffffff' : (isHighlight ? highlightColor : ownerData.color);
                  const bgColor = isSelected ? '#444' : isTarget ? '#522' : '#2a2a2a';

                 // === MÁGICA 1: ILHA DO GOVERNADOR ===
                  if (id === 'N15_IlhaGovernador') {
                    return (
                      <div key={id} onClick={() => handleTerritoryClick(id)}
                        style={{
                          position: 'relative', width: '220px', minHeight: '130px',
                          cursor: isDimmed ? 'not-allowed' : 'pointer', opacity: isDimmed ? 0.3 : 1,
                          transition: 'all 0.3s ease-in-out', transform: (isSelected || isTarget) ? 'scale(1.05)' : 'scale(1)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          filter: `
                            drop-shadow(3px 0px 0px ${borderColor}) drop-shadow(-3px 0px 0px ${borderColor})
                            drop-shadow(0px 3px 0px ${borderColor}) drop-shadow(0px -3px 0px ${borderColor})
                            ${isHighlight ? `drop-shadow(0 0 15px ${highlightColor})` : ''}
                          `
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: bgColor,
                          WebkitMaskImage: 'url(/mapa.png)', maskImage: 'url(/mapa.png)',
                          WebkitMaskSize: 'contain', maskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center', maskPosition: 'center', zIndex: -1 
                        }} />
                        <h3 style={{ fontSize: '11px', margin: '15px 0 2px 0', textTransform: 'uppercase', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                          {territoryNames[id]}
                        </h3>
                        <p style={{ fontSize: '16px', margin: '0', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', fontWeight: 'bold' }}>
                          🪖 {data.armies}
                        </p>
                      </div>
                    );
                  }

                  // === MÁGICA 2: IPANEMA/LEBLON ===
                  else if (id === 'N07_IpanemaLeblon') {
                    return (
                      <div key={id} onClick={() => handleTerritoryClick(id)}
                        style={{
                          position: 'relative', width: '220px', minHeight: '130px',
                          cursor: isDimmed ? 'not-allowed' : 'pointer', opacity: isDimmed ? 0.3 : 1,
                          transition: 'all 0.3s ease-in-out', transform: (isSelected || isTarget) ? 'scale(1.05)' : 'scale(1)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          filter: `
                            drop-shadow(3px 0px 0px ${borderColor}) drop-shadow(-3px 0px 0px ${borderColor})
                            drop-shadow(0px 3px 0px ${borderColor}) drop-shadow(0px -3px 0px ${borderColor})
                            ${isHighlight ? `drop-shadow(0 0 15px ${highlightColor})` : ''}
                          `
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: bgColor,
                          WebkitMaskImage: 'url(/mapa1.png)', maskImage: 'url(/mapa1.png)', 
                          WebkitMaskSize: 'contain', maskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center', maskPosition: 'center', zIndex: -1 
                        }} />
                        <h3 style={{ fontSize: '11px', margin: '15px 0 2px 0', textTransform: 'uppercase', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                          {territoryNames[id]}
                        </h3>
                        <p style={{ fontSize: '16px', margin: '0', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', fontWeight: 'bold' }}>
                          🪖 {data.armies}
                        </p>
                      </div>
                    );
                  }

                  // === MÁGICA 3: ROCINHA/GÁVEA ===
                  else if (id === 'N08_RocinhaGavea') {
                    return (
                      <div key={id} onClick={() => handleTerritoryClick(id)}
                        style={{
                          position: 'relative', width: '220px', minHeight: '130px',
                          cursor: isDimmed ? 'not-allowed' : 'pointer', opacity: isDimmed ? 0.3 : 1,
                          transition: 'all 0.3s ease-in-out', transform: (isSelected || isTarget) ? 'scale(1.05)' : 'scale(1)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          filter: `
                            drop-shadow(3px 0px 0px ${borderColor}) drop-shadow(-3px 0px 0px ${borderColor})
                            drop-shadow(0px 3px 0px ${borderColor}) drop-shadow(0px -3px 0px ${borderColor})
                            ${isHighlight ? `drop-shadow(0 0 15px ${highlightColor})` : ''}
                          `
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: bgColor,
                          WebkitMaskImage: 'url(/mapa2.png)', maskImage: 'url(/mapa2.png)', 
                          WebkitMaskSize: 'contain', maskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center', maskPosition: 'center', zIndex: -1 
                        }} />
                        <h3 style={{ fontSize: '11px', margin: '15px 0 2px 0', textTransform: 'uppercase', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                          {territoryNames[id]}
                        </h3>
                        <p style={{ fontSize: '16px', margin: '0', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', fontWeight: 'bold' }}>
                          🪖 {data.armies}
                        </p>
                      </div>
                    );
                  }

                  // === MÁGICA 4: COPACABANA / LEME ===
                  else if (id === 'N06_Copacabana') {
                    return (
                      <div key={id} onClick={() => handleTerritoryClick(id)}
                        style={{
                          position: 'relative', width: '220px', minHeight: '130px',
                          cursor: isDimmed ? 'not-allowed' : 'pointer', opacity: isDimmed ? 0.3 : 1,
                          transition: 'all 0.3s ease-in-out', transform: (isSelected || isTarget) ? 'scale(1.05)' : 'scale(1)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          filter: `
                            drop-shadow(3px 0px 0px ${borderColor}) drop-shadow(-3px 0px 0px ${borderColor})
                            drop-shadow(0px 3px 0px ${borderColor}) drop-shadow(0px -3px 0px ${borderColor})
                            ${isHighlight ? `drop-shadow(0 0 15px ${highlightColor})` : ''}
                          `
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: bgColor,
                          WebkitMaskImage: 'url(/mapa3.png)', maskImage: 'url(/mapa3.png)', 
                          WebkitMaskSize: 'contain', maskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center', maskPosition: 'center', zIndex: -1 
                        }} />
                        <h3 style={{ fontSize: '11px', margin: '15px 0 2px 0', textTransform: 'uppercase', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                          {territoryNames[id]}
                        </h3>
                        <p style={{ fontSize: '16px', margin: '0', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', fontWeight: 'bold' }}>
                          🪖 {data.armies}
                        </p>
                      </div>
                    );
                  }

                  // === MÁGICA 5: GLÓRIA / BOTAFOGO ===
                  else if (id === 'N05_GloriaBotafogo') {
                    return (
                      <div key={id} onClick={() => handleTerritoryClick(id)}
                        style={{
                          position: 'relative', width: '220px', minHeight: '130px',
                          cursor: isDimmed ? 'not-allowed' : 'pointer', opacity: isDimmed ? 0.3 : 1,
                          transition: 'all 0.3s ease-in-out', transform: (isSelected || isTarget) ? 'scale(1.05)' : 'scale(1)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          filter: `
                            drop-shadow(3px 0px 0px ${borderColor}) drop-shadow(-3px 0px 0px ${borderColor})
                            drop-shadow(0px 3px 0px ${borderColor}) drop-shadow(0px -3px 0px ${borderColor})
                            ${isHighlight ? `drop-shadow(0 0 15px ${highlightColor})` : ''}
                          `
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: bgColor,
                          WebkitMaskImage: 'url(/mapa4.png)', maskImage: 'url(/mapa4.png)', 
                          WebkitMaskSize: 'contain', maskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center', maskPosition: 'center', zIndex: -1 
                        }} />
                        <h3 style={{ fontSize: '11px', margin: '15px 0 2px 0', textTransform: 'uppercase', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                          {territoryNames[id]}
                        </h3>
                        <p style={{ fontSize: '16px', margin: '0', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', fontWeight: 'bold' }}>
                          🪖 {data.armies}
                        </p>
                      </div>
                    );
                  }

                  // === MÁGICA 6: LAPA ===
                  else if (id === 'N02_Lapa') {
                    return (
                      <div key={id} onClick={() => handleTerritoryClick(id)}
                        style={{
                          position: 'relative', width: '220px', minHeight: '130px',
                          cursor: isDimmed ? 'not-allowed' : 'pointer', opacity: isDimmed ? 0.3 : 1,
                          transition: 'all 0.3s ease-in-out', transform: (isSelected || isTarget) ? 'scale(1.05)' : 'scale(1)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          filter: `
                            drop-shadow(3px 0px 0px ${borderColor}) drop-shadow(-3px 0px 0px ${borderColor})
                            drop-shadow(0px 3px 0px ${borderColor}) drop-shadow(0px -3px 0px ${borderColor})
                            ${isHighlight ? `drop-shadow(0 0 15px ${highlightColor})` : ''}
                          `
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: bgColor,
                          WebkitMaskImage: 'url(/mapa5.png)', maskImage: 'url(/mapa5.png)', 
                          WebkitMaskSize: 'contain', maskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center', maskPosition: 'center', zIndex: -1 
                        }} />
                        <h3 style={{ fontSize: '11px', margin: '15px 0 2px 0', textTransform: 'uppercase', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                          {territoryNames[id]}
                        </h3>
                        <p style={{ fontSize: '16px', margin: '0', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', fontWeight: 'bold' }}>
                          🪖 {data.armies}
                        </p>
                      </div>
                    );
                  }

                  // === MÁGICA 7: CENTRO ===
                  else if (id === 'N01_Centro') {
                    return (
                      <div key={id} onClick={() => handleTerritoryClick(id)}
                        style={{
                          position: 'relative', width: '220px', minHeight: '130px',
                          cursor: isDimmed ? 'not-allowed' : 'pointer', opacity: isDimmed ? 0.3 : 1,
                          transition: 'all 0.3s ease-in-out', transform: (isSelected || isTarget) ? 'scale(1.05)' : 'scale(1)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          filter: `
                            drop-shadow(3px 0px 0px ${borderColor}) drop-shadow(-3px 0px 0px ${borderColor})
                            drop-shadow(0px 3px 0px ${borderColor}) drop-shadow(0px -3px 0px ${borderColor})
                            ${isHighlight ? `drop-shadow(0 0 15px ${highlightColor})` : ''}
                          `
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: bgColor,
                          WebkitMaskImage: 'url(/mapa6.png)', maskImage: 'url(/mapa6.png)', 
                          WebkitMaskSize: 'contain', maskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center', maskPosition: 'center', zIndex: -1 
                        }} />
                        <h3 style={{ fontSize: '11px', margin: '15px 0 2px 0', textTransform: 'uppercase', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                          {territoryNames[id]}
                        </h3>
                        <p style={{ fontSize: '16px', margin: '0', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', fontWeight: 'bold' }}>
                          🪖 {data.armies}
                        </p>
                      </div>
                    );
                  }

                  // === MÁGICA 8: SAÚDE ===
                  else if (id === 'N03_Saude') {
                    return (
                      <div key={id} onClick={() => handleTerritoryClick(id)}
                        style={{
                          position: 'relative', width: '220px', minHeight: '130px',
                          cursor: isDimmed ? 'not-allowed' : 'pointer', opacity: isDimmed ? 0.3 : 1,
                          transition: 'all 0.3s ease-in-out', transform: (isSelected || isTarget) ? 'scale(1.05)' : 'scale(1)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          filter: `
                            drop-shadow(3px 0px 0px ${borderColor}) drop-shadow(-3px 0px 0px ${borderColor})
                            drop-shadow(0px 3px 0px ${borderColor}) drop-shadow(0px -3px 0px ${borderColor})
                            ${isHighlight ? `drop-shadow(0 0 15px ${highlightColor})` : ''}
                          `
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: bgColor,
                          WebkitMaskImage: 'url(/mapa7.png)', maskImage: 'url(/mapa7.png)', 
                          WebkitMaskSize: 'contain', maskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center', maskPosition: 'center', zIndex: -1 
                        }} />
                        <h3 style={{ fontSize: '11px', margin: '15px 0 2px 0', textTransform: 'uppercase', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                          {territoryNames[id]}
                        </h3>
                        <p style={{ fontSize: '16px', margin: '0', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', fontWeight: 'bold' }}>
                          🪖 {data.armies}
                        </p>
                      </div>
                    );
                  }

                  // === MÁGICA 9: RIO COMPRIDO ===
                  else if (id === 'N04_RioComprido') {
                    return (
                      <div key={id} onClick={() => handleTerritoryClick(id)}
                        style={{
                          position: 'relative', width: '220px', minHeight: '130px',
                          cursor: isDimmed ? 'not-allowed' : 'pointer', opacity: isDimmed ? 0.3 : 1,
                          transition: 'all 0.3s ease-in-out', transform: (isSelected || isTarget) ? 'scale(1.05)' : 'scale(1)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          filter: `
                            drop-shadow(3px 0px 0px ${borderColor}) drop-shadow(-3px 0px 0px ${borderColor})
                            drop-shadow(0px 3px 0px ${borderColor}) drop-shadow(0px -3px 0px ${borderColor})
                            ${isHighlight ? `drop-shadow(0 0 15px ${highlightColor})` : ''}
                          `
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: bgColor,
                          WebkitMaskImage: 'url(/mapa8.png)', maskImage: 'url(/mapa8.png)', 
                          WebkitMaskSize: 'contain', maskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center', maskPosition: 'center', zIndex: -1 
                        }} />
                        <h3 style={{ fontSize: '11px', margin: '15px 0 2px 0', textTransform: 'uppercase', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                          {territoryNames[id]}
                        </h3>
                        <p style={{ fontSize: '16px', margin: '0', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', fontWeight: 'bold' }}>
                          🪖 {data.armies}
                        </p>
                      </div>
                    );
                  }

                  // === RENDERIZAÇÃO PADRÃO PARA OS OUTROS TERRITÓRIOS ===
                  return (
                    <div key={id} onClick={() => handleTerritoryClick(id)}
                      style={{
                        border: `4px solid ${borderColor}`,
                        borderRadius: '8px', padding: '15px', cursor: isDimmed ? 'not-allowed' : 'pointer',
                        backgroundColor: bgColor, width: '220px', opacity: isDimmed ? 0.3 : 1,
                        transition: 'all 0.3s ease-in-out', transform: (isSelected || isTarget) ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: isHighlight ? `0 0 15px ${highlightColor}88` : 'none'
                      }}
                    >
                      <h3 style={{ fontSize: '15px', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                        {territoryNames[id]}
                      </h3>
                      <p style={{ margin: '0', fontSize: '12px' }}>Facção: <span style={{color: ownerData.color, fontWeight: 'bold'}}>{ownerData.faction}</span></p>
                      <p style={{ fontSize: '20px', margin: '10px 0 0 0' }}>🪖 {data.armies}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
        </div>
      </div>
    );
}