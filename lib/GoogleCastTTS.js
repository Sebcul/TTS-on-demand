'use strict';

const googleTTS = require('google-tts-api');
const Client = require('castv2-client').Client;
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;

const DEFAULT_PORT = 8009;
const PLAYBACK_TIMEOUT_MS = 30000;

class GoogleCastTTS {

  constructor({ address, port = DEFAULT_PORT }) {
    this._address = address;
    this._port = port;
  }

  async speak({ text, language = 'en', volume = 50, slow = false }) {
    const url = await this._getAudioUrl(text, language, slow);
    await this._playOnDevice(url, volume);
  }

  async _getAudioUrl(text, language, slow) {
    return googleTTS.getAudioUrl(text, {
      lang: language,
      slow,
      host: 'https://translate.google.com',
    });
  }

  _playOnDevice(url, volume) {
    return new Promise((resolve, reject) => {
      const client = new Client();
      const normalizedVolume = Math.max(0, Math.min(100, volume)) / 100;
      let originalVolume = null;
      let resolved = false;

      const cleanup = () => {
        if (resolved) return;
        resolved = true;
        client.close();
      };

      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Playback timed out'));
      }, PLAYBACK_TIMEOUT_MS);

      const finish = (err) => {
        clearTimeout(timeout);
        cleanup();
        if (err) reject(err);
        else resolve();
      };

      client.on('error', (err) => {
        finish(err);
      });

      client.connect(this._address, () => {
        client.getVolume((err, vol) => {
          if (err) return finish(err);

          originalVolume = vol.level;

          client.setVolume({ level: normalizedVolume }, (err) => {
            if (err) return finish(err);

            client.launch(DefaultMediaReceiver, (err, player) => {
              if (err) return finish(err);

              const media = {
                contentId: url,
                contentType: 'audio/mp3',
                streamType: 'BUFFERED',
              };

              player.load(media, { autoplay: true }, (err) => {
                if (err) return finish(err);

                player.on('status', (status) => {
                  if (status.playerState === 'IDLE' && status.idleReason === 'FINISHED') {
                    this._restoreVolume(client, originalVolume, finish);
                  }
                });
              });
            });
          });
        });
      });
    });
  }

  _restoreVolume(client, originalVolume, callback) {
    if (originalVolume === null) return callback();
    client.setVolume({ level: originalVolume }, (err) => {
      callback(err);
    });
  }

}

module.exports = GoogleCastTTS;
