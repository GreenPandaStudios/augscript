// aug-spec: "views.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Small server components keep each page's behavior and dependencies visible. */
Page(string title, List<Html> children) returns Html:
    return <html lang="en">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>{title} — August</title>
        </head>
        <body style="margin:0;background:#f3f5f9;color:#17233a;font:17px system-ui,sans-serif;line-height:1.6">
            <main style="max-width:640px;margin:48px auto;padding:28px;background:white;border-radius:20px;box-shadow:0 12px 48px #17233a12">
                <nav><a href="/" style="color:#4852d7;font-weight:750;text-decoration:none">August · OpenID Connect</a></nav>
                <h1>{title}</h1>
                {children}
            </main>
        </body>
    </html>
