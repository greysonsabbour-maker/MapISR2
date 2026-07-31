import JSZip from 'jszip';
import type { MapFeature, MapFeatureCollection, MapLayerType, GeoCoordinate } from '@/types';

const LAYER_KEYWORDS: Record<MapLayerType, string[]> = {
  mainline: ['mainline', 'main line', 'main track', 'main'],
  sidings: ['siding', 'sidings', 'spur'],
  yards: ['yard', 'yards'],
  industries: ['industry', 'industries', 'customer', 'plant', 'facility'],
  crossovers: ['crossover', 'crossovers', 'cross over'],
  stations: ['station', 'stations', 'depot'],
  waypoints: ['waypoint', 'waypoints', 'milepost', 'mp'],
  junctions: ['junction', 'junctions', 'interlocking'],
  trains: ['train'],
};

function classifyFeature(name: string, folderPath: string): MapLayerType {
  const searchText = `${name} ${folderPath}`.toLowerCase();

  for (const [layer, keywords] of Object.entries(LAYER_KEYWORDS)) {
    if (layer === 'trains') continue;
    for (const keyword of keywords) {
      if (searchText.includes(keyword)) {
        return layer as MapLayerType;
      }
    }
  }
  return 'mainline';
}

function parseCoordinates(coordsText: string): GeoCoordinate[] {
  const trimmed = coordsText.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(/\s+/);
  const coordinates: GeoCoordinate[] = [];

  for (const part of parts) {
    const [lng, lat] = part.split(',').map(Number);
    if (!isNaN(lat) && !isNaN(lng)) {
      coordinates.push({ lat, lng });
    }
  }
  return coordinates;
}

function getElementText(parent: Element, tagName: string): string {
  const el = parent.getElementsByTagName(tagName)[0];
  return el?.textContent?.trim() ?? '';
}

function parsePlacemark(placemark: Element, folderPath: string): MapFeature[] {
  const features: MapFeature[] = [];
  const name = getElementText(placemark, 'name') || 'Unnamed';
  const description = getElementText(placemark, 'description');
  const type = classifyFeature(name, folderPath);

  const properties: Record<string, string> = {};
  const dataElements = placemark.getElementsByTagName('Data');
  for (let i = 0; i < dataElements.length; i++) {
    const dataEl = dataElements[i];
    const key = dataEl.getAttribute('name') ?? '';
    const value = dataEl.getElementsByTagName('value')[0]?.textContent ?? '';
    if (key) properties[key] = value;
  }

  const point = placemark.getElementsByTagName('Point')[0];
  if (point) {
    const coords = parseCoordinates(getElementText(point, 'coordinates'));
    if (coords.length > 0) {
      features.push({
        id: `${type}-${name}-${coords[0].lat}-${coords[0].lng}`,
        name,
        type,
        coordinates: coords,
        description,
        properties,
      });
    }
  }

  const lineString = placemark.getElementsByTagName('LineString')[0];
  if (lineString) {
    const coords = parseCoordinates(getElementText(lineString, 'coordinates'));
    if (coords.length > 0) {
      features.push({
        id: `${type}-${name}-line`,
        name,
        type,
        coordinates: coords,
        description,
        properties,
      });
    }
  }

  const polygon = placemark.getElementsByTagName('Polygon')[0];
  if (polygon) {
    const outerBoundary = polygon.getElementsByTagName('outerBoundaryIs')[0];
    const linearRing = outerBoundary?.getElementsByTagName('LinearRing')[0];
    if (linearRing) {
      const coords = parseCoordinates(getElementText(linearRing, 'coordinates'));
      if (coords.length > 0) {
        features.push({
          id: `${type}-${name}-polygon`,
          name,
          type,
          coordinates: coords,
          description,
          properties,
        });
      }
    }
  }

  return features;
}

function parseFolder(folder: Element, parentPath: string): MapFeature[] {
  const features: MapFeature[] = [];
  const folderName = getElementText(folder, 'name');
  const folderPath = parentPath ? `${parentPath}/${folderName}` : folderName;

  const placemarks = folder.getElementsByTagName('Placemark');
  for (let i = 0; i < placemarks.length; i++) {
    features.push(...parsePlacemark(placemarks[i], folderPath));
  }

  const subFolders = folder.getElementsByTagName('Folder');
  for (let i = 0; i < subFolders.length; i++) {
    features.push(...parseFolder(subFolders[i], folderPath));
  }

  return features;
}

function computeBounds(features: MapFeature[]): MapFeatureCollection['bounds'] {
  if (features.length === 0) return undefined;

  let north = -90;
  let south = 90;
  let east = -180;
  let west = 180;

  for (const feature of features) {
    for (const coord of feature.coordinates) {
      north = Math.max(north, coord.lat);
      south = Math.min(south, coord.lat);
      east = Math.max(east, coord.lng);
      west = Math.min(west, coord.lng);
    }
  }

  return { north, south, east, west };
}

export async function parseKmzFile(url: string): Promise<MapFeatureCollection> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch KMZ: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  let kmlContent = '';
  for (const filename of Object.keys(zip.files)) {
    if (filename.endsWith('.kml') || filename.endsWith('.KML')) {
      kmlContent = await zip.files[filename].async('text');
      break;
    }
  }

  if (!kmlContent) {
    throw new Error('No KML file found in KMZ archive');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(kmlContent, 'text/xml');

  const features: MapFeature[] = [];

  const document = doc.getElementsByTagName('Document')[0];
  if (document) {
    const placemarks = document.getElementsByTagName('Placemark');
    for (let i = 0; i < placemarks.length; i++) {
      features.push(...parsePlacemark(placemarks[i], ''));
    }

    const folders = document.getElementsByTagName('Folder');
    for (let i = 0; i < folders.length; i++) {
      features.push(...parseFolder(folders[i], ''));
    }
  }

  const uniqueFeatures = deduplicateFeatures(features);

  return {
    features: uniqueFeatures,
    bounds: computeBounds(uniqueFeatures),
  };
}

function deduplicateFeatures(features: MapFeature[]): MapFeature[] {
  const seen = new Set<string>();
  return features.filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });
}

export function getLocationByName(
  features: MapFeature[],
  name: string,
): MapFeature | undefined {
  const normalized = name.toLowerCase().trim();
  return features.find((f) => f.name.toLowerCase().trim() === normalized);
}

export function buildRouteCoordinates(
  features: MapFeature[],
  routeNames: string[],
): GeoCoordinate[] {
  const coords: GeoCoordinate[] = [];
  for (const name of routeNames) {
    const feature = getLocationByName(features, name);
    if (feature && feature.coordinates.length > 0) {
      coords.push(feature.coordinates[0]);
    }
  }
  return coords;
}

export function extractLocations(features: MapFeature[]): {
  yards: string[];
  stations: string[];
  industries: string[];
  all: string[];
} {
  const yards = new Set<string>();
  const stations = new Set<string>();
  const industries = new Set<string>();
  const all = new Set<string>();

  for (const feature of features) {
    if (feature.coordinates.length === 0) continue;
    all.add(feature.name);

    switch (feature.type) {
      case 'yards':
        yards.add(feature.name);
        break;
      case 'stations':
        stations.add(feature.name);
        break;
      case 'industries':
        industries.add(feature.name);
        break;
    }
  }

  return {
    yards: [...yards].sort(),
    stations: [...stations].sort(),
    industries: [...industries].sort(),
    all: [...all].sort(),
  };
}

export function getFeaturesByLayer(
  features: MapFeature[],
  layer: MapLayerType,
): MapFeature[] {
  return features.filter((f) => f.type === layer);
}
