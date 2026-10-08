---
title: "provider/views.aug diagrams"
generated: true
source: "examples/oidc-login/provider/views.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# provider/views.aug diagrams

[OpenID Connect login application](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](views.md)


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### ProviderLogin {#sequence-ProviderLogin}

::: spec-paragraph specification-paragraph-1
[Source](views.md#source-L4)
:::

A server form with a checked HTTP action. The browser submits to the provider endpoint.

It takes `requestId`, `csrf`, and `message` as strings and `submit` as `HttpAction`.

```mermaid
sequenceDiagram
    participant p0 as ProviderLogin
    participant p1 as common/views
    p0->>p1: Page(title=”Sign in with the August provider”,<br/>children=‹Page title=”Sign in with the August provider”›<br/>‹p›｛message｝‹/p› ‹p<br/>style=”background:＃f3f5f9；padding:12px；border-radius:8px”›Demo<br/>account: ‹strong›ada‹/strong› · password<br/>‹strong›august-demo‹/strong›‹/p› ‹form method=”post”<br/>action=”/provider/login” onSubmit=｛submit｝› ‹input<br/>type=”hidden” name=”request_id” value=｛requestId｝ /›<br/>‹input type=”hidden” name=”csrf” value=｛csrf｝ /›<br/>‹p›‹label for=”username”›Username‹/label›‹br /›‹input<br/>id=”username” name=”username” autocomplete=”username”<br/>value=”ada” maxlength=”64” required<br/>style=”padding:10px；width:90%” /›‹/p› ‹p›‹label<br/>for=”password”›Password‹/label›‹br /›‹input<br/>id=”password” type=”password” name=”password”<br/>autocomplete=”current-password” maxlength=”256” required<br/>style=”padding:10px；width:90%” /›‹/p› ‹button<br/>type=”submit” style=”padding:12px<br/>20px；border:0；border-radius:9px；background:＃4852d7；color:white；font:inherit”›Sign<br/>in and return to the app‹/button› ‹/form› ‹p<br/>style=”font-size:14px；color:＃677189”›The provider and<br/>app run in the same executable. Authorization codes<br/>still travel through the OpenID Connect protocol.‹/p›<br/>‹/Page›)
    p1-->>p0: Page result: Html
    Note over p0: Return ‹Page title=”Sign in with the August provider”›<br/>‹p›｛message｝‹/p› ‹p<br/>style=”background:＃f3f5f9；padding:12px；border-radius:8px”›Demo<br/>account: ‹strong›ada‹/strong› · password<br/>‹strong›august-demo‹/strong›‹/p› ‹form method=”post”<br/>action=”/provider/login” onSubmit=｛submit｝› ‹input<br/>type=”hidden” name=”request_id” value=｛requestId｝ /›<br/>‹input type=”hidden” name=”csrf” value=｛csrf｝ /›<br/>‹p›‹label for=”username”›Username‹/label›‹br /›‹input<br/>id=”username” name=”username” autocomplete=”username”<br/>value=”ada” maxlength=”64” required<br/>style=”padding:10px；width:90%” /›‹/p› ‹p›‹label<br/>for=”password”›Password‹/label›‹br /›‹input<br/>id=”password” type=”password” name=”password”<br/>autocomplete=”current-password” maxlength=”256” required<br/>style=”padding:10px；width:90%” /›‹/p› ‹button<br/>type=”submit” style=”padding:12px<br/>20px；border:0；border-radius:9px；background:＃4852d7；color:white；font:inherit”›Sign<br/>in and return to the app‹/button› ‹/form› ‹p<br/>style=”font-size:14px；color:＃677189”›The provider and<br/>app run in the same executable. Authorization codes<br/>still travel through the OpenID Connect protocol.‹/p›<br/>‹/Page›； required cleanup runs before exit
```

### ProviderFailure {#sequence-ProviderFailure}

::: spec-paragraph specification-paragraph-2
[Source](views.md#source-L18)
:::

It takes `message` as a string.

```mermaid
sequenceDiagram
    participant p0 as ProviderFailure
    participant p1 as common/views
    p0->>p1: Page(title=”Sign-in could not continue”, children=‹Page<br/>title=”Sign-in could not continue”›‹p›｛message｝‹/p›‹a<br/>href=”/login/start”›Start a new sign-in‹/a›‹/Page›)
    p1-->>p0: Page result: Html
    Note over p0: Return ‹Page title=”Sign-in could not<br/>continue”›‹p›｛message｝‹/p›‹a href=”/login/start”›Start a<br/>new sign-in‹/a›‹/Page›； required cleanup runs before<br/>exit
```

## Called contracts

- [Page](../common/views-diagrams.md#sequence-Page) — common/views.aug
