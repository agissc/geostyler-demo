import React, { useState, useEffect } from 'react';
import {
  Style as GsStyle
} from 'geostyler-style';

import {
  Data as GsData
} from 'geostyler-data';

import SldStyleParser from 'geostyler-sld-parser';
import MapboxStyleParser from 'geostyler-mapbox-parser';
import QGISStyleParser from 'geostyler-qgis-parser';

import {
  CodeEditor,
  locale as GsLocale,
  PreviewMap,
  GeoStylerContext,
  GeoStylerLocale
} from 'geostyler';

import './App.less';
import LegendRenderer from 'geostyler-legend/dist/LegendRenderer/LegendRenderer';
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import OlLayerTile from 'ol/layer/Tile';
import OlSourceTileWMS from 'ol/source/TileWMS';
import { fromLonLat } from 'ol/proj';
import { GeoStylerContextInterface } from 'geostyler/dist/context/GeoStylerContext/GeoStylerContext';

const sldStyleParser = new SldStyleParser({
  builderOptions: {
    format: true
  }
});
const sldStyleParserSE = new SldStyleParser({
  sldVersion: '1.1.0',
  builderOptions: {
    format: true
  }
});
sldStyleParserSE.title = 'SLD 1.1.0 - Symbology Encoding';
const mapBoxStyleParser = new MapboxStyleParser({
  pretty: true
});
const qgisParser = new QGISStyleParser();

export interface AppLocale {
  codeEditor: string;
  cardLayout: string;
  examples: string;
  graphicalEditor: string;
  language: string;
  legend: string;
  splitView: string;
  previewMap: string;
  loadedSuccess: string;
  previewMapDataProjection: string;
}

export const App: React.FC = () => {

  const [locale] = useState<GeoStylerLocale>(GsLocale.en_US);
  const [appLocale] = useState<AppLocale>({
    codeEditor: 'Code Editor',
    cardLayout: 'CardLayout (Beta)',
    examples: 'Examples',
    graphicalEditor: 'Graphical Editor',
    language: 'Language',
    legend: 'Legend',
    splitView: 'Split View',
    previewMap: 'Preview Map',
    loadedSuccess: 'Loaded successfully!',
    previewMapDataProjection: 'The sample data is expected in the projection EPSG:4326.'
  });
  const [data] = useState<GsData>();
  const [ruleRendererType] = useState<'SLD' | 'OpenLayers'>('OpenLayers');
  const [style, setStyle] = useState<GsStyle>({
    name: 'GeoStyler Demo',
    rules: [
      {
        name: 'Rule 1',
        symbolizers: [
          {
            kind: 'Line',
            color: '#ff0000',
            width: 5
          }
        ]
      }
    ]
  });

  useEffect(() => {
    const legendRenderer = new LegendRenderer({
      maxColumnWidth: 300,
      maxColumnHeight: 300,
      overflow: 'auto',
      styles: [structuredClone(style)],
      size: [600, 300],
      hideRect: true
    });
    const legendEl = document.getElementById("legend");
    if (legendEl) {
      legendRenderer.render(legendEl);
    }
  }, [style]);

  const map = new OlMap({
    layers: [
      new OlLayerTile({
        source: new OlSourceTileWMS({
          url: 'https://sgx.geodatenzentrum.de/wms_topplus_open',
          params: {
            'LAYERS': 'web_light_grau'
          }
        })
      })
    ],
    view: new OlView({
      center: fromLonLat([-122.416667, 37.783333]),
      zoom: 12
    }),
  });

  useEffect(() => {
    map.setTarget('map');
  }, [map]);

  const ctx: GeoStylerContextInterface = {
    composition: {
      Renderer: {
        rendererType: ruleRendererType
      },
      SLDRenderer: {
        wmsBaseUrl: 'https://ows-demo.terrestris.de/geoserver/ows?',
        layer: 'terrestris:bundeslaender'
      }
    },
    data,
    locale
  };

  return (
    <GeoStylerContext.Provider value={ctx}>
      <div className="app">
        <div className="split-view-container">
          <div className="code-editor-section">
            <CodeEditor
              style={style}
              parsers={[
                mapBoxStyleParser,
                qgisParser,
                sldStyleParser,
                sldStyleParserSE
              ]}
              defaultParser={sldStyleParser}
              onStyleChange={setStyle}
              showSaveButton={true}
              showCopyButton={true}
            />
          </div>
          <div className="map-section">
            <p className='preview-map-info'>{appLocale.previewMapDataProjection}</p>
            <PreviewMap
              style={structuredClone(style)}
              map={map}
              mapHeight="calc(100% - 40px)"
            />
          </div>
          <div className='legend-section'>
            <h2>{appLocale.legend}</h2>
            <div id="legend"></div>
          </div>
        </div>
      </div>
    </GeoStylerContext.Provider>
  );
}

export default App;
