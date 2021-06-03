// ラズパイのためのプラグイン
const rpio = require('rpio')
const PluginRaspi = {
  '初期化': {
    type: 'func',
    josi: [],
    pure: true,
    fn: function (sys) {
      sys.__gpio = []
      for (let i = 1; i <= 40; i++) {
        sys.__gpio[i] = false
      }
    }
  },
  '!クリア': {
    type: 'func',
    josi: [],
    fn: function (sys) {
      // GPIOを閉じる
      for (let i = 1; i < sys.__gpio.length; i++) {
        if (sys.__gpio[i]) {
          rpio.close(i)
        }
      }
    }
  },
  // @ラズパイ
  'RASPIバージョン': { type: 'const', value: '0.1'}, // @RASPIばーじょん
  'LOW': { type: 'const', value: rpio.LOW }, // @LOW 
  'HIGH': { type: 'const', value: rpio.HIGH }, // @HIGH
  'IN': { type: 'const', value: rpio.INPUT }, // @IN 
  'OUT': { type: 'const', value: rpio.OUTPUT }, // @OUT
  '入力モード': { type: 'const', value: rpio.INPUT }, // @にゅうりょくもーど 
  '出力モード': { type: 'const', value: rpio.OUTPUT }, // @しゅつりょくもーど
  'PWMモード': { type: 'const', value: rpio.PWM }, // @PWMもーど
  'プルアップ': { type: 'const', value: rpio.PULL_UP }, // @ぷるあっぷ 
  'プルダウン': { type: 'const', value: rpio.PULL_DOWN }, // @ぷるだうん
  '眠': { // @sec秒処理を停止する // @ねむる
    type: 'func',
    josi: [['だけ']],
    pure: true,
    fn: function (sec, sys) {
      rpio.sleep(sec)
    },
    return_none: true
  },
  'GPIO開': { // @GPIOのピン番号NOをMODE(入力モード/出力モード)で開く。MODEを配列で[モード,初期値]で指定も可能。 // @GPIOひらく
    type: 'func',
    josi: [['を'],['で','にて']],
    pure: true,
    fn: function (no, mode, sys) {
      if (mode instanceof Array) {
        if (mode.length >= 2) {
          rpio.open(no, mode[0], mode[1])
        } else {
          rpio.open(no, mode[0])
        }
      } else {
        rpio.open(no, mode)
      }
      sys.__gpio[no] = true
    },
    return_none: true
  },
  'GPIO閉': { // @GPIOのピン番号NOを閉じる // @GPIOとじる
    type: 'func',
    josi: [['を', 'の']],
    pure: true,
    fn: function (no, sys) {
      rpio.close(no)
      sys.__gpio[no] = false
    },
    return_none: true
  },
  'GPIO設定': { // @GPIOのピン番号NOをV(LOW/HIGH/オン/オフ)に設定する // @GPIOせってい
    type: 'func',
    josi: [['を'],['に','へ']],
    pure: true,
    fn: function (no, value, sys) {
      rpio.write(no, value)
    },
    return_none: true
  },
  'GPIO読': { // @GPIOのピン番号NOの値を読む // @GPIOよむ
    type: 'func',
    josi: [['を']],
    pure: true,
    fn: function (no, sys) {
      if (!sys.__gpio[n]) {
        throw new Error('『GPIO開』を先に使ってください')
      }
      return rpio.read(no)
    }
  },
  'GPIOバイナリ読': { // @GPIOのピン番号NOの値をNバイト読んでBufferを返す // @GPIOばいなりよむ
    type: 'func',
    josi: [['を'],['だけ']],
    pure: true,
    fn: function (no, n, sys) {
      if (!sys.__gpio[n]) {
        throw new Error('『GPIO開』を先に使ってください')
      }
      const buf = new Buffer(n)
      rpio.readbuf(no, buf)
      return buf
    }
  },
  'GPIOバイナリ書': { // @GPIOのピン番号NOの値へバッファBUFを書き込む // @GPIOばいなりかく
    type: 'func',
    josi: [['へ','に'],['を']],
    pure: true,
    fn: function (no, buf, sys) {
      if (!sys.__gpio[n]) {
        throw new Error('『GPIO開』を先に使ってください')
      }
      rpio.writebuf(no, buf)
    },
    return_none: true
  },
  'GPIO変化時': { // @GPIOのピン番号NOの値が変化した時にFUNCを実行。その時「対象」に代入される。 // @GPIOへんかしたとき
    type: 'func',
    josi: [['を'],['の','が']],
    pure: true,
    fn: function (func, no, sys) {
      if (!sys.__gpio[no]) {
        throw new Error('最初に『NOを[入力モード,プルアップ]でGPIO開』と記述してください。')
      }
      if (typeof(func) === 'string') {
        func = sys.__findVar(func, null)
        if (!func){ throw new Error('イベントが追加できません。関数が見当たりません>    。') }
      }
      rpio.poll(no, function(pin) {
        sys.__v0['対象'] = rpio.read(pin)
        func(sys)
      })
    },
    return_none: true
  },
  'PWM分割数設定': { // @PWMの分割数(clock divider)を設定 // @PWMぶんかつすうせってい
    type: 'func',
    josi: [['へ','に']],
    pure: true,
    fn: function (v, sys) {
      rpio.pwmSetClockDivider(v)
    },
    return_none: true
  },
  'PWM範囲設定': { // @GPIOピンNOのPWMの範囲をVに設定 // @PWMはんいせってい
    type: 'func',
    josi: [['を'],['へ','に']],
    pure: true,
    fn: function (no, v, sys) {
      rpio.pwmSetRange(no, v)
    },
    return_none: true
  },
  'PWM値設定': { // @GPIOピンNOのPWMのデータをVに設定 // @PWMあたいせってい
    type: 'func',
    josi: [['へ','に'],['を']],
    pure: true,
    fn: function (no, v, sys) {
      rpio.pwmSetData(no, v)
    }
  },
  'DHT11取得': { // @GPIOピンNOにつなげた温度湿度センサーDHT11から値を読み{"温度":xxx,"湿度":xxx}で返す // @DHT11しゅとく
    type: 'func',
    josi: [['から','の']],
    pure: true,
    fn: function (no, sys) {
      const dht11 = require(__dirname + '/dht11.js')
      return dht11(no)
    }
  }
}

module.exports = PluginRaspi

