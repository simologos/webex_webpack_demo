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
    access_token: ''
  }
};

// Create the calling configuration

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
