'use strict';

module.exports = {
  async getDevices({ homey }) {
    const devices = homey.app.getDevices();
    homey.app.log(`Widget API /devices called — returning ${devices.length} device(s)`, JSON.stringify(devices));
    return devices;
  },

  async getLanguages({ homey }) {
    return homey.app.getLanguages();
  },

  async speak({ homey, body }) {
    await homey.app.speak({
      deviceId: body.deviceId,
      text: body.text,
      language: body.language,
      volume: body.volume,
      slow: body.slow,
    });
    return { ok: true };
  },
};
