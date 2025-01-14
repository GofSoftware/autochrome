import { IConnectorSettings } from '@autochrome/core/settings/i-connector-settings';

export interface IRobotSettingsGlobal extends IConnectorSettings {
    autoPlay: boolean;
}
