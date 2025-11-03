import React from 'react';
import { Card, Connection } from '../types';

interface ConnectionLinesProps {
  connections: Connection[];
  cards: Card[];
  onDeleteConnection?: (connectionId: string) => void;
}

const ConnectionLines: React.FC<ConnectionLinesProps> = ({
  connections,
  cards,
  onDeleteConnection
}) => {
  const getCardCenter = (cardId: number) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return { x: 0, y: 0 };
    // 카드 크기는 300x200이고, position은 좌상단 기준
    return {
      x: card.position.x + 150, // 카드 width / 2
      y: card.position.y + 100  // 카드 height / 2
    };
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {connections.map(connection => {
        const from = getCardCenter(connection.fromCardId);
        const to = getCardCenter(connection.toCardId);
        const color = connection.color || '#ef4444'; // 기본 빨강
        const strokeDasharray = connection.style === 'dashed' ? '5,5' : 'none';

        return (
          <g key={connection.id}>
            {/* 연결선 */}
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={color}
              strokeWidth="3"
              strokeDasharray={strokeDasharray}
              className="drop-shadow-lg"
            />

            {/* 선 중간에 삭제 버튼 (호버 시 보임) */}
            {onDeleteConnection && (
              <g
                className="pointer-events-auto cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                onClick={() => onDeleteConnection(connection.id)}
              >
                <circle
                  cx={(from.x + to.x) / 2}
                  cy={(from.y + to.y) / 2}
                  r="12"
                  fill="white"
                  stroke={color}
                  strokeWidth="2"
                />
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={color}
                  fontSize="16"
                  fontWeight="bold"
                >
                  ×
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default ConnectionLines;
