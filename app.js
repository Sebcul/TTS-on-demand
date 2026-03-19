'use strict';

const Homey = require('homey');
const GoogleCastTTS = require('./lib/GoogleCastTTS');

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'sv', label: 'Swedish' },
  { id: 'de', label: 'German' },
  { id: 'fr', label: 'French' },
  { id: 'es', label: 'Spanish' },
  { id: 'nl', label: 'Dutch' },
  { id: 'it', label: 'Italian' },
  { id: 'pt', label: 'Portuguese' },
  { id: 'da', label: 'Danish' },
  { id: 'no', label: 'Norwegian' },
  { id: 'fi', label: 'Finnish' },
  { id: 'pl', label: 'Polish' },
  { id: 'ja', label: 'Japanese' },
  { id: 'ko', label: 'Korean' },
  { id: 'zh-CN', label: 'Chinese (Simplified)' },
  { id: 'ru', label: 'Russian' },
  { id: 'ar', label: 'Arabic' },
  { id: 'hi', label: 'Hindi' },
];

class TTSOnDemandApp extends Homey.App {

  async onInit() {
    this._discoveryStrategy = this.homey.discovery.getStrategy('googlecast');

    const initialResults = this._discoveryStrategy.getDiscoveryResults();
    this.log(`Discovery: found ${Object.keys(initialResults).length} device(s) on init`);
    for (const [id, result] of Object.entries(initialResults)) {
      this.log(`  - ${result.txt?.fn || id} (${result.address}:${result.port})`);
    }

    this._discoveryStrategy.on('result', (result) => {
      this.log(`Discovery: new device found — ${result.txt?.fn || result.id} (${result.address})`);
    });

    this._registerFlowCards();
    this.log('TTS on Demand has been initialized');
  }

  getDevices() {
    const results = this._discoveryStrategy.getDiscoveryResults();
    return Object.values(results).map((result) => ({
      id: result.id,
      name: result.txt?.fn || result.id,
      address: result.address,
      port: result.port || 8009,
    }));
  }

  getLanguages() {
    return LANGUAGES;
  }

  async speak({ deviceId, text, language = 'en', volume = 50, slow = false }) {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    const devices = this.getDevices();
    const device = devices.find((d) => d.id === deviceId);
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`);
    }

    const tts = new GoogleCastTTS({
      address: device.address,
      port: device.port,
    });

    await tts.speak({ text: text.trim(), language, volume, slow });
  }

  _registerFlowCards() {
    const speakAction = this.homey.flow.getActionCard('speak');

    speakAction.registerRunListener(async (args) => {
      await this.speak({
        deviceId: args.device.id,
        text: args.text,
        language: args.language,
        volume: args.volume,
        slow: args.slow,
      });
    });

    speakAction.registerArgumentAutocompleteListener('device', async (query) => {
      const devices = this.getDevices();
      return devices
        .filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))
        .map((d) => ({
          id: d.id,
          name: d.name,
          description: d.address,
        }));
    });
  }

}

module.exports = TTSOnDemandApp;
