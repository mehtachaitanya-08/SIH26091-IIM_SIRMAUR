import React from 'react';
import { renderToString } from 'react-dom/server';
import SetoDashboard from '../dist-ssr/SetoDashboard.js';

try {
  const html = renderToString(React.createElement(SetoDashboard));
  console.log('RENDER SUCCESS! HTML byte length:', html.length);
  console.log('Contains "Welcome, Ramesh!":', html.includes('Welcome, Ramesh!'));
  console.log('Contains "GraminAI":', html.includes('GraminAI'));
  console.log('Contains "Recent scenarios":', html.includes('Recent scenarios'));
  console.log('Contains "Mustard Oil Mill":', html.includes('Mustard Oil Mill'));
  console.log('Contains "Tailoring Workshop":', html.includes('Tailoring Workshop'));
  console.log('Contains "Sahukar Debt Relief":', html.includes('Sahukar Debt Relief'));
  console.log('Contains "The Entrepreneur Workspace":', html.includes('The Entrepreneur Workspace'));
} catch (err) {
  console.error('RENDER ERROR:', err);
  process.exit(1);
}
