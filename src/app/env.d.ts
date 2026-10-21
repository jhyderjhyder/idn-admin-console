interface Env{
    readonly NG_APP_TENANT_NAME: string;
    readonly NG_APP_CLIENT_ID:string;
    readonly NG_APP_CLIENT_SECRET:string;
    readonly NG_APP_ENV:string;
}
interface ImportMeta{
    readonly env:Env;
}