import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  advancePhotoRowY,
  resolveServiceCardStartY,
} from '../domain/pdf/sections/servicesHelpers.js';

describe('pdf services section helpers', () => {
  it('advancePhotoRowY preserva o cursor entre linhas de fotos', () => {
    expect(advancePhotoRowY(120, 0, 2, 55, 3)).toBe(178);
    expect(advancePhotoRowY(178, 1, 2, 55, 3)).toBe(233);
    expect(advancePhotoRowY(120, 0, 1, 55, 3)).toBe(175);
  });

  it('resolveServiceCardStartY preserva gap quando o card cabe na pagina atual', () => {
    expect(
      resolveServiceCardStartY({
        y: 60,
        maxY: 260,
        needsGap: true,
        requiredSpace: 90,
        nextPageContentY: 20,
        cardGap: 3,
      }),
    ).toEqual({ startsNewPage: false, y: 63 });

    expect(
      resolveServiceCardStartY({
        y: 60,
        maxY: 260,
        needsGap: false,
        requiredSpace: 90,
        nextPageContentY: 20,
        cardGap: 3,
      }),
    ).toEqual({ startsNewPage: false, y: 60 });
  });

  it('resolveServiceCardStartY preserva decisao de iniciar nova pagina sem mutar doc', () => {
    expect(
      resolveServiceCardStartY({
        y: 230,
        maxY: 260,
        needsGap: true,
        requiredSpace: 90,
        nextPageContentY: 20,
        cardGap: 3,
      }),
    ).toEqual({ startsNewPage: true, y: 20 });

    expect(
      resolveServiceCardStartY({
        y: 20,
        maxY: 260,
        needsGap: true,
        requiredSpace: 260,
        nextPageContentY: 20,
        cardGap: 3,
      }),
    ).toEqual({ startsNewPage: false, y: 23 });
  });

  it('mantem o modulo sem imports de services.js, jsPDF, Image, foto resolver ou DOM', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/domain/pdf/sections/servicesHelpers.js'),
      'utf8',
    );

    expect(source).not.toMatch(/services\.js|jspdf|Image|photoStorage|resolvePhotoDataUrlForPdf/);
    expect(source).not.toMatch(/document|window|React|ui\/|reportExportHandlers|views\/registro/);
    expect(source).not.toMatch(/fillPage|drawSectionTitle|drawServicesPageHeader/);
  });
});
