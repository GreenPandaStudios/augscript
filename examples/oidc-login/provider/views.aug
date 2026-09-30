// aug-spec: "views.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Page from common
/** A server form with a checked HTTP action. The browser submits to the provider endpoint. */
ProviderLogin(string requestId, string csrf, string message, HttpAction submit) returns Html:
    return <Page title="Sign in with the August provider">
        <p>{message}</p>
        <p style="background:#f3f5f9;padding:12px;border-radius:8px">Demo account: <strong>ada</strong> · password <strong>august-demo</strong></p>
        <form method="post" action="/provider/login" onSubmit={submit}>
            <input type="hidden" name="request_id" value={requestId} />
            <input type="hidden" name="csrf" value={csrf} />
            <p><label for="username">Username</label><br /><input id="username" name="username" autocomplete="username" value="ada" maxlength="64" required style="padding:10px;width:90%" /></p>
            <p><label for="password">Password</label><br /><input id="password" type="password" name="password" autocomplete="current-password" maxlength="256" required style="padding:10px;width:90%" /></p>
            <button type="submit" style="padding:12px 20px;border:0;border-radius:9px;background:#4852d7;color:white;font:inherit">Sign in and return to the app</button>
        </form>
        <p style="font-size:14px;color:#677189">The provider and app run in the same executable. Authorization codes still travel through the OpenID Connect protocol.</p>
    </Page>

ProviderFailure(string message) returns Html:
    return <Page title="Sign-in could not continue"><p>{message}</p><a href="/login/start">Start a new sign-in</a></Page>
