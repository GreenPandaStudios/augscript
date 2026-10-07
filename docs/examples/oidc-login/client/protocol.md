---
title: "client/protocol.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/protocol.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `client/protocol.aug`

[OpenID Connect login application](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`client/contracts.aug`](contracts.md)
- [`client/endpoints.aug`](endpoints.md)
- [`client/export.aug`](export.md)
- [`client/login.aug`](login.md)
- [`client/logout.aug`](logout.md)
- [`client/protocol.aug`](protocol.md)
- [`client/session.aug`](session.md)
- [`client/views.aug`](views.md)
- [`common/export.aug`](../common/export.md)
- [`common/headers.aug`](../common/headers.md)
- [`common/keys.aug`](../common/keys.md)
- [`common/settings.aug`](../common/settings.md)
- [`common/views.aug`](../common/views.md)
- [`provider/authorization.aug`](../provider/authorization.md)
- [`provider/contracts.aug`](../provider/contracts.md)
- [`provider/credentials.aug`](../provider/credentials.md)
- [`provider/discovery.aug`](../provider/discovery.md)
- [`provider/export.aug`](../provider/export.md)
- [`provider/token.aug`](../provider/token.md)
- [`provider/userinfo.aug`](../provider/userinfo.md)
- [`provider/views.aug`](../provider/views.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMzFiMzdmOWEwM2MxMTk0NWI2M2MyNGUzM2RjNjkwZDYzMjFmZjU4ZmE1NzlkNjk1MGM1NjljNzczYWFlN2VkYiIsImZvcm1hdHRlZFNoYTI1NiI6Ijc0NjA3Nzg1MTE3NGYyNGI0MTY4M2Y1MDBlMjExNjc0MGU3NDlmMzQ1MGIwYTk1OTQxZDMzZjliN2VlODkwNjEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDEyIiwiZmlyc3QiOjExLCJsYXN0IjoxMSwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWRjYTdkZTUwMjE5ZCJdfSx7ImlkIjoic291cmNlLUwxNSIsImZpcnN0IjoxNCwibGFzdCI6MTQsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1kY2E3ZGU1MDIxOWQiXX0seyJpZCI6InNvdXJjZS1MMTgiLCJmaXJzdCI6MTcsImxhc3QiOjE3LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktZGNhN2RlNTAyMTlkIl19LHsiaWQiOiJzb3VyY2UtTDIyIiwiZmlyc3QiOjIxLCJsYXN0IjoyMSwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWRjYTdkZTUwMjE5ZCJdfSx7ImlkIjoic291cmNlLUwyNCIsImZpcnN0IjoyMywibGFzdCI6MjMsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1kY2E3ZGU1MDIxOWQiXX0seyJpZCI6InNvdXJjZS1MMzMiLCJmaXJzdCI6MzYsImxhc3QiOjM2LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktZGNhN2RlNTAyMTlkIl19LHsiaWQiOiJzb3VyY2UtTDM2IiwiZmlyc3QiOjM5LCJsYXN0IjozOSwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWRjYTdkZTUwMjE5ZCJdfSx7ImlkIjoic291cmNlLUw0MiIsImZpcnN0Ijo0NCwibGFzdCI6NDQsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1kY2E3ZGU1MDIxOWQiXX0seyJpZCI6InNvdXJjZS1MNDYiLCJmaXJzdCI6NDgsImxhc3QiOjQ4LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktZGNhN2RlNTAyMTlkIl19LHsiaWQiOiJzb3VyY2UtTDUwIiwiZmlyc3QiOjUyLCJsYXN0Ijo1MiwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWRjYTdkZTUwMjE5ZCJdfSx7ImlkIjoic291cmNlLUw1MiIsImZpcnN0Ijo1NCwibGFzdCI6NTQsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1kY2E3ZGU1MDIxOWQiXX0seyJpZCI6InNvdXJjZS1MNTQiLCJmaXJzdCI6NTYsImxhc3QiOjU2LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktZGNhN2RlNTAyMTlkIl19LHsiaWQiOiJzb3VyY2UtTDU3IiwiZmlyc3QiOjU5LCJsYXN0Ijo1OSwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWRjYTdkZTUwMjE5ZCJdfSx7ImlkIjoic291cmNlLUw1OSIsImZpcnN0Ijo2MSwibGFzdCI6NjEsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1kY2E3ZGU1MDIxOWQiXX0seyJpZCI6InNvdXJjZS1MNjEiLCJmaXJzdCI6NjMsImxhc3QiOjYzLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktZGNhN2RlNTAyMTlkIl19LHsiaWQiOiJzb3VyY2UtTDYzIiwiZmlyc3QiOjY1LCJsYXN0Ijo2NSwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWRjYTdkZTUwMjE5ZCIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xMCJdfSx7ImlkIjoic291cmNlLUwyOCIsImZpcnN0IjoyNiwibGFzdCI6MjYsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1jYzQwNGJkNTIyYzEiLCIuLi9kaWFncmFtcy9mb2xkZXJzL2NvbW1vbi9pbmRleC5tZCNib3VuZGFyeS0xYzk2MDVlNTM0NmQiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS0wNTgxZTdkNWM4MmUiXX0seyJpZCI6InNvdXJjZS1MNDAiLCJmaXJzdCI6NDIsImxhc3QiOjQyLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktY2M0MDRiZDUyMmMxIiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9jb21tb24vaW5kZXgubWQjYm91bmRhcnktMWM5NjA1ZTUzNDZkIiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktMDU4MWU3ZDVjODJlIl19LHsiaWQiOiJzb3VyY2UtTDcyIiwiZmlyc3QiOjczLCJsYXN0Ijo3MywiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWNjNDA0YmQ1MjJjMSIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY29tbW9uL2luZGV4Lm1kI2JvdW5kYXJ5LTFjOTYwNWU1MzQ2ZCIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTA1ODFlN2Q1YzgyZSJdfSx7ImlkIjoic291cmNlLUwyMCIsImZpcnN0IjoxOSwibGFzdCI6MTksImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS00MDJkMjU2MDhkYzQiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS0zNTU3NjNjMTc1ODUiXX0seyJpZCI6InNvdXJjZS1MMjkiLCJmaXJzdCI6MjcsImxhc3QiOjMyLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktYmUwYjVlZWVjNzBiIiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktZGRlNWI1NTU4NDU1Il19LHsiaWQiOiJzb3VyY2UtTDUzIiwiZmlyc3QiOjU1LCJsYXN0Ijo1NiwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWExZjViZTVhMDRkOSIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTQxMmZlYzU2ZGYxMiJdfSx7ImlkIjoic291cmNlLUw2OSIsImZpcnN0Ijo3MCwibGFzdCI6NzAsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1hMWY1YmU1YTA0ZDkiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS00MTJmZWM1NmRmMTIiXX0seyJpZCI6InNvdXJjZS1MNzAiLCJmaXJzdCI6NzEsImxhc3QiOjcxLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktYTFmNWJlNWEwNGQ5IiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktNDEyZmVjNTZkZjEyIl19LHsiaWQiOiJzb3VyY2UtTDcxIiwiZmlyc3QiOjcyLCJsYXN0Ijo3MiwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWExZjViZTVhMDRkOSIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTQxMmZlYzU2ZGYxMiJdfSx7ImlkIjoic291cmNlLUw0NyIsImZpcnN0Ijo0OSwibGFzdCI6NDksImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1hMWY1YmU1YTA0ZDkiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS00MTJmZWM1NmRmMTIiXX0seyJpZCI6InNvdXJjZS1MNzgiLCJmaXJzdCI6ODYsImxhc3QiOjkxLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktYTFmNWJlNWEwNGQ5IiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktNDEyZmVjNTZkZjEyIl19LHsiaWQiOiJzb3VyY2UtTDkzIiwiZmlyc3QiOjEyNSwibGFzdCI6MTMwLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktYTFmNWJlNWEwNGQ5IiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktNDEyZmVjNTZkZjEyIl19LHsiaWQiOiJzb3VyY2UtTDEwMiIsImZpcnN0IjoxNDYsImxhc3QiOjE0NiwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWExZjViZTVhMDRkOSIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTQxMmZlYzU2ZGYxMiJdfSx7ImlkIjoic291cmNlLUw0OCIsImZpcnN0Ijo1MCwibGFzdCI6NTAsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1hMWY1YmU1YTA0ZDkiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS00MTJmZWM1NmRmMTIiXX0seyJpZCI6InNvdXJjZS1MNzciLCJmaXJzdCI6NzcsImxhc3QiOjg1LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktNGEzZWEwYjU4ZmZiIiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1jMDdhMTA3OWEwMGIiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS00NjZiMzI3ZDk3ZjkiXX0seyJpZCI6InNvdXJjZS1MOTIiLCJmaXJzdCI6MTE2LCJsYXN0IjoxMjQsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS00YTNlYTBiNThmZmIiLCIuLi9kaWFncmFtcy9mb2xkZXJzL3Byb3ZpZGVyL2luZGV4Lm1kI2JvdW5kYXJ5LWMwN2ExMDc5YTAwYiIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTQ2NmIzMjdkOTdmOSJdfSx7ImlkIjoic291cmNlLUwxMDEiLCJmaXJzdCI6MTM3LCJsYXN0IjoxNDUsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS00YTNlYTBiNThmZmIiLCIuLi9kaWFncmFtcy9mb2xkZXJzL3Byb3ZpZGVyL2luZGV4Lm1kI2JvdW5kYXJ5LWMwN2ExMDc5YTAwYiIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTQ2NmIzMjdkOTdmOSJdfSx7ImlkIjoic291cmNlLUwxMCIsImZpcnN0Ijo5LCJsYXN0IjoyMywiYmFja2xpbmtzIjpbInByb3RvY29sLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLXJlc3BvbnNlSnNvbiJdfSx7ImlkIjoic291cmNlLUwyNyIsImZpcnN0IjoyNSwibGFzdCI6MzksImJhY2tsaW5rcyI6WyJwcm90b2NvbC1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1kaXNjb3ZlciJdfSx7ImlkIjoic291cmNlLUwzOSIsImZpcnN0Ijo0MSwibGFzdCI6NjUsImJhY2tsaW5rcyI6WyJwcm90b2NvbC1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIiwiI3N5bWJvbC12YWxpZGF0ZUlkZW50aXR5Il19LHsiaWQiOiJzb3VyY2UtTDExLUwxOCIsImZpcnN0IjoxMCwibGFzdCI6MTcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwxMy1MMTgiLCJmaXJzdCI6MTIsImxhc3QiOjE3LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MMTktTDI0IiwiZmlyc3QiOjE4LCJsYXN0IjoyMywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIl19LHsiaWQiOiJzb3VyY2UtTDI4LUwzNiIsImZpcnN0IjoyNiwibGFzdCI6MzksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNCJdfSx7ImlkIjoic291cmNlLUwzMi1MMzYiLCJmaXJzdCI6MzUsImxhc3QiOjM5LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTUiXX0seyJpZCI6InNvdXJjZS1MNDAtTDYzIiwiZmlyc3QiOjQyLCJsYXN0Ijo2NSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC02Il19LHsiaWQiOiJzb3VyY2UtTDQ1LUw0OCIsImZpcnN0Ijo0NywibGFzdCI6NTAsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNyJdfSx7ImlkIjoic291cmNlLUw0OS1MNTQiLCJmaXJzdCI6NTEsImxhc3QiOjU2LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTgiXX0seyJpZCI6InNvdXJjZS1MNTUtTDYxIiwiZmlyc3QiOjU3LCJsYXN0Ijo2MywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC05Il19LHsiaWQiOiJzb3VyY2UtTDY1IiwiZmlyc3QiOjY2LCJsYXN0IjoxNTEsImJhY2tsaW5rcyI6WyIjc3ltYm9sLXRlc3QtMjAtdmFsaWRhdGVJZGVudGl0eSJdfSx7ImlkIjoic291cmNlLUw2OC1MNjkiLCJmaXJzdCI6NjksImxhc3QiOjcwLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTExIl19LHsiaWQiOiJzb3VyY2UtTDcwLUw3MyIsImZpcnN0Ijo3MSwibGFzdCI6NzQsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTIiXX0seyJpZCI6InNvdXJjZS1MNzQiLCJmaXJzdCI6NzUsImxhc3QiOjc1LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEzIl19LHsiaWQiOiJzb3VyY2UtTDc2IiwiZmlyc3QiOjc2LCJsYXN0Ijo5MywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xNCJdfSx7ImlkIjoic291cmNlLUw3Ny1MODAiLCJmaXJzdCI6NzcsImxhc3QiOjkzLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTE1Il19LHsiaWQiOiJzb3VyY2UtTDgyIiwiZmlyc3QiOjk0LCJsYXN0IjoxMzUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTYiXX0seyJpZCI6InNvdXJjZS1MOTItTDk4IiwiZmlyc3QiOjExNiwibGFzdCI6MTM1LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTE3Il19LHsiaWQiOiJzb3VyY2UtTDk4IiwiZmlyc3QiOjEzNSwibGFzdCI6MTM1LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTE4Il19LHsiaWQiOiJzb3VyY2UtTDEwMCIsImZpcnN0IjoxMzYsImxhc3QiOjE1MSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xOSJdfSx7ImlkIjoic291cmNlLUwxMDEtTDEwNyIsImZpcnN0IjoxMzcsImxhc3QiOjE1MSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yMCJdfSx7ImlkIjoic291cmNlLUwxMDciLCJmaXJzdCI6MTUxLCJsYXN0IjoxNTEsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMjEiXX1dfQ
// aug-spec: "protocol.aug.md" explains this file. Read it before changes; refresh with aug spec.
import SessionError from contracts
import Discovery and IdClaims from provider
import settings from common
import HttpClient from web
import parse from json
import Crypto and GnuTlsCrypto and RsaJwks and rsaJwk and signJwt and importJwk and verifyJwt and JwtError from crypto
/** Accept only a successful JSON response. Redirects remain explicit and are never followed by the transport. */
responseJson(HttpResponse<Bytes> response):
    if response.status != 200:
        throw SessionError()
    match response.headers.get(name="content-type"):
        when null:
            throw SessionError()
        when some contentType:
            if not contentType.startsWith(prefix="application/json"):
                throw SessionError()
    try:
        return parse(input=response.body.text())
    catch ConversionError error:
        throw SessionError()
    catch JsonError error:
        throw SessionError()
/** Discovery is fetched over HTTP. Every advertised URL is checked against the registered issuer before any credential is sent. */
discover(resolve HttpClient client):
    config = settings()
    json = responseJson(
        response=client.request(
            method="GET",
            url=config.issuer + "/.well-known/openid-configuration"
        )
    )
    try:
        document = json.decode<Discovery>()
        if document.issuer != config.issuer or document.authorization_endpoint != config.issuer + "/authorize" or document.token_endpoint != config.issuer + "/token" or document.jwks_uri != config.issuer + "/jwks" or document.userinfo_endpoint != config.issuer + "/userinfo":
            throw SessionError()
        return document
    catch JsonError error:
        throw SessionError()
/** Validate the signed ID token using a public key from this issuer's HTTP JWKS, then validate the registered claims and one-use nonce. */
validateIdentity(string token, string nonce, int now, RsaJwks jwks, resolve Crypto crypto):
    config = settings()
    if jwks.keys.length() != 1:
        throw SessionError()
    try:
        jwk = jwks.keys.get(index=0)
        if jwk.kid != "provider-1":
            throw SessionError()
        publicKey = importJwk(jwk)
        claims = verifyJwt(token, publicKey, kid="provider-1", tokenType="JWT").decode<IdClaims>()
        if claims.iss != config.issuer or claims.aud != config.clientId or claims.sub.length() == 0 or claims.sub.length() > 255:
            throw SessionError()
        if claims.exp <= now or claims.iat < now - 300 or claims.iat > now + 30 or claims.exp <= claims.iat or claims.exp > now + 330:
            throw SessionError()
        if not crypto.equal(left=claims.nonce.bytes(), right=nonce.bytes()):
            throw SessionError()
        return claims
    catch JwtError error:
        throw SessionError()
    catch JsonError error:
        throw SessionError()
    catch IndexError error:
        throw SessionError()
    catch CryptoError error:
        throw SessionError()
test validateIdentity:
    when "signed_identity_claims":
        implement Crypto with GnuTlsCrypto
        resolve Crypto to crypto
        key = crypto.generateRsa()
        publicKey = crypto.publicRsa(key)
        jwks = RsaJwks(keys=[rsaJwk(publicKey, kid="provider-1")])
        config = settings()
        now = 1700000000
        expectedNonce = "nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn"
        it "accepts_valid_identity":
            claims = IdClaims(
                iss=config.issuer,
                sub="ada",
                aud=config.clientId,
                exp=now + 300,
                iat=now,
                nonce=expectedNonce,
                name="Ada"
            )
            token = signJwt(
                key,
                claims=Json(value=claims),
                kid="provider-1",
                tokenType="JWT"
            )
            identity = validateIdentity(token, nonce=expectedNonce, now, jwks)
            assert(condition=identity.sub == "ada")
        it "rejects_signed_invalid_claims" for (issuer, audience, subject, issued, expires, nonce) in [(
            "https://wrong-issuer.invalid",
            config.clientId,
            "ada",
            now,
            now + 300,
            expectedNonce
        ), (config.issuer, "wrong-audience", "ada", now, now + 300, expectedNonce), (config.issuer, config.clientId, "", now, now + 300, expectedNonce), (
            config.issuer,
            config.clientId,
            "ada",
            now - 400,
            now + 300,
            expectedNonce
        ), (
            config.issuer,
            config.clientId,
            "ada",
            now + 100,
            now + 300,
            expectedNonce
        ), (config.issuer, config.clientId, "ada", now, now, expectedNonce), (config.issuer, config.clientId, "ada", now, now + 600, expectedNonce), (config.issuer, config.clientId, "ada", now, now + 300, "wrong-nonce")]:
            claims = IdClaims(
                iss=issuer,
                sub=subject,
                aud=audience,
                exp=expires,
                iat=issued,
                nonce,
                name="Ada"
            )
            token = signJwt(
                key,
                claims=Json(value=claims),
                kid="provider-1",
                tokenType="JWT"
            )
            try:
                validateIdentity(token, nonce=expectedNonce, now, jwks)
                assert(condition=false)
            catch SessionError error:
                assert(condition=true)
        it "rejects_token_context" for (kid, tokenType) in [("wrong-key", "JWT"), ("provider-1", "august-session+jwt")]:
            claims = IdClaims(
                iss=config.issuer,
                sub="ada",
                aud=config.clientId,
                exp=now + 300,
                iat=now,
                nonce=expectedNonce,
                name="Ada"
            )
            token = signJwt(key, claims=Json(value=claims), kid, tokenType)
            try:
                validateIdentity(token, nonce=expectedNonce, now, jwks)
                assert(condition=false)
            catch SessionError error:
                assert(condition=true)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMzFiMzdmOWEwM2MxMTk0NWI2M2MyNGUzM2RjNjkwZDYzMjFmZjU4ZmE1NzlkNjk1MGM1NjljNzczYWFlN2VkYiIsImZvcm1hdHRlZFNoYTI1NiI6IjU5NzkxMmFmMTVjN2NlZjUzMDM0YTFhMmYwODg3NTkxZDM1MTU1YzBjMGIzZWY1YTE3YjFiNDU4MWNkNGE1ZjMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDEyIiwiZmlyc3QiOjExLCJsYXN0IjoxMSwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWRjYTdkZTUwMjE5ZCJdfSx7ImlkIjoic291cmNlLUwxNSIsImZpcnN0IjoxNSwibGFzdCI6MTUsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1kY2E3ZGU1MDIxOWQiXX0seyJpZCI6InNvdXJjZS1MMTgiLCJmaXJzdCI6MTksImxhc3QiOjE5LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktZGNhN2RlNTAyMTlkIl19LHsiaWQiOiJzb3VyY2UtTDIyIiwiZmlyc3QiOjI3LCJsYXN0IjoyNywiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWRjYTdkZTUwMjE5ZCJdfSx7ImlkIjoic291cmNlLUwyNCIsImZpcnN0IjozMCwibGFzdCI6MzAsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1kY2E3ZGU1MDIxOWQiXX0seyJpZCI6InNvdXJjZS1MMzMiLCJmaXJzdCI6NDUsImxhc3QiOjQ1LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktZGNhN2RlNTAyMTlkIl19LHsiaWQiOiJzb3VyY2UtTDM2IiwiZmlyc3QiOjUwLCJsYXN0Ijo1MCwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWRjYTdkZTUwMjE5ZCJdfSx7ImlkIjoic291cmNlLUw0MiIsImZpcnN0Ijo1NywibGFzdCI6NTcsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1kY2E3ZGU1MDIxOWQiXX0seyJpZCI6InNvdXJjZS1MNDYiLCJmaXJzdCI6NjIsImxhc3QiOjYyLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktZGNhN2RlNTAyMTlkIl19LHsiaWQiOiJzb3VyY2UtTDUwIiwiZmlyc3QiOjY3LCJsYXN0Ijo2NywiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWRjYTdkZTUwMjE5ZCJdfSx7ImlkIjoic291cmNlLUw1MiIsImZpcnN0Ijo3MCwibGFzdCI6NzAsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1kY2E3ZGU1MDIxOWQiXX0seyJpZCI6InNvdXJjZS1MNTQiLCJmaXJzdCI6NzMsImxhc3QiOjczLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktZGNhN2RlNTAyMTlkIl19LHsiaWQiOiJzb3VyY2UtTDU3IiwiZmlyc3QiOjc4LCJsYXN0Ijo3OCwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWRjYTdkZTUwMjE5ZCJdfSx7ImlkIjoic291cmNlLUw1OSIsImZpcnN0Ijo4MSwibGFzdCI6ODEsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1kY2E3ZGU1MDIxOWQiXX0seyJpZCI6InNvdXJjZS1MNjEiLCJmaXJzdCI6ODQsImxhc3QiOjg0LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktZGNhN2RlNTAyMTlkIl19LHsiaWQiOiJzb3VyY2UtTDYzIiwiZmlyc3QiOjg3LCJsYXN0Ijo4NywiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWRjYTdkZTUwMjE5ZCIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xMCJdfSx7ImlkIjoic291cmNlLUwyOCIsImZpcnN0IjozNSwibGFzdCI6MzUsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1jYzQwNGJkNTIyYzEiLCIuLi9kaWFncmFtcy9mb2xkZXJzL2NvbW1vbi9pbmRleC5tZCNib3VuZGFyeS0xYzk2MDVlNTM0NmQiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS0wNTgxZTdkNWM4MmUiXX0seyJpZCI6InNvdXJjZS1MNDAiLCJmaXJzdCI6NTUsImxhc3QiOjU1LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktY2M0MDRiZDUyMmMxIiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9jb21tb24vaW5kZXgubWQjYm91bmRhcnktMWM5NjA1ZTUzNDZkIiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktMDU4MWU3ZDVjODJlIl19LHsiaWQiOiJzb3VyY2UtTDcyIiwiZmlyc3QiOjk3LCJsYXN0Ijo5NywiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWNjNDA0YmQ1MjJjMSIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY29tbW9uL2luZGV4Lm1kI2JvdW5kYXJ5LTFjOTYwNWU1MzQ2ZCIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTA1ODFlN2Q1YzgyZSJdfSx7ImlkIjoic291cmNlLUwyMCIsImZpcnN0IjoyNCwibGFzdCI6MjQsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS00MDJkMjU2MDhkYzQiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS0zNTU3NjNjMTc1ODUiXX0seyJpZCI6InNvdXJjZS1MMjkiLCJmaXJzdCI6MzYsImxhc3QiOjQxLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktYmUwYjVlZWVjNzBiIiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktZGRlNWI1NTU4NDU1Il19LHsiaWQiOiJzb3VyY2UtTDUzIiwiZmlyc3QiOjcyLCJsYXN0Ijo3NCwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWExZjViZTVhMDRkOSIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTQxMmZlYzU2ZGYxMiJdfSx7ImlkIjoic291cmNlLUw2OSIsImZpcnN0Ijo5NCwibGFzdCI6OTQsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1hMWY1YmU1YTA0ZDkiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS00MTJmZWM1NmRmMTIiXX0seyJpZCI6InNvdXJjZS1MNzAiLCJmaXJzdCI6OTUsImxhc3QiOjk1LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktYTFmNWJlNWEwNGQ5IiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktNDEyZmVjNTZkZjEyIl19LHsiaWQiOiJzb3VyY2UtTDcxIiwiZmlyc3QiOjk2LCJsYXN0Ijo5NiwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWExZjViZTVhMDRkOSIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTQxMmZlYzU2ZGYxMiJdfSx7ImlkIjoic291cmNlLUw0NyIsImZpcnN0Ijo2NCwibGFzdCI6NjQsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1hMWY1YmU1YTA0ZDkiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS00MTJmZWM1NmRmMTIiXX0seyJpZCI6InNvdXJjZS1MNzgiLCJmaXJzdCI6MTEwLCJsYXN0IjoxMTUsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1hMWY1YmU1YTA0ZDkiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS00MTJmZWM1NmRmMTIiXX0seyJpZCI6InNvdXJjZS1MOTMiLCJmaXJzdCI6MTUwLCJsYXN0IjoxNTUsImJhY2tsaW5rcyI6WyIuLi9kaWFncmFtcy9mb2xkZXJzL2NsaWVudC9pbmRleC5tZCNib3VuZGFyeS1hMWY1YmU1YTA0ZDkiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS00MTJmZWM1NmRmMTIiXX0seyJpZCI6InNvdXJjZS1MMTAyIiwiZmlyc3QiOjE3NCwibGFzdCI6MTc0LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktYTFmNWJlNWEwNGQ5IiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktNDEyZmVjNTZkZjEyIl19LHsiaWQiOiJzb3VyY2UtTDQ4IiwiZmlyc3QiOjY1LCJsYXN0Ijo2NSwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LWExZjViZTVhMDRkOSIsIi4uL2RpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTQxMmZlYzU2ZGYxMiJdfSx7ImlkIjoic291cmNlLUw3NyIsImZpcnN0IjoxMDEsImxhc3QiOjEwOSwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvY2xpZW50L2luZGV4Lm1kI2JvdW5kYXJ5LTRhM2VhMGI1OGZmYiIsIi4uL2RpYWdyYW1zL2ZvbGRlcnMvcHJvdmlkZXIvaW5kZXgubWQjYm91bmRhcnktYzA3YTEwNzlhMDBiIiwiLi4vZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktNDY2YjMyN2Q5N2Y5Il19LHsiaWQiOiJzb3VyY2UtTDkyIiwiZmlyc3QiOjE0MSwibGFzdCI6MTQ5LCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktNGEzZWEwYjU4ZmZiIiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1jMDdhMTA3OWEwMGIiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS00NjZiMzI3ZDk3ZjkiXX0seyJpZCI6InNvdXJjZS1MMTAxIiwiZmlyc3QiOjE2NSwibGFzdCI6MTczLCJiYWNrbGlua3MiOlsiLi4vZGlhZ3JhbXMvZm9sZGVycy9jbGllbnQvaW5kZXgubWQjYm91bmRhcnktNGEzZWEwYjU4ZmZiIiwiLi4vZGlhZ3JhbXMvZm9sZGVycy9wcm92aWRlci9pbmRleC5tZCNib3VuZGFyeS1jMDdhMTA3OWEwMGIiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS00NjZiMzI3ZDk3ZjkiXX0seyJpZCI6InNvdXJjZS1MMTAiLCJmaXJzdCI6OSwibGFzdCI6MzIsImJhY2tsaW5rcyI6WyJwcm90b2NvbC1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1yZXNwb25zZUpzb24iXX0seyJpZCI6InNvdXJjZS1MMjciLCJmaXJzdCI6MzQsImxhc3QiOjUyLCJiYWNrbGlua3MiOlsicHJvdG9jb2wtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiIsIiNzeW1ib2wtZGlzY292ZXIiXX0seyJpZCI6InNvdXJjZS1MMzkiLCJmaXJzdCI6NTQsImxhc3QiOjg5LCJiYWNrbGlua3MiOlsicHJvdG9jb2wtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyIsIiNzeW1ib2wtdmFsaWRhdGVJZGVudGl0eSJdfSx7ImlkIjoic291cmNlLUwxMS1MMTgiLCJmaXJzdCI6MTAsImxhc3QiOjIyLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MMTMtTDE4IiwiZmlyc3QiOjEzLCJsYXN0IjoyMiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDE5LUwyNCIsImZpcnN0IjoyMywibGFzdCI6MzEsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfSx7ImlkIjoic291cmNlLUwyOC1MMzYiLCJmaXJzdCI6MzUsImxhc3QiOjUxLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTQiXX0seyJpZCI6InNvdXJjZS1MMzItTDM2IiwiZmlyc3QiOjQ0LCJsYXN0Ijo1MSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC01Il19LHsiaWQiOiJzb3VyY2UtTDQwLUw2MyIsImZpcnN0Ijo1NSwibGFzdCI6ODgsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNiJdfSx7ImlkIjoic291cmNlLUw0NS1MNDgiLCJmaXJzdCI6NjEsImxhc3QiOjY1LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTciXX0seyJpZCI6InNvdXJjZS1MNDktTDU0IiwiZmlyc3QiOjY2LCJsYXN0Ijo3NCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC04Il19LHsiaWQiOiJzb3VyY2UtTDU1LUw2MSIsImZpcnN0Ijo3NSwibGFzdCI6ODUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtOSJdfSx7ImlkIjoic291cmNlLUw2NSIsImZpcnN0Ijo5MCwibGFzdCI6MTg0LCJiYWNrbGlua3MiOlsiI3N5bWJvbC10ZXN0LTIwLXZhbGlkYXRlSWRlbnRpdHkiXX0seyJpZCI6InNvdXJjZS1MNjgtTDY5IiwiZmlyc3QiOjkzLCJsYXN0Ijo5NCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xMSJdfSx7ImlkIjoic291cmNlLUw3MC1MNzMiLCJmaXJzdCI6OTUsImxhc3QiOjk4LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEyIl19LHsiaWQiOiJzb3VyY2UtTDc0IiwiZmlyc3QiOjk5LCJsYXN0Ijo5OSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xMyJdfSx7ImlkIjoic291cmNlLUw3NiIsImZpcnN0IjoxMDAsImxhc3QiOjExOCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xNCJdfSx7ImlkIjoic291cmNlLUw3Ny1MODAiLCJmaXJzdCI6MTAxLCJsYXN0IjoxMTcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTUiXX0seyJpZCI6InNvdXJjZS1MODIiLCJmaXJzdCI6MTE5LCJsYXN0IjoxNjMsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTYiXX0seyJpZCI6InNvdXJjZS1MOTItTDk4IiwiZmlyc3QiOjE0MSwibGFzdCI6MTYyLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTE3Il19LHsiaWQiOiJzb3VyY2UtTDk4IiwiZmlyc3QiOjE2MSwibGFzdCI6MTYxLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTE4Il19LHsiaWQiOiJzb3VyY2UtTDEwMCIsImZpcnN0IjoxNjQsImxhc3QiOjE4MiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xOSJdfSx7ImlkIjoic291cmNlLUwxMDEtTDEwNyIsImZpcnN0IjoxNjUsImxhc3QiOjE4MSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yMCJdfSx7ImlkIjoic291cmNlLUwxMDciLCJmaXJzdCI6MTgwLCJsYXN0IjoxODAsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMjEiXX1dfQ
// aug-spec: "protocol.aug.md" explains this file. Read it before changes; refresh with aug spec.
import SessionError from contracts
import Discovery and IdClaims from provider
import settings from common
import HttpClient from web
import parse from json
import Crypto and GnuTlsCrypto and RsaJwks and rsaJwk and signJwt and importJwk and verifyJwt and JwtError from crypto
/** Accept only a successful JSON response. Redirects remain explicit and are never followed by the transport. */
responseJson(HttpResponse<Bytes> response) {
    if response.status != 200 {
        throw SessionError()
    }
    match response.headers.get(name="content-type") {
        when null {
            throw SessionError()
        }
        when some contentType {
            if not contentType.startsWith(prefix="application/json") {
                throw SessionError()
            }
        }
    }
    try {
        return parse(input=response.body.text())
    }
    catch ConversionError error {
        throw SessionError()
    }
    catch JsonError error {
        throw SessionError()
    }
}
/** Discovery is fetched over HTTP. Every advertised URL is checked against the registered issuer before any credential is sent. */
discover(resolve HttpClient client) {
    config = settings()
    json = responseJson(
        response=client.request(
            method="GET",
            url=config.issuer + "/.well-known/openid-configuration"
        )
    )
    try {
        document = json.decode<Discovery>()
        if document.issuer != config.issuer or document.authorization_endpoint != config.issuer + "/authorize" or document.token_endpoint != config.issuer + "/token" or document.jwks_uri != config.issuer + "/jwks" or document.userinfo_endpoint != config.issuer + "/userinfo" {
            throw SessionError()
        }
        return document
    }
    catch JsonError error {
        throw SessionError()
    }
}
/** Validate the signed ID token using a public key from this issuer's HTTP JWKS, then validate the registered claims and one-use nonce. */
validateIdentity(string token, string nonce, int now, RsaJwks jwks, resolve Crypto crypto) {
    config = settings()
    if jwks.keys.length() != 1 {
        throw SessionError()
    }
    try {
        jwk = jwks.keys.get(index=0)
        if jwk.kid != "provider-1" {
            throw SessionError()
        }
        publicKey = importJwk(jwk)
        claims = verifyJwt(token, publicKey, kid="provider-1", tokenType="JWT").decode<IdClaims>()
        if claims.iss != config.issuer or claims.aud != config.clientId or claims.sub.length() == 0 or claims.sub.length() > 255 {
            throw SessionError()
        }
        if claims.exp <= now or claims.iat < now - 300 or claims.iat > now + 30 or claims.exp <= claims.iat or claims.exp > now + 330 {
            throw SessionError()
        }
        if not crypto.equal(left=claims.nonce.bytes(), right=nonce.bytes()) {
            throw SessionError()
        }
        return claims
    }
    catch JwtError error {
        throw SessionError()
    }
    catch JsonError error {
        throw SessionError()
    }
    catch IndexError error {
        throw SessionError()
    }
    catch CryptoError error {
        throw SessionError()
    }
}
test validateIdentity {
    when "signed_identity_claims" {
        implement Crypto with GnuTlsCrypto
        resolve Crypto to crypto
        key = crypto.generateRsa()
        publicKey = crypto.publicRsa(key)
        jwks = RsaJwks(keys=[rsaJwk(publicKey, kid="provider-1")])
        config = settings()
        now = 1700000000
        expectedNonce = "nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn"
        it "accepts_valid_identity" {
            claims = IdClaims(
                iss=config.issuer,
                sub="ada",
                aud=config.clientId,
                exp=now + 300,
                iat=now,
                nonce=expectedNonce,
                name="Ada"
            )
            token = signJwt(
                key,
                claims=Json(value=claims),
                kid="provider-1",
                tokenType="JWT"
            )
            identity = validateIdentity(token, nonce=expectedNonce, now, jwks)
            assert(condition=identity.sub == "ada")
        }
        it "rejects_signed_invalid_claims" for (issuer, audience, subject, issued, expires, nonce) in [(
            "https://wrong-issuer.invalid",
            config.clientId,
            "ada",
            now,
            now + 300,
            expectedNonce
        ), (config.issuer, "wrong-audience", "ada", now, now + 300, expectedNonce), (config.issuer, config.clientId, "", now, now + 300, expectedNonce), (
            config.issuer,
            config.clientId,
            "ada",
            now - 400,
            now + 300,
            expectedNonce
        ), (
            config.issuer,
            config.clientId,
            "ada",
            now + 100,
            now + 300,
            expectedNonce
        ), (config.issuer, config.clientId, "ada", now, now, expectedNonce), (config.issuer, config.clientId, "ada", now, now + 600, expectedNonce), (config.issuer, config.clientId, "ada", now, now + 300, "wrong-nonce")] {
            claims = IdClaims(
                iss=issuer,
                sub=subject,
                aud=audience,
                exp=expires,
                iat=issued,
                nonce,
                name="Ada"
            )
            token = signJwt(
                key,
                claims=Json(value=claims),
                kid="provider-1",
                tokenType="JWT"
            )
            try {
                validateIdentity(token, nonce=expectedNonce, now, jwks)
                assert(condition=false)
            }
            catch SessionError error {
                assert(condition=true)
            }
        }
        it "rejects_token_context" for (kid, tokenType) in [("wrong-key", "JWT"), ("provider-1", "august-session+jwt")] {
            claims = IdClaims(
                iss=config.issuer,
                sub="ada",
                aud=config.clientId,
                exp=now + 300,
                iat=now,
                nonce=expectedNonce,
                name="Ada"
            )
            token = signJwt(key, claims=Json(value=claims), kid, tokenType)
            try {
                validateIdentity(token, nonce=expectedNonce, now, jwks)
                assert(condition=false)
            }
            catch SessionError error {
                assert(condition=true)
            }
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](protocol-diagrams.md)

### `responseJson` · [source](protocol.md#source-L10) {#symbol-responseJson}

Accept only a successful JSON response. Redirects remain explicit and are never followed by the transport. It takes `response` as `HttpResponse<Bytes>`. Failures can raise [`SessionError`](contracts.md#symbol-SessionError).

::: spec-paragraph specification-paragraph-1
It checks that `response.status` equals `200`. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It obtains `response.headers.get` with `name` `"content-type"`. If no value is found, it raises a [`SessionError`](contracts.md#symbol-SessionError). [source](protocol.md#source-L11-L18)
:::

::: spec-paragraph specification-paragraph-2
The non-null result becomes `contentType`. It checks that `contentType.startsWith` with `prefix` `"application/json"` returns true. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. [source](protocol.md#source-L13-L18)
:::

::: spec-paragraph specification-paragraph-3
It tries to return [`parse`](../dependencies/packages/%40git/url_2d3c37c690c0fa115be1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-parse) with `input` from `response.body.text`. If this work raises `ConversionError`, it raises a [`SessionError`](contracts.md#symbol-SessionError). If this work raises `JsonError`, it raises a [`SessionError`](contracts.md#symbol-SessionError). [source](protocol.md#source-L19-L24)
:::

::: details Checked interface

```text
responseJson(HttpResponse<Bytes> response) returns Json unless SessionError
```

It takes `response` as `HttpResponse<Bytes>`. Failures can raise [`SessionError`](contracts.md#symbol-SessionError).

:::

### `discover` · [source](protocol.md#source-L27) {#symbol-discover}

Discovery is fetched over HTTP. Every advertised URL is checked against the registered issuer before any credential is sent. It gets `client` ([`HttpClient`](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-HttpClient)) from dependency injection.

It can call [`HttpClient.request`](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-HttpClient.request). Failures can raise `HttpError` and [`SessionError`](contracts.md#symbol-SessionError).

::: spec-paragraph specification-paragraph-4
It gets `config` from [`settings`](../common/settings.md#symbol-settings). It sets `json` to [`responseJson`](protocol.md#symbol-responseJson) with `response` from [`client.request`](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-HttpClient.request) with `method` `"GET"` and `url` from the text `{config.issuer}/.well-known/openid-configuration`. It sets `document` to `json.decode` for [`Discovery`](../provider/discovery.md#symbol-Discovery). [source](protocol.md#source-L28-L36)
:::

::: spec-paragraph specification-paragraph-5
It checks that `document.issuer` equals `config.issuer` and `document.authorization_endpoint` equals the text `{config.issuer}/authorize` and `document.token_endpoint` equals the text `{config.issuer}/token` and `document.jwks_uri` equals the text `{config.issuer}/jwks` and `document.userinfo_endpoint` equals the text `{config.issuer}/userinfo`. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It returns `document`. If this work raises `JsonError`, it raises a [`SessionError`](contracts.md#symbol-SessionError). [source](protocol.md#source-L32-L36)
:::

::: details Checked interface

```text
discover(resolve HttpClient client) returns Discovery unless HttpError and SessionError uses HttpClient.request
```

It gets `client` ([`HttpClient`](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-HttpClient)) from dependency injection. It can call [`HttpClient.request`](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-HttpClient.request). Failures can raise `HttpError` and [`SessionError`](contracts.md#symbol-SessionError).

:::

### `validateIdentity` · [source](protocol.md#source-L39) {#symbol-validateIdentity}

Validate the signed ID token using a public key from this issuer's HTTP JWKS, then validate the registered claims and one-use nonce. It takes `token` and `nonce` as strings, `now` as an integer, and `jwks` as [`RsaJwks`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-RsaJwks). It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)) from dependency injection.

It can call [`Crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`Crypto.decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), [`Crypto.importRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.importRsa), and [`Crypto.verifyRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.verifyRsa). Failures can raise [`SessionError`](contracts.md#symbol-SessionError).

::: spec-paragraph specification-paragraph-6
It gets `config` from [`settings`](../common/settings.md#symbol-settings). It checks that the number of elements in `jwks.keys` equals `1`. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It sets `jwk` to the item at index `0` in `jwks.keys`. [source](protocol.md#source-L40-L63)
:::

::: spec-paragraph specification-paragraph-7
It checks that `jwk.kid` equals `"provider-1"`. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It sets `publicKey` to [`importJwk`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-importJwk) with `jwk` using injected `crypto`. It sets `claims` to `decode` on [`verifyJwt`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-verifyJwt) with `token`, `publicKey`, `kid` `"provider-1"`, and `tokenType` `"JWT"` using injected `crypto` for [`IdClaims`](../provider/contracts.md#symbol-IdClaims). [source](protocol.md#source-L45-L48)
:::

::: spec-paragraph specification-paragraph-8
It checks that `claims.iss` equals `config.issuer` and `claims.aud` equals `config.clientId` and the byte length of `claims.sub` does not equal `0` and the byte length of `claims.sub` is at most `255` and `claims.exp` is greater than `now` and `claims.iat` is at least (`now` minus `300`) and `claims.iat` is at most (`now` plus `30`) and `claims.exp` is greater than `claims.iat` and `claims.exp` is at most (`now` plus `330`). It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It checks that [`crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal) with `left` from the UTF-8 bytes of `claims.nonce` and `right` from the UTF-8 bytes of `nonce` returns true. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. [source](protocol.md#source-L49-L54)
:::

::: spec-paragraph specification-paragraph-9
It returns `claims`. If this work raises [`JwtError`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-JwtError), it raises a [`SessionError`](contracts.md#symbol-SessionError). If this work raises `JsonError`, it raises a [`SessionError`](contracts.md#symbol-SessionError). If this work raises `IndexError`, it raises a [`SessionError`](contracts.md#symbol-SessionError). [source](protocol.md#source-L55-L61)
:::

::: spec-paragraph specification-paragraph-10
If this work raises `CryptoError`, it raises a [`SessionError`](contracts.md#symbol-SessionError). [source](protocol.md#source-L63)
:::

::: details Checked interface

```text
validateIdentity(string token, string nonce, int now, RsaJwks jwks, resolve Crypto crypto) returns IdClaims unless SessionError uses Crypto.equal, Crypto.decodeBase64url, Crypto.importRsa, Crypto.verifyRsa
```

It takes `token` and `nonce` as strings, `now` as an integer, and `jwks` as [`RsaJwks`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-RsaJwks). It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)) from dependency injection. It can call [`Crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`Crypto.decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), [`Crypto.importRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.importRsa), and [`Crypto.verifyRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.verifyRsa). Failures can raise [`SessionError`](contracts.md#symbol-SessionError).

:::

### `test validateIdentity` · [source](protocol.md#source-L65) {#symbol-test-20-validateIdentity}

Tests [`validateIdentity`](protocol.md#symbol-validateIdentity). Each case gets fresh setup and dependencies.

#### `signed_identity_claims`

::: spec-paragraph specification-paragraph-11
Setup for each case: `Crypto` is provided by [`GnuTlsCrypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-GnuTlsCrypto). Stateless instances are reused; stateful instances are created for each resolve. It sets `crypto` to the instance provided for `Crypto`. It sets `key` to [`crypto.generateRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.generateRsa). [source](protocol.md#source-L68-L69)
:::

::: spec-paragraph specification-paragraph-12
It sets `publicKey` to [`crypto.publicRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.publicRsa) with `key`. It sets `jwks` to a [`RsaJwks`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-RsaJwks) with `keys` from a list containing [`rsaJwk`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-rsaJwk) with `publicKey` and `kid` `"provider-1"` using injected `Crypto` for `crypto`. It gets `config` from [`settings`](../common/settings.md#symbol-settings). It sets `now` to `1700000000`. [source](protocol.md#source-L70-L73)
:::

::: spec-paragraph specification-paragraph-13
It sets `expectedNonce` to `"nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn"`. [source](protocol.md#source-L74)
:::

::: spec-paragraph specification-paragraph-14
##### `accepts_valid_identity` · [source](protocol.md#source-L76)
:::

::: spec-paragraph specification-paragraph-15
It sets `claims` to an [`IdClaims`](../provider/contracts.md#symbol-IdClaims) with `iss` from `config.issuer`, `sub` `"ada"`, `aud` from `config.clientId`, `exp` from `now` plus `300`, `iat` from `now`, `nonce` from `expectedNonce`, and `name` `"Ada"`. It sets `token` to [`signJwt`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-signJwt) with `key`, `claims` from a `Json` with `value` from `claims`, `kid` `"provider-1"`, and `tokenType` `"JWT"` using injected `Crypto` for `crypto`. It sets `identity` to [`validateIdentity`](protocol.md#symbol-validateIdentity) with `token`, `nonce` from `expectedNonce`, `now`, and `jwks` using injected `Crypto` for `crypto`. The test requires `identity.sub` equals `"ada"`. [source](protocol.md#source-L77-L80)
:::

::: spec-paragraph specification-paragraph-16
##### `rejects_signed_invalid_claims` · [source](protocol.md#source-L82)
:::

Run once for each row of a tuple containing `"https://wrong-issuer.invalid"`, `config.clientId`, `"ada"`, `now`, `now` plus `300`, `expectedNonce`; a tuple containing `config.issuer`, `"wrong-audience"`, `"ada"`, `now`, `now` plus `300`, `expectedNonce`; a tuple containing `config.issuer`, `config.clientId`, `""`, `now`, `now` plus `300`, `expectedNonce`; a tuple containing `config.issuer`, `config.clientId`, `"ada"`, `now` minus `400`, `now` plus `300`, `expectedNonce`; a tuple containing `config.issuer`, `config.clientId`, `"ada"`, `now` plus `100`, `now` plus `300`, `expectedNonce`; a tuple containing `config.issuer`, `config.clientId`, `"ada"`, `now`, `now`, `expectedNonce`; a tuple containing `config.issuer`, `config.clientId`, `"ada"`, `now`, `now` plus `600`, `expectedNonce`; a tuple containing `config.issuer`, `config.clientId`, `"ada"`, `now`, `now` plus `300`, `"wrong-nonce"`. Bind row positions to `issuer`, `audience`, `subject`, `issued`, `expires`, `nonce`.

::: spec-paragraph specification-paragraph-17
It sets `claims` to an [`IdClaims`](../provider/contracts.md#symbol-IdClaims) with `iss` from `issuer`, `sub` from `subject`, `aud` from `audience`, `exp` from `expires`, `iat` from `issued`, `nonce`, and `name` `"Ada"`. It sets `token` to [`signJwt`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-signJwt) with `key`, `claims` from a `Json` with `value` from `claims`, `kid` `"provider-1"`, and `tokenType` `"JWT"` using injected `Crypto` for `crypto`. It calls [`validateIdentity`](protocol.md#symbol-validateIdentity) with `token`, `nonce` from `expectedNonce`, `now`, and `jwks` using injected `Crypto` for `crypto`. The test requires `false` is true. [source](protocol.md#source-L92-L98)
:::

::: spec-paragraph specification-paragraph-18
If this work raises [`SessionError`](contracts.md#symbol-SessionError), it the test requires `true` is true. [source](protocol.md#source-L98)
:::

::: spec-paragraph specification-paragraph-19
##### `rejects_token_context` · [source](protocol.md#source-L100)
:::

Run once for each row of a tuple containing `"wrong-key"`, `"JWT"`; a tuple containing `"provider-1"`, `"august-session+jwt"`. Bind row positions to `kid`, `tokenType`.

::: spec-paragraph specification-paragraph-20
It sets `claims` to an [`IdClaims`](../provider/contracts.md#symbol-IdClaims) with `iss` from `config.issuer`, `sub` `"ada"`, `aud` from `config.clientId`, `exp` from `now` plus `300`, `iat` from `now`, `nonce` from `expectedNonce`, and `name` `"Ada"`. It sets `token` to [`signJwt`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-signJwt) with `key`, `claims` from a `Json` with `value` from `claims`, `kid`, and `tokenType` using injected `Crypto` for `crypto`. It calls [`validateIdentity`](protocol.md#symbol-validateIdentity) with `token`, `nonce` from `expectedNonce`, `now`, and `jwks` using injected `Crypto` for `crypto`. The test requires `false` is true. [source](protocol.md#source-L101-L107)
:::

::: spec-paragraph specification-paragraph-21
If this work raises [`SessionError`](contracts.md#symbol-SessionError), it the test requires `true` is true. [source](protocol.md#source-L107)
:::

### Dependencies

It uses [`parse`](../dependencies/packages/%40git/url_2d3c37c690c0fa115be1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-parse) from `json`. It uses [`HttpClient`](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-HttpClient) ([`request`](../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-HttpClient.request)) from `web`. It uses [`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto) ([`decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), [`equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`generateRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.generateRsa), [`importRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.importRsa), [`publicRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.publicRsa), and [`verifyRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.verifyRsa)), [`GnuTlsCrypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-GnuTlsCrypto), [`JwtError`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-JwtError), [`RsaJwks`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-RsaJwks) (`keys`), [`importJwk`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-importJwk), [`rsaJwk`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-rsaJwk), [`signJwt`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-signJwt), and [`verifyJwt`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-verifyJwt) from `crypto`. It uses [`RsaJwk`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-RsaJwk) (`kid`) and [`Settings`](../common/settings.md#symbol-Settings) (`clientId` and `issuer`).

It uses [`SessionError`](contracts.md#symbol-SessionError) from `contracts`. It uses [`settings`](../common/settings.md#symbol-settings) from `common`. It uses [`IdClaims`](../provider/contracts.md#symbol-IdClaims) (`aud`, `exp`, `iat`, `iss`, `nonce`, and `sub`) and [`Discovery`](../provider/discovery.md#symbol-Discovery) (`authorization_endpoint`, `issuer`, `jwks_uri`, `token_endpoint`, and `userinfo_endpoint`) from `provider`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
