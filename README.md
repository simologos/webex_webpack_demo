## Option 1

### Test code

Option 2 from doc, via package manager:

```javascript
import Calling from 'webex/calling';

// Create the Webex configuration

const webexConfig = {
    config: {
      logger: {
        level: 'debug' // Set the desired log level
      },
      meetings: {
        reconnection: {
          enabled: true
        },
        enableRtx: true
      },
      encryption: {
        kmsInitialTimeout: 8000,
        kmsMaxTimeout: 40000,
        batcherMaxCalls: 30,
        caroots: null
      },
      dss: {}
    },
    credentials: {
      access_token: '<access token>'
    }
  };
  
  // Create the calling configuration
  
  const callingConfig = {
    clientConfig: {
      calling: true,
      contact: true,
      callHistory: true,
      callSettings: true,
      voicemail: true
    },
    callingClientConfig: {
      logger: {
        level: 'info'
      }
    },
    logger: {
      level: 'info'
    }
  };
  
  // Create the Calling object
  
  const calling = await Calling.init({ webexConfig, callingConfig });
  let callingClient;
  calling.on('ready', () => {
    calling.register().then(() => {
      callingClient = calling.callingClient;
    });
  });
```

### Modules installed

```
"devDependencies": {
    "@babel/polyfill": "^7.12.1",
    "@babel/preset-env": "^7.22.4",
    "@babel/runtime-corejs2": "^7.22.2",
    "html-webpack-plugin": "^5.6.3",
    "node-polyfill-webpack-plugin": "^3.0.0",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^5.2.0"
  },
  "dependencies": {
    "webex": "^3.7.0"
  }
```

### Bundle Size

```
WARNING in asset size limit: The following asset(s) exceed the recommended size limit (244 KiB).
This can impact web performance.
Assets: 
  index.js (4.18 MiB)
```

## Option 2

### Test code

```javascript
import { init } from 'webex';
import { createClient } from '@webex/calling';

const webex = init({
  credentials: {
    access_token: ``
  }
});

webex.once('ready', async () => {
  const callingClientConfig = {
    logger: {
      level: 'info'
    }
  };

  const callingClient = await createClient(webex, callingClientConfig);

  console.log(callingClient);
});

```
-> This failed to initialize

### Modules installed
```
"devDependencies": {
    "@babel/polyfill": "^7.12.1",
    "@babel/preset-env": "^7.22.4",
    "@babel/runtime-corejs2": "^7.22.2",
    "html-webpack-plugin": "^5.6.3",
    "node-polyfill-webpack-plugin": "^3.0.0",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^5.2.0"
  },
  "dependencies": {
    "webex": "^3.7.0"
    "@webex/calling": "^3.7.0"
  }
```

### Bundle Size

```
WARNING in asset size limit: The following asset(s) exceed the recommended size limit (244 KiB).
This can impact web performance.
Assets: 
  index.js (5.66 MiB)
```

## Option 3
Directly use the UMD bundle.

### Webpack Config

```javascript
const path = require('path');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const { CycloneDxWebpackPlugin } = require('@cyclonedx/webpack-plugin');

const cycloneDxWebpackPluginOptions = {
    specVersion: '1.4',
    reproducibleResults: true
}

module.exports = {
    entry: './src/index.js',
    mode: 'production',
    optimization: {
        usedExports: true,
        sideEffects: true,
        minimize: true
    },
    output: {
        filename: 'index.min.js',
        path: path.resolve(__dirname, 'dist')
    },
    // Exclude the Webex SDK from the bundle
    externals: {
        'webex': 'Webex',        
    },
    plugins: [
        new NodePolyfillPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            title: 'Webex WebRTC App',
            meta: {
                viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no'
            }
        }),
        // And copy the UMD build into the dist folder:
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'node_modules/webex/umd/calling.min.js',
                    to: 'calling.min.js'
                },
                {
                    from: 'node_modules/webex/umd/calling.min.js.map',
                    to: 'calling.min.js.map',
                    noErrorOnMissing: true
                }
            ],
        }),
        // And reference the calling bundle in the index.html file.
        new HtmlWebpackTagsPlugin({
            scripts: ['calling.min.js'],
            append: false // This adds the script before the bundle
        }),
        new CycloneDxWebpackPlugin(cycloneDxWebpackPluginOptions)
    ],
    resolve: {
        ...
    }
};
```

### Test code

Same as Option 1.

### Problem
Since the Webex SDK does not get bundled, it does not appear in the SBOM.

## Option 4

Try to optimize the webpack output.

-> ran exhaustive tests, but no less than 4.17MB was achieved (0.04 MB).

## Option 5
Use different bundlers:
- Rollup -> 4.595 MB

## Option 6

Use the `@webex/calling` package, which requires a custom initializer (e.g what `webex/calling` without the `@` does).

### Test code

