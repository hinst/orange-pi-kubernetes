# PostgreSQL memory

https://stackoverflow.com/questions/28844170/how-to-limit-the-memory-that-is-available-for-postgresql-server
* Total memory = shared_buffers + (temp_buffers + work_mem) × max_connections

Values:
* shared_buffers = 128 MB
* temp_buffers = 8 MB
* work_mem = 4 MB
* max_connections = 10
    * Default is 100, I set 10
* Calculation: 128 + (8 + 4) * 10 = 248

To sum it up, PostgreSQL should use up to around 250 MB of memory
