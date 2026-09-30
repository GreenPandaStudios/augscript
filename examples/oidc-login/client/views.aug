// aug-spec: "views.aug.md" explains this file. Read it before changes; refresh with aug spec.
import SessionClaims from contracts
import Page from common
import logout from logout

LoginPage() returns Html:
    return <Page title="Sign in">
        <p>This August app is both an OpenID Connect provider and a login client.</p>
        <p><a href="/login/start" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#4852d7;color:white;text-decoration:none">Sign in with OpenID Connect</a></p>
        <p>The server uses authorization codes, S256 PKCE, state and nonce validation. Your session is a separate signed JWT in an HttpOnly cookie.</p>
    </Page>

Welcome(SessionClaims session) returns Html unless HttpError:
    return <Page title={"Welcome, " + session.name}>
        <p>You are signed in as <strong>{session.name}</strong>.</p>
        <p>Subject: <code>{session.sub}</code></p>
        <p><a href="/me">View the protected JSON endpoint</a></p>
        <form method="post" action="/logout" onSubmit={handle logout(input from form)}>
            <input type="hidden" name="csrf" value={session.csrf} />
            <button type="submit" style="padding:10px 18px;border-radius:10px;border:0;background:#17233a;color:white;font:inherit">Sign out</button>
        </form>
    </Page>
