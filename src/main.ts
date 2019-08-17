import * as crypto from "crypto";
import * as WebSocket from "@hoobs/ws-connect";

import { PluginConfig } from "./interfaces";
import { Log } from "./logger";
import { Hap } from "./hap";

export class Plugin {
    public log: Log;
    public config;
    public homebridgeConfig;
    public hap: Hap;

    constructor(log, config: PluginConfig, homebridgeConfig) {
        this.log = new Log(log, config.debug);
        this.config = config;
        this.homebridgeConfig = homebridgeConfig;

        const deviceId = crypto.createHash("sha256")
            .update(this.homebridgeConfig.bridge.username)
            .digest("hex");

        const socket = new WebSocket(`wss://homebridge-gsh.iot.oz.nu/socket?token=${config.token}&deviceId=${deviceId}`);

        this.hap = new Hap(socket, this.log, this.homebridgeConfig.bridge.pin, this.config);

        socket.on("websocket-status", (status) => {
            this.log.info(status);
        });

        socket.on("json", async (req) => {
            const res = (response) => {
                socket.sendJson({
                    type: "response",
                    requestId: req.requestId,
                    body: response,
                });
            };

            if (!this.hap.ready) {
                this.log.info("Devices Not Ready");

                return res(this.deviceNotReady(req.body, req.headers));
            }

            for (const input of req.body.inputs) {
                input.requestId = req.body.requestId;

                switch (input.intent) {
                    case "action.devices.SYNC":
                        setTimeout(() => {
                            this.log.debug("Sending full post-sync state report");
                            this.hap.sendFullStateReport();
                        }, 10000);

                        return res(await this.onSync(req.body, req.headers));

                    case "action.devices.QUERY":
                        return res(await this.onQuery(req.body, req.headers));

                    case "action.devices.EXECUTE":
                        return res(await this.onExecute(req.body, req.headers));

                    case "action.devices.DISCONNECT":
                        return res(await this.onDisconnect(req.body, req.headers));

                    default:
                        this.log.error(`ERROR - Unknown Intent: ${input.intent}`);
                        break;
                }
            }
        });
    }

    async onSync(body, headers) {
        this.log.info("Received SYNC intent");
        this.log.debug(JSON.stringify(body, null, 2));

        const devices = await this.hap.buildSyncResponse() as undefined;

        this.log.debug(devices);

        return {
            requestId: body.requestId,
            payload: {
                agentUserId: null,
                devices,
            },
        };
    }

    async onQuery(body, headers) {
        this.log.info("Received QUERY intent");
        this.log.debug(JSON.stringify(body, null, 2));

        const devices = await this.hap.query(body.inputs[0].payload.devices);

        this.log.debug(devices);

        return {
            requestId: body.requestId,
            payload: {
                devices,
            },
        };
    }

    async onExecute(body, headers) {
        this.log.info("Received EXECUTE intent");
        this.log.debug(JSON.stringify(body, null, 2));

        const commands = await this.hap.execute(body.inputs[0].payload.commands) as undefined;

        this.log.debug(commands);

        return {
            requestId: body.requestId,
            payload: {
                commands,
            },
        };
    }

    async onDisconnect(body, headers) {
        this.log.info("Received DISCONNECT intent");
        this.log.debug(JSON.stringify(body, null, 2));

        return {
            requestId: body.requestId,
            payload: {},
        };
    }

    deviceNotReady(body, headers) {
        return {
            requestId: body.requestId,
            payload: {
                errorCode: "deviceNotReady",
                status: "ERROR",
            },
        };
    }
}
