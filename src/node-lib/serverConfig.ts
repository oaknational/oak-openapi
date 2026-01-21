const isBrowser = typeof window !== 'undefined';

type EnvValue = string | number;
// Config values can be the result of a logic test on an env value,
// e.g. `process.env.MY_ENV_SWITCH === "on"`
type ConfigValue = EnvValue | boolean;
type DefaultValue = string | number | boolean | null;

interface EnvVar {
  value: ConfigValue | undefined;
  required: boolean;
  availableInBrowser: boolean;
  default: DefaultValue;
  // useful for messaging in case if missing vars
  envName: string;
  description?: string;
  allowedValues?: EnvValue[] | boolean[];
}

const parseValue = <T extends ConfigValue>(
  value: T | undefined,
): T | undefined => {
  if (value === 'undefined') {
    return undefined;
  }

  return value;
};

/**
 * Ensure the object u passed satisfies T, but
 * return the inferred type of U.
 *
 * Provides an alternative to envVars: Record<string, EnvVar> = {...}
 * which would make the return type too loose (the record), and break
 * the keyof check for ConfigKey
 */
const satisfies =
  <T>() =>
  <U extends T>(u: U) =>
    u;

type ConfigKey = keyof typeof envVars;

const envVars = satisfies<Record<string, EnvVar>>()({
  sanityProjectId: {
    value: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    envName: 'NEXT_PUBLIC_SANITY_PROJECT_ID',
    required: true,
    availableInBrowser: true,
    default: null,
  },
  sanityDataset: {
    value: process.env.NEXT_PUBLIC_SANITY_DATASET,
    envName: 'NEXT_PUBLIC_SANITY_DATASET',
    required: true,
    availableInBrowser: true,
    default: null,
  },

  sanityGraphqlApiSecret: {
    value: process.env.SANITY_AUTH_SECRET,
    envName: 'SANITY_AUTH_SECRET',
    required: true,
    availableInBrowser: false,
    default: null,
  },
});

for (const [, envVarConfig] of Object.entries(envVars)) {
  const {
    value: envValue,
    required,
    default: defaultValue,
    envName,
  } = envVarConfig;

  // These secrets shouldn't be making it to the browser, so existence
  // checks will fail.
  if (!isBrowser) {
    const shouldBePresent = required;
    const isPresent = Boolean(envValue || defaultValue);

    /**
     * @TODO we decide which var is required, etc, and set defaults and validations
     */
    if (shouldBePresent && !isPresent) {
      throw new Error(`- - - WARNING (getServerConfig): No config value found for required env var:
      - - - ${envName}`);
    }
  }
}

// We can safely assert it's non-nullable as our
// guard loop above will throw
type NonNullEnvValue<K extends ConfigKey> = NonNullable<
  (typeof envVars)[K]['value']
>;

const getServerConfig = <K extends ConfigKey>(key: K): NonNullEnvValue<K> => {
  const {
    value,
    default: defaultValue,
    envName,
    required,
  } = envVars[key] || {};

  // Without parsing, undefined gets stringified as "undefined"
  const parsedValue = parseValue(value);

  // Allow falsy values to be passed, but not `undefined`, don't allow empty strings on required values.
  if (parsedValue !== undefined && !(required && parsedValue === '')) {
    return parsedValue;
  }

  // Allow falsy values to be set, but not `undefined` or `null` (which indicates a deliberate lack of default)
  if (defaultValue !== undefined && defaultValue !== null) {
    return defaultValue;
  }

  if (!isBrowser) {
    throw new Error(
      `getServerConfig('${key}') failed because there is no env value ${envName}`,
    );
  }
  return '';
};

export default getServerConfig;
