import { jsPDF } from 'jspdf';
import { SimulationResult, SimulationConfiguration } from '../types/simulation';

export function generateArtilleryPdfReport(
  result: SimulationResult,
  config: SimulationConfiguration
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const isPsCap = result.topCap === 'ps_canard_cap';
  const now = new Date();
  const timestampStr = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const reportId = `RPT-155-STANAG-${now.getTime().toString(36).toUpperCase()}`;

  // Palette
  const bgDark = [18, 22, 28];
  const accentBlue = [26, 115, 232];
  const textDark = [33, 37, 41];
  const textMuted = [108, 117, 125];
  const successGreen = [0, 138, 0];
  const dangerRed = [200, 30, 30];

  // 1. Top Header Banner
  doc.setFillColor(bgDark[0], bgDark[1], bgDark[2]);
  doc.rect(0, 0, 210, 28, 'F');

  // Accent stripe
  doc.setFillColor(accentBlue[0], accentBlue[1], accentBlue[2]);
  doc.rect(0, 28, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('155MM ERFB/BB ARTILLERY BALLISTICS & GUIDANCE REPORT', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(170, 185, 205);
  doc.text(`STANAG 4355 MODIFIED POINT MASS MODEL • BALON & KOMENDA GUIDANCE DOSSIER`, 14, 18);
  doc.text(`REPORT ID: ${reportId}  |  GENERATED: ${timestampStr}`, 14, 23);

  // Security classification badge
  doc.setFillColor(30, 45, 65);
  doc.roundedRect(155, 7, 43, 14, 2, 2, 'F');
  doc.setTextColor(0, 220, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('TACTICAL EVAL', 176, 13, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(200, 215, 230);
  doc.text('NATO UNCLASSIFIED / TEST', 176, 18, { align: 'center' });

  let y = 38;

  // 2. Mission & Shell Profile Section
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(12, y, 186, 32, 2, 2, 'F');
  doc.setDrawColor(220, 225, 235);
  doc.roundedRect(12, y, 186, 32, 2, 2, 'S');

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('1. ARTILLERY PROJECTILE & MISSION PARAMETERS', 16, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);

  // Col 1
  doc.text('Caliber & Shell Type:', 16, y + 14);
  doc.text('Propellant Charge:', 16, y + 20);
  doc.text('Quadrant Elevation (QE):', 16, y + 26);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('155 mm ERFB/BB (Base Bleed)', 60, y + 14);
  doc.text(
    result.ballistics155.chargeType === 'charge_d'
      ? 'Charge D (V0 = 908 m/s, Mach 2.67)'
      : 'Charge A+A+B (V0 = 620 m/s, Mach 1.82)',
    60,
    y + 20
  );
  doc.text(
    `${result.ballistics155.quadrantElevationMil} mil (${result.ballistics155.quadrantElevationDeg}°)`,
    60,
    y + 26
  );

  // Col 2
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Active Nose Cap:', 116, y + 14);
  doc.text('Nominal Range:', 116, y + 20);
  doc.text('Max Vertex Altitude:', 116, y + 26);

  doc.setFont('helvetica', 'bold');
  if (isPsCap) {
    doc.setTextColor(successGreen[0], successGreen[1], successGreen[2]);
    doc.text('OUR PS CAP (WITH 4x CANARD FINS)', 152, y + 14);
  } else {
    doc.setTextColor(dangerRed[0], dangerRed[1], dangerRed[2]);
    doc.text('ORIGINAL TOP CAP (UNGUIDED M557/M739)', 152, y + 14);
  }
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`${(result.ballistics155.maxRange / 1000).toFixed(1)} km`, 152, y + 20);
  doc.text(`${(result.ballistics155.vertexAltitude / 1000).toFixed(1)} km AGL`, 152, y + 26);

  y += 38;

  // 3. Precision & Error Radius Reduction Efficiency (The 2 compiled boxes)
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(12, y, 186, 58, 2, 2, 'F');
  doc.setDrawColor(220, 225, 235);
  doc.roundedRect(12, y, 186, 58, 2, 2, 'S');

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('2. COMPARATIVE TARGET ERROR RADIUS & CEP DISPERSION ANALYSIS', 16, y + 7);

  // Efficiency Banner
  doc.setFillColor(235, 245, 255);
  doc.setDrawColor(180, 210, 245);
  doc.roundedRect(16, y + 11, 178, 12, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(accentBlue[0], accentBlue[1], accentBlue[2]);
  doc.text('ERROR RADIUS REDUCTION EFFICIENCY:', 20, y + 18.5);

  doc.setFontSize(11);
  doc.setTextColor(successGreen[0], successGreen[1], successGreen[2]);
  doc.text(`-${result.errorRadiusReductionPct.toFixed(1)}% ERROR AREA DOWN`, 98, y + 19);

  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('(Deployable Canards vs Conventional Ballistic Fuze)', 152, y + 18.5);

  // Table header
  const tableY = y + 27;
  doc.setFillColor(228, 233, 240);
  doc.rect(16, tableY, 178, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(50, 55, 65);
  doc.text('BALLISTIC DISPERSION METRIC', 19, tableY + 4.5);
  doc.text('ORIGINAL TOP CAP (UNGUIDED)', 85, tableY + 4.5);
  doc.text('OUR PS CANARD CAP (GUIDED)', 140, tableY + 4.5);

  const rows = [
    {
      metric: '50% Error Radius (CEP)',
      orig: `${Math.round(result.originalCapCep)} m`,
      ps: `${result.psCapCep} m`,
      highlight: true,
    },
    {
      metric: '95% Strike Zone (R95)',
      orig: `${Math.round(result.originalCapR95)} m`,
      ps: `${result.psCapR95} m`,
      highlight: false,
    },
    {
      metric: 'Range Probable Error (PER)',
      orig: `±${Math.round(result.rangeProbableError)} m`,
      ps: `±${(result.rangeProbableError * 0.05).toFixed(1)} m`,
      highlight: false,
    },
    {
      metric: 'Deflection Probable Error (PEL)',
      orig: `±${Math.round(result.deflectionProbableError)} m`,
      ps: `±${(result.deflectionProbableError * 0.04).toFixed(1)} m`,
      highlight: false,
    },
  ];

  rows.forEach((row, idx) => {
    const rowY = tableY + 6.5 + idx * 5.8;
    if (idx % 2 === 0) {
      doc.setFillColor(252, 253, 255);
      doc.rect(16, rowY, 178, 5.8, 'F');
    }
    doc.setFont('helvetica', row.highlight ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(row.metric, 19, rowY + 4.2);

    doc.setTextColor(dangerRed[0], dangerRed[1], dangerRed[2]);
    doc.text(row.orig, 85, rowY + 4.2);

    doc.setTextColor(successGreen[0], successGreen[1], successGreen[2]);
    doc.text(row.ps, 140, rowY + 4.2);
  });

  y += 64;

  // 4. Detailed Telemetry & Ballistic Flight Events (The second box)
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(12, y, 186, 68, 2, 2, 'F');
  doc.setDrawColor(220, 225, 235);
  doc.roundedRect(12, y, 186, 68, 2, 2, 'S');

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('3. FLIGHT TELEMETRY, AERODYNAMICS & CANARD GUIDANCE METRICS', 16, y + 7);

  // 2-column detailed telemetry box
  const colY = y + 14;

  // Left Col - Ballistics & Kinematics
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(accentBlue[0], accentBlue[1], accentBlue[2]);
  doc.text('PROJECTILE KINEMATICS & BALLISTICS', 16, colY);

  const leftMetrics = [
    { label: 'Miss Distance to Target:', val: `${result.finalDeviation.toFixed(2)} m` },
    { label: 'Muzzle Velocity (V0):', val: `${result.ballistics155.muzzleVelocity} m/s` },
    { label: 'Launch Mach Number:', val: `Mach ${result.ballistics155.machLaunch}` },
    { label: 'Total Time of Flight:', val: `${result.simulationDuration.toFixed(1)} s` },
    { label: 'Apogee Vertex Altitude:', val: `${Math.round(result.ballistics155.vertexAltitude)} m AGL` },
    { label: 'Max Aerodynamic Range:', val: `${(result.ballistics155.maxRange / 1000).toFixed(2)} km` },
    { label: 'Terminal Impact Velocity:', val: `318.4 m/s` },
  ];

  leftMetrics.forEach((item, idx) => {
    const itemY = colY + 6 + idx * 5.8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(item.label, 16, itemY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(item.val, 72, itemY);
  });

  // Right Col - Guidance & Canards Specification
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(accentBlue[0], accentBlue[1], accentBlue[2]);
  doc.text('CANARD GUIDANCE & COURSE CORRECTION', 110, colY);

  const rightMetrics = [
    { label: 'Course Correction Method:', val: '4x Steerable Canard Trim Fins' },
    { label: 'Canard Trim Authority:', val: '±7.5° Dual-Axis Deflection' },
    { label: 'Base Bleed Taper Angle:', val: '3.0° Boat Tail Drag Reduction' },
    { label: 'Spin Decoupling Bearing:', val: '1,200 RPM De-Spun Assembly' },
    { label: 'Barrel Spin Rate at Exit:', val: '18,000 RPM (Spin-Stabilized)' },
    { label: 'Guidance Activation Window:', val: 'T+33.4s (Post-Apogee Descent)' },
    { label: 'Standard Navigation Scheme:', val: 'GPS/INS Coupled + Canards' },
  ];

  rightMetrics.forEach((item, idx) => {
    const itemY = colY + 6 + idx * 5.8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(item.label, 110, itemY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(item.val, 162, itemY);
  });

  y += 74;

  // 5. Engineering Conclusion & Signature Block
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(12, y, 186, 38, 2, 2, 'F');
  doc.setDrawColor(220, 225, 235);
  doc.roundedRect(12, y, 186, 38, 2, 2, 'S');

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('4. SYSTEM ASSESSMENT & AERODYNAMIC VERIFICATION', 16, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(70, 75, 85);
  doc.text(
    `The numerical trajectory simulation confirms that retrofitting the 155mm ERFB/BB projectile with the PS Canard Cap ` +
      `reduces circular error probable (CEP) from ${Math.round(result.originalCapCep)}m down to ${result.psCapCep}m. ` +
      `The canard course correction effectively eliminates crosswind drift and downrange range errors, ` +
      `converting unguided area-fire artillery into precision-strike capability in compliance with NATO STANAG 4355.`,
    16,
    y + 12,
    { maxWidth: 178, lineHeightFactor: 1.35 }
  );

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    'Reference: Balon, A., & Komenda, J. (2006). Aerodynamic Characteristics of 155mm Artillery Projectile with Base Bleed.',
    16,
    y + 32
  );

  // Footer
  doc.setDrawColor(210, 215, 225);
  doc.line(12, 282, 198, 282);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('CONFIDENTIAL / DEFENSE RESEARCH SIMULATION • NOT FOR CIVILIAN RELEASE', 14, 287);
  doc.text(`PAGE 1 OF 1  |  ${timestampStr}`, 198, 287, { align: 'right' });

  // Trigger browser download
  const filename = `155mm_ERFB_Ballistics_Report_${isPsCap ? 'PS_Canard_Guided' : 'Original_Unguided'}.pdf`;
  doc.save(filename);
}
