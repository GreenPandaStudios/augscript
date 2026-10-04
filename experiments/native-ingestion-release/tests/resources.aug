extern C aug_postgres_live_pools_v1() returns int
extern C aug_postgres_live_connections_v1() returns int
extern C aug_postgres_live_results_v1() returns int
checkResources():
    unsafe:
        if aug_postgres_live_pools_v1() != 0 or aug_postgres_live_connections_v1() != 0 or aug_postgres_live_results_v1() != 0:
            throw FileError()