```javascript
import * as WebexCalling from '@webex/calling';
import WebexCore, { MemoryStoreAdapter } from '@webex/webex-core';
import '@webex/internal-plugin-device';
import '@webex/internal-plugin-mercury';
import '@webex/internal-plugin-encryption';

// Create the Webex configuration

const webexConfig = {
  config: {
    logger: {
      level: 'debug' // Set the desired log level
    },
    meetings: {
      reconnection: {
        enabled: true
      },
      enableRtx: true
    },
    encryption: {
      kmsInitialTimeout: 8000,
      kmsMaxTimeout: 40000,
      batcherMaxCalls: 30,
      caroots: null
    },
    dss: {}
  },
  credentials: {
    access_token: '<accesstoken>'
  }
};

// Create the calling configuration

const callingConfig = {
  clientConfig: {
    calling: true,
    contact: true,
    callHistory: true,
    callSettings: true,
    voicemail: true
  },
  callingClientConfig: {
    logger: {
      level: 'info'
    }
  },
  logger: {
    level: 'info'
  }
};

const Webex = WebexCore.extend({
  webex: true,
});

let log = WebexCalling.Logger;
log.setLogger(callingConfig.logger.level, 'Calling');

webexConfig.config = Object.assign({}, {
  hydra: 'https://api.ciscospark.com/v1',
  hydraServiceUrl: 'https://api.ciscospark.com/v1',
  credentials: {
    clientType: 'confidential',
  },
  device: {
    validateDomains: true,
    ephemeral: true,
  },
  storage: {
    boundedAdapter: MemoryStoreAdapter,
    unboundedAdapter: MemoryStoreAdapter,
  },
}, webexConfig.config);

const webex = new Webex(webexConfig);

let registered = false;
let callingClient = undefined;
let contactClient = undefined;
let callHistoryClient = undefined;
let voicemailClient = undefined;
let callSettingsClient = undefined;

const initializeClients = async () => {
  const { clientConfig, callingClientConfig, logger } = callingConfig;

  callingClient = clientConfig.calling
    ? await WebexCalling.createClient(webex, callingClientConfig)
    : undefined;

  contactClient = clientConfig.contact
    ? WebexCalling.createContactsClient(webex, logger)
    : undefined;

  callHistoryClient = clientConfig.callHistory
    ? WebexCalling.createCallHistoryClient(webex, logger)
    : undefined;

  voicemailClient = clientConfig.voicemail
    ? WebexCalling.createVoicemailClient(webex, logger)
    : undefined;

  callSettingsClient = clientConfig.callSettings
    ? WebexCalling.createCallSettingsClient(webex, logger)
    : undefined;
}

const register = () => {
  return webex.internal.device
    .register()
    .then(() => {
      console.log('Authentication: webex.internal.device.register successful');

      return webex.internal.mercury
        .connect()
        .then(async () => {
          console.log('Authentication: webex.internal.mercury.connect successful');
          registered = true;

          try {
            await initializeClients();
          } catch (error) {
            console.log(`Error occurred while initializing clients ${error}`);
          }
        })
        .catch((error) => {
          console.log(`Error occurred during mercury.connect() ${error}`);
        });
    })
    .catch((error) => {
      console.log(`Error occurred during device.register() ${error}`);
    });
}

const deregister = async () => {
  if (!registered) {
    console.log('Authentication: webex.internal.device.deregister already done');
    return Promise.resolve();
  }

  const lines = Object.values(this.callingClient?.getLines());

  for (const line of lines) {
    if (line.getStatus() === 'active') {
      line.deregister();
    }
  }

  return (
    // @ts-ignore
    this.webex.internal.mercury
      .disconnect()
      .then(() => {
        console.log('Authentication: webex.internal.mercury.disconnect successful');

        // @ts-ignore
        return webex.internal.device.unregister();
      })
      .then(() => {
        console.log('Authentication: webex.internal.device.deregister successful');
        registered = false;
      })
      .catch((error) => {
        console.warn(
          `Error occurred during mercury.disconnect() or device.deregister() ${error}`);
      })
  );
}

const createMicrophoneStream = () => {
  // TODO
  return WebexCalling.createMicrophoneStream;
}

const createNoiseReductionEffect = (options) => {
  return new WebexCalling.NoiseReductionEffect(options);
}

webex.once('ready', () => {
  console.log('Webex is ready');
  log = webex.logger;

  register().then(() => {
    console.log('successfully registered!');
  });
});

```

### Modules installed

```
"devDependencies": {
    "@cyclonedx/webpack-plugin": "^4.0.1",
    "html-webpack-plugin": "^5.6.3",
    "node-polyfill-webpack-plugin": "^3.0.0",
    "webpack": "^5.89.0",
    "webpack-bundle-analyzer": "^4.10.2",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^5.2.0"
  },
  "dependencies": {
    "@webex/calling": "^3.7.0",
    "@webex/internal-plugin-device": "^3.7.0",
    "@webex/internal-plugin-encryption": "^3.7.0",
    "@webex/internal-plugin-mercury": "^3.7.0",
    "@webex/internal-plugin-metrics": "^3.7.0",
    "@webex/internal-plugin-support": "^3.7.0",
    "@webex/plugin-logger": "^3.7.0",
    "@webex/webex-core": "^3.7.0"
  }
```

### Bundle Size
With `webpack.config.option4.js`:
```
WARNING in entrypoint size limit: The following entrypoint(s) combined asset size exceeds the recommended limit (244 KiB). This can impact web performance.
Entrypoints:
  main (4.13 MiB)
      index.min.js
```

GZIP: 1MB