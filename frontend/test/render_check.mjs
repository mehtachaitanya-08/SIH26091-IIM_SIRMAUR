import React from 'react';
import { renderToString } from 'react-dom/server';
import SetoDashboard from '../dist-ssr/SetoDashboard.js';

try {
  const html = renderToString(React.createElement(SetoDashboard));
  console.log('RENDER SUCCESS! HTML byte length:', html.length);
  console.log('Contains "Welcome!":', html.includes('Welcome!'));
  console.log('Contains "GraminAI":', html.includes('GraminAI'));
  console.log('Contains "Recent scenarios":', html.includes('Recent scenarios'));
  console.log('Contains "Mustard Oil Mill":', html.includes('Mustard Oil Mill'));
  console.log('Contains "Tailoring Workshop":', html.includes('Tailoring Workshop'));
  console.log('Contains "Sahukar Debt Relief":', html.includes('Sahukar Debt Relief'));
  console.log('Contains "The Entrepreneur Workspace":', html.includes('The Entrepreneur Workspace'));

  const userHtml = renderToString(React.createElement(SetoDashboard, {
    currentUser: { name: 'Ramesh Kumar', category: 'SC', id: 'UP-STP-008129' }
  }));
  console.log('User fixture render contains "Welcome, Ramesh!":', userHtml.includes('Welcome, Ramesh!'));
  console.log('User fixture render contains "Ramesh Kumar":', userHtml.includes('Ramesh Kumar'));
} catch (err) {
  console.error('RENDER ERROR:', err);
  process.exit(1);
}
