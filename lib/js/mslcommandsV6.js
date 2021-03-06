/* eslint-disable no-unused-vars */

const _ = require('lodash');
const { commandsV6 } = require('node-milight-promise');
const tinycolor = require('tinycolor2');

const kelvinToPercent = function (val) {
  const minK = 2700;
  const maxK = 6500;
  const minM = 0;
  const maxM = 100;

  val = Math.max(minK, Math.min(val, maxK));
  val = 100 * ((val - maxK) / (maxK - minK) + 1);
  val = Math.round(val);
  val = Math.max(minM, Math.min(val, maxM));

  return val;
};

function mslcommandsV6(adapter, mslStatestore) {
  /* -------------------------------------------------------- Wrapper bridge (iBox1 ) -------------------------------------------------------------------- */

  // wrapper bridge on
  commandsV6.bridge.constructor.prototype.on = _.wrap(commandsV6.bridge.on, async function (func, options) {
    if (typeof options !== 'object') {
      return func();
    }

    if (options.val === false) {
      options.val = true;
      await mslStatestore.setState({
        dp: 'off',
        val: true,
        params: options,
      });

      return this.off(options);
    }

    await mslStatestore.setState({
      dp: 'off',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'onoff',
      val: true,
      params: options,
    });

    let _brightness = mslStatestore.getState(`${options.fullChannelPath}brightness`);

    _brightness = (_brightness.val > 0 ? _brightness.val : (_brightness.oldVal > 0
      ? _brightness.oldVal : 100));

    await mslStatestore.setState({
      dp: 'brightness',
      val: _brightness,
      params: options,
    });

    return [
      func(),
      ...await this.rgb(options),
    ];
  });

  // wrapper bridge off
  commandsV6.bridge.constructor.prototype.off = _.wrap(commandsV6.bridge.off, async function (func, options) {
    if (typeof options !== 'object') {
      return func();
    }

    if (options.val === false) {
      options.val = true;
      await mslStatestore.setState({
        dp: 'on',
        val: true,
        params: options,
      });

      return this.on(options);
    }

    await mslStatestore.setState({
      dp: 'on',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'onoff',
      val: false,
      params: options,
    });

    await mslStatestore.setState({
      dp: 'rgb',
      val: '#000000',
      params: options,
    });

    return [
      func(),
      ...await this.rgb(options),
    ];
  });

  // wrapper bridge whiteMode
  commandsV6.bridge.constructor.prototype.whiteMode = _.wrap(commandsV6.bridge.whiteMode, async function (func, options) {
    if (typeof options !== 'object') {
      return func();
    }

    let _brightness = mslStatestore.getState(`${options.fullChannelPath}brightness`);

    _brightness = (_brightness.val > 0 ? _brightness.val : (_brightness.oldVal > 0
      ? _brightness.oldVal : 100));

    await mslStatestore.setState({
      dp: 'brightness',
      val: _brightness,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'saturation',
      val: 0,
      params: options,
    });

    return this.rgb(options);
  });

  // wrapper bridge nightMode
  commandsV6.bridge.constructor.prototype.nightMode = _.wrap(commandsV6.bridge.nightMode, async (func, options) => {
    if (mslStatestore.getState(`${options.fullChannelPath}on`).val === true) {
      await mslStatestore.setState({
        dp: 'on',
        val: false,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'off',
        val: true,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'onoff',
        val: false,
        params: options,
      });
    }

    if (mslStatestore.getState(`${options.fullChannelPath}effectOn`).val === true) {
      await mslStatestore.setState({
        dp: 'effectOn',
        val: false,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'effectOff',
        val: true,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'effectOnOff',
        val: false,
        params: options,
      });
    }

    await mslStatestore.setState({
      dp: 'whiteMode',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'brightness',
      val: 0,
      params: options,
    });

    return func();
  });

  // wrapper bridge brightness
  commandsV6.bridge.constructor.prototype.brightness = _.wrap(commandsV6.bridge.brightness, async function (func, options) {
    if (typeof options !== 'object') {
      return func(_.parseInt(options));
    }

    return this.rgb(options);
  });

  // wrapper bridge hue
  commandsV6.bridge.constructor.prototype.hue = _.wrap(commandsV6.bridge.hue, async function (func, options, ...argv) {
    if (typeof options !== 'object') {
      return func(_.parseInt(options), argv[0]);
    }

    return this.rgb(options);
  });

  // Wrapper bridge rgb
  commandsV6.bridge.constructor.prototype.rgb = _.wrap(commandsV6.bridge.rgb, async function (func, options) {
    const _saturation = mslStatestore.getState(`${options.fullChannelPath}saturation`);
    const _brightness = mslStatestore.getState(`${options.fullChannelPath}brightness`);

    const _on = [];

    await mslStatestore.setState({
      dp: 'nightMode',
      val: false,
      params: options,
    });

    if (_brightness.val === 0) {
      await mslStatestore.setState({
        dp: 'whiteMode',
        val: false,
        params: options,
      });

      if (mslStatestore.getState(`${options.fullChannelPath}on`).val === true) {
        await mslStatestore.setState({
          dp: 'on',
          val: false,
          params: options,
        });
        await mslStatestore.setState({
          dp: 'off',
          val: true,
          params: options,
        });
        await mslStatestore.setState({
          dp: 'onoff',
          val: false,
          params: options,
        });
      }

      return this.off();
    }

    if (mslStatestore.getState(`${options.fullChannelPath}on`).val === false) {
      await mslStatestore.setState({
        dp: 'on',
        val: true,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'off',
        val: false,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'onoff',
        val: true,
        params: options,
      });

      _on.push(...await this.on());
    }

    if (_saturation.val === 0) {
      await mslStatestore.setState({
        dp: 'whiteMode',
        val: true,
        params: options,
      });

      return [
        // _on,
        await this.whiteMode(),
        [], [],
        await this.brightness(_brightness.val),
      ];
    }

    await mslStatestore.setState({
      dp: 'whiteMode',
      val: false,
      params: options,
    });

    const _rgb = tinycolor(mslStatestore.getState(`${options.fullChannelPath}rgb`).val)
      .toRgb(); // eventuell optimieren

    return [
      _on,
      await func.call(commandsV6.bridge, _rgb.r, _rgb.g, _rgb.b),
      await this.brightness(_brightness.val),
    ];
  });

  // wrapper bridge effectMode
  commandsV6.bridge.constructor.prototype.effectMode = _.wrap(commandsV6.bridge.effectMode, async function (func, options) {
    if (mslStatestore.getState(`${options.fullChannelPath}effectOn`).val === false) {
      await mslStatestore.setState({
        dp: 'effectOn',
        val: true,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'effectOff',
        val: false,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'effectOnOff',
        val: true,
        params: options,
      });
    }

    return [
      await this.effectOn(),
      [],
      func(options.val),
      [],
      await this.effectBrightness(mslStatestore.getState(`${options.fullChannelPath}effectBrightness`).val),
    ];
  });

  // wrapper bridge effectModeNext
  commandsV6.bridge.constructor.prototype.effectModeNext = _.wrap(commandsV6.bridge.effectModeNext, async function (func, options) {
    return [
      func(),
      await this.effectBrightness(mslStatestore.getState(`${options.fullChannelPath}effectBrightness`).val),
    ];
  });

  // wrapper bridge effectSpeedUp
  commandsV6.bridge.constructor.prototype.effectSpeedUp = _.wrap(commandsV6.bridge.effectSpeedUp, async (func) => func());

  // wrapper bridge effectSpeedDown
  commandsV6.bridge.constructor.prototype.effectSpeedDown = _.wrap(commandsV6.bridge.effectSpeedDown, async (func) => func());

  /* --------------------------------------------------------- Additional Function bridge ------------------------------------------------- */

  // bridge onoff
  commandsV6.bridge.constructor.prototype.onoff = async function (options) {
    if (options.val === true) {
      await mslStatestore.setState({
        dp: 'on',
        val: true,
        params: options,
      });

      return this.on(options);
    }
    options.val = true;
    await mslStatestore.setState({
      dp: 'off',
      val: true,
      params: options,
    });

    return this.off(options);
  };

  // bridge effectBrightness
  commandsV6.bridge.constructor.prototype.effectBrightness = async function (options) {
    if (typeof options !== 'object') {
      return this.brightness(options);
    }

    return this.brightness(options.val);
  };

  // bridge effectOn
  commandsV6.bridge.constructor.prototype.effectOn = async function (options, ...argv) {
    if (typeof options !== 'object') {
      return this.on(options);
    }

    if (options.val === false) {
      options.val = true;
      await mslStatestore.setState({
        dp: 'effectOff',
        val: true,
        params: options,
      });

      return this.effectOff(options);
    }

    await mslStatestore.setState({
      dp: 'effectOff',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'effectOnOff',
      val: true,
      params: options,
    });

    const _effectMode = mslStatestore.getState(`${options.fullChannelPath}effectMode`);

    options.val = _effectMode.val;

    return this.effectMode(options);
  };

  // bridge effectOff
  commandsV6.bridge.constructor.prototype.effectOff = async function (options, ...argv) {
    if (typeof options !== 'object') {
      return this.off(options);
    }

    if (options.val === false) {
      options.val = true;
      await mslStatestore.setState({
        dp: 'effectOn',
        val: true,
        params: options,
      });

      return this.effectOn(options);
    }

    await mslStatestore.setState({
      dp: 'effectOn',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'effectOnOff',
      val: false,
      params: options,
    });

    await mslStatestore.setState({
      dp: 'rgb',
      val: '#000000',
      params: options,
    });

    return [
      ...await this.effectOff(),
    ];
  };

  // wrapper bridge effectOnOff
  commandsV6.bridge.constructor.prototype.effectOnOff = async function (options) {
    if (options.val === true) {
      await mslStatestore.setState({
        dp: 'effectOn',
        val: true,
        params: options,
      });

      return this.effectOn(options);
    }
    options.val = true;
    await mslStatestore.setState({
      dp: 'effectOff',
      val: true,
      params: options,
    });

    return this.effectOff(options);
  };

  /* ------------------------------------------------------------- Wrapper rgbw ------------------------------------------------------------- */

  // wrapper rgbw on
  commandsV6.rgbw.constructor.prototype.on = _.wrap(commandsV6.rgbw.on, async function (func, options) {
    if (typeof options !== 'object') {
      return func(options);
    }

    if (options.val === false) {
      options.val = true;
      await mslStatestore.setState({
        dp: 'off',
        val: true,
        params: options,
      });

      return this.off(options);
    }

    await mslStatestore.setState({
      dp: 'off',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'onoff',
      val: true,
      params: options,
    });

    let _brightness = mslStatestore.getState(`${options.fullChannelPath}brightness`);

    _brightness = (_brightness.val > 0 ? _brightness.val : (_brightness.oldVal > 0
      ? _brightness.oldVal : 100));

    await mslStatestore.setState({
      dp: 'brightness',
      val: _brightness,
      params: options,
    });

    return [
      func(options.mslZoneNumber),
      ...await this.rgb(options),
    ];
  });

  // wrapper rgbw off
  commandsV6.rgbw.constructor.prototype.off = _.wrap(commandsV6.rgbw.off, async function (func, options) {
    if (typeof options !== 'object') {
      return func(options);
    }

    if (options.val === false) {
      options.val = true;
      await mslStatestore.setState({
        dp: 'on',
        val: true,
        params: options,
      });

      return this.on(options);
    }

    await mslStatestore.setState({
      dp: 'on',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'onoff',
      val: false,
      params: options,
    });

    await mslStatestore.setState({
      dp: 'rgb',
      val: '#000000',
      params: options,
    });

    return [
      func(options.mslZoneNumber),
      ...await this.rgb(options),
    ];
  });

  // wrapper rgbw whiteMode
  commandsV6.rgbw.constructor.prototype.whiteMode = _.wrap(commandsV6.rgbw.whiteMode, async function (func, options) {
    if (typeof options !== 'object') {
      return func(options);
    }

    let _brightness = mslStatestore.getState(`${options.fullChannelPath}brightness`);

    _brightness = (_brightness.val > 0 ? _brightness.val : (_brightness.oldVal > 0
      ? _brightness.oldVal : 100));

    await mslStatestore.setState({
      dp: 'brightness',
      val: _brightness,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'saturation',
      val: 0,
      params: options,
    });

    return this.rgb(options);
  });

  // wrapper rgbw nightMode
  commandsV6.rgbw.constructor.prototype.nightMode = _.wrap(commandsV6.rgbw.nightMode, async (func, options) => {
    if (mslStatestore.getState(`${options.fullChannelPath}on`).val === true) {
      await mslStatestore.setState({
        dp: 'on',
        val: false,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'off',
        val: true,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'onoff',
        val: false,
        params: options,
      });
    }

    if (mslStatestore.getState(`${options.fullChannelPath}effectOn`).val === true) {
      await mslStatestore.setState({
        dp: 'effectOn',
        val: false,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'effectOff',
        val: true,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'effectOnOff',
        val: false,
        params: options,
      });
    }

    await mslStatestore.setState({
      dp: 'whiteMode',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'brightness',
      val: 0,
      params: options,
    });

    return func(options.mslZoneNumber);
  });

  // wrapper rgbw brightness
  commandsV6.rgbw.constructor.prototype.brightness = _.wrap(commandsV6.rgbw.brightness, async function (func, options, ...argv) {
    if (typeof options !== 'object') {
      return func(options, _.parseInt(argv[0]));
    }

    return this.rgb(options);
  });

  // wrapper rgbw hue
  commandsV6.rgbw.constructor.prototype.hue = _.wrap(commandsV6.rgbw.hue, async function (func, options, ...argv) {
    if (typeof options !== 'object') {
      return func(options, _.parseInt(argv[0]), argv[1]);
    }

    return this.rgb(options);
  });

  // Wrapper rgbw rgb
  commandsV6.rgbw.constructor.prototype.rgb = _.wrap(commandsV6.rgbw.rgb, async function (func, options) {
    const _saturation = mslStatestore.getState(`${options.fullChannelPath}saturation`);
    const _brightness = mslStatestore.getState(`${options.fullChannelPath}brightness`);

    const _on = [];

    await mslStatestore.setState({
      dp: 'nightMode',
      val: false,
      params: options,
    });

    if (_brightness.val === 0) {
      await mslStatestore.setState({
        dp: 'whiteMode',
        val: false,
        params: options,
      });

      if (mslStatestore.getState(`${options.fullChannelPath}on`).val === true) {
        await mslStatestore.setState({
          dp: 'on',
          val: false,
          params: options,
        });
        await mslStatestore.setState({
          dp: 'off',
          val: true,
          params: options,
        });
        await mslStatestore.setState({
          dp: 'onoff',
          val: false,
          params: options,
        });
      }

      return this.off(options.mslZoneNumber);
    }

    if (mslStatestore.getState(`${options.fullChannelPath}on`).val === false) {
      await mslStatestore.setState({
        dp: 'on',
        val: true,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'off',
        val: false,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'onoff',
        val: true,
        params: options,
      });

      _on.push(...await this.on(options.mslZoneNumber));
    }

    if (_saturation.val === 0) {
      await mslStatestore.setState({
        dp: 'whiteMode',
        val: true,
        params: options,
      });

      return [
        // _on,
        await this.whiteMode(options.mslZoneNumber),
        [], [],
        await this.brightness(options.mslZoneNumber, _brightness.val),
      ];
    }

    await mslStatestore.setState({
      dp: 'whiteMode',
      val: false,
      params: options,
    });

    const _rgb = tinycolor(mslStatestore.getState(`${options.fullChannelPath}rgb`).val)
      .toRgb(); // eventuell optimieren

    return [
      _on,
      await func.call(commandsV6.rgbw, options.mslZoneNumber, _rgb.r, _rgb.g, _rgb.b),
      await this.brightness(options.mslZoneNumber, _brightness.val),
    ];
  });

  // wrapper rgbw effectMode
  commandsV6.rgbw.constructor.prototype.effectMode = _.wrap(commandsV6.rgbw.effectMode, async function (func, options) {
    if (mslStatestore.getState(`${options.fullChannelPath}effectOn`).val === false) {
      await mslStatestore.setState({
        dp: 'effectOn',
        val: true,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'effectOff',
        val: false,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'effectOnOff',
        val: true,
        params: options,
      });
    }

    return [
      await this.effectOn(options.mslZoneNumber),
      [],
      func(options.mslZoneNumber, options.val),
      [],
      await this.effectBrightness(options.mslZoneNumber, mslStatestore.getState(`${options.fullChannelPath}effectBrightness`).val),
    ];
  });

  // wrapper rgbw effectModeNext
  commandsV6.rgbw.constructor.prototype.effectModeNext = _.wrap(commandsV6.rgbw.effectModeNext, async function (func, options) {
    return [
      func(options.mslZoneNumber),
      await this.effectBrightness(options.mslZoneNumber, mslStatestore.getState(`${options.fullChannelPath}effectBrightness`).val),
    ];
  });

  // wrapper rgbw effectSpeedUp
  commandsV6.rgbw.constructor.prototype.effectSpeedUp = _.wrap(commandsV6.rgbw.effectSpeedUp, async (func, options) => func(options.mslZoneNumber));

  // wrapper rgbw effectSpeedDown
  commandsV6.rgbw.constructor.prototype.effectSpeedDown = _.wrap(commandsV6.rgbw.effectSpeedDown, async (func, options) => func(options.mslZoneNumber));

  // wrapper rgbw link
  commandsV6.rgbw.constructor.prototype.link = _.wrap(commandsV6.rgbw.link, async (func, options) => func(options.mslZoneNumber));

  // wrapper rgbw unlink
  commandsV6.rgbw.constructor.prototype.unlink = _.wrap(commandsV6.rgbw.unlink, async (func, options) => func(options.mslZoneNumber));

  /* --------------------------------------------------------- Additional Function rgbw ------------------------------------------------- */

  // rgbw onoff
  commandsV6.rgbw.constructor.prototype.onoff = async function (options) {
    if (options.val === true) {
      await mslStatestore.setState({
        dp: 'on',
        val: true,
        params: options,
      });

      return this.on(options);
    }
    options.val = true;
    await mslStatestore.setState({
      dp: 'off',
      val: true,
      params: options,
    });

    return this.off(options);
  };

  // rgbw effectBrightness
  commandsV6.rgbw.constructor.prototype.effectBrightness = async function (options, ...argv) {
    if (typeof options !== 'object') {
      return this.brightness(options, argv[0]);
    }

    return this.brightness(options.mslZoneNumber, options.val);
  };

  // rgbw effectOn
  commandsV6.rgbw.constructor.prototype.effectOn = async function (options, ...argv) {
    if (typeof options !== 'object') {
      return this.on(options);
    }

    if (options.val === false) {
      options.val = true;
      await mslStatestore.setState({
        dp: 'effectOff',
        val: true,
        params: options,
      });

      return this.effectOff(options);
    }

    await mslStatestore.setState({
      dp: 'effectOff',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'effectOnOff',
      val: true,
      params: options,
    });

    const _effectMode = mslStatestore.getState(`${options.fullChannelPath}effectMode`);

    options.val = _effectMode.val;

    return this.effectMode(options);
  };

  // rgbw effectOff
  commandsV6.rgbw.constructor.prototype.effectOff = async function (options, ...argv) {
    if (typeof options !== 'object') {
      return this.off(options);
    }

    if (options.val === false) {
      options.val = true;
      await mslStatestore.setState({
        dp: 'effectOn',
        val: true,
        params: options,
      });

      return this.effectOn(options);
    }

    await mslStatestore.setState({
      dp: 'effectOn',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'effectOnOff',
      val: false,
      params: options,
    });

    await mslStatestore.setState({
      dp: 'rgb',
      val: '#000000',
      params: options,
    });

    return [
      ...await this.effectOff(options.mslZoneNumber),
    ];
  };

  // rgbw effectOnOff
  commandsV6.rgbw.constructor.prototype.effectOnOff = async function (options) {
    if (options.val === true) {
      await mslStatestore.setState({
        dp: 'effectOn',
        val: true,
        params: options,
      });

      return this.effectOn(options);
    }
    options.val = true;
    await mslStatestore.setState({
      dp: 'effectOff',
      val: true,
      params: options,
    });

    return this.effectOff(options);
  };

  /* ------------------------------------------------------------- Wrapper fullColor ------------------------------------------------------------- */

  // wrapper fullColor on
  commandsV6.fullColor.constructor.prototype.on = _.wrap(commandsV6.fullColor.on, async function (func, options) {
    if (typeof options !== 'object') {
      return func(options);
    }

    if (options.val === false) {
      options.val = true;
      await mslStatestore.setState({
        dp: 'off',
        val: true,
        params: options,
      });

      return this.off(options);
    }

    await mslStatestore.setState({
      dp: 'off',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'onoff',
      val: true,
      params: options,
    });

    let _brightness = mslStatestore.getState(`${options.fullChannelPath}brightness`);

    _brightness = (_brightness.val > 0 ? _brightness.val : (_brightness.oldVal > 0
      ? _brightness.oldVal : 100));

    await mslStatestore.setState({
      dp: 'brightness',
      val: _brightness,
      params: options,
    });

    return [
      func(options.mslZoneNumber),
      ...await this.rgb(options),
    ];
  });

  // wrapper fullColor off
  commandsV6.fullColor.constructor.prototype.off = _.wrap(commandsV6.fullColor.off, async function (func, options) {
    if (typeof options !== 'object') {
      return func(options);
    }

    if (options.val === false) {
      options.val = true;
      await mslStatestore.setState({
        dp: 'on',
        val: true,
        params: options,
      });

      return this.on(options);
    }

    await mslStatestore.setState({
      dp: 'on',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'onoff',
      val: false,
      params: options,
    });

    await mslStatestore.setState({
      dp: 'rgb',
      val: '#000000',
      params: options,
    });

    return [
      func(options.mslZoneNumber),
      ...await this.rgb(options),
    ];
  });

  // wrapper fullColor whiteMode
  commandsV6.fullColor.constructor.prototype.whiteMode = _.wrap(commandsV6.fullColor.whiteMode, async function (func, options) {
    if (typeof options !== 'object') {
      return func(options);
    }

    let _brightness = mslStatestore.getState(`${options.fullChannelPath}brightness`);

    _brightness = (_brightness.val > 0 ? _brightness.val : (_brightness.oldVal > 0
      ? _brightness.oldVal : 100));

    await mslStatestore.setState({
      dp: 'brightness',
      val: _brightness,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'saturation',
      val: 0,
      params: options,
    });

    return this.rgb(options);
  });

  // wrapper fullColor nightMode
  commandsV6.fullColor.constructor.prototype.nightMode = _.wrap(commandsV6.fullColor.nightMode, async (func, options) => {
    if (mslStatestore.getState(`${options.fullChannelPath}on`).val === true) {
      await mslStatestore.setState({
        dp: 'on',
        val: false,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'off',
        val: true,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'onoff',
        val: false,
        params: options,
      });
    }

    if (mslStatestore.getState(`${options.fullChannelPath}effectOn`).val === true) {
      await mslStatestore.setState({
        dp: 'effectOn',
        val: false,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'effectOff',
        val: true,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'effectOnOff',
        val: false,
        params: options,
      });
    }

    await mslStatestore.setState({
      dp: 'whiteMode',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'brightness',
      val: 0,
      params: options,
    });

    return func(options.mslZoneNumber);
  });

  // wrapper fullColor whiteTemperature
  commandsV6.fullColor.constructor.prototype.whiteTemperature = _.wrap(commandsV6.fullColor.whiteTemperature, async function (func, options, ...argv) {
    if (typeof options !== 'object') {
      return func(options, kelvinToPercent(argv[0]));
    }

    let _brightness = mslStatestore.getState(`${options.fullChannelPath}brightness`);

    _brightness = (_brightness.val > 0 ? _brightness.val : (_brightness.oldVal > 0
      ? _brightness.oldVal : 100));

    await mslStatestore.setState({
      dp: 'brightness',
      val: _brightness,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'saturation',
      val: 0,
      params: options,
    });

    await mslStatestore.setState({
      dp: 'whiteTemperature',
      val: options.val,
      params: options,
    });

    return this.rgb(options);
  });

  // wrapper fullColor brightness
  commandsV6.fullColor.constructor.prototype.brightness = _.wrap(commandsV6.fullColor.brightness, async function (func, options, ...argv) {
    if (typeof options !== 'object') {
      return func(options, _.parseInt(argv[0]));
    }

    return this.rgb(options);
  });

  // wrapper fullColor saturation
  commandsV6.fullColor.constructor.prototype.saturation = _.wrap(commandsV6.fullColor.saturation, async function (func, options, ...argv) {
    if (typeof options !== 'object') {
      return func(options, _.parseInt(argv[0]), argv[1]);
    }

    return this.rgb(options);
  });

  // wrapper fullColor hue
  commandsV6.fullColor.constructor.prototype.hue = _.wrap((zone, hue, enableLegacyColorWheel, mslColorOffset) => {
    let cn = Math.min(Math.max(hue, 0x00), 0xFF);
    const zn = Math.min(Math.max(zone, 0x00), 0x04);
    if (enableLegacyColorWheel) {
      // cn = (0xFF - cn) - 0x48;
      cn = (0xFF - cn) - mslColorOffset;
      if (cn < 0x00) {
        cn = 0xFF + cn;
      }
    }
    return [0x31, 0x00, 0x00, 0x08, 0x01, cn, cn, cn, cn, zn];
  }, async function (func, options, ...argv) {
    if (typeof options !== 'object') {
      const mslColorOffset = +adapter.config.zones.find((zone) => +zone.mslZoneNumber === options).mslColorOffset;
      return func(options, _.parseInt(argv[0]), argv[1], mslColorOffset);
    }

    return this.rgb(options);
  });

  // Wrapper fullColor rgb
  commandsV6.fullColor.constructor.prototype.rgb = _.wrap(commandsV6.fullColor.rgb, async function (func, options) {
    const _saturation = mslStatestore.getState(`${options.fullChannelPath}saturation`);
    const _brightness = mslStatestore.getState(`${options.fullChannelPath}brightness`);

    const _whiteTemperature = mslStatestore.getState(`${options.fullChannelPath}whiteTemperature`);

    const _on = [];

    await mslStatestore.setState({
      dp: 'nightMode',
      val: false,
      params: options,
    });

    if (_brightness.val === 0) {
      await mslStatestore.setState({
        dp: 'whiteMode',
        val: false,
        params: options,
      });

      if (mslStatestore.getState(`${options.fullChannelPath}on`).val === true) {
        await mslStatestore.setState({
          dp: 'on',
          val: false,
          params: options,
        });
        await mslStatestore.setState({
          dp: 'off',
          val: true,
          params: options,
        });
        await mslStatestore.setState({
          dp: 'onoff',
          val: false,
          params: options,
        });
      }

      // eslint-disable-next-line no-return-await
      return await this.off(options.mslZoneNumber);
    }

    if (mslStatestore.getState(`${options.fullChannelPath}on`).val === false) {
      await mslStatestore.setState({
        dp: 'on',
        val: true,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'off',
        val: false,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'onoff',
        val: true,
        params: options,
      });

      _on.push(...await this.on(options.mslZoneNumber));
    }

    if (_saturation.val === 0) {
      await mslStatestore.setState({
        dp: 'whiteMode',
        val: true,
        params: options,
      });

      return [
        _on,
        await this.whiteTemperature(options.mslZoneNumber, _whiteTemperature.val),
        await this.brightness(options.mslZoneNumber, _brightness.val),
      ];
    }

    await mslStatestore.setState({
      dp: 'whiteMode',
      val: false,
      params: options,
    });

    const _rgb = tinycolor(mslStatestore.getState(`${options.fullChannelPath}rgb`).val)
      .toRgb(); // eventuell optimieren

    return [
      _on,
      ...await Promise.all(func.call(commandsV6.fullColor, options.mslZoneNumber, _rgb.r, _rgb.g, _rgb.b)),
    ];
  });

  // wrapper fullColor effectMode
  commandsV6.fullColor.constructor.prototype.effectMode = _.wrap(commandsV6.fullColor.effectMode, async function (func, options) {
    if (mslStatestore.getState(`${options.fullChannelPath}effectOn`).val === false) {
      await mslStatestore.setState({
        dp: 'effectOn',
        val: true,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'effectOff',
        val: false,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'effectOnOff',
        val: true,
        params: options,
      });
    }

    return [
      await this.effectOn(options.mslZoneNumber),
      [],
      func(options.mslZoneNumber, options.val),
      [],
      await this.effectBrightness(options.mslZoneNumber, mslStatestore.getState(`${options.fullChannelPath}effectBrightness`).val),
    ];
  });

  // wrapper fullColor effectModeNext
  commandsV6.fullColor.constructor.prototype.effectModeNext = _.wrap(commandsV6.fullColor.effectModeNext, async function (func, options) {
    return [
      func(options.mslZoneNumber),
      await this.effectBrightness(options.mslZoneNumber, mslStatestore.getState(`${options.fullChannelPath}effectBrightness`).val),
    ];
  });

  // wrapper fullColor effectSpeedUp
  commandsV6.fullColor.constructor.prototype.effectSpeedUp = _.wrap(commandsV6.fullColor.effectSpeedUp, async (func, options) => func(options.mslZoneNumber));

  // wrapper fullColor effectSpeedDown
  commandsV6.fullColor.constructor.prototype.effectSpeedDown = _.wrap(commandsV6.fullColor.effectSpeedDown, async (func, options) => func(options.mslZoneNumber));

  // wrapper fullColor link
  commandsV6.fullColor.constructor.prototype.link = _.wrap(commandsV6.fullColor.link, async (func, options) => func(options.mslZoneNumber));

  // wrapper fullColor unlink
  commandsV6.fullColor.constructor.prototype.unlink = _.wrap(commandsV6.fullColor.unlink, async (func, options) => func(options.mslZoneNumber));

  /* --------------------------------------------------------- Additional Function fullColor-------------------------------------------------- */

  // fullColor onoff
  commandsV6.fullColor.constructor.prototype.onoff = async function (options) {
    if (options.val === true) {
      await mslStatestore.setState({
        dp: 'on',
        val: true,
        params: options,
      });

      return this.on(options);
    }
    options.val = true;
    await mslStatestore.setState({
      dp: 'off',
      val: true,
      params: options,
    });

    return this.off(options);
  };

  // fullColor effectBrightness
  commandsV6.fullColor.constructor.prototype.effectBrightness = async function (options, ...argv) {
    if (typeof options !== 'object') {
      return this.brightness(options, argv[0]);
    }

    return this.brightness(options.mslZoneNumber, options.val);
  };

  // fullColor effectOn
  commandsV6.fullColor.constructor.prototype.effectOn = async function (options, ...argv) {
    if (typeof options !== 'object') {
      return this.on(options);
    }

    if (options.val === false) {
      options.val = true;
      await mslStatestore.setState({
        dp: 'effectOff',
        val: true,
        params: options,
      });

      return this.effectOff(options);
    }

    await mslStatestore.setState({
      dp: 'effectOff',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'effectOnOff',
      val: true,
      params: options,
    });

    const _effectMode = mslStatestore.getState(`${options.fullChannelPath}effectMode`);

    options.val = _effectMode.val;

    return this.effectMode(options);
  };

  // fullColor effectOff
  commandsV6.fullColor.constructor.prototype.effectOff = async function (options, ...argv) {
    if (typeof options !== 'object') {
      return this.off(options);
    }

    if (options.val === false) {
      options.val = true;
      await mslStatestore.setState({
        dp: 'effectOn',
        val: true,
        params: options,
      });

      return this.effectOn(options);
    }

    await mslStatestore.setState({
      dp: 'effectOn',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'effectOnOff',
      val: false,
      params: options,
    });

    await mslStatestore.setState({
      dp: 'rgb',
      val: '#000000',
      params: options,
    });

    return [
      ...await this.effectOff(options.mslZoneNumber),
    ];
  };

  // fullColor effectOnOff
  commandsV6.fullColor.constructor.prototype.effectOnOff = async function (options) {
    if (options.val === true) {
      await mslStatestore.setState({
        dp: 'effectOn',
        val: true,
        params: options,
      });

      return this.effectOn(options);
    }
    options.val = true;
    await mslStatestore.setState({
      dp: 'effectOff',
      val: true,
      params: options,
    });

    return this.effectOff(options);
  };

  /* ------------------------------------------------------------- Wrapper fullColor8Zone ------------------------------------------------------------- */

  // wrapper fullColor8Zone on
  commandsV6.fullColor8Zone.constructor.prototype.on = _.wrap(commandsV6.fullColor8Zone.on, async function (func, options) {
    if (typeof options !== 'object') {
      return func(options);
    }

    if (options.val === false) {
      options.val = true;
      await mslStatestore.setState({
        dp: 'off',
        val: true,
        params: options,
      });

      return this.off(options);
    }

    await mslStatestore.setState({
      dp: 'off',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'onoff',
      val: true,
      params: options,
    });

    let _brightness = mslStatestore.getState(`${options.fullChannelPath}brightness`);

    _brightness = (_brightness.val > 0 ? _brightness.val : (_brightness.oldVal > 0
      ? _brightness.oldVal : 100));

    await mslStatestore.setState({
      dp: 'brightness',
      val: _brightness,
      params: options,
    });

    return [
      func(options.mslZoneNumber),
      ...await this.rgb(options),
    ];
  });

  // wrapper fullColor8Zone off
  commandsV6.fullColor8Zone.constructor.prototype.off = _.wrap(commandsV6.fullColor8Zone.off, async function (func, options) {
    if (typeof options !== 'object') {
      return func(options);
    }

    if (options.val === false) {
      options.val = true;
      await mslStatestore.setState({
        dp: 'on',
        val: true,
        params: options,
      });

      return this.on(options);
    }

    await mslStatestore.setState({
      dp: 'on',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'onoff',
      val: false,
      params: options,
    });

    await mslStatestore.setState({
      dp: 'rgb',
      val: '#000000',
      params: options,
    });

    return [
      func(options.mslZoneNumber),
      ...await this.rgb(options),
    ];
  });

  // wrapper fullColor8Zone whiteMode
  commandsV6.fullColor8Zone.constructor.prototype.whiteMode = _.wrap(commandsV6.fullColor8Zone.whiteMode, async function (func, options) {
    if (typeof options !== 'object') {
      return func(options);
    }

    let _brightness = mslStatestore.getState(`${options.fullChannelPath}brightness`);

    _brightness = (_brightness.val > 0 ? _brightness.val : (_brightness.oldVal > 0
      ? _brightness.oldVal : 100));

    await mslStatestore.setState({
      dp: 'brightness',
      val: _brightness,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'saturation',
      val: 0,
      params: options,
    });

    return this.rgb(options);
  });

  // wrapper fullColor8Zone nightMode
  commandsV6.fullColor8Zone.constructor.prototype.nightMode = _.wrap(commandsV6.fullColor8Zone.nightMode, async (func, options) => {
    if (mslStatestore.getState(`${options.fullChannelPath}on`).val === true) {
      await mslStatestore.setState({
        dp: 'on',
        val: false,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'off',
        val: true,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'onoff',
        val: false,
        params: options,
      });
    }

    if (mslStatestore.getState(`${options.fullChannelPath}effectOn`).val === true) {
      await mslStatestore.setState({
        dp: 'effectOn',
        val: false,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'effectOff',
        val: true,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'effectOnOff',
        val: false,
        params: options,
      });
    }

    await mslStatestore.setState({
      dp: 'whiteMode',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'brightness',
      val: 0,
      params: options,
    });

    return func(options.mslZoneNumber);
  });

  // wrapper fullColor8Zone whiteTemperature
  commandsV6.fullColor8Zone.constructor.prototype.whiteTemperature = _.wrap(commandsV6.fullColor8Zone.whiteTemperature, async function (func, options, ...argv) {
    if (typeof options !== 'object') {
      return func(options, kelvinToPercent(argv[0]));
    }

    let _brightness = mslStatestore.getState(`${options.fullChannelPath}brightness`);

    _brightness = (_brightness.val > 0 ? _brightness.val : (_brightness.oldVal > 0
      ? _brightness.oldVal : 100));

    await mslStatestore.setState({
      dp: 'brightness',
      val: _brightness,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'saturation',
      val: 0,
      params: options,
    });

    // await mslStatestore.setState({ dp: 'whiteTemperature', val: options.val, params: options });

    return this.rgb(options);
  });

  // wrapper fullColor8Zone brightness
  commandsV6.fullColor8Zone.constructor.prototype.brightness = _.wrap(commandsV6.fullColor8Zone.brightness, async function (func, options, ...argv) {
    if (typeof options !== 'object') {
      return func(options, _.parseInt(argv[0]));
    }

    return this.rgb(options);
  });

  // wrapper fullColor8Zone saturation
  commandsV6.fullColor8Zone.constructor.prototype.saturation = _.wrap(commandsV6.fullColor8Zone.saturation, async function (func, options, ...argv) {
    if (typeof options !== 'object') {
      return func(options, _.parseInt(argv[0]), argv[1]);
    }

    return this.rgb(options);
  });

  // wrapper fullColor8Zone hue
  commandsV6.fullColor8Zone.constructor.prototype.hue = _.wrap((zone, hue, enableLegacyColorWheel, mslColorOffset) => {
    let cn = Math.min(Math.max(hue, 0x00), 0xFF);
    const zn = Math.min(Math.max(zone, 0x00), 0x08);
    if (enableLegacyColorWheel) {
      // cn = (0xFF - cn) - 0x48;
      cn = (0xFF - cn) - mslColorOffset;
      if (cn < 0x00) {
        cn = 0xFF + cn;
      }
    }
    return [0x31, 0x00, 0x00, 0x0a, 0x01, cn, cn, cn, cn, zn];
  }, async function (func, options, ...argv) {
    if (typeof options !== 'object') {
      const mslColorOffset = +adapter.config.zones.find((zone) => +zone.mslZoneNumber === options).mslColorOffset;
      return func(options, _.parseInt(argv[0]), argv[1], mslColorOffset);
    }

    return this.rgb(options);
  });

  // Wrapper fullColor8Zone rgb
  commandsV6.fullColor8Zone.constructor.prototype.rgb = _.wrap(commandsV6.fullColor8Zone.rgb, async function (func, options) {
    const _saturation = mslStatestore.getState(`${options.fullChannelPath}saturation`);
    const _brightness = mslStatestore.getState(`${options.fullChannelPath}brightness`);

    const _whiteTemperature = mslStatestore.getState(`${options.fullChannelPath}whiteTemperature`);

    const _on = [];

    await mslStatestore.setState({
      dp: 'nightMode',
      val: false,
      params: options,
    });

    if (_brightness.val === 0) {
      await mslStatestore.setState({
        dp: 'whiteMode',
        val: false,
        params: options,
      });

      if (mslStatestore.getState(`${options.fullChannelPath}on`).val === true) {
        await mslStatestore.setState({
          dp: 'on',
          val: false,
          params: options,
        });
        await mslStatestore.setState({
          dp: 'off',
          val: true,
          params: options,
        });
        await mslStatestore.setState({
          dp: 'onoff',
          val: false,
          params: options,
        });
      }

      // eslint-disable-next-line no-return-await
      return await this.off(options.mslZoneNumber);
    }

    if (mslStatestore.getState(`${options.fullChannelPath}on`).val === false) {
      await mslStatestore.setState({
        dp: 'on',
        val: true,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'off',
        val: false,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'onoff',
        val: true,
        params: options,
      });

      _on.push(...await this.on(options.mslZoneNumber));
    }

    if (_saturation.val === 0) {
      await mslStatestore.setState({
        dp: 'whiteMode',
        val: true,
        params: options,
      });

      return [
        _on,
        await this.whiteTemperature(options.mslZoneNumber, _whiteTemperature.val),
        await this.brightness(options.mslZoneNumber, _brightness.val),

      ];
    }

    await mslStatestore.setState({
      dp: 'whiteMode',
      val: false,
      params: options,
    });

    const _rgb = tinycolor(mslStatestore.getState(`${options.fullChannelPath}rgb`).val)
      .toRgb();
    return [
      _on,
      ...await Promise.all(func.call(commandsV6.fullColor8Zone, options.mslZoneNumber, _rgb.r, _rgb.g, _rgb.b)),
    ];
  });

  // wrapper fullColor8Zone effectMode
  commandsV6.fullColor8Zone.constructor.prototype.effectMode = _.wrap(commandsV6.fullColor8Zone.effectMode, async function (func, options) {
    if (mslStatestore.getState(`${options.fullChannelPath}effectOn`).val === false) {
      await mslStatestore.setState({
        dp: 'effectOn',
        val: true,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'effectOff',
        val: false,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'effectOnOff',
        val: true,
        params: options,
      });
    }

    return [
      await this.effectOn(options.mslZoneNumber),
      [],
      func(options.mslZoneNumber, options.val),
      [],
      await this.effectBrightness(options.mslZoneNumber, mslStatestore.getState(`${options.fullChannelPath}effectBrightness`).val),
    ];
  });

  // wrapper fullColor8Zone effectModeNext
  commandsV6.fullColor8Zone.constructor.prototype.effectModeNext = _.wrap(commandsV6.fullColor8Zone.effectModeNext, async function (func, options) {
    return [
      func(options.mslZoneNumber),
      await this.effectBrightness(options.mslZoneNumber, mslStatestore.getState(`${options.fullChannelPath}effectBrightness`).val),
    ];
  });

  // wrapper fullColor8Zone effectSpeedUp
  commandsV6.fullColor8Zone.constructor.prototype.effectSpeedUp = _.wrap(commandsV6.fullColor8Zone.effectSpeedUp, async (func, options) => func(options.mslZoneNumber));

  // wrapper fullColor8Zone effectSpeedDown
  commandsV6.fullColor8Zone.constructor.prototype.effectSpeedDown = _.wrap(commandsV6.fullColor8Zone.effectSpeedDown, async (func, options) => func(options.mslZoneNumber));

  // wrapper fullColor8Zone link
  commandsV6.fullColor8Zone.constructor.prototype.link = _.wrap(commandsV6.fullColor8Zone.link, async (func, options) => func(options.mslZoneNumber));

  // wrapper fullColor8Zone unlink
  commandsV6.fullColor8Zone.constructor.prototype.unlink = _.wrap(commandsV6.fullColor8Zone.unlink, async (func, options) => func(options.mslZoneNumber));

  /* --------------------------------------------------------- Additional Function fullColor8Zone -------------------------------------------------- */

  // fullColor8Zone onoff
  commandsV6.fullColor8Zone.constructor.prototype.onoff = async function (options) {
    if (options.val === true) {
      await mslStatestore.setState({
        dp: 'on',
        val: true,
        params: options,
      });

      return this.on(options);
    }
    options.val = true;
    await mslStatestore.setState({
      dp: 'off',
      val: true,
      params: options,
    });

    return this.off(options);
  };

  // fullColor8Zone effectBrightness
  commandsV6.fullColor8Zone.constructor.prototype.effectBrightness = async function (options, ...argv) {
    if (typeof options !== 'object') {
      return this.brightness(options, argv[0]);
    }

    return this.brightness(options.mslZoneNumber, options.val);
  };

  // fullColor8Zone effectOn
  commandsV6.fullColor8Zone.constructor.prototype.effectOn = async function (options, ...argv) {
    if (typeof options !== 'object') {
      return this.on(options);
    }

    if (options.val === false) {
      options.val = true;
      await mslStatestore.setState({
        dp: 'effectOff',
        val: true,
        params: options,
      });

      return this.effectOff(options);
    }

    await mslStatestore.setState({
      dp: 'effectOff',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'effectOnOff',
      val: true,
      params: options,
    });

    const _effectMode = mslStatestore.getState(`${options.fullChannelPath}effectMode`);

    options.val = _effectMode.val;

    return this.effectMode(options);
  };

  // fullColor8Zone effectOff
  commandsV6.fullColor8Zone.constructor.prototype.effectOff = async function (options, ...argv) {
    if (typeof options !== 'object') {
      return this.off(options);
    }

    if (options.val === false) {
      options.val = true;
      await mslStatestore.setState({
        dp: 'effectOn',
        val: true,
        params: options,
      });

      return this.effectOn(options);
    }

    await mslStatestore.setState({
      dp: 'effectOn',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'effectOnOff',
      val: false,
      params: options,
    });

    await mslStatestore.setState({
      dp: 'rgb',
      val: '#000000',
      params: options,
    });

    return [
      ...await this.effectOff(options.mslZoneNumber),
    ];
  };

  // fullColor8Zone effectOnOff
  commandsV6.fullColor8Zone.constructor.prototype.effectOnOff = async function (options) {
    if (options.val === true) {
      await mslStatestore.setState({
        dp: 'effectOn',
        val: true,
        params: options,
      });

      return this.effectOn(options);
    }
    options.val = true;
    await mslStatestore.setState({
      dp: 'effectOff',
      val: true,
      params: options,
    });

    return this.effectOff(options);
  };

  /* ------------------------------------------------------------- Wrapper white ------------------------------------------------------------- */

  // wrapper white on
  commandsV6.white.constructor.prototype.on = _.wrap(commandsV6.white.on, async function (func, options) {
    if (typeof options !== 'object') {
      return func(options);
    }

    if (options.val === false) {
      options.val = true;
      await mslStatestore.setState({
        dp: 'off',
        val: true,
        params: options,
      });

      return this.off(options);
    }

    await mslStatestore.setState({
      dp: 'off',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'onoff',
      val: true,
      params: options,
    });

    return func(options.mslZoneNumber);
  });

  // wrapper white off
  commandsV6.white.constructor.prototype.off = _.wrap(commandsV6.white.off, async function (func, options) {
    if (typeof options !== 'object') {
      return func(options);
    }

    if (options.val === false) {
      options.val = true;
      await mslStatestore.setState({
        dp: 'on',
        val: true,
        params: options,
      });

      return this.on(options);
    }

    await mslStatestore.setState({
      dp: 'on',
      val: false,
      params: options,
    });
    await mslStatestore.setState({
      dp: 'onoff',
      val: false,
      params: options,
    });

    return func(options.mslZoneNumber);
  });

  // wrapper white brightUp
  commandsV6.white.constructor.prototype.brightUp = _.wrap(commandsV6.white.brightUp, (func, options) => func(options.mslZoneNumber));

  // wrapper white brightDown
  commandsV6.white.constructor.prototype.brightDown = _.wrap(commandsV6.white.brightDown, async (func, options) => func(options.mslZoneNumber));

  // wrapper white maxBright
  commandsV6.white.constructor.prototype.maxBright = _.wrap(commandsV6.white.maxBright, async (func, options) => {
    if (mslStatestore.getState(`${options.fullChannelPath}off`).val === true) {
      await mslStatestore.setState({
        dp: 'on',
        val: true,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'off',
        val: false,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'onoff',
        val: true,
        params: options,
      });
    }

    return func(options.mslZoneNumber);
  });

  // wrapper white nightMode
  commandsV6.white.constructor.prototype.nightMode = _.wrap(commandsV6.white.nightMode, async (func, options) => {
    if (mslStatestore.getState(`${options.fullChannelPath}on`).val === true) {
      await mslStatestore.setState({
        dp: 'on',
        val: false,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'off',
        val: true,
        params: options,
      });
      await mslStatestore.setState({
        dp: 'onoff',
        val: false,
        params: options,
      });
    }

    return func(options.mslZoneNumber);
  });

  // wrapper white warmer
  commandsV6.white.constructor.prototype.warmer = _.wrap(commandsV6.white.warmer, async (func, options) => func(options.mslZoneNumber));

  // wrapper white cooler
  commandsV6.white.constructor.prototype.cooler = _.wrap(commandsV6.white.cooler, async (func, options) => func(options.mslZoneNumber));

  // wrapper white link
  commandsV6.white.constructor.prototype.link = _.wrap(commandsV6.white.link, async (func, options) => func(options.mslZoneNumber));

  // wrapper white unlink
  commandsV6.white.constructor.prototype.unlink = _.wrap(commandsV6.white.unlink, async (func, options) => func(options.mslZoneNumber));

  /* --------------------------------------------------------- Additional Function white -------------------------------------------------- */

  // white onoff
  commandsV6.white.constructor.prototype.onoff = async function (options) {
    if (options.val === true) {
      await mslStatestore.setState({
        dp: 'on',
        val: true,
        params: options,
      });

      return this.on(options);
    }
    options.val = true;
    await mslStatestore.setState({
      dp: 'off',
      val: true,
      params: options,
    });

    return this.off(options);
  };
  /* --------------------------------------------------------------------------------------------------------------------------------------- */

  return commandsV6;
}

module.exports = mslcommandsV6;
