import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { audienceAPI } from '../services/api';
import '../styles/AudienceOverlapVisualization.css';

const AudienceOverlapVisualization = ({ audiences }) => {
  const svgRef = useRef();
  const [overlapData, setOverlapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (audiences && audiences.length >= 2) {
      fetchOverlapData();
    }
  }, [audiences]);

  const fetchOverlapData = async () => {
    try {
      setLoading(true);
      const audienceIds = audiences.map((a) => a.id);
      const response = await audienceAPI.analyzeOverlap(audienceIds);
      setOverlapData(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to analyze overlap');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (overlapData && svgRef.current) {
      renderVennDiagram();
    }
  }, [overlapData]);

  const renderVennDiagram = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 80, left: 20 };

    svg.attr('width', width).attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Colors for audiences
    const colors = ['#1877f2', '#42b72a', '#fa383e', '#f7b928', '#9333ea'];

    if (audiences.length === 2) {
      renderTwoCircleVenn(g, innerWidth, innerHeight, colors);
    } else if (audiences.length === 3) {
      renderThreeCircleVenn(g, innerWidth, innerHeight, colors);
    } else {
      renderMultipleAudienceOverlap(g, innerWidth, innerHeight, colors);
    }
  };

  const renderTwoCircleVenn = (g, width, height, colors) => {
    const radius = Math.min(width, height) / 4;
    const centerY = height / 2;
    const offset = radius * 0.7;

    const audience1 = audiences[0];
    const audience2 = audiences[1];
    const overlapKey = `${audience1.id}-${audience2.id}`;
    const overlapScore = overlapData.overlaps[overlapKey] || 0;

    // Circle 1
    g.append('circle')
      .attr('cx', width / 2 - offset)
      .attr('cy', centerY)
      .attr('r', radius)
      .attr('fill', colors[0])
      .attr('opacity', 0.5)
      .attr('stroke', colors[0])
      .attr('stroke-width', 2);

    // Circle 2
    g.append('circle')
      .attr('cx', width / 2 + offset)
      .attr('cy', centerY)
      .attr('r', radius)
      .attr('fill', colors[1])
      .attr('opacity', 0.5)
      .attr('stroke', colors[1])
      .attr('stroke-width', 2);

    // Labels
    g.append('text')
      .attr('x', width / 2 - offset - radius / 2)
      .attr('y', centerY)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1c1e21')
      .attr('font-weight', 'bold')
      .attr('font-size', '14px')
      .text(audience1.name);

    g.append('text')
      .attr('x', width / 2 + offset + radius / 2)
      .attr('y', centerY)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1c1e21')
      .attr('font-weight', 'bold')
      .attr('font-size', '14px')
      .text(audience2.name);

    // Overlap percentage
    g.append('text')
      .attr('x', width / 2)
      .attr('y', centerY)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1c1e21')
      .attr('font-weight', 'bold')
      .attr('font-size', '18px')
      .text(`${Math.round(overlapScore * 100)}%`);

    g.append('text')
      .attr('x', width / 2)
      .attr('y', centerY + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#65676b')
      .attr('font-size', '12px')
      .text('overlap');
  };

  const renderThreeCircleVenn = (g, width, height, colors) => {
    const radius = Math.min(width, height) / 4;
    const centerX = width / 2;
    const centerY = height / 2;
    const offset = radius * 0.8;

    // Calculate positions for three circles
    const positions = [
      { x: centerX, y: centerY - offset },
      { x: centerX - offset, y: centerY + offset / 2 },
      { x: centerX + offset, y: centerY + offset / 2 },
    ];

    // Draw circles
    audiences.forEach((audience, i) => {
      g.append('circle')
        .attr('cx', positions[i].x)
        .attr('cy', positions[i].y)
        .attr('r', radius)
        .attr('fill', colors[i])
        .attr('opacity', 0.4)
        .attr('stroke', colors[i])
        .attr('stroke-width', 2);

      // Labels
      g.append('text')
        .attr('x', positions[i].x)
        .attr('y', positions[i].y - radius - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#1c1e21')
        .attr('font-weight', 'bold')
        .attr('font-size', '14px')
        .text(audience.name);
    });

    // Show pairwise overlaps
    const overlaps = [];
    for (let i = 0; i < audiences.length; i++) {
      for (let j = i + 1; j < audiences.length; j++) {
        const key = `${audiences[i].id}-${audiences[j].id}`;
        const score = overlapData.overlaps[key] || 0;
        const midX = (positions[i].x + positions[j].x) / 2;
        const midY = (positions[i].y + positions[j].y) / 2;
        overlaps.push({ x: midX, y: midY, score, pair: `${i}-${j}` });
      }
    }

    overlaps.forEach((overlap) => {
      g.append('text')
        .attr('x', overlap.x)
        .attr('y', overlap.y)
        .attr('text-anchor', 'middle')
        .attr('fill', '#1c1e21')
        .attr('font-weight', 'bold')
        .attr('font-size', '16px')
        .text(`${Math.round(overlap.score * 100)}%`);
    });
  };

  const renderMultipleAudienceOverlap = (g, width, height, colors) => {
    // For more than 3 audiences, show a matrix view
    const cellSize = Math.min(width, height) / (audiences.length + 1);

    // Draw audience labels
    audiences.forEach((audience, i) => {
      // Column headers
      g.append('text')
        .attr('x', (i + 1) * cellSize + cellSize / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('fill', '#1c1e21')
        .attr('font-weight', 'bold')
        .attr('font-size', '12px')
        .text(audience.name.substring(0, 15));

      // Row labels
      g.append('text')
        .attr('x', cellSize - 10)
        .attr('y', (i + 1) * cellSize + cellSize / 2)
        .attr('text-anchor', 'end')
        .attr('fill', '#1c1e21')
        .attr('font-weight', 'bold')
        .attr('font-size', '12px')
        .text(audience.name.substring(0, 15));
    });

    // Draw overlap matrix
    audiences.forEach((audience1, i) => {
      audiences.forEach((audience2, j) => {
        if (i === j) {
          // Diagonal - same audience
          g.append('rect')
            .attr('x', (j + 1) * cellSize)
            .attr('y', (i + 1) * cellSize)
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('fill', colors[i % colors.length])
            .attr('opacity', 0.3)
            .attr('stroke', '#ccc');
        } else if (i < j) {
          // Upper triangle - show overlap
          const key = `${audience1.id}-${audience2.id}`;
          const score = overlapData.overlaps[key] || 0;
          const intensity = score;

          g.append('rect')
            .attr('x', (j + 1) * cellSize)
            .attr('y', (i + 1) * cellSize)
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('fill', '#1877f2')
            .attr('opacity', intensity * 0.8)
            .attr('stroke', '#ccc');

          g.append('text')
            .attr('x', (j + 1) * cellSize + cellSize / 2)
            .attr('y', (i + 1) * cellSize + cellSize / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', intensity > 0.5 ? 'white' : '#1c1e21')
            .attr('font-weight', 'bold')
            .attr('font-size', '14px')
            .text(`${Math.round(score * 100)}%`);
        }
      });
    });
  };

  if (loading) {
    return <div className="overlap-loading">Analyzing audience overlap...</div>;
  }

  if (error) {
    return <div className="overlap-error">{error}</div>;
  }

  return (
    <div className="audience-overlap-visualization">
      <div className="overlap-info">
        <h3>Overlap Analysis</h3>
        <p>
          Visualizing targeting overlap between {audiences.length} selected audiences.
          Higher percentages indicate more similar targeting criteria.
        </p>
      </div>

      <div className="venn-diagram-container">
        <svg ref={svgRef}></svg>
      </div>

      <div className="overlap-legend">
        <h4>Audiences</h4>
        <div className="legend-items">
          {audiences.map((audience, idx) => (
            <div key={audience.id} className="legend-item">
              <div
                className="legend-color"
                style={{
                  background: ['#1877f2', '#42b72a', '#fa383e', '#f7b928', '#9333ea'][
                    idx % 5
                  ],
                }}
              ></div>
              <span>{audience.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overlap-details">
        <h4>Detailed Overlap Scores</h4>
        <div className="overlap-table">
          <table>
            <thead>
              <tr>
                <th>Audience 1</th>
                <th>Audience 2</th>
                <th>Overlap %</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(overlapData.overlaps).map(([key, score]) => {
                const [id1, id2] = key.split('-');
                const aud1 = audiences.find((a) => a.id === id1);
                const aud2 = audiences.find((a) => a.id === id2);
                return (
                  <tr key={key}>
                    <td>{aud1?.name}</td>
                    <td>{aud2?.name}</td>
                    <td>
                      <strong>{Math.round(score * 100)}%</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AudienceOverlapVisualization;
