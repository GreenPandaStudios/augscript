---
title: "provider/authorization.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/provider/authorization.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `provider/authorization.aug`

[OpenID Connect login application](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`client/contracts.aug`](../client/contracts.md)
- [`client/endpoints.aug`](../client/endpoints.md)
- [`client/export.aug`](../client/export.md)
- [`client/login.aug`](../client/login.md)
- [`client/logout.aug`](../client/logout.md)
- [`client/protocol.aug`](../client/protocol.md)
- [`client/session.aug`](../client/session.md)
- [`client/views.aug`](../client/views.md)
- [`common/export.aug`](../common/export.md)
- [`common/headers.aug`](../common/headers.md)
- [`common/keys.aug`](../common/keys.md)
- [`common/settings.aug`](../common/settings.md)
- [`common/views.aug`](../common/views.md)
- [`provider/authorization.aug`](authorization.md)
- [`provider/contracts.aug`](contracts.md)
- [`provider/credentials.aug`](credentials.md)
- [`provider/discovery.aug`](discovery.md)
- [`provider/export.aug`](export.md)
- [`provider/token.aug`](token.md)
- [`provider/userinfo.aug`](userinfo.md)
- [`provider/views.aug`](views.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiY2I1YmVkNjJkYzdjOWFjMzNlNWMwOTg0M2QxMjU1N2M2ZmYwYzM4OWY0Y2VlNmUyNmNiZWE5ZjBjMTYyYTI2NyIsImZvcm1hdHRlZFNoYTI1NiI6IjI0MDgyMmU1MDQzMzI2OTExN2IyZjRkNzA4YzJiMTNjODRhMjgxZjk5MmE1OGEwMzFlNTBjMWZjYTk3ZWMyMTkiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMxIiwiZmlyc3QiOjM5LCJsYXN0Ijo0NiwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY29tbW9uL2luZGV4Lm1kI2JvdW5kYXJ5LWI2ZmEzYjU0ZTQ4YiIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktZTAyNWM2MDViY2Y5IiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktOGIzZDkwMDBhZWVhIl19LHsiaWQiOiJzb3VyY2UtTDM5IiwiZmlyc3QiOjYxLCJsYXN0Ijo2NSwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY29tbW9uL2luZGV4Lm1kI2JvdW5kYXJ5LWI2ZmEzYjU0ZTQ4YiIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktZTAyNWM2MDViY2Y5IiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1mMjAwNGZlZGRlODEiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS04YjNkOTAwMGFlZWEiXX0seyJpZCI6InNvdXJjZS1MNDIiLCJmaXJzdCI6NjgsImxhc3QiOjc0LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jb21tb24vaW5kZXgubWQjYm91bmRhcnktYjZmYTNiNTRlNDhiIiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1lMDI1YzYwNWJjZjkiLCIuLi9kaWFncmFtcy9mb2xkZXJzL3Byb3ZpZGVyL2luZGV4Lm1kI2JvdW5kYXJ5LWYyMDA0ZmVkZGU4MSIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LThiM2Q5MDAwYWVlYSJdfSx7ImlkIjoic291cmNlLUw0NiIsImZpcnN0Ijo3OCwibGFzdCI6ODQsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NvbW1vbi9pbmRleC5tZCNib3VuZGFyeS1iNmZhM2I1NGU0OGIiLCIuLi9kaWFncmFtcy9mb2xkZXJzL3Byb3ZpZGVyL2luZGV4Lm1kI2JvdW5kYXJ5LWUwMjVjNjA1YmNmOSIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktZjIwMDRmZWRkZTgxIiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktOGIzZDkwMDBhZWVhIl19LHsiaWQiOiJzb3VyY2UtTDQ5IiwiZmlyc3QiOjkzLCJsYXN0Ijo5OSwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY29tbW9uL2luZGV4Lm1kI2JvdW5kYXJ5LWI2ZmEzYjU0ZTQ4YiIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktZTAyNWM2MDViY2Y5IiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1mMjAwNGZlZGRlODEiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS04YjNkOTAwMGFlZWEiXX0seyJpZCI6InNvdXJjZS1MNTEiLCJmaXJzdCI6MTA0LCJsYXN0IjoxMTAsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NvbW1vbi9pbmRleC5tZCNib3VuZGFyeS1iNmZhM2I1NGU0OGIiLCIuLi9kaWFncmFtcy9mb2xkZXJzL3Byb3ZpZGVyL2luZGV4Lm1kI2JvdW5kYXJ5LWUwMjVjNjA1YmNmOSIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktZjIwMDRmZWRkZTgxIiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktOGIzZDkwMDBhZWVhIl19LHsiaWQiOiJzb3VyY2UtTDU3IiwiZmlyc3QiOjEyNCwibGFzdCI6MTMxLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jb21tb24vaW5kZXgubWQjYm91bmRhcnktYjZmYTNiNTRlNDhiIiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1lMDI1YzYwNWJjZjkiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS04YjNkOTAwMGFlZWEiXX0seyJpZCI6InNvdXJjZS1MNjAiLCJmaXJzdCI6MTM4LCJsYXN0IjoxNDIsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NvbW1vbi9pbmRleC5tZCNib3VuZGFyeS1iNmZhM2I1NGU0OGIiLCIuLi9kaWFncmFtcy9mb2xkZXJzL3Byb3ZpZGVyL2luZGV4Lm1kI2JvdW5kYXJ5LWUwMjVjNjA1YmNmOSIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktZjIwMDRmZWRkZTgxIiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktOGIzZDkwMDBhZWVhIiwiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTkiXX0seyJpZCI6InNvdXJjZS1MMTMiLCJmaXJzdCI6MTIsImxhc3QiOjEyLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jb21tb24vaW5kZXgubWQjYm91bmRhcnktNDAwODAzMjMwMDFlIiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1lMDI1YzYwNWJjZjkiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS04YjNkOTAwMGFlZWEiXX0seyJpZCI6InNvdXJjZS1MMzYiLCJmaXJzdCI6NTgsImxhc3QiOjU4LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jb21tb24vaW5kZXgubWQjYm91bmRhcnktNDAwODAzMjMwMDFlIiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1lMDI1YzYwNWJjZjkiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS04YjNkOTAwMGFlZWEiXX0seyJpZCI6InNvdXJjZS1MMTIiLCJmaXJzdCI6MTEsImxhc3QiOjU1LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1mMjg0ZGRjMTRiMzUiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS0zY2QxODRkMDg0NjQiLCJhdXRob3JpemF0aW9uLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLWF1dGhvcml6ZSJdfSx7ImlkIjoic291cmNlLUwzNSIsImZpcnN0Ijo1NywibGFzdCI6MTQyLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1mMjg0ZGRjMTRiMzUiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS0zY2QxODRkMDg0NjQiLCJhdXRob3JpemF0aW9uLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3ltYm9sLXByb3ZpZGVyTG9naW4iXX0seyJpZCI6InNvdXJjZS1MNTUiLCJmaXJzdCI6MTIyLCJsYXN0IjoxMjIsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL3Byb3ZpZGVyL2luZGV4Lm1kI2JvdW5kYXJ5LWQ2OWI2MTIxNTNjYSIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTI3NDcwMWUxM2E3ZCJdfSx7ImlkIjoic291cmNlLUwzMCIsImZpcnN0IjozOCwibGFzdCI6MzgsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL3Byb3ZpZGVyL2luZGV4Lm1kI2JvdW5kYXJ5LWQ2OWI2MTIxNTNjYSIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTI3NDcwMWUxM2E3ZCJdfSx7ImlkIjoic291cmNlLUw0MCIsImZpcnN0Ijo2NiwibGFzdCI6MTM2LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1kNjliNjEyMTUzY2EiLCIuLi9kaWFncmFtcy9mb2xkZXJzL3Byb3ZpZGVyL2luZGV4Lm1kI2JvdW5kYXJ5LTFmNWU5MzcxZDY3MCIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTI3NDcwMWUxM2E3ZCIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTRiMjQ5NWYxOTI0YyJdfSx7ImlkIjoic291cmNlLUw1NiIsImZpcnN0IjoxMjMsImxhc3QiOjEyMywiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktZDcyODkxOTA4NWQxIiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktZWZhMzAyNWY3NzNkIl19LHsiaWQiOiJzb3VyY2UtTDIxIiwiZmlyc3QiOjIwLCJsYXN0IjoyMSwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktMTBkYTZhZTIyYWI1IiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktOWEyYWJiMWM3OWMzIl19LHsiaWQiOiJzb3VyY2UtTDQ4IiwiZmlyc3QiOjg2LCJsYXN0Ijo5OSwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktMTBkYTZhZTIyYWI1IiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktOWEyYWJiMWM3OWMzIl19LHsiaWQiOiJzb3VyY2UtTDI1IiwiZmlyc3QiOjI0LCJsYXN0IjoyNCwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktMTBkYTZhZTIyYWI1IiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktOWEyYWJiMWM3OWMzIl19LHsiaWQiOiJzb3VyY2UtTDI2IiwiZmlyc3QiOjI1LCJsYXN0IjoyNSwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktMTBkYTZhZTIyYWI1IiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktOWEyYWJiMWM3OWMzIl19LHsiaWQiOiJzb3VyY2UtTDI3IiwiZmlyc3QiOjI2LCJsYXN0IjoyNiwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktMTBkYTZhZTIyYWI1IiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktOWEyYWJiMWM3OWMzIl19LHsiaWQiOiJzb3VyY2UtTDUzIiwiZmlyc3QiOjExMiwibGFzdCI6MTEyLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS0xMGRhNmFlMjJhYjUiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS05YTJhYmIxYzc5YzMiXX0seyJpZCI6InNvdXJjZS1MMjgiLCJmaXJzdCI6MjcsImxhc3QiOjI3LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS0xZjVlOTM3MWQ2NzAiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS00YjI0OTVmMTkyNGMiXX0seyJpZCI6InNvdXJjZS1MNTIiLCJmaXJzdCI6MTExLCJsYXN0IjoxMTEsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL3Byb3ZpZGVyL2luZGV4Lm1kI2JvdW5kYXJ5LTFmNWU5MzcxZDY3MCIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTRiMjQ5NWYxOTI0YyJdfSx7ImlkIjoic291cmNlLUw1NCIsImZpcnN0IjoxMTMsImxhc3QiOjEyMSwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktOGQ4OTJlNTYwYTNmIl19LHsiaWQiOiJzb3VyY2UtTDI5IiwiZmlyc3QiOjI4LCJsYXN0IjozNywiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktOGQ4OTJlNTYwYTNmIl19LHsiaWQiOiJzb3VyY2UtTDE1IiwiZmlyc3QiOjE0LCJsYXN0IjoxNCwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktOGQ4OTJlNTYwYTNmIl19LHsiaWQiOiJzb3VyY2UtTDE3IiwiZmlyc3QiOjE2LCJsYXN0IjoxNiwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktOGQ4OTJlNTYwYTNmIl19LHsiaWQiOiJzb3VyY2UtTDE5IiwiZmlyc3QiOjE4LCJsYXN0IjoxOCwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktOGQ4OTJlNTYwYTNmIl19LHsiaWQiOiJzb3VyY2UtTDIyIiwiZmlyc3QiOjIxLCJsYXN0IjoyMSwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktOGQ4OTJlNTYwYTNmIl19LHsiaWQiOiJzb3VyY2UtTDI0IiwiZmlyc3QiOjIzLCJsYXN0IjoyMywiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktOGQ4OTJlNTYwYTNmIl19LHsiaWQiOiJzb3VyY2UtTDUwIiwiZmlyc3QiOjEwMCwibGFzdCI6MTEwLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS00NDc2MThhZmFkZTMiXX0seyJpZCI6InNvdXJjZS1MMzIiLCJmaXJzdCI6NDcsImxhc3QiOjU1LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1mMjAwNGZlZGRlODEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNCJdfSx7ImlkIjoic291cmNlLUwxMy1MMTkiLCJmaXJzdCI6MTIsImxhc3QiOjE4LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MMjAtTDI3IiwiZmlyc3QiOjE5LCJsYXN0IjoyNiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDI4LUwzMSIsImZpcnN0IjoyNywibGFzdCI6NDYsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfSx7ImlkIjoic291cmNlLUwzNi1MNjAiLCJmaXJzdCI6NTgsImxhc3QiOjE0MiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC01Il19LHsiaWQiOiJzb3VyY2UtTDM3LUw2MCIsImZpcnN0Ijo1OSwibGFzdCI6MTQyLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTYiXX0seyJpZCI6InNvdXJjZS1MNTAtTDU0IiwiZmlyc3QiOjEwMCwibGFzdCI6MTIxLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTciXX0seyJpZCI6InNvdXJjZS1MNTUtTDU4IiwiZmlyc3QiOjEyMiwibGFzdCI6MTM2LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTgiXX1dfQ
// aug-spec: "authorization.aug.md" explains this file. Read it before changes; refresh with aug spec.
import AuthorizationRequest and AuthorizationCode and LoginForm and LoginError from contracts
import ProviderLogin and ProviderFailure from views
import verifyCredentials from credentials
import settings and securityHeaders and withCookie from common
import Crypto from crypto
import Clock from time
import ExpiringStore and StoreFull from memory
import urlEncode from web
/** Validate the registered client before offering a login form. A malformed redirect is never followed. */
endpoint GET "/provider/authorize" as authorize(string response_type from query, string client_id from query, string redirect_uri from query, string requestedScope from query "scope", string state from query, string nonce from query, string code_challenge from query, string code_challenge_method from query, resolve Crypto crypto, resolve Clock clock, resolve ExpiringStore<AuthorizationRequest> requests) unless LoginError with status 400 and CryptoError with status 503 and TimeError with status 503 and StoreFull with status 503 and HttpError:
    config = settings()
    if client_id != config.clientId or redirect_uri != config.callback or response_type != "code" or code_challenge_method != "S256":
        throw LoginError()
    if requestedScope != "openid" and requestedScope != "openid profile":
        throw LoginError()
    if not state.isToken(min=43, max=128) or not nonce.isToken(min=43, max=128) or code_challenge.length() != 43:
        throw LoginError()
    try:
        if crypto.decodeBase64url(input=code_challenge).length() != 32:
            throw LoginError()
    catch CryptoError error:
        throw LoginError()
    requestId = crypto.random(size=32).base64url()
    browser = crypto.random(size=32).base64url()
    csrf = crypto.random(size=32).base64url()
    now = clock.now()
    request = AuthorizationRequest(
        clientId=client_id,
        redirectUri=redirect_uri,
        state=state,
        nonce=nonce,
        challenge=code_challenge,
        browser=browser,
        csrf=csrf,
        expires=now + 300
    )
    requests.put(key=requestId, value=request, expires=request.expires, now=now)
    headers = withCookie(
        headers=securityHeaders(),
        name="aug_authorize",
        value=browser,
        path="/provider",
        maxAge=300,
        secure=config.secureCookies
    )
    return HttpResponse(
        body=ProviderLogin(
            requestId,
            csrf,
            message="Authorize the registered August login app.",
            submit=handle providerLogin(input from form)
        ),
        headers=headers
    )
/** The browser binding and CSRF token are checked before credentials. Each form request is consumed once. */
endpoint POST "/provider/login" as providerLogin(LoginForm form from form, optional string browser from cookie "aug_authorize", optional string origin from header "origin", resolve Crypto crypto, resolve Clock clock, resolve ExpiringStore<AuthorizationRequest> requests, resolve ExpiringStore<AuthorizationCode> codes) unless CryptoError with status 503 and TimeError with status 503 and StoreFull with status 503 and HttpError:
    config = settings()
    try:
        if origin != config.baseUrl:
            return HttpResponse(
                body=ProviderFailure(message="The sign-in form must come from this app."),
                status=403,
                headers=securityHeaders()
            )
        match requests.take(key=form.request_id, now=clock.now()):
            when null:
                return HttpResponse(
                    body=ProviderFailure(
                        message="The sign-in request expired or was already used."
                    ),
                    status=400,
                    headers=securityHeaders()
                )
            when some request:
                match browser:
                    when null:
                        return HttpResponse(
                            body=ProviderFailure(
                                message="The browser binding is missing."
                            ),
                            status=403,
                            headers=securityHeaders()
                        )
                    when some secret:
                        if not crypto.equal(
                            left=secret.bytes(),
                            right=request.browser.bytes()
                        ) or not crypto.equal(
                            left=form.csrf.bytes(),
                            right=request.csrf.bytes()
                        ):
                            return HttpResponse(
                                body=ProviderFailure(
                                    message="The sign-in form could not be verified."
                                ),
                                status=403,
                                headers=securityHeaders()
                            )
                if not verifyCredentials(
                    username=form.username,
                    password=form.password
                ):
                    return HttpResponse(
                        body=ProviderFailure(
                            message="The username or password was not accepted."
                        ),
                        status=401,
                        headers=securityHeaders()
                    )
                now = clock.now()
                code = crypto.random(size=32).base64url()
                grant = AuthorizationCode(
                    clientId=request.clientId,
                    redirectUri=request.redirectUri,
                    challenge=request.challenge,
                    nonce=request.nonce,
                    subject="demo-ada",
                    name="Ada",
                    expires=now + 60
                )
                codes.put(key=code, value=grant, expires=grant.expires, now=now)
                location = request.redirectUri + "?code=" + urlEncode(input=code) + "&state=" + urlEncode(input=request.state)
                headers = withCookie(
                    headers=securityHeaders().with(name="location", value=location),
                    name="aug_authorize",
                    value="",
                    path="/provider",
                    maxAge=0,
                    secure=config.secureCookies
                )
                return HttpResponse(
                    body=<p>Returning to the application.</p>,
                    status=303,
                    headers=headers
                )
    catch HttpError error:
        return HttpResponse(
            body=ProviderFailure(message="The submitted form is invalid."),
            status=400,
            headers=securityHeaders()
        )
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiY2I1YmVkNjJkYzdjOWFjMzNlNWMwOTg0M2QxMjU1N2M2ZmYwYzM4OWY0Y2VlNmUyNmNiZWE5ZjBjMTYyYTI2NyIsImZvcm1hdHRlZFNoYTI1NiI6IjhiZDczZGM5Y2JlZTc2OTVjMzgwNTA5MzBmZmZiZjM3MDc4OTA2MGU1OWFhOWI3ZjllNTU1MzgyOGJhYTRmNTIiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMxIiwiZmlyc3QiOjQ1LCJsYXN0Ijo1MiwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY29tbW9uL2luZGV4Lm1kI2JvdW5kYXJ5LWI2ZmEzYjU0ZTQ4YiIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktZTAyNWM2MDViY2Y5IiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktOGIzZDkwMDBhZWVhIl19LHsiaWQiOiJzb3VyY2UtTDM5IiwiZmlyc3QiOjY4LCJsYXN0Ijo3MiwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY29tbW9uL2luZGV4Lm1kI2JvdW5kYXJ5LWI2ZmEzYjU0ZTQ4YiIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktZTAyNWM2MDViY2Y5IiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1mMjAwNGZlZGRlODEiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS04YjNkOTAwMGFlZWEiXX0seyJpZCI6InNvdXJjZS1MNDIiLCJmaXJzdCI6NzYsImxhc3QiOjgyLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jb21tb24vaW5kZXgubWQjYm91bmRhcnktYjZmYTNiNTRlNDhiIiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1lMDI1YzYwNWJjZjkiLCIuLi9kaWFncmFtcy9mb2xkZXJzL3Byb3ZpZGVyL2luZGV4Lm1kI2JvdW5kYXJ5LWYyMDA0ZmVkZGU4MSIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LThiM2Q5MDAwYWVlYSJdfSx7ImlkIjoic291cmNlLUw0NiIsImZpcnN0Ijo4NywibGFzdCI6OTMsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NvbW1vbi9pbmRleC5tZCNib3VuZGFyeS1iNmZhM2I1NGU0OGIiLCIuLi9kaWFncmFtcy9mb2xkZXJzL3Byb3ZpZGVyL2luZGV4Lm1kI2JvdW5kYXJ5LWUwMjVjNjA1YmNmOSIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktZjIwMDRmZWRkZTgxIiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktOGIzZDkwMDBhZWVhIl19LHsiaWQiOiJzb3VyY2UtTDQ5IiwiZmlyc3QiOjEwMywibGFzdCI6MTA5LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jb21tb24vaW5kZXgubWQjYm91bmRhcnktYjZmYTNiNTRlNDhiIiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1lMDI1YzYwNWJjZjkiLCIuLi9kaWFncmFtcy9mb2xkZXJzL3Byb3ZpZGVyL2luZGV4Lm1kI2JvdW5kYXJ5LWYyMDA0ZmVkZGU4MSIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LThiM2Q5MDAwYWVlYSJdfSx7ImlkIjoic291cmNlLUw1MSIsImZpcnN0IjoxMTcsImxhc3QiOjEyMywiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY29tbW9uL2luZGV4Lm1kI2JvdW5kYXJ5LWI2ZmEzYjU0ZTQ4YiIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktZTAyNWM2MDViY2Y5IiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1mMjAwNGZlZGRlODEiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS04YjNkOTAwMGFlZWEiXX0seyJpZCI6InNvdXJjZS1MNTciLCJmaXJzdCI6MTM4LCJsYXN0IjoxNDUsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NvbW1vbi9pbmRleC5tZCNib3VuZGFyeS1iNmZhM2I1NGU0OGIiLCIuLi9kaWFncmFtcy9mb2xkZXJzL3Byb3ZpZGVyL2luZGV4Lm1kI2JvdW5kYXJ5LWUwMjVjNjA1YmNmOSIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LThiM2Q5MDAwYWVlYSJdfSx7ImlkIjoic291cmNlLUw2MCIsImZpcnN0IjoxNTUsImxhc3QiOjE1OSwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY29tbW9uL2luZGV4Lm1kI2JvdW5kYXJ5LWI2ZmEzYjU0ZTQ4YiIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktZTAyNWM2MDViY2Y5IiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1mMjAwNGZlZGRlODEiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS04YjNkOTAwMGFlZWEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtOSJdfSx7ImlkIjoic291cmNlLUwxMyIsImZpcnN0IjoxMiwibGFzdCI6MTIsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NvbW1vbi9pbmRleC5tZCNib3VuZGFyeS00MDA4MDMyMzAwMWUiLCIuLi9kaWFncmFtcy9mb2xkZXJzL3Byb3ZpZGVyL2luZGV4Lm1kI2JvdW5kYXJ5LWUwMjVjNjA1YmNmOSIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LThiM2Q5MDAwYWVlYSJdfSx7ImlkIjoic291cmNlLUwzNiIsImZpcnN0Ijo2NSwibGFzdCI6NjUsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NvbW1vbi9pbmRleC5tZCNib3VuZGFyeS00MDA4MDMyMzAwMWUiLCIuLi9kaWFncmFtcy9mb2xkZXJzL3Byb3ZpZGVyL2luZGV4Lm1kI2JvdW5kYXJ5LWUwMjVjNjA1YmNmOSIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LThiM2Q5MDAwYWVlYSJdfSx7ImlkIjoic291cmNlLUwxMiIsImZpcnN0IjoxMSwibGFzdCI6NjIsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL3Byb3ZpZGVyL2luZGV4Lm1kI2JvdW5kYXJ5LWYyODRkZGMxNGIzNSIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTNjZDE4NGQwODQ2NCIsImF1dGhvcml6YXRpb24tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtYXV0aG9yaXplIl19LHsiaWQiOiJzb3VyY2UtTDM1IiwiZmlyc3QiOjY0LCJsYXN0IjoxNjEsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL3Byb3ZpZGVyL2luZGV4Lm1kI2JvdW5kYXJ5LWYyODRkZGMxNGIzNSIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTNjZDE4NGQwODQ2NCIsImF1dGhvcml6YXRpb24tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiIsIiNzeW1ib2wtcHJvdmlkZXJMb2dpbiJdfSx7ImlkIjoic291cmNlLUw1NSIsImZpcnN0IjoxMzYsImxhc3QiOjEzNiwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktZDY5YjYxMjE1M2NhIiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktMjc0NzAxZTEzYTdkIl19LHsiaWQiOiJzb3VyY2UtTDMwIiwiZmlyc3QiOjQ0LCJsYXN0Ijo0NCwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktZDY5YjYxMjE1M2NhIiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktMjc0NzAxZTEzYTdkIl19LHsiaWQiOiJzb3VyY2UtTDQwIiwiZmlyc3QiOjc0LCJsYXN0IjoxNTIsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL3Byb3ZpZGVyL2luZGV4Lm1kI2JvdW5kYXJ5LWQ2OWI2MTIxNTNjYSIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktMWY1ZTkzNzFkNjcwIiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktMjc0NzAxZTEzYTdkIiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktNGIyNDk1ZjE5MjRjIl19LHsiaWQiOiJzb3VyY2UtTDU2IiwiZmlyc3QiOjEzNywibGFzdCI6MTM3LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1kNzI4OTE5MDg1ZDEiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1lZmEzMDI1Zjc3M2QiXX0seyJpZCI6InNvdXJjZS1MMjEiLCJmaXJzdCI6MjMsImxhc3QiOjI1LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS0xMGRhNmFlMjJhYjUiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS05YTJhYmIxYzc5YzMiXX0seyJpZCI6InNvdXJjZS1MNDgiLCJmaXJzdCI6OTYsImxhc3QiOjExMCwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktMTBkYTZhZTIyYWI1IiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktOWEyYWJiMWM3OWMzIl19LHsiaWQiOiJzb3VyY2UtTDI1IiwiZmlyc3QiOjMwLCJsYXN0IjozMCwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktMTBkYTZhZTIyYWI1IiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktOWEyYWJiMWM3OWMzIl19LHsiaWQiOiJzb3VyY2UtTDI2IiwiZmlyc3QiOjMxLCJsYXN0IjozMSwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktMTBkYTZhZTIyYWI1IiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktOWEyYWJiMWM3OWMzIl19LHsiaWQiOiJzb3VyY2UtTDI3IiwiZmlyc3QiOjMyLCJsYXN0IjozMiwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktMTBkYTZhZTIyYWI1IiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktOWEyYWJiMWM3OWMzIl19LHsiaWQiOiJzb3VyY2UtTDUzIiwiZmlyc3QiOjEyNiwibGFzdCI6MTI2LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS0xMGRhNmFlMjJhYjUiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS05YTJhYmIxYzc5YzMiXX0seyJpZCI6InNvdXJjZS1MMjgiLCJmaXJzdCI6MzMsImxhc3QiOjMzLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS0xZjVlOTM3MWQ2NzAiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS00YjI0OTVmMTkyNGMiXX0seyJpZCI6InNvdXJjZS1MNTIiLCJmaXJzdCI6MTI1LCJsYXN0IjoxMjUsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL3Byb3ZpZGVyL2luZGV4Lm1kI2JvdW5kYXJ5LTFmNWU5MzcxZDY3MCIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTRiMjQ5NWYxOTI0YyJdfSx7ImlkIjoic291cmNlLUw1NCIsImZpcnN0IjoxMjcsImxhc3QiOjEzNSwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktOGQ4OTJlNTYwYTNmIl19LHsiaWQiOiJzb3VyY2UtTDI5IiwiZmlyc3QiOjM0LCJsYXN0Ijo0MywiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktOGQ4OTJlNTYwYTNmIl19LHsiaWQiOiJzb3VyY2UtTDE1IiwiZmlyc3QiOjE0LCJsYXN0IjoxNCwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktOGQ4OTJlNTYwYTNmIl19LHsiaWQiOiJzb3VyY2UtTDE3IiwiZmlyc3QiOjE3LCJsYXN0IjoxNywiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktOGQ4OTJlNTYwYTNmIl19LHsiaWQiOiJzb3VyY2UtTDE5IiwiZmlyc3QiOjIwLCJsYXN0IjoyMCwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktOGQ4OTJlNTYwYTNmIl19LHsiaWQiOiJzb3VyY2UtTDIyIiwiZmlyc3QiOjI0LCJsYXN0IjoyNCwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktOGQ4OTJlNTYwYTNmIl19LHsiaWQiOiJzb3VyY2UtTDI0IiwiZmlyc3QiOjI4LCJsYXN0IjoyOCwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktOGQ4OTJlNTYwYTNmIl19LHsiaWQiOiJzb3VyY2UtTDUwIiwiZmlyc3QiOjExMywibGFzdCI6MTI0LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS00NDc2MThhZmFkZTMiXX0seyJpZCI6InNvdXJjZS1MMzIiLCJmaXJzdCI6NTMsImxhc3QiOjYxLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1mMjAwNGZlZGRlODEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNCJdfSx7ImlkIjoic291cmNlLUwxMy1MMTkiLCJmaXJzdCI6MTIsImxhc3QiOjIxLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MMjAtTDI3IiwiZmlyc3QiOjIyLCJsYXN0IjozMiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDI4LUwzMSIsImZpcnN0IjozMywibGFzdCI6NTIsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfSx7ImlkIjoic291cmNlLUwzNi1MNjAiLCJmaXJzdCI6NjUsImxhc3QiOjE2MCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC01Il19LHsiaWQiOiJzb3VyY2UtTDM3LUw2MCIsImZpcnN0Ijo2NiwibGFzdCI6MTYwLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTYiXX0seyJpZCI6InNvdXJjZS1MNTAtTDU0IiwiZmlyc3QiOjExMywibGFzdCI6MTM1LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTciXX0seyJpZCI6InNvdXJjZS1MNTUtTDU4IiwiZmlyc3QiOjEzNiwibGFzdCI6MTUwLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTgiXX1dfQ
// aug-spec: "authorization.aug.md" explains this file. Read it before changes; refresh with aug spec.
import AuthorizationRequest and AuthorizationCode and LoginForm and LoginError from contracts
import ProviderLogin and ProviderFailure from views
import verifyCredentials from credentials
import settings and securityHeaders and withCookie from common
import Crypto from crypto
import Clock from time
import ExpiringStore and StoreFull from memory
import urlEncode from web
/** Validate the registered client before offering a login form. A malformed redirect is never followed. */
endpoint GET "/provider/authorize" as authorize(string response_type from query, string client_id from query, string redirect_uri from query, string requestedScope from query "scope", string state from query, string nonce from query, string code_challenge from query, string code_challenge_method from query, resolve Crypto crypto, resolve Clock clock, resolve ExpiringStore<AuthorizationRequest> requests) unless LoginError with status 400 and CryptoError with status 503 and TimeError with status 503 and StoreFull with status 503 and HttpError {
    config = settings()
    if client_id != config.clientId or redirect_uri != config.callback or response_type != "code" or code_challenge_method != "S256" {
        throw LoginError()
    }
    if requestedScope != "openid" and requestedScope != "openid profile" {
        throw LoginError()
    }
    if not state.isToken(min=43, max=128) or not nonce.isToken(min=43, max=128) or code_challenge.length() != 43 {
        throw LoginError()
    }
    try {
        if crypto.decodeBase64url(input=code_challenge).length() != 32 {
            throw LoginError()
        }
    }
    catch CryptoError error {
        throw LoginError()
    }
    requestId = crypto.random(size=32).base64url()
    browser = crypto.random(size=32).base64url()
    csrf = crypto.random(size=32).base64url()
    now = clock.now()
    request = AuthorizationRequest(
        clientId=client_id,
        redirectUri=redirect_uri,
        state=state,
        nonce=nonce,
        challenge=code_challenge,
        browser=browser,
        csrf=csrf,
        expires=now + 300
    )
    requests.put(key=requestId, value=request, expires=request.expires, now=now)
    headers = withCookie(
        headers=securityHeaders(),
        name="aug_authorize",
        value=browser,
        path="/provider",
        maxAge=300,
        secure=config.secureCookies
    )
    return HttpResponse(
        body=ProviderLogin(
            requestId,
            csrf,
            message="Authorize the registered August login app.",
            submit=handle providerLogin(input from form)
        ),
        headers=headers
    )
}
/** The browser binding and CSRF token are checked before credentials. Each form request is consumed once. */
endpoint POST "/provider/login" as providerLogin(LoginForm form from form, optional string browser from cookie "aug_authorize", optional string origin from header "origin", resolve Crypto crypto, resolve Clock clock, resolve ExpiringStore<AuthorizationRequest> requests, resolve ExpiringStore<AuthorizationCode> codes) unless CryptoError with status 503 and TimeError with status 503 and StoreFull with status 503 and HttpError {
    config = settings()
    try {
        if origin != config.baseUrl {
            return HttpResponse(
                body=ProviderFailure(message="The sign-in form must come from this app."),
                status=403,
                headers=securityHeaders()
            )
        }
        match requests.take(key=form.request_id, now=clock.now()) {
            when null {
                return HttpResponse(
                    body=ProviderFailure(
                        message="The sign-in request expired or was already used."
                    ),
                    status=400,
                    headers=securityHeaders()
                )
            }
            when some request {
                match browser {
                    when null {
                        return HttpResponse(
                            body=ProviderFailure(
                                message="The browser binding is missing."
                            ),
                            status=403,
                            headers=securityHeaders()
                        )
                    }
                    when some secret {
                        if not crypto.equal(
                            left=secret.bytes(),
                            right=request.browser.bytes()
                        ) or not crypto.equal(
                            left=form.csrf.bytes(),
                            right=request.csrf.bytes()
                        ) {
                            return HttpResponse(
                                body=ProviderFailure(
                                    message="The sign-in form could not be verified."
                                ),
                                status=403,
                                headers=securityHeaders()
                            )
                        }
                    }
                }
                if not verifyCredentials(
                    username=form.username,
                    password=form.password
                ) {
                    return HttpResponse(
                        body=ProviderFailure(
                            message="The username or password was not accepted."
                        ),
                        status=401,
                        headers=securityHeaders()
                    )
                }
                now = clock.now()
                code = crypto.random(size=32).base64url()
                grant = AuthorizationCode(
                    clientId=request.clientId,
                    redirectUri=request.redirectUri,
                    challenge=request.challenge,
                    nonce=request.nonce,
                    subject="demo-ada",
                    name="Ada",
                    expires=now + 60
                )
                codes.put(key=code, value=grant, expires=grant.expires, now=now)
                location = request.redirectUri + "?code=" + urlEncode(input=code) + "&state=" + urlEncode(input=request.state)
                headers = withCookie(
                    headers=securityHeaders().with(name="location", value=location),
                    name="aug_authorize",
                    value="",
                    path="/provider",
                    maxAge=0,
                    secure=config.secureCookies
                )
                return HttpResponse(
                    body=<p>Returning to the application.</p>,
                    status=303,
                    headers=headers
                )
            }
        }
    }
    catch HttpError error {
        return HttpResponse(
            body=ProviderFailure(message="The submitted form is invalid."),
            status=400,
            headers=securityHeaders()
        )
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](authorization-diagrams.md)

Plain handler results default to HTTP 200 unless another status is declared. HttpResponse values choose their own status. Unhandled request failures return HTTP 500 and cancel the request tasks.

### `authorize` · [source](authorization.md#source-L12) {#symbol-authorize}

`authorize` handles `GET /provider/authorize`. Validate the registered client before offering a login form. A malformed redirect is never followed.

It reads `response_type`, `client_id`, `redirect_uri`, `scope`, `state`, `nonce`, `code_challenge`, and `code_challenge_method` from the HTTP query. `scope` is called `requestedScope` here. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)), and `requests` ([`ExpiringStore<AuthorizationRequest>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection. It can call [`Crypto.decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), [`Crypto.random`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.random), [`Clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now), and [`ExpiringStore<AuthorizationRequest>.put`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.put).

The handler responds with HTTP 400 for [`LoginError`](contracts.md#symbol-LoginError), HTTP 503 for `CryptoError`, HTTP 503 for `TimeError`, and HTTP 503 for [`StoreFull`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-StoreFull). It can also raise `HttpError`.

::: spec-paragraph specification-paragraph-1
It gets `config` from [`settings`](../common/settings.md#symbol-settings). It checks that `client_id` equals `config.clientId` and `redirect_uri` equals `config.callback` and `response_type` equals `"code"` and `code_challenge_method` equals `"S256"`, `requestedScope` is either `"openid"` or `"openid profile"`, and `state` is a URL-safe ASCII token with `43` to `128` characters and `nonce` is a URL-safe ASCII token with `43` to `128` characters and the byte length of `code_challenge` equals `43`. It raises a [`LoginError`](contracts.md#symbol-LoginError) at the first failed check. [source](authorization.md#source-L13-L19)
:::

::: spec-paragraph specification-paragraph-2
It checks that the byte length of [`crypto.decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url) with `input` from `code_challenge` equals `32`. It raises a [`LoginError`](contracts.md#symbol-LoginError) at the first failed check. If this work raises `CryptoError`, it raises a [`LoginError`](contracts.md#symbol-LoginError). It sets `requestId`, `browser`, and `csrf` separately, each to the URL-safe base64 encoding of [`crypto.random`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.random) with `size` `32`. [source](authorization.md#source-L20-L27)
:::

::: spec-paragraph specification-paragraph-3
It sets `now` to [`clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now). It sets `request` to an [`AuthorizationRequest`](contracts.md#symbol-AuthorizationRequest) with `clientId` from `client_id`, `redirectUri` from `redirect_uri`, `state`, `nonce`, `challenge` from `code_challenge`, `browser`, `csrf`, and `expires` from `now` plus `300`. It calls [`requests.put`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.put) with `key` from `requestId`, `value` from `request`, `request.expires`, and `now`. It sets `headers` to [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` from [`securityHeaders`](../common/headers.md#symbol-securityHeaders), `name` `"aug_authorize"`, `value` from `browser`, `path` `"/provider"`, `maxAge` `300`, and `secure` from `config.secureCookies`. [source](authorization.md#source-L28-L31)
:::

::: spec-paragraph specification-paragraph-4
It returns HTTP 200 with [`ProviderLogin`](views.md#symbol-ProviderLogin) with `requestId`, `csrf`, `message` `"Authorize the registered August login app."`, and `submit` from a form action that sends `POST /provider/login` to [`providerLogin`](authorization.md#symbol-providerLogin) on submission and `headers` headers. [source](authorization.md#source-L32)
:::

::: details Checked interface

```text
authorize(string response_type, string client_id, string redirect_uri, string requestedScope, string state, string nonce, string code_challenge, string code_challenge_method, resolve Crypto crypto, resolve Clock clock, resolve ExpiringStore<AuthorizationRequest> requests) returns HttpResponse<Html> unless CryptoError and HttpError and LoginError and StoreFull and TimeError uses Crypto.decodeBase64url, Crypto.random, Clock.now, ExpiringStore<AuthorizationRequest>.put
```

It reads `response_type`, `client_id`, `redirect_uri`, `scope`, `state`, `nonce`, `code_challenge`, and `code_challenge_method` from the HTTP query. `scope` is called `requestedScope` here. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)), and `requests` ([`ExpiringStore<AuthorizationRequest>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection. It can call [`Crypto.decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), [`Crypto.random`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.random), [`Clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now), and [`ExpiringStore<AuthorizationRequest>.put`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.put).

The handler responds with HTTP 400 for [`LoginError`](contracts.md#symbol-LoginError), HTTP 503 for `CryptoError`, HTTP 503 for `TimeError`, and HTTP 503 for [`StoreFull`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-StoreFull). It can also raise `HttpError`.

:::

### `providerLogin` · [source](authorization.md#source-L35) {#symbol-providerLogin}

`providerLogin` handles `POST /provider/login`. The browser binding and CSRF token are checked before credentials. Each form request is consumed once.

It takes `form` as [`LoginForm`](contracts.md#symbol-LoginForm) from the HTTP form, `browser` as `optional string` from the HTTP cookie `aug_authorize`, and `origin` as `optional string` from the HTTP header `origin`. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)), `requests` ([`ExpiringStore<AuthorizationRequest>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)), and `codes` ([`ExpiringStore<AuthorizationCode>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null. It can call [`Clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now), [`ExpiringStore<AuthorizationRequest>.take`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.take), [`Crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`Crypto.random`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.random), [`ExpiringStore<AuthorizationCode>.put`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.put), [`Crypto.passwordHash`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.passwordHash), and [`Crypto.decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url).

The handler responds with HTTP 503 for `CryptoError`, HTTP 503 for `TimeError`, and HTTP 503 for [`StoreFull`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-StoreFull). It can also raise `HttpError`.

::: spec-paragraph specification-paragraph-5
It gets `config` from [`settings`](../common/settings.md#symbol-settings). If `origin` does not equal `config.baseUrl`, it returns HTTP 403 with [`ProviderFailure`](views.md#symbol-ProviderFailure) showing `"The sign-in form must come from this app."` and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers. It obtains [`requests.take`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.take) with `key` from `form.request_id` and `now` from [`clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now). If no value is found, it returns HTTP 400 with [`ProviderFailure`](views.md#symbol-ProviderFailure) showing `"The sign-in request expired or was already used."` and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers. [source](authorization.md#source-L36-L60)
:::

::: spec-paragraph specification-paragraph-6
The non-null result becomes `request`. If `browser` is null, it returns HTTP 403 with [`ProviderFailure`](views.md#symbol-ProviderFailure) showing `"The browser binding is missing."` and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers. The non-null `browser` becomes `secret`. If [`crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal) with `left` from the UTF-8 bytes of `secret` and `right` from the UTF-8 bytes of `request.browser` returns false or [`crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal) with `left` from the UTF-8 bytes of `form.csrf` and `right` from the UTF-8 bytes of `request.csrf` returns false, it returns HTTP 403 with [`ProviderFailure`](views.md#symbol-ProviderFailure) showing `"The sign-in form could not be verified."` and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers. [source](authorization.md#source-L37-L60)
:::

::: spec-paragraph specification-paragraph-7
If [`verifyCredentials`](credentials.md#symbol-verifyCredentials) with `form.username` and `form.password` using injected `crypto` returns false, it returns HTTP 401 with [`ProviderFailure`](views.md#symbol-ProviderFailure) showing `"The username or password was not accepted."` and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers. It sets `now` to [`clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now). It sets `code` to the URL-safe base64 encoding of [`crypto.random`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.random) with `size` `32`. It sets `grant` to an [`AuthorizationCode`](contracts.md#symbol-AuthorizationCode) with `request.clientId`, `request.redirectUri`, `request.challenge`, `request.nonce`, `subject` `"demo-ada"`, `name` `"Ada"`, and `expires` from `now` plus `60`. [source](authorization.md#source-L50-L54)
:::

::: spec-paragraph specification-paragraph-8
It calls [`codes.put`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.put) with `key` from `code`, `value` from `grant`, `grant.expires`, and `now`. It builds `location` as the text `{request.redirectUri}?code={urlEncode with input from code}&state={urlEncode with input from request.state}`. It sets `headers` to [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` from [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with the header `"location"` set to `location`, `name` `"aug_authorize"`, `value` `""`, `path` `"/provider"`, `maxAge` `0`, and `secure` from `config.secureCookies`. It returns HTTP 303 with a paragraph containing `Returning to the application.` with escaped text and `headers` headers. [source](authorization.md#source-L55-L58)
:::

::: spec-paragraph specification-paragraph-9
If this work raises `HttpError`, it returns HTTP 400 with [`ProviderFailure`](views.md#symbol-ProviderFailure) showing `"The submitted form is invalid."` and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers. [source](authorization.md#source-L60)
:::

::: details Checked interface

```text
providerLogin(LoginForm form, optional string browser, optional string origin, resolve Crypto crypto, resolve Clock clock, resolve ExpiringStore<AuthorizationRequest> requests, resolve ExpiringStore<AuthorizationCode> codes) returns HttpResponse<Html> unless CryptoError and HttpError and StoreFull and TimeError uses Clock.now, ExpiringStore<AuthorizationRequest>.take, Crypto.equal, Crypto.random, ExpiringStore<AuthorizationCode>.put, Crypto.passwordHash, Crypto.decodeBase64url
```

It takes `form` as [`LoginForm`](contracts.md#symbol-LoginForm) from the HTTP form, `browser` as `optional string` from the HTTP cookie `aug_authorize`, and `origin` as `optional string` from the HTTP header `origin`. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)), `requests` ([`ExpiringStore<AuthorizationRequest>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)), and `codes` ([`ExpiringStore<AuthorizationCode>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null. It can call [`Clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now), [`ExpiringStore<AuthorizationRequest>.take`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.take), [`Crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`Crypto.random`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.random), [`ExpiringStore<AuthorizationCode>.put`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.put), [`Crypto.passwordHash`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.passwordHash), and [`Crypto.decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url).

The handler responds with HTTP 503 for `CryptoError`, HTTP 503 for `TimeError`, and HTTP 503 for [`StoreFull`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-StoreFull). It can also raise `HttpError`.

:::

### Dependencies

It uses [`ExpiringStore`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore) ([`put`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.put) and [`take`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.take)) and [`StoreFull`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-StoreFull) from `memory`. It uses [`urlEncode`](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-urlEncode) from `web`. It uses [`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto) ([`decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), [`equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`passwordHash`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.passwordHash), and [`random`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.random)) from `crypto`. It uses [`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock) ([`now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now)) from `time`.

It uses [`securityHeaders`](../common/headers.md#symbol-securityHeaders), [`withCookie`](../common/headers.md#symbol-withCookie), and [`settings`](../common/settings.md#symbol-settings) from `common`. It uses [`Settings`](../common/settings.md#symbol-Settings) (`baseUrl`, `callback`, `clientId`, and `secureCookies`). It uses [`AuthorizationCode`](contracts.md#symbol-AuthorizationCode) (`expires`), [`AuthorizationRequest`](contracts.md#symbol-AuthorizationRequest) (`browser`, `challenge`, `clientId`, `csrf`, `expires`, `nonce`, `redirectUri`, and `state`), [`LoginError`](contracts.md#symbol-LoginError), and [`LoginForm`](contracts.md#symbol-LoginForm) (`csrf`, `password`, `request_id`, and `username`) from `contracts`. It uses [`verifyCredentials`](credentials.md#symbol-verifyCredentials) from `credentials`.

It uses [`ProviderFailure`](views.md#symbol-ProviderFailure) and [`ProviderLogin`](views.md#symbol-ProviderLogin) from `views`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
