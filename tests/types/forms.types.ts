import type {
  CacheUpdate,
  FormConfig,
  FormSaveState,
  SaveResult,
} from "../../src/forms/orchestration/types";

type Equal<Actual, Expected> =
  (<T>() => T extends Actual ? 1 : 2) extends <T>() => T extends Expected ? 1 : 2 ? true : false;

type Expect<T extends true> = T;

type IsRequired<T, Key extends keyof T> = {} extends Pick<T, Key> ? false : true;

type ProfileValues = {
  displayName: string;
};

type ProfilePayload = {
  name: string;
};

type ProfileResponse = {
  id: string;
  name: string;
};

type ProfileMutation = (payload: ProfilePayload) => Promise<ProfileResponse>;

type ProfileConfig = FormConfig<"profile", ProfileValues, ProfileMutation>;

type PayloadMapperIsRequired = Expect<Equal<IsRequired<ProfileConfig, "toMutationPayload">, true>>;

const profileConfig = {
  id: "profile",
  snapshot: () => {
    return { displayName: "" };
  },
  validate: (values) => {
    const _displayName: string = values.displayName;
    return _displayName.length > 0 ? { valid: true } : { valid: false, error: "required" };
  },
  toMutationPayload: (values) => {
    const _displayName: string = values.displayName;
    return { name: _displayName };
  },
  onSuccess: ({ response, variables, results, formValues }) => {
    const _responseId: string = response.id;
    const _payloadName: string = variables.name;
    const _displayName: string = formValues.displayName;
    const _results: Record<string, never> = results;
    void [_responseId, _payloadName, _displayName, _results];
  },
  endpoint: {
    mutationFn: async (payload: ProfilePayload) => {
      return { id: "profile-id", name: payload.name };
    },
  },
} satisfies ProfileConfig;

void profileConfig;

// Values that already satisfy the endpoint input do not need a mapper.
type DirectMutation = (values: ProfileValues) => Promise<ProfileResponse>;
type DirectConfig = FormConfig<"profile", ProfileValues, DirectMutation>;

const directConfig = {
  id: "profile",
  snapshot: () => {
    return { displayName: "" };
  },
  validate: () => {
    return { valid: true };
  },
  endpoint: {
    mutationFn: async (values: ProfileValues) => {
      return { id: "profile-id", name: values.displayName };
    },
  },
} satisfies DirectConfig;

void directConfig;

const dependency = {
  id: "account",
  snapshot: () => {
    return { accountId: "account-id" };
  },
  validate: () => {
    return { valid: true as const };
  },
  endpoint: {
    mutationFn: async () => {
      return { accountId: "account-id" as string };
    },
  },
  form: { reset: () => {} },
} as const;

const dependentConfig = {
  id: "profile",
  snapshot: () => {
    return { displayName: "" };
  },
  validate: () => {
    return { valid: true as const };
  },
  toMutationPayload: (_values, { results }) => {
    const accountId: string | undefined = results.account?.accountId;
    return { accountId, name: "display name" };
  },
  dependencies: [dependency] as const,
  endpoint: {
    mutationFn: async (payload: { accountId: string | undefined; name: string }) => {
      return { profileId: "profile-id", accountId: payload.accountId };
    },
  },
} satisfies FormConfig<
  "profile",
  ProfileValues,
  (payload: { accountId: string | undefined; name: string }) => Promise<{
    profileId: string;
    accountId: string | undefined;
  }>,
  readonly [typeof dependency]
>;

void dependentConfig;

type DependentCacheUpdate = CacheUpdate<
  ProfileResponse,
  ProfilePayload,
  { account?: { accountId: string } }
>;

const cacheUpdate: DependentCacheUpdate = {
  queryKey: ({ response, variables, results }) => {
    const _id: string = response.id;
    const _name: string = variables.name;
    const _accountId: string | undefined = results.account?.accountId;
    void [_id, _name, _accountId];
    return ["profile", response.id];
  },
  update: (previous, { response }) => {
    const _previous: unknown = previous;
    const _id: string = response.id;
    void [_previous, _id];
    return response;
  },
};

void cacheUpdate;

type ProfileState = FormSaveState<ProfileValues, ProfilePayload, ProfileResponse>;
type StateResponseIsTyped = Expect<Equal<NonNullable<ProfileState["response"]>, ProfileResponse>>;

type ProfileForm = {
  id: "profile";
  snapshot: () => ProfileValues;
  validate: () => { valid: true };
  endpoint: { mutationFn: ProfileMutation };
  form: { reset: () => void };
};

type ProfileResult = SaveResult<readonly [ProfileForm]>;
type ResultResponseIsKeyed = Expect<
  Equal<NonNullable<ProfileResult["responses"]["profile"]>, ProfileResponse>
>;

void (null as unknown as [PayloadMapperIsRequired, StateResponseIsTyped, ResultResponseIsKeyed]);

// @ts-expect-error A values/payload mismatch must require an explicit mapper.
const missingPayloadMapper: ProfileConfig = {
  id: "profile",
  snapshot: () => {
    return { displayName: "" };
  },
  validate: () => {
    return { valid: true };
  },
  endpoint: {
    mutationFn: async (_payload: ProfilePayload) => {
      return { id: "profile-id", name: "name" };
    },
  },
};

void missingPayloadMapper;
