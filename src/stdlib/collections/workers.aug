// aug-spec: "workers.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Transformation from operations

/** Transform copied data on isolated worker heaps, preserving input order.
 * Supply a directly named concrete pure function with one value input; callbacks and behavior objects are not worker inputs.
 * @param values At most 1048576 copied data values; the input remains unchanged.
 * @param concurrency Number of chunk jobs in a wave, from 1 to 64. This does not reserve pool threads.
 * @param chunkSize Values per job, from 1 to 65536.
 * @param transformation A named pure function, with no checked errors, injection, owned inputs, or task starts.
 * @throws ConversionError Invalid bounds, checked before any worker starts, including for an empty input.
 * @throws ConcurrencyError The shared pool cannot admit a job or copy its inputs.
 * @throws IndexError Checked snapshot reads retain this error; indices stay within the snapshot.
 * Admission or cancellation joins already admitted jobs before leaving the current wave.
 */
mapWorkers<T implements optional Data, U implements optional Data>(List<T> values, int concurrency, int chunkSize, Transformation<T, U> transformation) returns List<U> unless ConversionError and ConcurrencyError and IndexError:
    length = values.length()
    if concurrency < 1 or concurrency > 64 or chunkSize < 1 or chunkSize > 65536 or length > 1048576:
        throw ConversionError()
    List<T> snapshot = []
    for value in values:
        borrow snapshot:
            snapshot.append(value)
    List<U> results = []
    offset = 0
    while offset < length:
        List<List<T>> wave = []
        count = 0
        while count < concurrency and offset < length:
            List<T> chunk = []
            while chunk.length() < chunkSize and offset < length:
                value = snapshot.get(index=offset)
                borrow chunk:
                    chunk.append(value)
                offset = offset + 1
            borrow wave:
                wave.append(value=chunk)
            count = count + 1
        scope:
            jobs = [start worker _mapWorkerChunk(values=chunk, transformation) for chunk in wave]
            completed = wait for jobs
            for chunk in completed:
                for value in chunk:
                    borrow results:
                        results.append(value)
    return [value for value in results]

// The compiler specializes this private entry with a direct call to the named
// transformation. Only the chunk crosses the heap boundary, never the interface.
/** Compiler template specialized for each named transformation before native lowering.
 * The generated worker entry receives copied chunk data. Compilation replaces transformation.apply with a direct call.
 */
_mapWorkerChunk<T implements optional Data, U implements optional Data>(List<T> values, Transformation<T, U> transformation) returns List<U>:
    List<U> results = []
    for value in values:
        transformed = transformation.apply(value)
        borrow results:
            results.append(value=transformed)
    return results
