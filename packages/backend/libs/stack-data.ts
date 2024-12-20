// eslint-disable-next-line @typescript-eslint/naming-convention
export enum ENV_KEYS {
  dev = 'dev',
  stg = 'stg',
  uat = 'uat',
  sdlc = 'sdlc',
  prd = 'prd'
}

export const ENVS_TARGET = {
  [ENV_KEYS.dev]: 'dev',
  [ENV_KEYS.stg]: 'stg',
  [ENV_KEYS.uat]: 'uat',
  [ENV_KEYS.sdlc]: 'sdlc',
  [ENV_KEYS.prd]: 'prd'
}
