//@ts-ignore
import packageInfo from '../../package.json';

export const environment = {
  production: false,
  environmentName: 'DEV',
  VERSION: packageInfo.version,
};
